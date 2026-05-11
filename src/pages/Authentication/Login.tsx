import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Text,
    Paper,
    Group,
    PaperProps,
    Button,
    Anchor,
    Stack,
    Box,
    Alert,
} from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { AppPath } from '../Routes';
import AuthenticationError, { AuthenticationErrorReason } from '../../core/auth/authenticationError';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';


export function LoginPage(props: PaperProps) {
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    });

    const authState = useAuthState();

    const { t } = useTranslation();

    const navigate = useNavigate();
    const { state } = useLocation();
    const [authError, setAuthError] = useState<AuthenticationErrorReason | null>(null);

    // Redirect to original location or root page if user already authenticated
    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate(state != null ? state.path : AppPath.APP_ROOT);
        }
    }, [authState, state, navigate])

    const handleSubmit = () => {
        authState.authProvider.signIn(form.values.email, form.values.password)
            .then((user) => {
                console.log(user.displayName + ' signed in:');
                if (state != null) { navigate(state?.path); }
            })
            .catch((error: AuthenticationError) => {
                setAuthError(error.reason);
            })
    }

    const getAuthErrorAlert = () => {
        if (authError === null) {
            return <></>;
        }
        let alertBody: JSX.Element;
        switch (authError) {
            case AuthenticationErrorReason.INVALID_LOGIN_CREDENTIALS:
                alertBody = (
                    <Text>{t('pages.login.auth_errors.invalid_credentials')}</Text>
                );
                break;

            case AuthenticationErrorReason.USER_DISABLED:
                alertBody = (
                    <Text>{t('pages.login.auth_errors.account_disabled')}</Text>
                );
                break;

            default:
                alertBody = (
                    <Text>{t('pages.login.auth_errors.other_error')}</Text>
                );
                break;
        }

        return (
            <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} p={'xs'}>
                {alertBody}
            </Alert>);
    }

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            {authState.user == null &&
                <Box>
                    <Text size="lg" fw={500}>
                        {t('pages.login.welcome_message')}
                    </Text>
                    {getAuthErrorAlert()}
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <TextInput
                                required
                                label={t('pages.login.form_fields.email.label')}
                                placeholder={t('pages.login.form_fields.email.placeholder')}
                                radius="md"
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                required
                                label={t('pages.login.form_fields.password.label')}
                                placeholder={t('pages.login.form_fields.password.placeholder')}
                                radius="md"
                                {...form.getInputProps('password')}
                            />
                        </Stack>

                        <Group position='apart' mt="xl">
                            <Anchor component="button" type="button" c="dimmed" onClick={() => navigate(AppPath.REGISTER, { state: state })} size="xs">
                                {t('pages.login.go_to_register_msg')}
                            </Anchor>
                            <Button type="submit" radius="xl">
                                {t('pages.login.signin')}
                            </Button>
                        </Group>
                    </form>
                </Box>}
        </Paper>
    );
}

