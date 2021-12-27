/*
    File that contains all apis related to middleware APIs
*/

import axios from "axios";

const AGENCY_URLS = {
    DEV: 'http://89aa-182-191-80-60.ngrok.io',
    TEST: 'http://test-agency.zadanetwork.com',
    PRODUCTION: 'https://agency.zadanetwork.com',
}

const http_client = axios.create({
    baseURL: AGENCY_URLS.TEST,
    timeout: 120000,
    timeoutErrorMessage: 'Request is timed out, Please check your internet connection and try again.',
});

/**
 * Function to authenticate user
 * @param {String} userId 
 * @param {String} secretPhrase 
 */
export const AUTHENTICATE_API = (userId, secretPhrase) => {
    try {
        const result = http_client({
            url: '/api/authenticate',
            method: 'POST',
            data: {
                userId: userId,
                secretPhrase: secretPhrase,
            },
        });
        return result;
    } catch (error) {
        throw error;
    }
}