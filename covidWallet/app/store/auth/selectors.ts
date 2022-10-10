import { createSelector } from 'reselect';
import { RootState } from '..';

// true selector
export const trueSelector = createSelector([], () => true);

// Exporting State Selector
export const selectToken = (s: RootState) => s.auth.token;

export const selectUser = (s: RootState) => s.auth.user;
export const selectTempVar = (state: RootState) => state.auth.tempVar;

export const selectAutoAcceptConnection = (state: RootState) =>
  state.auth.user.auto_accept_connection;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthorized = (state: RootState) => state.auth.isAuthorized;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthorized = (state: RootState) => state.auth.isAuthorized;
export const selectAuthError = (state: RootState) => state.auth.error;
// export const selectToken = createSelector(
//     (s: RootState) => s.auth.token,
//     (token) => // do something with token
// );
