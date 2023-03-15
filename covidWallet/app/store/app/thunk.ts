import { createAsyncThunk } from '@reduxjs/toolkit';
import { ConnectionAPI, CredentialAPI, throwErrorIfExist } from '../../gateways';

export const resetCache = createAsyncThunk('auth/resetCache', async () => {
  try {
    ConnectionAPI.invalidateCache();
    CredentialAPI.invalidateCache();
  } catch (e) {
    throwErrorIfExist(e);
  }
});
