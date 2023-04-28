import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthAPI, throwErrorIfExist } from '../../gateways';
import { navigationRef } from '../../navigation/utils';
import { updateAuthStatus } from '.';
import { showAskDialog, _showAlert } from '../../helpers';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (args: { phone: string; secret: string }, { dispatch }) => {
    let { phone, secret } = args;
    let response = await AuthAPI.login(phone, secret);
    let data = response?.data;

    // Check status
    if (data.status != undefined) {
      if (data.status === 'deleted') {
        // deleted user.
      } else if (data.status === 'inactive') {
        showAskDialog(
          'Re-activate Account',
          'Do you want to re-activate your account?',
          () => dispatch(reactivateUserAccount({ phone })),
          () => {
            dispatch(updateAuthStatus('idle'));
          },
          'Re-activate',
          'default',
          'Cancel',
          'destructive'
        );
      }
    } else {
      if (data.verified) {
        if (data.type === 'demo') {
          navigationRef.navigate('SecurityScreen', {
            navigation: navigationRef,
            user: { ...data, phone, secret: secret },
          });
          dispatch(updateAuthStatus('idle'));
          return;
        }
      }

      navigationRef.navigate('MultiFactorScreen', {
        from: 'Login',
        user: { ...data, phone, secret: secret },
      });
      dispatch(updateAuthStatus('idle'));
    }
    return data.success;
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (args: { name: string; phone: string; secret: string }, { dispatch }) => {
    try {
      let { name, phone, secret } = args;
      let response = await AuthAPI._registerUserAPI(name, phone, secret);
      let data = response?.data;
      if (data.status == 'inactive') {
        _showAlert('ZADA Wallet', 'User already exist!');
        dispatch(updateAuthStatus('idle'));
        return;
      }

      navigationRef.navigate('MultiFactorScreen', {
        from: 'Register',
        user: { ...data, phone, secret: secret },
      });

      return response.data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

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
  async (args: { code: string; userId: string; phone: string }) => {
    try {
      let { code, userId, phone } = args;
      let response = await AuthAPI.validateOTP(code, userId, phone);
      if (response?.data.success) {
        navigationRef.navigate('ResetPasswordScreen', { metadata: response?.data.token });
      }
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
