import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthAPI, throwErrorIfExist } from '../../gateways';
import { navigationRef } from '../../navigation/utils';
import { _showAlert } from '../../helpers';

export const createWallet = createAsyncThunk('auth/createWallet', async (token: string) => {
  try {
    await AuthAPI.createWallet(token);
  } catch (e) {
    throwErrorIfExist(e);
  }
});

export const reactivateUserAccount = createAsyncThunk(
  'auth/reactivateUserAccount',
  async (args: { phone: string }) => {
    try {
      let { phone } = args;
      let response = await AuthAPI.reactivateAccount(phone);
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'auth/deleteUserAccount',
  async (args: { phone: string }) => {
    try {
      let response = await AuthAPI.deleteAccount();
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const validateUserOTP = createAsyncThunk(
  'auth/validateUserOTP',
  async (args: { phone: string; code: string }) => {
    try {
      let { phone, code } = args;
      let response = await AuthAPI.validateOTP(phone, code);
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const getUserStatus = createAsyncThunk(
  'auth/getUserStatus',
  async (args: { phone: string }) => {
    try {
      let { phone } = args;
      let response = await AuthAPI.getUserStatus(phone);
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const getUserProfile = createAsyncThunk('auth/getUserProfile', async () => {
  try {
    let response = await AuthAPI._fetchProfileAPI();
    return response?.data;
  } catch (e) {
    throwErrorIfExist(e);
  }
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (args: Object) => {
    try {
      let response = await AuthAPI._updateProfileAPI({ ...args });
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetUserPassword',
  async (args: { password: string; metadata: string }) => {
    try {
      let { password, metadata } = args;
      let response = await AuthAPI.resetPassword(password, metadata);
      if (response?.data.success) {
        _showAlert('Password Changed!', 'Your password has been changed successfully!');
        navigationRef.navigate('LoginScreen');
      }
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

// Resend Codes
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (args: { phone: string; secret?: string; channel: string }) => {
    try {
      let { phone, secret, channel } = args;
      let response = await AuthAPI._resendOTPAPI(phone, 'phone', channel, secret);
      return response?.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);
