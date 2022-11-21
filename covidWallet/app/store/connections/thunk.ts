import { createAsyncThunk } from '@reduxjs/toolkit';
import { addConnection, deleteConnection } from '.';
import { RootState } from '..';
import { ConnectionAPI } from '../../gateways';
import { IActionObject } from '../actions/interface';

export const fetchConnections = createAsyncThunk('connection/fetchConnections', async () => {
  try {
    const response = await ConnectionAPI.get_all_connections();
    return response.data;
  } catch (e: any) {
    throw e;
  }
});

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

      const actionArr = Object.values(actionObj).reduce((acc: IActionObject[], item, index) => {
        item?.connectionId == connId && acc.push(item);
        return acc;
      }, []);

      // Throw error if actions are available from this connection.
      if (actionArr.length > 0) {
        throw 'custom:Unable to delete, this connection has action items available.';
      }

      // Delete connection API call.
      let response = await ConnectionAPI.delete_connection(connId);

      // Delete connection from redux.
      dispatch(deleteConnection(connId));

      return response.data;
    } catch (e: any) {
      throw e;
    }
  }
);
