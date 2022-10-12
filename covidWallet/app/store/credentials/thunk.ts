import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteCredential } from '.';
import { RootState } from '..';
import { CredentialAPI } from '../../gateways';
import { delete_credential_from_groups } from '../../helpers/Credential_Groups';
import { IConnectionObject } from '../connections/interface';
import { ICredentialObject } from './interface';

// Fetching credentials
export const fetchCredentials = createAsyncThunk(
  'credential/fetchCredentials',
  async (args, getState) => {
    try {
      // Current State
      const currentState = getState.getState() as RootState;
      const credentials = currentState.credential.entities;
      const connections = currentState.connection.entities;

      // Getting all credentials from database.
      const response = await CredentialAPI.get_all_credentials();
      const credArr: ICredentialObject[] = response.data.credentials;
      let credObj = {
        success: response.data.success,
        credentials: [] as any,
      };

      for (let i = 0; i < credArr.length; i++) {
        let cred = credArr[i];
        // Finding connection from store.
        let item: IConnectionObject | undefined = Object.values(connections).find(
          (c) => c?.connectionId == cred.connectionId
        );

        // Finding credential from store.
        let credItem = Object.values(credentials).find(
          (x) => x?.credentialId == cred.credentialId
        );

        // Adding QR Code.
        let qrCode = credItem?.qrCode;
        if (qrCode == undefined) {
          qrCode = await get_qr_credentials(cred.credentialId, cred.values);
        }

        // if (item !== undefined || null) {
        //   let obj = {
        //     ...cred,
        //     imageUrl: item?.imageUrl,
        //     organizationName: item?.name,
        //     qrCode: qrCode,
        //     type:
        //       cred.values != undefined && cred.values.Type != undefined
        //         ? cred.values.Type
        //         : (cred.values != undefined || cred.values != null) &&
        //           cred.values['Vaccine Name'] != undefined &&
        //           cred.values['Vaccine Name'].length != 0 &&
        //           cred.values['Dose'] != undefined &&
        //           cred.values['Dose'].length != 0
        //         ? 'COVIDpass (Vaccination)'
        //         : 'Digital Certificate',
        //   };
        //   credObj.credentials.push(obj);
        // }
        let obj = {
          ...cred,
          imageUrl: item?.imageUrl ? item?.imageUrl : null,
          organizationName: item?.name ? item?.name : null,
          qrCode: qrCode,
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

      return credObj;
    } catch (e: any) {
      throw e;
    }
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

      // Delete credentials API call
      await CredentialAPI.delete_credential(credentialId);

      // Removing Credentials from local storage
      let cred = Object.values(credObj).find((x) => x?.credentialId == credentialId);
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

const get_qr_credentials = async (credentialId?: string, values?: {}) => {
  try {
    // Return if null
    if (!credentialId || !values) return undefined;

    let qrResult = await CredentialAPI.fetch_signature_by_cred_id(credentialId, values);
    return qrResult.success ? qrResult.qrcode : undefined;
  } catch (e) {
    throw e;
  }
};
