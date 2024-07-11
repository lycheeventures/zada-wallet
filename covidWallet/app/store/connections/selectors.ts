import { createEntityAdapter } from '@reduxjs/toolkit';
import { RootState } from '..';
import { IConnectionObject } from './interface';

// Adapter
export const ConnectionAdapter = createEntityAdapter({
  selectId: (action: IConnectionObject) => action.connectionId,
});

// Selectors
export const selectConnections = ConnectionAdapter.getSelectors(
  (s: RootState) => s.connection
);
export const selectConnectionList = (s: RootState) => s.connection.connectionlist;
export const selectConnectionsStatus = (state: RootState) => state.connection.status;
export const selectConnectionsError = (state: RootState) => state.connection.error;
