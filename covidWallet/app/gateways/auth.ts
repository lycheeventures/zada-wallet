import http_client from './http_client';
import { analytics_log_register_success, analytics_log_verifies_otp } from '../helpers/analytics';
import { throwErrorIfExist } from '.';
import { store } from '../store';

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
export const authenticate = async (prevToken: String) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/v1/authenticate',
      data: { token: prevToken },
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
export const _resendOTPAPI = async (phone: string, type: string, secret?: string) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/v1/resend_codes',
      data: { phone, type, secretPhrase: secret },
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

// Send password reset link
export const resetPassword = async (password: string, metadata: string) => {
  try {
    const result = await http_client({
      method: 'POST',
      url: 'api/resetPassword',
      data: {
        password,
        metadata,
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
export async function validateOTP(phone: string, code: string) {
  try {
    let obj = {
      phone: phone,
      otpsms: code,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/v1/validateOTPs',
      data: obj,
    });

    analytics_log_verifies_otp();

    return result;
  } catch (error) {
    throw error;
  }
}

// Get User Status
export async function getUserStatus(phone: string) {
  try {
    let obj = {
      phone: phone,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/get_user_status',
      data: obj,
    });

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

// Unregister device token.
export async function unRegisterDeviceToken(devicePlatform: string) {
  try {
    let obj = {
      platform: devicePlatform,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/disableNotifications',
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

export async function reactivateAccount(phone: string) {
  try {
    let obj = {
      phone,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/reactivate',
      data: obj,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function deleteAccount() {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/delete_account',
    });
    return result;
  } catch (error) {
    throw error;
  }
}


export async function fetchAllowedCountryList() {
  try {
    const baseUrl = store.getState().app.baseUrl
    const response = await fetch(`${baseUrl}/api/v1/get_allowed_countries`, {
      method: 'GET'
    })
    const allowedCountries = await response.json();
    return allowedCountries;
  } catch (error) {
    throw error;
  }
}