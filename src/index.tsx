import { ResponsiveContextProvider } from '@imacdonald/phantom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import '@imacdonald/phantom/style/variables';
import './styles/core/index.module.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ResponsiveContextProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <App />
            </BrowserRouter>
        </ResponsiveContextProvider>
    </React.StrictMode>
);
