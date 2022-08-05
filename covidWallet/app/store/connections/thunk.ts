import { createAsyncThunk } from '@reduxjs/toolkit';
import { addConnection, deleteConnection } from '.';
import { RootState } from '..';
import { ConnectionAPI } from '../../gateways';
import { deleteAction } from '../actions';
import { removeCredentials } from '../credentials/thunk';

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
      let response = await ConnectionAPI.delete_connection(connId);

      // Current State
      let { credential, actions } = getState() as RootState;
      let credObj = credential.entities;
      let actionObj = actions.entities;

      // Remove Connection
      dispatch(deleteConnection(connId));

      // Remove Credential
      let credArr = Object.values(credObj).filter((x) => x?.connectionId == connId);
      credArr.forEach((e) => {
        if (e?.credentialId) dispatch(removeCredentials(e?.credentialId));
      });

      // Remove Actions
      let actionArr = Object.values(actionObj).filter((x) => x?.connectionId == connId);
      actionArr.forEach((e) => {
        // Removing Credential Actions
        if (e?.connectionId && e?.credentialId) {
          let combinedCredId = e?.connectionId + e?.credentialId;
          dispatch(deleteAction(combinedCredId));
        }

        // Removing Verification Actions
        if (e?.connectionId && e?.verificationId) {
          let combinedVerId = e?.connectionId + e?.verificationId;
          dispatch(deleteAction(combinedVerId));
        }
      });

      return response.data;
    } catch (e: any) {
      throw e;
    }
  }
);
