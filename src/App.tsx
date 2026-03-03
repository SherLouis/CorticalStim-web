import { MantineProvider, Skeleton } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';
import { Notifications } from '@mantine/notifications';
import { Suspense, useState } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import BasePage from './entry/BasePage';
import { useTranslation } from 'react-i18next';
import StimulationToolPage from './pages/StimulationTool/StimulationToolPage';
import { LoginPage } from './pages/Authentication/Login';
import FirebaseAuthenticationProvider from './infra/firebase/firebaseAuthenticationProvider';
import { AuthenticationProvider } from './core/auth/authenticationProvider';
import { RegisterPage } from './pages/Authentication/Register';
import { AuthContextProvider } from './context/AuthContext';
import { RequireAuth } from './components/routing/RequireAuth';
import { VerifyEmailPage } from './pages/Authentication/VerifyEmail';
import { RequireVerifiedUser } from './components/routing/RequireVerifiedUser';
import { AppPath } from './pages/Routes';
import AccountManagementPage from './pages/Authentication/AccountManagement';


function App() {

    const { t } = useTranslation();
    const authProvider = new FirebaseAuthenticationProvider() as AuthenticationProvider;

    const getRootElement = () => {
        if (process.env.REACT_APP_REQUIRE_AUTH === "true") {
            return (
                <RequireAuth noAuthRedirect={AppPath.LOGIN}>
                    <RequireVerifiedUser notVerifiedPage={AppPath.EMAIL_VERIFY}>
                        <BasePage title={t('app.title')}>
                            <StimulationToolPage />
                        </BasePage>
                    </RequireVerifiedUser>
                </RequireAuth>);
        }
        else {
            return (
                <BasePage title={t('app.title')}>
                    <StimulationToolPage />
                </BasePage>);
        }
    }

    const router = createHashRouter([
        {
            path: AppPath.LOGIN,
            element:
                <BasePage title={t('app.title')}>
                    <LoginPage />
                </BasePage>
        },
        {
            path: AppPath.REGISTER,
            element:
                <BasePage title={t('app.title')}>
                    <RegisterPage />
                </BasePage>
        },
        {
            path: AppPath.EMAIL_VERIFY,
            element:
                <RequireAuth noAuthRedirect={AppPath.LOGIN}>
                    <BasePage title={t('app.title')}>
                        <VerifyEmailPage />
                    </BasePage>
                </RequireAuth>
        },
        {
            path: AppPath.ACCOUNT,
            element:
                <RequireAuth noAuthRedirect={AppPath.LOGIN}>
                    <BasePage title={t('app.title')}>
                        <AccountManagementPage />
                    </BasePage>
                </RequireAuth>
        },
        {
            path: "/*",
            element: getRootElement()
        },
    ]);

    return (
        <AuthContextProvider authProvider={authProvider}>
            <Notifications position="top-right" />
            <RouterProvider router={router} />
        </AuthContextProvider>
    );
}

export default function WrappedApp() {
    const fallback = (<div>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
    </div>);
    return (
        <MantineProvider defaultColorScheme="auto">
            <Suspense fallback={fallback}>
                < App />
            </Suspense >
        </MantineProvider>
    );
}