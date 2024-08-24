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


export function LoginPage(props: PaperProps) {
    // TODO: traductions
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    });

    const authState = useAuthState();

    const navigate = useNavigate();
    const { state } = useLocation();
    const [authError, setAuthError] = useState<AuthenticationErrorReason | null>(null);

    // Redirect to original location if user already authenticated
    useEffect(() => {
        if (authState.isAuthenticated) {
            navigate(state?.path);
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

    const handlerSignOut = () => {
        authState.authProvider.signOut().then();
    }

    const getAuthErrorAlert = () => {
        if (authError === null) {
            return <></>;
        }
        let alertBody: JSX.Element;
        switch (authError) {
            case AuthenticationErrorReason.INVALID_LOGIN_CREDENTIALS:
                alertBody = (
                    <Text>{"Invalid credentials."}</Text>
                );
                break;

            case AuthenticationErrorReason.USER_DISABLED:
                alertBody = (
                    <Text>{"Your account is disabled."}</Text>
                );
                break;

            default:
                alertBody = (
                    <Text>{"Something went wrong. Please try again later."}</Text>
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
            {authState.user != null &&
                <Box>
                    <Text size="lg" fw={500}>
                        Welcome {authState.user.displayName}!
                    </Text>
                    <Button onClick={() => handlerSignOut()}>Sign Out</Button>
                </Box>
            }
            {authState.user == null &&
                <Box>
                    <Text size="lg" fw={500}>
                        Welcome, please sign in to continue
                    </Text>
                    {getAuthErrorAlert()}
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <TextInput
                                required
                                label="Email"
                                placeholder="you@email.com"
                                radius="md"
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Your password"
                                radius="md"
                                {...form.getInputProps('password')}
                            />
                        </Stack>

                        <Group position='apart' mt="xl">
                            <Anchor component="button" type="button" c="dimmed" onClick={() => navigate(AppPath.REGISTER, { state: state })} size="xs">
                                {"Don't have an account? Register"}
                            </Anchor>
                            <Button type="submit" radius="xl">
                                {"Sign in"}
                            </Button>
                        </Group>
                    </form>
                </Box>}
        </Paper>
    );
}

