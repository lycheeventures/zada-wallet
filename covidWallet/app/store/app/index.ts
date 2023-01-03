import { createSlice } from '@reduxjs/toolkit';
import { IAppState } from './interface';

// State initialization
export const AppState: IAppState = {
  status: 'loading',
  networkStatus: 'connected',
  developmentMode: false,
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
    updateDevelopmentMode(state, action) {
      state.developmentMode = action.payload;
    },
    resetApp: () => AppState,
  },
});

// Exporting Actions
export const { changeAppStatus, updateNetworkStatus, updateDevelopmentMode, resetApp } =
  slice.actions;

export { slice as AppSlice };
