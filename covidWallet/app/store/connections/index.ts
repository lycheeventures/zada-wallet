import { createSlice } from '@reduxjs/toolkit';
import { IConnectionList, IConnectionState } from './interface';
import { removeConnection, fetchConnections, acceptConnection, fetchConnectionList } from './thunk';
import { ConnectionAdapter } from './selectors';

// State initialization
export const ConnectionState: IConnectionState = {
  status: 'loading',
  error: {
    code: undefined,
    message: undefined,
    name: undefined,
    stack: undefined,
  },
  connectionlist: [],
};

// Slice
export const slice = createSlice({
  name: 'connection',
  initialState: ConnectionAdapter.getInitialState(ConnectionState),
  reducers: {
    addConnection: ConnectionAdapter.addOne,
    addConnections: ConnectionAdapter.addMany,
    deleteConnection: ConnectionAdapter.removeOne,

    updateConnectionlist: (state, action) => {
      state.connectionlist = action.payload;
    },

    changeConnectionStatus(state, action) {
      state.status = action.payload;
    },
    resetConnection: () => ConnectionAdapter.getInitialState(ConnectionState),
  },
  extraReducers: (builder) => {
    // Fetch connection.
    builder.addCase(fetchConnections.pending, (state, action) => {
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
      state.status = 'failed';
      state.error = action?.error;
    });

    // Accept Connection
    builder.addCase(acceptConnection.pending, (state, action) => {
      state.status = 'accepting_connection';
    });
    builder.addCase(acceptConnection.fulfilled, (state, action) => {
      if (action.payload) {
        state.status = 'succeeded';
      }
    });
    builder.addCase(acceptConnection.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
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
      state.status = 'failed';
      state.error = action?.error;
    });

    // Get Connection list
    builder.addCase(fetchConnectionList.pending, (state, action) => {
      state.status = 'loading';
    });
    builder.addCase(fetchConnectionList.fulfilled, (state, action) => {
      if (action.payload) {
        state.status = 'succeeded';
        let connectionsArray = [] as IConnectionList[];

        // create an array where the connection is not present in the state
        connectionsArray = action.payload.connections.filter((item: IConnectionList) => {
          return Object.values(state.entities).length > 0 ? Object.values(state.entities).every((value) => {
            return value?.name !== item.name
          }) : true
        })

        state.connectionlist = connectionsArray
      }
    });
    builder.addCase(fetchConnectionList.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action?.error;
    });
  },
});

// Exporting Actions
export const { changeConnectionStatus, addConnection, deleteConnection, updateConnectionlist, resetConnection } =
  slice.actions;

export { slice as ConnectionSlice };
