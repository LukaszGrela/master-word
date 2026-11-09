import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { apiReducer, reducerPath, middleware } from './slices/api';
import config from './slices/config';
import configForm from './slices/config-form';
import user from './slices/user';

export const store = configureStore({
  reducer: {
    [reducerPath]: apiReducer,
    config,
    configForm,
    user
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);
