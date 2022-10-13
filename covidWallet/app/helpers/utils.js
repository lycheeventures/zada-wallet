import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const capitalizeFirstLetter = (str) => {
  if (!str) {
    str = '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const sortValuesByKey = (values) => {
  return Object.keys(values)
    .sort()
    .reduce((obj, key) => {
      obj[key] = values[key];
      return obj;
    }, {});
};

// Get secure items from storage.
export const getSecureItems = async (key) => {
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
export const storeSecureItems = async (key, value) => {
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
  AsyncStorage.clear();
};
