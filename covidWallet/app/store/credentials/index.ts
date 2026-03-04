import { createSlice } from '@reduxjs/toolkit';
import { ICredentialState } from './interface';
import { addCredential, fetchCredentials, removeCredentials } from './thunk';
import { CredentialAdapter } from './selectors';

// State initialization
export const CredentialState: ICredentialState = {
  fetchCredentials: 'initial',
  addCredential: 'initial',
  deleteCredential: 'initial',
  error: {
    code: undefined,
    message: undefined,
    name: undefined,
    stack: undefined,
  },
};

export const slice = createSlice({
  name: 'credential',
  initialState: CredentialAdapter.getInitialState(CredentialState),
  reducers: {
    addCredentials: CredentialAdapter.addMany,
    updateCredential: CredentialAdapter.updateOne,
    deleteCredential: CredentialAdapter.removeOne,

    resetFetchCredentialStatus(state) {
      state.fetchCredentials = 'initial';
    },

    resetDeleteCredentialStatus(state) {
      state.deleteCredential = 'initial';
    },

    resetAddCredentialStatus(state) {
      state.addCredential = 'initial';
    },

    // changeCredentialStatus(state, action) {
    //   state.fetchCredentials = action.payload;
    //   state.addCredential = action.payload;
    //   state.deleteCredential = action.payload;
    // },
    resetCredential: () => CredentialAdapter.getInitialState(CredentialState),
  },
  extraReducers: builder => {
    builder.addCase(fetchCredentials.pending, (state, action) => {
      if (state.fetchCredentials === 'loading') return;
      state.fetchCredentials = 'loading';
    });
    builder.addCase(fetchCredentials.fulfilled, (state, action) => {
      if (action.payload.success) {
        CredentialAdapter.upsertMany(state, action.payload.credentials);
        state.fetchCredentials = 'success';
      }
    });
    builder.addCase(fetchCredentials.rejected, (state, action) => {
      state.fetchCredentials = 'error';
      state.error = action?.error;
    });

    // Add Credential
    builder.addCase(addCredential.pending, (state, action) => {
      if (state.addCredential === 'loading') return;
      state.addCredential = 'loading';
    });
    builder.addCase(addCredential.fulfilled, (state, action) => {
      if (action.payload.success) {
        CredentialAdapter.upsertMany(state, action.payload.credentials);
        state.addCredential = 'success';
      }
    });
    builder.addCase(addCredential.rejected, (state, action) => {
      state.addCredential = 'error';
      state.error = action?.error;
    });

    // Remove Credentials
    builder.addCase(removeCredentials.pending, (state, action) => {
      if (state.deleteCredential === 'loading') return;
      state.deleteCredential = 'loading';
    });
    builder.addCase(removeCredentials.fulfilled, (state, action) => {
      if (action.payload.success) {
        state.deleteCredential = 'success';
      }
    });
    builder.addCase(removeCredentials.rejected, (state, action) => {
      state.deleteCredential = 'error';
      state.error = action?.error;
    });
  },
});

// Exporting Actions
export const {
  resetFetchCredentialStatus,
  resetDeleteCredentialStatus,
  resetAddCredentialStatus,
  updateCredential,
  deleteCredential,
  resetCredential,
} = slice.actions;

// export const {
//     selectAll: selectAllCredentials,
// } = credentialAdapter.getSelectors((state: RootState) => state.action)

export { slice as CredentialSlice };
