import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { navigationRef } from '../../navigation/utils';
import { IAuthState, IUserState } from './interface';
import { fetchToken, loginUser, registerUser } from './thunk';

// State initialization
export const AuthState: IAuthState = {
  status: 'idle',
  isAuthorized: false,
  error: undefined,
  token: undefined,
  user: {
    isNew: true,
    id: undefined,
    walletSecret: undefined,
    type: undefined,
    auto_accept_connection: true,
  },
  tempVar: {
    isNew: true,
    id: undefined,
    walletSecret: undefined,
    type: undefined,
    auto_accept_connection: true,
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
    logout: (state) => {
      state.token = undefined;
      state.user = {
        isNew: true,
        id: undefined,
        walletSecret: undefined,
        type: undefined,
        auto_accept_connection: true,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Token.
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        state.token = action.payload.token;
        // state.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxM2FlMjYxYS1lNzc0LTRiNWMtYTY0ZS1kNjdjODVlZDcwOWMiLCJkdWIiOiIwYjc2OTIyYy0zYmMyLTQyMGQtODg1Ni02NzBhMTdjMmM3NTEiLCJpYXQiOjE2NjQxOTU0ODMsImV4cCI6MTY2NDIxMzQ4M30.WEsUdv6J0Dxw9DfxpdAGUx2QryGYKXp3drEe1yX_RKk'
        state.user.id = state.tempVar.id;
        state.user.walletSecret = state.tempVar.walletSecret;
        state.user.isNew = false;
        state.user.type = state.tempVar.type;
      }
    });
    builder.addCase(fetchToken.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error?.message;
    });

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
      state.error = action?.error?.message;
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
      state.error = action?.error?.message;
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
  logout,
} = slice.actions;

export { slice as AuthSlice };
