import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State Interface
export interface IAuthState {
  token: string | undefined;
}

// State initialization
export const AuthState: IAuthState = {
  token: undefined,
};

// Creating Slice
const slice = createSlice({
  name: 'auth',
  initialState: AuthState,
  reducers: {
    updateToken: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) state.token = action.payload;
    },
  },
});

// Exporting Actions
export const { updateToken } = slice.actions;

export { slice as AuthSlice };
