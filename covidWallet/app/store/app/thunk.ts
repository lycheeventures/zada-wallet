import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConnectionAPI, CredentialAPI, throwErrorIfExist } from '../../gateways';

export const resetCache = createAsyncThunk('auth/resetCache', async () => {
  try {
    await CredentialAPI.invalidateCache();
    await ConnectionAPI.invalidateCache();
  } catch (e) {
    throwErrorIfExist(e);
  }
});
