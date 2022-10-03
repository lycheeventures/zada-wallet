import { createSelector } from "reselect";
import { RootState } from "..";

// true selector
export const trueSelector = createSelector([], () => true);

// Exporting State Selector
export const tokenSelector = (s: RootState) => s.auth.token;

// export const selectToken = createSelector(
//     (s: RootState) => s.auth.token,
//     (token) => // do something with token
// );
