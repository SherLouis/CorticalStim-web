import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Suspense, useState } from 'react';
import { Routes, Route, HashRouter, BrowserRouter } from 'react-router-dom';
import BasePage from './entry/BasePage';
import DefaultPage from './pages/default/Default';
import { useTranslation } from 'react-i18next';
import ReportPage from './pages/report/ReportPage';

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    const { t } = useTranslation();

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications position="top-right" />
                <BasePage title={t('app.title')}>
                    <HashRouter>
                        <Routes>
                            <Route path='*' element={<DefaultPage />} /> {/* This is the default Route */}
                        </Routes>
                    </HashRouter>
                </BasePage>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default function WrappedApp() {
    return (
        <Suspense fallback="Loading...">
            <App />
        </Suspense>
    );
}