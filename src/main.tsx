import React from 'react';
import ReactDOM from 'react-dom/client';
import MasterWord from './game/MasterWord.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MasterWord attempts={8} />
  </React.StrictMode>
);
