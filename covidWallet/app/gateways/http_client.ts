import axios from 'axios';
import Config from 'react-native-config';
import { isJWTExp } from '../helpers/Authenticate';
import { showNetworkMessage } from '../helpers/Toast';
import { RootState } from '../store';
import { updateToken } from '../store/auth';

// for multiple requests
let isRefreshing = false;
let failedQueue: any = [];
const url_arr = [
  '/api/login',
  '/api/authenticate',
  '/api/register',
  '/api/resend_codes',
  '/api/recover',
  '/api/validateOTPs',
  '/api/wallet/create',
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

const setup = (store: any) => {
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

        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: token,
          };
        }
      }

      config.headers = {
        ...config.headers,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      config.timeout = 60000;
      config.baseURL = Config.API_URL;
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
          let { id: userId, walletSecret } = state.auth.user;
          // Fetch token
          return new Promise((resolve, reject) => {
            fetch(Config.API_URL + '/api/authenticate', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                secretPhrase: walletSecret,
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
          // ShowAlert Message
          // errorAlert();
          // alert(error);
          // Log error message
          // logErrorMessage(error);
        }

        console.log('error url => ', originalRequest.url);
        console.log('error => ', error);
        console.log('error response data => ', error.response.data);
        return Promise.reject(error);
      } else {
        showNetworkMessage();
        networkError = true;
      }
    }
  );
};

export default axios;
export { setup };
