import { createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import { ICredentialObject } from './interface';

export const CredentialAdapter = createEntityAdapter({
  selectId: (action: ICredentialObject) => action.credentialId,
});

// Select Status
export const selectCredentialsStatus = (state: RootState) => state.credential.status;

// Select Error
export const selectCredentialsError = (state: RootState) => state.credential.error;

// Select all credentials
export const selectCredentials = CredentialAdapter.getSelectors((s: RootState) => s.credential);

// Select sorted array
export const selectSortedCredentials = createSelector(selectCredentials.selectAll, (cred) =>
  cred.sort((a, b) => new Date(a.issuedAtUtc).getTime() - new Date(b.issuedAtUtc).getTime())
);

export const selectSearchedCredentials = createSelector(
  selectCredentials.selectAll,
  (_: ICredentialObject[], searchTerm: string) => searchTerm,
  (cred: ICredentialObject[], searchTerm) => {
    // Return sorted array
    if (searchTerm.length == 0) {
      return cred.sort(
        (a, b) => new Date(a.issuedAtUtc).getTime() - new Date(b.issuedAtUtc).getTime()
      );
    }

    // Return filtered array
    let filteredCred = cred.filter(function (cred) {
      return cred.type.toLocaleLowerCase().match(searchTerm.toLocaleLowerCase());
    });
    return filteredCred;
  }
);
