import jwt_decode from 'jwt-decode';
import { updateToken } from '.';
import { RootState } from '..';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthAPI } from '../../gateways';

export const fetchToken = createAsyncThunk('auth/fetchToken', async (args, { getState }) => {
  try {
    // Current State
    let { auth } = getState() as RootState;
    let userId = auth.user.id || '';
    let walletSecret = auth.user.walletSecret || '';

    let response = await AuthAPI.authenticate(userId, walletSecret);
    if (response.data.success) {
      const decodedAuthToken = jwt_decode(response.data.token);
      if (decodedAuthToken?.dub?.length) {
        return response.data;
      } else {
        throw 'Unable to create wallet.';
      }
    } else {
      throw 'Authentication failed!';
    }
  } catch (e) {
    throw e;
  }
});

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (args: { phone: string; secret: string }) => {
    try {
      let { phone, secret } = args;
      let response = await AuthAPI.login(phone, secret);
      let authResponse = await AuthAPI.authenticate(response?.data.userId, secret);
      return {
        success: response?.data.success,
        token: authResponse?.data.token,
        userId: response?.data.userId,
        walletSecret: secret,
        type: response?.data.type,
      };
    } catch (e) {
      throw e;
    }
  }
);

export const createWallet = createAsyncThunk('auth/createWallet', async () => {
  try {
    return await AuthAPI.createWallet();
  } catch (e) {
    throw e;
  }
});
