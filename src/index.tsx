import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import 'phantom-library/styles';
import './styles/core/index.module.scss';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
