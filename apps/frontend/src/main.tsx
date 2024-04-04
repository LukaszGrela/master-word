/* v8 ignore start */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { applyBowserClass, disableReactDevTools } from '@repo/utils';
import { App } from './App.tsx';
import './styles/index.scss';

applyBowserClass(document.getElementsByTagName('html')[0]);

if (import.meta.env.PROD) {
  disableReactDevTools();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
/* v8 ignore stop */
