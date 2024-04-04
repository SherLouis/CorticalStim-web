import { ColorScheme, ColorSchemeProvider, MantineProvider, Skeleton } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Suspense, useState } from 'react';
import { Routes, Route, HashRouter, createHashRouter, RouterProvider } from 'react-router-dom';
import BasePage from './entry/BasePage';
import { useTranslation } from 'react-i18next';
import StimulationToolPage from './pages/StimulationTool/StimulationToolPage';

// TODO: upgrade to mantine v7

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('dark');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    const { t } = useTranslation();

    const router = createHashRouter([
        {
          path: "*",
          element: <StimulationToolPage />
        },
      ]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications position="top-right" />
                <BasePage title={t('app.title')}>
                    <RouterProvider router={router}/>
                </BasePage>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export default function WrappedApp() {
    const fallback = (<div>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
    </div>);
    return (
        <Suspense fallback={fallback}>
            < App />
        </Suspense >
    );
}