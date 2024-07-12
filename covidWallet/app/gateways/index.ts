import * as AuthAPI from './auth';
import * as CredentialAPI from './credentials';
import * as ConnectionAPI from './connections';
import * as VerificationAPI from './verifications';
import { ResponseCodesEnum } from '../enums';
import { showOKDialog, _showAlert } from '../helpers';
import { clearAllAndLogout } from '../store/utils';
import { store } from '../store';
import { navigationRef } from '../navigation/utils';

const alertsToShow = new Set<string>();

// Exception List
const exceptionList = ['The specified key does not exist.'];
// Errors
const UNEXPECTED_ERROR = 'This was not suppose to happen. Our team has been notified.';
const SERVER_DOWN = 'Something is wrong with our servers. Please try again later.';
const SERVER_TIMEOUT = 'The operation could not be completed. Please try again!';
const INVALID_TOKEN = 'Your Session has expired. Please login again.';
const INVALID_PARAMS = 'Invalid parameters!';
const ALREADY_EXIST = 'Already exist in database';
const QR_ERROR = 'Not a valid ZADA QR';

export function throwErrorIfExist(error: any) {
  if (error?.response?.data.error) {
    throw error?.response?.data.error;
  } else {
    throw error;
  }
}

export function responseCodeMessages(code: number) {
  switch (code) {
    case ResponseCodesEnum.BAD_REQUEST:
      return INVALID_PARAMS;
    case ResponseCodesEnum.NOT_AUTHORIZED:
      return INVALID_TOKEN;
    case ResponseCodesEnum.ALREADY_FOUND:
      return ALREADY_EXIST;
    case ResponseCodesEnum.INTERNAL_SERVER_ERROR:
      return UNEXPECTED_ERROR;
    case ResponseCodesEnum.SERVICE_UNAVAILABLE:
      return SERVER_DOWN;
    case ResponseCodesEnum.GATEWAY_TIMEOUT:
      return SERVER_TIMEOUT;

    default:
      return 'Something went wrong!';
  }
}

export function handleErrorMessage(error: any) {
  if (error.response.status && !error.response.data.error) {
    let userMessage = responseCodeMessages(error.response.status);
    error.response.data.error = userMessage;
  }

  if (exceptionList.includes(error.response.data.error)) return;

  if (error.response.data.error === 'Invalid Token!') {
    showOKDialog('Session Timeout', INVALID_TOKEN, () => clearAllAndLogout(store.dispatch, 'timeout'));
    return;
  }

  if (error.response.data.error === 'Unsupported URL!') {
    showOKDialog('ZADA', QR_ERROR, async () => navigationRef.navigate('MainScreen'));
    return;
  }

  let errorMessage = error.response.data.message;

  if (errorMessage && errorMessage.length > 1) {
    _showAlert('Error', error.response.data.message);
    return;
  }
  alertsToShow.add(error.response.data.error);
  setTimeout(() => trigegShowAlert(), 2000);
}

const trigegShowAlert = () => {
  const alertMessages = Array.from(alertsToShow);
  alertsToShow.clear();
  alertMessages.map(alertMessage => {
    _showAlert('Error', alertMessage);
  })
}

export { AuthAPI, CredentialAPI, ConnectionAPI, VerificationAPI };
