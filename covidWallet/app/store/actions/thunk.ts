import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import ConstantsList from '../../helpers/ConfigApp';
import { IConnectionObject } from '../connections/interface';
import { fetchAcceptConnectionList } from '../connections/thunk';

export const fetchActions = createAsyncThunk(
  'actions/fetchActions',
  async (_, { getState, dispatch }) => {
    try {
      let state = getState() as RootState;

      //  connections exist
      if (Object.keys(state.connection.entities).length === 0) {
        await dispatch(fetchAcceptConnectionList()).unwrap();
        state = getState() as RootState;
      }

      const connArr = Object.values(state.connection.entities) as IConnectionObject[];

      // Fetch offers
      const response = await CredentialAPI.get_all_credentials_offers();

      const offers = response.data.offers || [];
      const actions = {
        success: response.data.success,
        actions: [] as any[],
      };

      if (response.data.success) {
        for (const offer of offers) {
          const obj = {
            ...offer,
            type: ConstantsList.CRED_OFFER,
          };

          actions.actions.push(addImageAndNameFromConnectionList(obj, connArr));
        }
      }

      // 3. Fetch verifications
      const verifications = await createVerificationObject(connArr);
      actions.actions = actions.actions.concat(verifications);

      return actions;
    } catch (e) {
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
        if (tempObj.organizationName !== undefined) {
          // Adding obj to array
          verification_arr.push(tempObj);
        }
      }

      // Returning array
      return verification_arr;
    }
  } catch (e) {
    throw e;
  }
};

const addImageAndNameFromConnectionList = (obj: any, connections: IConnectionObject[]) => {
  connections.forEach(e => {
    if (e.connectionId == obj.connectionId) {
      obj.imageUrl = e.imageUrl;
      obj.organizationName = e.name;
    }
  });

  return obj;
};
