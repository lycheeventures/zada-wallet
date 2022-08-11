import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { IActionObject } from './interface';
import ConstantList from '../../helpers/ConfigApp';

export const selectActionsStatus = (state: RootState) => state.actions.status;
export const selectActionsError = (state: RootState) => state.actions.error;

// Example Selector
// createSelector(
//   (s: TotalState) => s.api.profiles.byKey, // gets, us close, only changes when s.api.profile.byKey changes
//   (_: TotalState, userId: string) => userId, // this selector purely for accepting parameters, hence ignored underScore
//   (byKey, userId) => {
//     const rVal = byKey[userId];
//     // console.log(`>>>profileSelector for ${byKey}[${userId}]`, rVal);
//     return rVal;
//   } // this parameterized selector will only update when api.profile.byKey changes
// );

const getUniqueId = (action: IActionObject) => {
  switch (action.type) {
    case ConstantList.CRED_OFFER:
      return action.connectionId + action.credentialId;
    case ConstantList.VER_REQ:
      return action.connectionId + action.verificationId;
    default:
      return action.connectionId;
  }
};

export const ActionAdapter = createEntityAdapter({
  selectId: (action: IActionObject) => getUniqueId(action),
});

// All Actions Selector
export const selectActions = ActionAdapter.getSelectors(
  (state: RootState) => state.actions
);

// Total Actions
export const selectActionCount = selectActions.selectTotal;

// Connection Selector
export const selectConnectionActions = createSelector(
  selectActions.selectAll,
  (actions) => actions.filter((x: IActionObject) => x.type == ConstantList.CONN_REQ)
);

// Credential Selector
export const selectCredentialActions = createSelector(
  selectActions.selectAll,
  (actions) => actions.filter((x: IActionObject) => x.type == ConstantList.CRED_OFFER)
);

// Verification Selector
export const selectVerificationActions = createSelector(
  selectActions.selectAll,
  (actions) => actions.filter((x: IActionObject) => x.type == ConstantList.VER_REQ)
);
