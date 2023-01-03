// Dummy middleware.

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

export const middleware = (store) => (next) => async (action) => {
  next(action);
};
