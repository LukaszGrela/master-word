import React from 'react';
import ReactDOM from 'react-dom/client';
import MasterWord from './game/MasterWord.tsx';
import './index.css';
import { applyBowserClass } from './utils/bowser.ts';
import { disableReactDevTools } from './utils/disableReactDevTools.ts';
import { loadTranslation } from './i18n/index.ts';
import { noop } from './utils/noop.ts';

applyBowserClass(document.getElementsByTagName('html')[0]);

if (import.meta.env.PROD) {
  disableReactDevTools();
}
// load default
loadTranslation('pl')
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
