import { createSlice } from '@reduxjs/toolkit';
import { IAppState } from './interface';

// State initialization
export const AppState: IAppState = {
  status: 'loading',
  networkStatus: 'disconnected',
};

// Slice
export const slice = createSlice({
  name: 'app',
  initialState: AppState,
  reducers: {
    changeAppStatus(state, action) {
      state.status = action.payload;
    },
    updateNetworkStatus(state, action) {
      state.networkStatus = action.payload;
    },
  },
});

// Exporting Actions
export const { changeAppStatus, updateNetworkStatus } = slice.actions;

export { slice as AppSlice };
