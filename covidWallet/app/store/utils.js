import createTransform from 'redux-persist/es/createTransform';
import CryptoJS from 'react-native-crypto-js';
import { resetLocalStorage, resetSecureItems } from '../helpers/utils';
import { resetAuth } from './auth';
import { resetConnection } from './connections';
import { resetCredential } from './credentials';
import { resetApp } from './app';
import { resetAction } from './actions';

export const createEncryptor = ({ secretKey }) =>
  createTransform(
    (inboundState, key) => {
      if (!inboundState) {
        return inboundState;
      }
      if (secretKey) {
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(inboundState), secretKey, {
          keySize: 256 / 8,
          iv: secretKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();
        return encrypted;
      }
    },
    (outboundState, key) => {
      if (!outboundState) {
        return outboundState;
      }
      if (secretKey) {
        let bytes = CryptoJS.AES.decrypt(outboundState, secretKey, {
          keySize: 256 / 8,
          iv: secretKey,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        });
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
      }
    }
  );

export const clearAll = async (dispatch) => {
  resetLocalStorage();
  await resetSecureItems();
  dispatch(resetAuth());
  dispatch(resetAction());
  dispatch(resetConnection());
  dispatch(resetCredential());
  dispatch(resetApp());
};
