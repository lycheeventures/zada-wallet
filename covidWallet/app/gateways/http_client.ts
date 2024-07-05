import axios from 'axios';
import Config from 'react-native-config';
import { handleErrorMessage } from '.';
import { isJWTExp } from '../helpers/Authenticate';
import { showNetworkMessage } from '../helpers/Toast';
import { RootState } from '../store';
import { updateToken } from '../store/auth';

// for multiple requests
let isRefreshing = false;
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

// Getting user credentials.
const getUserCredentials = (state: RootState) => {
  // const credentials = await Keychain.getGenericPassword();
  // let AuthCredentials = null;
  // if (credentials) {
  //   AuthCredentials = JSON.parse(credentials.username);
  // }
  // const { refreshToken } = AuthCredentials;
  let creds = {
    userId: state.auth.user.id,
    walletSecret: state.auth.user.walletSecret,
  };
  return creds;
};

const setup = (store: any, baseurl: string) => {
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
          };
        }
      }

      // Add Accept header.
      config.headers = {
        ...config.headers,
        Accept: 'application/json',
      };

      // Add Content-Type header.
      if (!config.headers['Content-Type']) {
        config.headers = {
          ...config.headers,
          'Content-Type': 'application/json',
        };
      }

      // Setting timeout
      config.timeout = 60000 * 2;

      // Setting baseurl
      config.baseURL = baseurl;

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
            fetch(baseurl + '/api/v1/authenticate', {
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
