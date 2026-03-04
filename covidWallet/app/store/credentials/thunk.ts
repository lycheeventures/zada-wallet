import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteCredential, updateCredential } from '.';
import { RootState } from '..';
import { CredentialAPI } from '../../gateways';
import { delete_credential_from_groups } from '../../helpers/Credential_Groups';
import { IConnectionObject } from '../connections/interface';
import { ICredentialObject, ICredentialObjectValues } from './interface';

// Fetching credentials
export const fetchCredentials = createAsyncThunk(
  'credential/fetchCredentials',
  async (args, getState) => {
    try {
      // Current State
      const currentState = getState.getState() as RootState;
      const connections = currentState.connection.entities;
      const credentials = currentState.credential.entities;

      // Getting all credentials from database.
      const response = await CredentialAPI.get_all_credentials();
      const credArr: ICredentialObject[] = response.data.credentials;
      let credObj = {
        success: response.data.success,
        credentials: [] as any,
      };

      for (let i = 0; i < credArr.length; i++) {
        let cred = credArr[i];

        let credentialFromCurrentState = Object.values(credentials).find(
          x => x?.credentialId == cred.credentialId
        );

        let qrCode = undefined;
        // Set v3 QR Code if already present in store.
        if (credentialFromCurrentState?.qrCode?.v === 3) {
          qrCode = credentialFromCurrentState.qrCode;
        }

        // Finding connection from store.
        let item: IConnectionObject | undefined = Object.values(connections).find(
          c => c?.connectionId == cred.connectionId
        );

        let obj = {
          ...cred,
          imageUrl: item?.imageUrl ? item?.imageUrl : null,
          organizationName: item?.name ? item?.name : null,
          qrCode: qrCode,
          credentialType: cred.type,
          type:
            cred.values != undefined && cred.values.Type != undefined
              ? cred.values.Type
              : (cred.values != undefined || cred.values != null) &&
                cred.values['Vaccine Name'] != undefined &&
                cred.values['Vaccine Name'].length != 0 &&
                cred.values['Dose'] != undefined &&
                cred.values['Dose'].length != 0
              ? 'COVIDpass (Vaccination)'
              : 'Digital Certificate',
        };
        credObj.credentials.push(obj);
      }
      console.log('Fetched Credentials: ', credObj.credentials);
      return credObj;
    } catch (e: any) {
      throw e;
    }
  }
);

export const addCredential = createAsyncThunk(
  'credential/addCredential',
  async (cred: ICredentialObject, { getState }) => {
    // Current State
    const currentState = getState() as RootState;
    const connections = currentState.connection.entities;
    const credentials = currentState.credential.entities;

    let credObj = {
      success: true,
      credentials: Object.values(credentials) as any[],
    };

    // Finding connection from store.
    let item: IConnectionObject | undefined = Object.values(connections).find(
      c => c?.connectionId == cred.connectionId
    );

    let obj = {
      ...cred,
      imageUrl: item?.imageUrl ? item?.imageUrl : null,
      organizationName: item?.name ? item?.name : null,
      qrCode: undefined,
      type:
        cred.values != undefined && cred.values.Type != undefined
          ? cred.values.Type
          : (cred.values != undefined || cred.values != null) &&
            cred.values['Vaccine Name'] != undefined &&
            cred.values['Vaccine Name'].length != 0 &&
            cred.values['Dose'] != undefined &&
            cred.values['Dose'].length != 0
          ? 'COVIDpass (Vaccination)'
          : 'Digital Certificate',
    };

    credObj.credentials.push(obj);

    return credObj;
  }
);

// Removing credential
export const removeCredentials = createAsyncThunk(
  'credential/removeCredentials',
  async (credentialId: string, { getState, dispatch }) => {
    try {
      // Current State
      let { credential } = getState() as RootState;
      let credObj = credential.entities;

      let cred = Object.values(credObj).find(x => x?.credentialId == credentialId);

      // Delete credentials API call
      await CredentialAPI.delete_credential(credentialId, cred?.correlationId);

      // Removing Credentials from local storage
      if (cred?.credentialId) {
        dispatch(deleteCredential(cred?.credentialId));

        // Removing Credentials Group from Async storage
        delete_credential_from_groups(cred?.credentialId);
      }
      return { success: true };
    } catch (e) {
      throw e;
    }
  }
);

// Compressing credentials
export const compressCredentials = createAsyncThunk(
  'credential/compressCredentials',
  async (threadId: string, { getState, dispatch }) => {
    try {
      // Current State
      let currentState = getState() as RootState;
      const credentials = currentState.credential.entities;

      let credObj = Object.values(credentials).find(x => x?.threadId == threadId);

      // Return if credObj is undefined.
      if (!credObj) {
        return { success: true };
      }

      // Return if QR is not undefined
      if (credObj.qrCode !== undefined) {
        return { success: true };
      }

      // Making QR code.
      const orderedData = Object.keys(credObj.values)
        .sort()
        .reduce((obj: any, key) => {
          obj[key] = credObj?.values[key as keyof ICredentialObjectValues];
          return obj;
        }, {});
      let qrObj = {
        d: Object.values(orderedData),
        id: credObj.credentialId,
        threadId,
      };

      let result = await CredentialAPI.compress_credential_qr(qrObj);
      if (result.data.success) {
        let newQRObj = {
          d: result.data.compressed,
          v: 3,
          type: 'cv',
          i: 'zada',
        };
        dispatch(updateCredential({ id: credObj.credentialId, changes: { qrCode: newQRObj } }));
      }
      return { success: true };
    } catch (e) {
      throw e;
    }
  }
);
