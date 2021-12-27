/*
    File contains everything related to async storage
*/

import AsyncStorage from "@react-native-async-storage/async-storage";

export const ASYNC_CONFIG = {

    CONNECTION_REQUESTS: 'conn_requests',
    CREDENTIAL_REQUESTS: 'cred_requests',
    VERIFICATION_REQUESTS: 'ver_requests',

    CONNECTIONS: 'connections',
    CREDENTIALS: 'credentials',
    VERIFICATIONS: 'verifications',

}

/**
 * Function to save value in async storage with respective to key
 * @param {String} key 
 * @param {String} value 
 */
export const _setAsync = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        throw error;
    }
}

/**
 * Function to get value from async storage using key
 * @param {String} key
 */
export const _getAsync = async (key) => {
    try {
        await AsyncStorage.getItem(key);
    } catch (error) {
        throw error;
    }
}