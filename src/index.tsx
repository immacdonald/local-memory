import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import 'phantom-library/styles';
import './styles/core/index.module.scss';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
