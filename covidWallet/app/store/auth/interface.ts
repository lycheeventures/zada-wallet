import { RootState } from '..';

export const selectToken = (state: RootState) => state.auth.token;
