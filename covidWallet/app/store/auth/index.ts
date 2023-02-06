import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { _showAlert } from '../../helpers';
import { IAuthState, IUserState } from './interface';
import { loginUser, reactivateUserAccount, registerUser, resetUserPassword } from './thunk';

// State initialization
export const AuthState: IAuthState = {
  status: 'idle',
  isAuthorized: false,
  error: {
    code: undefined,
    message: undefined,
    name: undefined,
    stack: undefined,
  },
  token: undefined,
  user: {
    isNew: true,
    id: undefined,
    walletSecret: undefined,
    type: undefined,
    auto_accept_connection: true,
    status: undefined,
  },
  tempVar: {
    isNew: true,
    id: undefined,
    walletSecret: undefined,
    type: undefined,
    auto_accept_connection: true,
    status: undefined,
  },
};

// Creating Slice
const slice = createSlice({
  name: 'auth',
  initialState: AuthState,
  reducers: {
    updateAuthStatus(state, action) {
      state.status = action.payload;
    },
    updateIsAuthorized(state, action) {
      state.isAuthorized = action.payload;
    },
    updateToken: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) state.token = action.payload;
    },
    updateUser: (state, action: PayloadAction<IUserState | undefined>) => {
      if (action.payload) {
        state.user = action.payload;
      }
    },
    updateTempVar: (state, action) => {
      if (action.payload) {
        state.tempVar = action.payload;
      }
    },
    resetAuth: () => AuthState,
  },
  extraReducers: (builder) => {
    // Login.
    builder.addCase(loginUser.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        state.user.type = action.payload?.type;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });

    // Register.
    builder.addCase(registerUser.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        state.user.type = action.payload.type;
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });

     // Reset Password.
     builder.addCase(resetUserPassword.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(resetUserPassword.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(resetUserPassword.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });


    // Account re-activation
    builder.addCase(reactivateUserAccount.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(reactivateUserAccount.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        _showAlert('ZADA Wallet', 'Account Re-activated! Please login again.');
      }
    });
    builder.addCase(reactivateUserAccount.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });
  },
});

// Exporting Actions
export const {
  updateToken,
  updateUser,
  updateTempVar,
  updateAuthStatus,
  updateIsAuthorized,
  resetAuth,
} = slice.actions;

export { slice as AuthSlice };
