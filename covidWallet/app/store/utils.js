import { createTransform } from 'reduxjs-toolkit-persist';
import CryptoJS from 'react-native-crypto-js';
import { resetLocalStorage, resetSecureItems } from '../helpers/utils';
import { resetAuth } from './auth';
import { resetConnection } from './connections';
import { resetCredential } from './credentials';
import { changeAppStatus, resetApp } from './app';
import { resetAction } from './actions';
import { resetCache } from './app/thunk';
import { deleteUserAccount } from './auth/thunk';
import { persistor } from '.';
import { AuthAPI } from '../gateways';
import { Platform } from 'react-native';

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

/// Write a function that will clear all the data from the store and logout the user
export const clearAllAndLogout = async (dispatch, type) => {
  if (type && type !== 'timeout') {
    await AuthAPI.unRegisterDeviceToken(Platform.OS);
  }
  resetLocalStorage();
  resetSecureItems();
  dispatch(resetAction());
  dispatch(resetConnection());
  dispatch(resetCredential());
  await dispatch(resetCache());
  dispatch(resetAuth());
  dispatch(changeAppStatus('idle'));
  persistor.purge();
};

export const deleteAccountAndClearAll = async (dispatch) => {
  await AuthAPI.unRegisterDeviceToken(Platform.OS);
  resetLocalStorage();
  resetSecureItems();
  dispatch(resetAction());
  dispatch(resetConnection());
  dispatch(resetCredential());
  await dispatch(resetCache());
  await dispatch(deleteUserAccount()).unwrap();
  dispatch(resetAuth());
  dispatch(changeAppStatus('idle'));
  persistor.purge();
};
