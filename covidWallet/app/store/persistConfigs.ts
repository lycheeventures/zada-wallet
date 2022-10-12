import AsyncStorage from '@react-native-async-storage/async-storage';
import createTransform from 'redux-persist/es/createTransform';
import CryptoJS from 'react-native-crypto-js';
import { createMigrate } from 'redux-persist';
import { RootState } from '.';
import { saveItem } from '../helpers/Storage';

// const encrypt = createTransform(
//   (inboundState, key) => {
//     console.log('emc...', key);
//     if (!inboundState) return inboundState;
//     // const cryptedText = CryptoJS.AES.encrypt(JSON.stringify(inboundState), 'secret key 123');
//     // return cryptedText.toString();
//     let password = '123456';
//     if (password) {
//       let iv = CryptoJS.MD5(password);
//       let encrypted = CryptoJS.AES.encrypt(JSON.stringify(inboundState), iv, {
//         keySize: 128 / 8,
//         iv: iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//       }).toString();

//       console.log('encrypted => ', encrypted);
//       saveItem('STORE', encrypted);
//       return encrypted;
//     }
//   },
//   (outboundState, key) => {
//     console.log('dec...=> ', key);
//     if (!outboundState) return outboundState;
//     // const bytes = CryptoJS.AES.decrypt(outboundState, 'secret key 123');
//     let password = '1234526';
//     if (password) {
//       let iv = CryptoJS.MD5(password);
//       let bytes = CryptoJS.AES.decrypt(outboundState, iv, {
//         keySize: 128 / 8,
//         iv: iv,
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7,
//       });
//       const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//       return JSON.parse(decrypted);
//     }
//   }
// );

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['auth'],
  // transforms: [encrypt],
};

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  version: 1,
  blacklist: ['status'],
  // transforms: [encrypt],
};

export { rootPersistConfig, authPersistConfig };
