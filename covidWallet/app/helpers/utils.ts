import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { btoa, atob } from 'react-native-quick-base64';

export const capitalizeFirstLetter = (str: string) => {
  if (!str) {
    str = '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const sortValuesByKey = (values: any) => {
  return Object.keys(values)
    .sort()
    .reduce((obj: any, key) => {
      obj[key] = values[key];
      return obj;
    }, {});
};

export const convertStringToBase64 = (str: string) => {
  return btoa(str);
};

export const convertBase64ToString = (str: string) => {
  return atob(str);
};

// Get secure items from storage.
export const getSecureItems = async () => {
  try {
    // Retrieve the credentials
    let credentials = await Keychain.getInternetCredentials('Server');
    credentials = JSON.parse(credentials.password);
    return credentials;
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
    return null;
  }
};

// Store secure items in storage.
export const storeSecureItems = async (key: string, value: any) => {
  try {
    value = JSON.stringify(value);
    await Keychain.setInternetCredentials('Server', key, value);
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
    return null;
  }
};

// Remove secure storage
export const resetSecureItems = async () => {
  try {
    // Retrieve the credentials
    await Keychain.resetInternetCredentials('Server');
  } catch (error) {
    console.log("Keychain couldn't be accessed!", error);
    return null;
  }
};

export const resetLocalStorage = async () => {
  let allKeys = (await AsyncStorage.getAllKeys()) as string[];
  let index = allKeys.indexOf('isAppSetupComplete');
  allKeys.splice(index, 1);
  AsyncStorage.multiRemove(allKeys)
};
