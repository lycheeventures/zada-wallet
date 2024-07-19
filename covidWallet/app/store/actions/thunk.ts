import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '..';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import ConstantsList, { PROD_BASE_URL, ZADA_WALLET_ID_CRED_DEF_PROD, ZADA_WALLET_ID_CRED_DEF_TEST } from '../../helpers/ConfigApp';
import { IConnectionObject } from '../connections/interface';
import { showMessage } from '../../helpers';
import { updateShowClaimButton } from '../app';
import { accept_credential } from '../../gateways/credentials';
import { addCredential } from '../credentials/thunk';
import { deleteAction } from '.';
import { ICredentialObject } from '../credentials/interface';

export const fetchActions = createAsyncThunk(
  'actions/fetchActions',
  async (args, { dispatch, getState }) => {
    try {
      // Current State
      const { connection, app } = getState() as RootState;
      const connArr = Object.values(connection.entities) as IConnectionObject[];

      // Getting credDef for wallet ID
      const ZadaWalletIdCredDef = PROD_BASE_URL === app.baseUrl ? ZADA_WALLET_ID_CRED_DEF_PROD : ZADA_WALLET_ID_CRED_DEF_TEST;

      const response = await CredentialAPI.get_all_credentials_offers();

      console.log({ response: response?.data?.offers })

      let offers = response.data.offers;
      let actions = {
        success: response.data.success,
        actions: [] as any,
      };

      if (response.data.success) {
        for (let i = 0; i < offers.length; ++i) {
          // Adding Credential Object
          offers[i]['type'] = ConstantsList.CRED_OFFER;
          if (offers[i].definitionId === ZadaWalletIdCredDef) {
            // accept credential offer
            let result = await accept_credential(offers[i].credentialId);

            let cred_dict = result.data.credential;

            let attributes = cred_dict.credential_proposal_dict.credential_proposal.attributes;

            let values: any = {}
            for (let item of attributes) {
              values[item.name] = item.value;
            }


            let cred = {
              acceptedAtUtc: cred_dict.updated_at,
              connectionId: cred_dict.connection_id,
              correlationId: cred_dict.credential_exchange_id,
              credentialId: cred_dict.credential_exchange_id,
              definitionId: cred_dict.credential_definition_id,
              issuedAtUtc: cred_dict.created_at,
              schemaId: cred_dict.schema_id,
              state: 'Issued',
              threadId: cred_dict.thread_id,
              values,
            };

            if (result.data.success) {
              dispatch(updateShowClaimButton(false))
              dispatch(addCredential(cred as any));
            }
          } else {
            actions.actions[i] = addImageAndNameFromConnectionList(offers[i], connArr);
          }
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
