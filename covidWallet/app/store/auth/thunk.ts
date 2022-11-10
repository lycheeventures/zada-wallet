import jwt_decode from 'jwt-decode';
import { RootState } from '..';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthAPI, throwErrorIfExist } from '../../gateways';
import { navigationRef } from '../../navigation/utils';
import { updateTempVar } from '.';
import { storeSecureItems } from '../../helpers/utils';

export const fetchToken = createAsyncThunk(
  'auth/fetchToken',
  async (
    args: { secret: string | undefined; tempUserId?: string | undefined },
    { getState, dispatch }
  ) => {
    try {
      // Current State
      let { secret, tempUserId } = args;
      let { auth } = getState() as RootState;
      let userId = auth.user.id || '';

      // If userid is passed
      if (tempUserId) {
        userId = tempUserId;
      }

      let walletSecret;
      if (secret != undefined) {
        walletSecret = secret;
      } else {
        walletSecret = auth.user.walletSecret ? auth.user.walletSecret : '';
      }

      let response = await AuthAPI.authenticate(userId, walletSecret);
      if (response.data.success) {
        // saving token in secure storage
        await storeSecureItems('TOKEN', response.data.token);

        const decodedAuthToken = jwt_decode(response.data.token);
        if (decodedAuthToken?.dub?.length) {
          return response.data;
        } else {
          await dispatch(createWallet(response.data.token));
        }
      } else {
        throw 'Authentication failed!';
      }
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (args: { phone: string; secret: string }) => {
    try {
      let { phone, secret } = args;
      let response = await AuthAPI.login(phone, secret);
      let data = {
        success: undefined,
        userId: undefined,
        walletSecret: secret,
        type: undefined,
        token: undefined,
        verified: undefined,
        status: undefined,
      };

      // If success then authenticate user.
      if (response?.data.success) {
        data = {
          success: response?.data.success,
          userId: response?.data.userId,
          walletSecret: secret,
          type: response?.data.type,
          verified: response?.data.verified,
          token: undefined,
          status: response?.data.status,
        };
        if (response?.data.verified) {
          let authResp = await AuthAPI.authenticate(response?.data.userId, secret);
          data = {
            ...data,
            token: authResp.data.token,
          };
        }
      }

      return data;
    } catch (e) {
      throwErrorIfExist(e);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (args: { name: string; phone: string; secret: string }, { dispatch }) => {
    try {
      let { name, phone, secret } = args;
      let response = await AuthAPI._registerUserAPI(name, phone, secret);
      let data = response.data;
      // Handling new and unverified user.
      if (!data.verified || data.status === 'inactive') {
        await dispatch(
          updateTempVar({
            isNew: true,
            type: data.type,
            id: data.userId,
            walletSecret: secret,
            auto_accept_connection: true,
          })
        );
      }

      return {
        success: data.success,
        type: data.type,
        status: data.status,
      };
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
