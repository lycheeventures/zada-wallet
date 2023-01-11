import { createSelector } from 'reselect';
import { RootState } from '..';

// export const selectToken = createSelector(
//     (s: RootState) => s.auth.token,
//     (token) => // do something with token
// );

// true selector
export const trueSelector = createSelector([], () => true);

// Exporting State Selector
export const selectToken = (s: RootState) => s.auth.token;

export const selectUser = (s: RootState) => s.auth.user;

export const selectAutoAcceptConnection = (state: RootState) =>
  state.auth.user.auto_accept_connection;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthorized = (state: RootState) => state.auth.isAuthorized;
export const selectAuthError = (state: RootState) => state.auth.error;