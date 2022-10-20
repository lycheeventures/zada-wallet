import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '..';
import { IActionState } from './interface';
import { ActionAdapter, selectActions } from './selectors';
import { fetchActions } from './thunk';

// State initialization
export const ActionState: IActionState = {
  status: 'loading',
  error: {
    code: undefined,
    message: undefined,
    name: undefined,
    stack: undefined,
  },
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
    resetAction: () => {
      console.log(ActionAdapter.getInitialState(ActionState));
      return ActionAdapter.getInitialState(ActionState);
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
      state.status = 'failed';
      state.error = action?.error;
    });
  },
});

// Exporting Actions
export const { changeActionStatus, addAction, deleteAction, resetAction } = slice.actions;

export { slice as ActionSlice };
