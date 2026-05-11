import React from 'react';
import ReactDOM from 'react-dom/client';
import WrappedApp from './App';

import './i18n';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <WrappedApp />
    </React.StrictMode>
);
