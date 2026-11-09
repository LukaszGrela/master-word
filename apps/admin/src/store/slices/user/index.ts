import { userSlice } from './slice';

export * from './types';

export const { setAuthorized } = userSlice.actions;

export default userSlice.reducer;
