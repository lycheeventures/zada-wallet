import { createSlice } from '@reduxjs/toolkit';
import { ICredentialState } from './interface';
import { fetchCredentials, removeCredentials } from './thunk';
import { CredentialAdapter } from './selectors';

// State initialization
export const CredentialState: ICredentialState = {
  status: 'loading',
  error: undefined,
};

export const slice = createSlice({
  name: 'credential',
  initialState: CredentialAdapter.getInitialState(CredentialState),
  reducers: {
    addCredential: CredentialAdapter.addOne,
    addCredentials: CredentialAdapter.addMany,
    updateCredential: CredentialAdapter.updateOne,
    deleteCredential: CredentialAdapter.removeOne,

    changeCredentialStatus(state, action) {
      state.status = action.payload;
    },
    resetCredential: () => CredentialAdapter.getInitialState(CredentialState),
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCredentials.pending, (state, action) => {
      if (state.status == 'idle') {
        state.status = 'loading';
      }
    });
    builder.addCase(fetchCredentials.fulfilled, (state, action) => {
      if (action.payload.success) {
        CredentialAdapter.upsertMany(state, action.payload.credentials);
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
export const {
  changeCredentialStatus,
  addCredential,
  updateCredential,
  deleteCredential,
  resetCredential,
} = slice.actions;

// export const {
//     selectAll: selectAllCredentials,
// } = credentialAdapter.getSelectors((state: RootState) => state.action)

export { slice as CredentialSlice };
