import React from 'react';
import ReactDOM from 'react-dom/client';
import MasterWord from './game/MasterWord.tsx';
import './index.css';
import { applyBowserClass } from './utils/bowser.ts';
import { disableReactDevTools } from './utils/disableReactDevTools.ts';
import { loadTranslation } from './i18n/index.ts';
import { noop } from './utils/noop.ts';
import { AppStorage } from './utils/localStorage/index.ts';
import { TSupportedLanguages } from './api/types.ts';

applyBowserClass(document.getElementsByTagName('html')[0]);

if (import.meta.env.PROD) {
  disableReactDevTools();
}
// load default
if (!AppStorage.getInstance().has('ui-language')) {
  AppStorage.getInstance().setItem('ui-language', 'pl');
}
loadTranslation(
  (AppStorage.getInstance().getItem('ui-language') as TSupportedLanguages) ||
    'pl'
)
  .then(noop)
  .catch(noop)
  .finally(() => {
    // ready or not here I come
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <MasterWord attempts={8} />
      </React.StrictMode>
    );
  });
