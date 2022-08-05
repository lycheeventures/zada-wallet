import { createSlice } from '@reduxjs/toolkit';
import { IConnectionState } from './interface';
import { removeConnection, fetchConnections, acceptConnection } from './thunk';
import { ConnectionAdapter } from './selectors';

// State initialization
export const ConnectionState: IConnectionState = {
  status: 'loading',
  error: undefined,
};

// Slice
export const slice = createSlice({
  name: 'connection',
  initialState: ConnectionAdapter.getInitialState(ConnectionState),
  reducers: {
    addConnection: ConnectionAdapter.addOne,
    addConnections: ConnectionAdapter.addMany,
    deleteConnection: ConnectionAdapter.removeOne,

    changeConnectionStatus(state, action) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch connection.
    builder.addCase(fetchConnections.pending, (state, action) => {
      // Handle the fetch result pending
      if (state.status === 'idle') {
        state.status = 'loading';
      }
    });
    builder.addCase(fetchConnections.fulfilled, (state, action) => {
      if (action.payload.success) {
        ConnectionAdapter.upsertMany(state, action.payload.connections);
        state.status = 'idle';
      }
    });
    builder.addCase(fetchConnections.rejected, (state, action) => {
      if (action.payload) {
        state.status = 'failed';
        state.error = action.error.message;
      }
    });

    // Accept Connection
    builder.addCase(acceptConnection.pending, (state, action) => {
      // Handle the accept connection result by inserting the connection.
      state.status = 'pending';
    });
    builder.addCase(acceptConnection.fulfilled, (state, action) => {
      if (action.payload) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(acceptConnection.rejected, (state, action) => {
      if (action.payload) {
        state.status = 'failed';
        state.error = action.error.message;
      }
    });

    // Delete connection.
    builder.addCase(removeConnection.pending, (state, action) => {
      state.status = 'pending';
    });
    builder.addCase(removeConnection.fulfilled, (state, action) => {
      if (action.payload) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(removeConnection.rejected, (state, action) => {
      if (action.error) {
        state.status = 'failed';
        state.error = action.error.message;
      }
    });
  },
});

// Exporting Actions
export const { changeConnectionStatus, addConnection, deleteConnection } = slice.actions;

export { slice as ConnectionSlice };
