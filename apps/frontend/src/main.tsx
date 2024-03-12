import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyBowserClass } from './utils/bowser.ts';
import { disableReactDevTools } from './utils/disableReactDevTools.ts';
import { AppStorage } from './utils/localStorage/index.ts';
import { EStorageKeys } from './utils/localStorage/enums.ts';
import { App } from './App.tsx';
import './styles/index.scss';

applyBowserClass(document.getElementsByTagName('html')[0]);

if (import.meta.env.PROD) {
  disableReactDevTools();
}
if (!AppStorage.getInstance().has(EStorageKeys.UI_LANGUAGE)) {
  AppStorage.getInstance().setItem(EStorageKeys.UI_LANGUAGE, 'pl');
}
if (!AppStorage.getInstance().has(EStorageKeys.GAME_LANGUAGE)) {
  AppStorage.getInstance().setItem(
    EStorageKeys.GAME_LANGUAGE,
    AppStorage.getInstance().getItem(EStorageKeys.UI_LANGUAGE) || 'pl'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
