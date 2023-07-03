import { RootState } from '..';

export const selectAppStatus = (state: RootState) => state.app.status;

export const selectNetworkStatus = (state: RootState) =>  state.app.networkStatus;

export const selectDevelopmentMode = (state: RootState) => state.app.developmentMode;

export const selectAppSetupComplete = (state: RootState) => state.app.isAppSetupComplete;
