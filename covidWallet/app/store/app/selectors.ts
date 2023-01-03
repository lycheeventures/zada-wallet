import { RootState } from '..';

export const selectActionsStatus = (state: RootState) => state.app.status;

export const selectNetworkStatus = (state: RootState) =>  state.app.networkStatus;

export const selectDevelopmentMode = (state: RootState) => state.app.developmentMode;
