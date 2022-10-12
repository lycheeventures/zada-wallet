import { RootState, store } from '.';
import { getUserCredentials } from '../helpers/utils';
import { updateUser } from './auth';
import CryptoJS from 'react-native-crypto-js';
import { getItem } from '../helpers/Storage';

const encrypt = (state) => {
  let password = '123456';
  if (password) {
    let iv = CryptoJS.MD5(password);
    return CryptoJS.AES.encrypt(JSON.stringify(state), iv, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }
};

const decrypt = (state, password: string) => {
  if (password) {
    let iv = CryptoJS.MD5(password);
    let bytes = CryptoJS.AES.decrypt(state, iv, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }
};

const hydrateMnually = async (password: string) => {
  let encrypted = await getItem('STORE');
  if (encrypted) {
    return await decrypt(encrypted, password);
  } else {
    return;
  }
};

export const middleware = (store) => (next) => async (action) => {
  // let state = store.getState() as RootState;
  // if (action.type === 'persist/REHYDRATE') {
  //   console.log('rehrdrating...');
  //   let password = await getUserCredentials();
  //   if (password) {
  //     console.log('hydrating manually');
  //     let newState = await hydrateMnually(password);
  //     newState._persist.rehydrated = true;
  //     console.log('newState => ', newState);
  //     return {
  //       ...newState,
  //     };
  //     // store.dispatch(
  //     //   updateUser({
  //     //     auto_accept_connection: true,
  //     //     id: undefined,
  //     //     isNew: false,
  //     //     type: undefined,
  //     //     walletSecret: password,
  //     //   })
  //     // );
  //   }
  // }
  // console.log(state.auth);
  next(action);
};
