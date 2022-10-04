import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import ConstantsList from '../../helpers/ConfigApp';
import { IConnectionObject } from '../connections/interface';

export const fetchActions = createAsyncThunk(
  'actions/fetchActions',
  async (args, { getState }) => {
    try {
      console.log('fetching actions ...');
      // Current State
      const { connection } = getState() as RootState;
      const connArr = Object.values(connection.entities) as IConnectionObject[];

      const response = await CredentialAPI.get_all_credentials_offers();

      let offers = response.data.offers;
      let actions = {
        success: response.data.success,
        actions: [] as any,
      };

      if (response.data.success) {
        for (let i = 0; i < offers.length; ++i) {
          // Adding Credential Object
          offers[i]['type'] = ConstantsList.CRED_OFFER;
          actions.actions[i] = addImageAndNameFromConnectionList(offers[i], connArr);
        }
      }

      // Adding Verification Object
      let verifications = await createVerificationObject(connArr);
      actions.actions = actions.actions.concat(verifications);

      return actions;
    } catch (e: any) {
      throw e;
    }
  }
);

// Create Verification Object
const createVerificationObject = async (connections: IConnectionObject[]) => {
  try {
    let result = await VerificationAPI.get_all_verification_proposals();

    if (result.data.success) {
      let verifications = result.data.verifications;

      if (verifications.length === 0) return [];

      let verification_arr = [] as any;
      for (let i = 0; i < verifications.length; i++) {
        let tempObj = verifications[i];
        // Adding type to verification request.
        tempObj['type'] = ConstantsList.VER_REQ;

        // Adding Image and Name to array.
        tempObj = addImageAndNameFromConnectionList(tempObj, connections);

        // Adding obj to array
        verification_arr.push(tempObj);
      }

      // Returning array
      return verification_arr;
    }
  } catch (e) {
    throw e;
  }
};

const addImageAndNameFromConnectionList = (
  obj: any,
  connections: IConnectionObject[]
) => {
  connections.forEach((e) => {
    if (e.connectionId == obj.connectionId) {
      obj.imageUrl = e.imageUrl;
      obj.organizationName = e.name;
    }
  });

  return obj;
};
