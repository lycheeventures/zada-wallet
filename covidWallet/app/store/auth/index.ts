import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState, IUserState } from './interface';
import { fetchToken, loginUser } from './thunk';

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
  },
  tempVar: {
    isNew: true,
    id: undefined,
    walletSecret: undefined,
    type: undefined,
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
        state.user = action.payload;
      }
    },
    logout: (state) => {
      state.token = undefined;
      state.user = {
        isNew: true,
        id: undefined,
        walletSecret: undefined,
        type: undefined,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch Token.
    builder.addCase(fetchToken.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.status = 'succeeded';
        state.isAuthorized = true;
        state.token = action.payload.token;
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
        state.user.type = action.payload.type;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
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
