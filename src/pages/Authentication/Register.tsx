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
import AuthenticationError, { AuthenticationErrorReason } from '../../core/auth/authenticationError';
import { useAuthState } from '../../context/AuthContext';
import { useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { AppPath } from '../Routes';
import { useTranslation } from 'react-i18next';
import { isPasswordSecure } from './Password';


export function RegisterPage(props: PaperProps) {
    const { t } = useTranslation();

    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: ''
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : t('pages.register.validations.invalid_email_format')),
            password: (val) => (!isPasswordSecure(val) ? t('pages.register.validations.password_requirements') : null),
        },
    });

    const navigate = useNavigate();
    const { state } = useLocation();
    const [authError, setAuthError] = useState<AuthenticationErrorReason | null>(null);

    const authProvider = useAuthState().authProvider;

    const handleSubmit = () => {
        authProvider.createUser(form.values.email, form.values.password, form.values.name)
            .then((user) => {
                console.log(user.displayName + ' registered');
                navigate(state !== null ? state.path : AppPath.APP_ROOT)
            })
            .catch((error: AuthenticationError) => {
                setAuthError(error.reason);
            })
    }

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            <Box>
                <Text size="lg" fw={500}>
                    {t('pages.register.welcome_message')}
                </Text>
                {authError !== null &&
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} p={'xs'}>
                        {authError === AuthenticationErrorReason.EMAIL_EXISTS &&
                            <Text>
                                {t('pages.register.auth_errors.email_exists')}
                                <Anchor component="button" type="button" onClick={() => navigate(AppPath.LOGIN, { state: state })} size="md">
                                    {t('pages.register.auth_errors.login_instead')}
                                </Anchor>
                            </Text>
                        }
                        {authError !== AuthenticationErrorReason.EMAIL_EXISTS &&
                            t('pages.register.auth_errors.other_error')
                        }
                    </Alert>
                }
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label={t('pages.register.form_fields.name.label')}
                            placeholder={t('pages.register.form_fields.name.placeholder')}
                            value={form.values.name}
                            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                            radius="md"
                        />

                        <TextInput
                            required
                            label={t('pages.register.form_fields.email.label')}
                            placeholder={t('pages.register.form_fields.email.placeholder')}
                            radius="md"
                            {...form.getInputProps('email')}
                        />

                        <PasswordInput
                            required
                            label={t('pages.register.form_fields.password.label')}
                            placeholder={t('pages.register.form_fields.password.placeholder')}
                            description={t('pages.register.form_fields.password.description')}
                            radius="md"
                            {...form.getInputProps('password')}
                        />
                    </Stack>

                    <Group justify='space-between' mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => navigate(AppPath.LOGIN, { state: state })} size="xs">
                            {t('pages.register.go_to_login_msg')}
                        </Anchor>
                        <Button type="submit" radius="xl">
                            {t('pages.register.register')}
                        </Button>
                    </Group>
                </form>
            </Box>
        </Paper>
    );
}

