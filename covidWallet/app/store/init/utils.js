import createTransform from 'redux-persist/es/createTransform';
import CryptoJS from 'react-native-crypto-js';

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
