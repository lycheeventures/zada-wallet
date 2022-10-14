import React, { useEffect } from 'react';
import BackgroundService from 'react-native-background-actions';

import { store, useAppDispatch } from '../store';
import { updateIsAuthorized } from '../store/auth';
import CryptoJS from 'react-native-crypto-js';
import { getItem, saveItem } from '../helpers/Storage';
// import { getUserCredentials } from '../helpers/utils';

const options = {
  taskName: 'Example',
  taskTitle: 'ExampleTask title',
  taskDesc: 'ExampleTask description',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
  parameters: {
    delay: 1000,
  },
};

const useDecryption = () => {
  const dispatch = useAppDispatch();
  const reduxStore = store.getState();
  const user = reduxStore.auth.user;

  const backgroundDataEncryption = async () => {
    await BackgroundService.start(encrypt_userData, options);
    await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' }); // Only Android, iOS will ignore this call
    // iOS will also run everything here in the background until .stop() is called
    await BackgroundService.stop();
  };

  // Decrypt User data
  const decrypt_userData = async () => {
    // // User secret
    // let password = await getUserCredentials();
    // if (password) {
    //   var iv = CryptoJS.MD5(password);

    //   let cipherObject = await getItem('STORE');
    //   if (reduxStore != null && cipherObject) {
    //     let decipherObject = await new Promise(async (resolve) => {
    //       let result = decrypt(cipherObject, iv);
    //       console.log('typeof result => ', typeof result);
    //       resolve(result);
    //     });
    //     // update redux data
    //     console.log('decipherObject => ', decipherObject);
    //   } else {
    //     console.log('cipherObject is empty');
    //   }
    // } else {
    //   console.log('Unable to decrypt data!');
    // }
  };

  // Encrypt User data
  const encrypt_userData = async (taskDataArguments: any) => {
    // await new Promise(async (resolve, reject) => {
    //   // User secret
    //   let password = await getUserCredentials();
    //   if (password) {
    //     var iv = CryptoJS.MD5(password);

    //     // encrypt
    //     let ecryptedData = encrypt(reduxStore, iv);
    //     console.log('ecryptedData => ', ecryptedData);
    //     await saveItem('STORE', ecryptedData);
    //     console.log('Encrypted!');
    //     resolve(true);
    //   } else {
    //     console.log('Unable to encrypt!');
    //     reject();
    //   }
    // });
  };

  const encrypt = (data: any, iv: CryptoJS.lib.WordArray) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), iv, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  };

  const decrypt = (data: any, iv: CryptoJS.lib.WordArray) => {
    let bytes = CryptoJS.AES.decrypt(data, iv, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    let decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
    // return JSON.parse(
    //   CryptoJS.enc.Utf8.stringify(
    //     CryptoJS.AES.decrypt(data, iv, {
    //       keySize: 128 / 8,
    //       iv: iv,
    //       mode: CryptoJS.mode.CBC,
    //       padding: CryptoJS.pad.Pkcs7,
    //     })
    //   )
    // );
  };

  // const storeUserCredentials = async () => {
  //   const username = user.id;
  //   const password = reduxStore.auth.user.walletSecret;
  //   if (password)
  //     // Store the credentials
  //     await Keychain.setGenericPassword(username, password);
  // };

  const decrpytData = async () => {
    // Decrypt User Data
    // await decrypt_userData();

    dispatch(updateIsAuthorized(true));
  };

  return {
    decrpytData,
    decrypt_userData,
    backgroundDataEncryption,
  };
};

export default useDecryption;
