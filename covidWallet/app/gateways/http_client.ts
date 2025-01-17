import axios, { AxiosRequestHeaders } from 'axios';
import qs from 'query-string';
import { getCountry } from 'react-native-localize';
import { handleErrorMessage } from '.';
import { isJWTExp } from '../helpers/Authenticate';
import { RootState } from '../store';
import { updateToken } from '../store/auth';
import { _showAlert } from '../helpers';

// for multiple requests
let isRefreshing = false;
let alertsToShow = new Set<string>();
let failedQueue: any = [];
const url_arr = [
  '/api/login',
  '/api/v1/authenticate',
  '/api/register',
  '/api/v1/resend_codes',
  '/api/recover',
  'api/resetPassword',
  '/api/reactivate',
  '/api/v1/validateOTPs',
  '/api/wallet/create',
  '/api/get_user_status',
  '/api/v1/is_country_allowed',
];
// Api request Queue machanism, if authorization token has expired.
const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};


const setup = (store: any) => {
  axios.defaults.paramsSerializer = (params) => { return qs.stringify(params, { encode: true }) };
  axios.interceptors.request.use(
    (config) => {
      if (!url_arr.includes(config.url ? config.url : '')) {
        const token = store.getState().auth.token;
        if (!token) throw 'Invalid token';
        if (isJWTExp(token)) {
          throw {
            response: { status: 401 },
          };
        }

        // Add token if exist
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: token,
          } as AxiosRequestHeaders;
        }
      }

      // Add Accept header.
      config.headers = {
        ...config.headers,
        Accept: 'application/json',
      } as AxiosRequestHeaders;

      // Add country header
      config.headers.country = getCountry();

      // Add Content-Type header.
      if (!config.headers['Content-Type']) {
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        } as AxiosRequestHeaders;
      }

      // Setting timeout
      config.timeout = 45000;

      // Setting baseurl
      config.baseURL = store.getState().app.baseUrl;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const { dispatch } = store;
  let networkError = false;
  axios.interceptors.response.use(
    (res) => {
      if (res.data.isCountryAllowed === false) {
        // Return if already shown
        if (alertsToShow.has('countryNotAllowed')) return res;

        alertsToShow.add('countryNotAllowed');
        let en_message = 'Your connection appears to be blocked. Please try to disable any VPN, check your internet connection, and try again. If the issue persists, contact support for assistance.';
        _showAlert('WARNING!', en_message)

        setTimeout(() => {
          alertsToShow.delete('countryNotAllowed');
        }, 5000)
      }
      return res;
    },
    async (error) => {
      if (networkError) throw error;
      const originalRequest = error.config;
      if (error.response) {
        if (
          error.response.status === 401 &&
          !url_arr.includes(originalRequest.url) &&
          !originalRequest._retry
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          let state = store.getState() as RootState;
          let { token } = state.auth;
          // Fetch token
          return new Promise((resolve, reject) => {
            fetch(store.getState().app.baseUrl + '/api/v1/authenticate', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token,
              }),
            })
              .then((response) => response.json())
              .then((resp) => {
                const { token } = resp;
                axios.defaults.headers.common.Authorization = `Bearer ${token}`;
                originalRequest.headers.Authorization = `Bearer ${token}`;

                processQueue(null, token);

                // Updating token
                dispatch(updateToken(token));

                resolve(axios(originalRequest));
              })
              .catch((err) => {
                processQueue(err, null);

                reject(err);
              })
              .finally(() => {
                isRefreshing = false;
              });
          });
        }
        // Error handling
        if (!axios.isCancel(error)) {
          // Error message handling.
          handleErrorMessage(error);
        }

        return Promise.reject(error);
      } else {
        networkError = true;
      }
    }
  );
};

export default axios;
export { setup };
