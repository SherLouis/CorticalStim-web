import { ColorScheme, ColorSchemeProvider, MantineProvider, Skeleton } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Suspense, useState } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import BasePage from './entry/BasePage';
import { useTranslation } from 'react-i18next';
import StimulationToolPage from './pages/StimulationTool/StimulationToolPage';
import { LoginPage } from './pages/Authentication/Login';
import firebaseAuthenticationProvider from './infra/firebase/firebaseAuthenticationProvider';
import { AuthenticationProvider } from './core/auth/authenticationProvider';
import { RegisterPage } from './pages/Authentication/Register';
import { AuthContextProvider } from './context/AuthContext';
import { RequireAuth } from './components/routing/RequireAuth';
import { VerifyEmailPage } from './pages/Authentication/VerifyEmail';
import { RequireVerifiedUser } from './components/routing/RequireVerifiedUser';
import { AppPath } from './pages/Routes';

// TODO: upgrade to mantine v7

function App() {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    const { t } = useTranslation();
    const authProvider = new firebaseAuthenticationProvider() as AuthenticationProvider;

    const router = createHashRouter([
        {
            path: AppPath.LOGIN,
            element: <LoginPage />
        },
        {
            path: AppPath.REGISTER,
            element: <RegisterPage />
        },
        {
            path: AppPath.EMAIL_VERIFY,
            element: <VerifyEmailPage />
        },
        {
            path: "/*",
            element:
                <RequireAuth noAuthRedirect={AppPath.LOGIN}>
                    <RequireVerifiedUser notVerifiedPage={AppPath.EMAIL_VERIFY}>
                        <StimulationToolPage />
                    </RequireVerifiedUser>
                </RequireAuth>
        },
    ]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <AuthContextProvider authProvider={authProvider}>
                    <Notifications position="top-right" />
                    <BasePage title={t('app.title')}>
                        <RouterProvider router={router} />
                    </BasePage>
                </AuthContextProvider>
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