import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IConfigState, TSetConfigPayload } from './types';

const initialState: IConfigState = {
  selectedLength: 5,
  selectedLanguage: 'pl',

  supportedLength: [],
  supportedLanguages: [],
};
const SLICE_NAME = 'config' as const;

export const configSlice = createSlice({
  initialState,
  name: SLICE_NAME,
  reducers: {
    setConfig: (state, action: PayloadAction<TSetConfigPayload>) => {
      const { supportedLanguages, supportedLength } = action.payload;

      if (supportedLanguages.indexOf(state.selectedLanguage) === -1) {
        state.selectedLanguage = '';
      }
      if (supportedLength.indexOf(state.selectedLength) === -1) {
        state.selectedLength = -1;
      }

      state.supportedLanguages = supportedLanguages;
      state.supportedLength = supportedLength;
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      if (state.supportedLanguages.indexOf(action.payload) !== -1) {
        state.selectedLanguage = action.payload;
      }
    },
  },
});
