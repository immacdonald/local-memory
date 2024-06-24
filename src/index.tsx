import React from 'react';
import { ResponsiveContextProvider } from 'phantom-library';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.tsx';
import 'phantom-library/styles';
import './styles/core/index.module.scss';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ResponsiveContextProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <App />
            </BrowserRouter>
        </ResponsiveContextProvider>
    </React.StrictMode>
);
