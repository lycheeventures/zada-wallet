import axios from 'axios';
import Config from 'react-native-config';
import { updateToken } from '../store/auth';

const url_arr = ['/api/login', '/api/authenticate'];

const setup = (store: any) => {
  axios.interceptors.request.use(
    (config) => {
      console.log('url => ',url_arr.includes(config.url ? config.url : ''));
      if (!url_arr.includes(config.url ? config.url : '')) {
        const token = store.getState().auth.token;
        if (token) {
          config.headers.Authorization = token;
        }
      }
      config.baseURL = Config.API_URL;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  const { dispatch } = store;
  axios.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      const originalConfig = err.config;

      // if (!url_arr.includes(originalConfig.url) && err.response) {
      //   // Access Token was expired
      //   if (err.response.status === 401 && !originalConfig._retry) {
      //     originalConfig._retry = true;
      //     const userID = store.auth.user.id;
      //     const walletSecret = store.auth.user.walletSecret;

      //     console.log('originalConfig => ', originalConfig);

      //     try {
      //       const rs = await axios.post('/api/authenticate', {
      //         method: 'POST',
      //         headers: {
      //           Accept: 'application/json',
      //           'Content-Type': 'application/json',
      //         },
      //         body: JSON.stringify({
      //           userId: userID,
      //           secretPhrase: walletSecret,
      //         }),
      //       });

      //       const { token } = rs.data;

      //       dispatch(updateToken(token));
      //       return axios(originalConfig);
      //     } catch (_error) {
      //       return Promise.reject(_error);
      //     }
      //   }
      // }

      return Promise.reject(err);
    }
  );
};

export default axios;
export { setup };
