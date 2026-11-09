import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUserState } from './types';

const initialState: IUserState = {
  authorized: false,
};

const SLICE_NAME = 'user';

export const userSlice = createSlice({
  initialState,
  name: SLICE_NAME,
  reducers: {
    setAuthorized: (state, action: PayloadAction<boolean>) => {
      state.authorized = action.payload;
    },
  },
});
