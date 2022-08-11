import { createSlice } from '@reduxjs/toolkit';
import { ICredentialState } from './interface';
import { fetchCredentials, removeCredentials } from './thunk';
import { credentialAdapter } from './selectors';

// State initialization
export const CredentialState: ICredentialState = {
  status: 'loading',
  error: undefined,
};

export const slice = createSlice({
  name: 'credential',
  initialState: credentialAdapter.getInitialState(CredentialState),
  reducers: {
    addCredential: credentialAdapter.addOne,
    addCredentials: credentialAdapter.addMany,
    deleteCredential: credentialAdapter.removeOne,

    changeCredentialStatus(state, action) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCredentials.pending, (state, action) => {
      if (state.status == 'idle') {
        state.status = 'loading';
      }
    });
    builder.addCase(fetchCredentials.fulfilled, (state, action) => {
      if (action.payload.success) {
        credentialAdapter.upsertMany(state, action.payload.credentials);
        state.status = 'idle';
      }
    });
    builder.addCase(fetchCredentials.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error?.message;
    });

    // Remove Credentials
    builder.addCase(removeCredentials.pending, (state, action) => {
      state.status = 'pending';
    });
    builder.addCase(removeCredentials.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(removeCredentials.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error?.message;
    });
  },
});

// Exporting Actions
export const { changeCredentialStatus, addCredential, deleteCredential } = slice.actions;

// export const {
//     selectAll: selectAllCredentials,
// } = credentialAdapter.getSelectors((state: RootState) => state.action)

export { slice as CredentialSlice };
