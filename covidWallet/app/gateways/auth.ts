import http_client from './http_client';
import { analytics_log_register_success, analytics_log_verifies_otp } from '../helpers/analytics';
import { throwErrorIfExist } from '.';

// login user api
export const login = async (phone: string, secret: string) => {
  try {
    console.log(phone, secret);
    const result = await http_client({
      method: 'POST',
      url: '/api/login',
      data: JSON.stringify({
        phone: phone,
        secretPhrase: secret,
      }),
    });

    return result;
  } catch (error) {
    throwErrorIfExist(error);
  }
};

// authenticate user api
export const authenticate = async (userID: String, secret: String) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/authenticate',
      data: JSON.stringify({
        userId: userID,
        secretPhrase: secret,
      }),
    });

    return result;
  } catch (error) {
    throw error;
  }
};

// register user api
export const _registerUserAPI = async (name: string, phone: string, secretPhrase: string) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/register',
      data: {
        name,
        phone,
        secretPhrase,
      },
    });

    analytics_log_register_success();

    return result;
  } catch (error) {
    throw error;
  }
};

// resend otp code api
export const _resendOTPAPI = async (userID: string, type: string) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/resend_codes',
      data: {
        userId: userID,
        type: type,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Send password reset link
export const _sendPasswordResetAPI = async (phone: string) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/recover',
      data: {
        phone,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// api to fetch user profile data
export const _fetchProfileAPI = async () => {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/get_user_data',
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// api to update user profile
export const _updateProfileAPI = async (data: Object) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/update_user',
      data: data,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Validate OTP
export async function validateOTP(phoneConfirmationCode: string, userId: string) {
  try {
    let obj = {
      otpsms: phoneConfirmationCode,
      userId: userId,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/validateOTPs',
      data: obj,
    });

    analytics_log_verifies_otp();

    return result;
  } catch (error) {
    throw error;
  }
}

// Register device token.
export async function registerDeviceToken(devicePlatform: string, devicePushToken: string) {
  try {
    let obj = {
      platform: devicePlatform,
      deviceToken: devicePushToken,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/enableNotifications',
      data: obj,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function createWallet(token: string) {
  try {
    let headers = {
      Authorization: 'Bearer ' + token,
    };
    const result = await http_client({
      method: 'POST',
      url: '/api/wallet/create',
      headers,
    });
    return result;
  } catch (error) {
    throw error;
  }
}
