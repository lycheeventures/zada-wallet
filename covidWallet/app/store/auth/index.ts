import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { _showAlert } from '../../helpers';
import { IAuthState, IUserState } from './interface';
import { getUserProfile, reactivateUserAccount, resetUserPassword, sendOTP, updateUserProfile, validateUserOTP } from './thunk';

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
    name: undefined,
    email: undefined,
    walletSecret: undefined,
    phone: undefined,
    type: undefined,
    country: undefined,
    language: undefined,
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
    resetAuth: () => AuthState,
  },
  extraReducers: (builder) => {
    // Validate OTP
    builder.addCase(validateUserOTP.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(validateUserOTP.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.user.id = action.payload.userId;
        state.token = action.payload.token;
        state.status = 'succeeded';
      }
    });
    builder.addCase(validateUserOTP.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });

    // Send OTP
    builder.addCase(sendOTP.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(sendOTP.fulfilled, (state, action) => {
      if (action.payload?.success) {
        if (action.payload?.type === 'demo') {
          state.token = action.payload.token;
          state.status = 'succeeded';
        }
      }
    });
    builder.addCase(sendOTP.rejected, (state, action) => {
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

    // Get user profile
    builder.addCase(getUserProfile.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(getUserProfile.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        state.user.name = action.payload.user.name;
        state.user.email = action.payload.user.email;
        state.user.country = action.payload.user.country;
        state.user.language = action.payload.user.language;
      }
    });
    builder.addCase(getUserProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });

    // Update user profile
    builder.addCase(updateUserProfile.pending, (state, action) => {
      if (state.status === 'idle') {
        state.status = 'pending';
      }
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });
  },
});

// Exporting Actions
export const { updateToken, updateUser, updateAuthStatus, updateIsAuthorized, resetAuth } =
  slice.actions;

export { slice as AuthSlice };
