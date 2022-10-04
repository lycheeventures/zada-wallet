import { createAsyncThunk } from '@reduxjs/toolkit';
import { addConnection, deleteConnection } from '.';
import { RootState } from '..';
import { ConnectionAPI } from '../../gateways';
import { IActionObject } from '../actions/interface';

export const fetchConnections = createAsyncThunk(
  'connection/fetchConnections',
  async () => {
    try {
      const response = await ConnectionAPI.get_all_connections();
      return response.data;
    } catch (e: any) {
      throw e;
    }
  }
);

export const acceptConnection = createAsyncThunk(
  'connection/acceptConnection',
  async (metadata: string, { dispatch }) => {
    try {
      let response = await ConnectionAPI.accept_connection(metadata);
      // Adding new connection to the list.
      dispatch(addConnection(response.data.connection));
      return response.data;
    } catch (e: any) {
      throw e;
    }
  }
);

export const removeConnection = createAsyncThunk(
  'connection/removeConnection',
  async (connId: string, { dispatch, getState }) => {
    try {
      // Current State
      let { actions } = getState() as RootState;
      let actionObj = actions.entities;

      const actionArr = Object.values(actionObj).reduce(
        (acc: IActionObject[], item, index) => {
          item?.connectionId == connId && acc.push(item);
          return acc;
        },
        []
      );

      if (actionArr.length > 0) {
        throw 'Before deleting connection, please make sure you have responded to all offers (actions) available from this connection.';
      }

      let response = await ConnectionAPI.delete_connection(connId);

      dispatch(deleteConnection(connId));

      return response.data;
      // for (let i = 0; i < actionArr.length; i++) {
      //   if (actionArr[i] !== undefined) {
      //     // Delete connection actions
      //     if (actionArr[i]?.connectionId && actionArr[i].type == ConstantList.CONN_REQ) {
      //       dispatch(deleteAction(actionArr[i].connectionId));
      //     }

      //     // Delete credential (certificate offers) actions
      //     if (
      //       actionArr[i]?.connectionId &&
      //       actionArr[i]?.credentialId &&
      //       actionArr[i].type == ConstantList.CRED_OFFER
      //     ) {
      //       // Delete from redux
      //       let combinedCredId = actionArr[i].connectionId + actionArr[i].credentialId;
      //       dispatch(deleteAction(combinedCredId));
      //     }

      //     // Delete Verification Actions
      //     if (
      //       actionArr[i]?.connectionId &&
      //       actionArr[i]?.verificationId &&
      //       actionArr[i].type == ConstantList.VER_REQ
      //     ) {
      //       // Delete from redux
      //       let combinedVerId = actionArr[i].connectionId + actionArr[i].verificationId;
      //       dispatch(deleteAction(combinedVerId));
      //     }
      //   }
      // }

      // // Remove Credentials
      // let credArr = Object.values(credObj).filter((x) => x?.connectionId == connId);
      // credArr.forEach((e) => {
      //   if (e?.credentialId) dispatch(deleteCredential(e?.credentialId));
      // });

      // // Remove Connection
      // dispatch(deleteConnection(connId));

      // return response.data;
    } catch (e: any) {
      throw e;
    }
  }
);
