import { ColorScheme, ColorSchemeProvider, MantineProvider, Skeleton } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Suspense, useState } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import BasePage from './entry/BasePage';
import { useTranslation } from 'react-i18next';
import StimulationToolPage from './pages/StimulationTool/StimulationToolPage';
import { AuthenticationForm } from './pages/Authentication/Signin';
import firebaseAuthenticationProvider from './infra/firebase/firebaseAuthenticationProvider';
import { AuthenticationProvider } from './core/auth/authenticationProvider';

// TODO: upgrade to mantine v7

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    const { t } = useTranslation();

    const router = createHashRouter([
        {
            path: "login",
            element: <AuthenticationForm />
        },
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
                    <RouterProvider router={router} />
                </BasePage>
            </MantineProvider>
        </ColorSchemeProvider>
    );
}

export const authProvider = new firebaseAuthenticationProvider() as AuthenticationProvider;

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