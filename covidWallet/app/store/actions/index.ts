import { createSlice } from '@reduxjs/toolkit';
import { IActionState } from './interface';
import { ActionAdapter } from './selectors';
import { fetchActions } from './thunk';

// State initialization
export const ActionState: IActionState = {
  status: 'loading',
  error: undefined,
};

// Slice
export const slice = createSlice({
  name: 'action',
  initialState: ActionAdapter.getInitialState(ActionState),
  reducers: {
    addAction: ActionAdapter.addOne,
    deleteAction: ActionAdapter.removeOne,

    changeActionStatus(state, action) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    // FetchActions
    builder.addCase(fetchActions.pending, (state, action) => {
      // Handle the fetch result by inserting the actions here
      if (state.status == 'idle') {
        state.status = 'loading';
      }
    });
    builder.addCase(fetchActions.fulfilled, (state, action) => {
      // Handle the fetch result by inserting the actions here
      if (action.payload.success) {
        ActionAdapter.upsertMany(state, action.payload.actions);
        state.status = 'idle';
      }
    });
    builder.addCase(fetchActions.rejected, (state, action) => {
      // Handle the rejected result
      if (action.error) {
        state.status = 'failed';
        state.error = action.error.message;
      }
    });
  },
});

// Exporting Actions
export const { changeActionStatus, addAction, deleteAction } = slice.actions;

export { slice as ActionSlice };
