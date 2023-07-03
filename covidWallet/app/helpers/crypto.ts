import CryptoJS from 'react-native-crypto-js';
import { sha256 } from 'react-native-sha256';

export const performSHA256 = async (str: string) => {
  return sha256(str);
};

export const generateRandomSecret = (len: number) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$&?@#%!0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const encryptAES256CBC = async (data: any, key: string) => {
  let encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
    keySize: 256 / 16,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();

  return encrypted;
};

export const decryptAES256CBC = (data: any, key: string) => {
  let bytes = CryptoJS.AES.decrypt(data, key, {
    keySize: 256 / 16,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};
