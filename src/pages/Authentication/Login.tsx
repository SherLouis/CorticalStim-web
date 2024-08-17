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
} from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from '../../context/AuthContext';
import { useEffect } from 'react';


export function LoginPage(props: PaperProps) {
    // TODO: error if invalid credentials for sigin
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
                console.log(user);
                if (state != null) { navigate(state?.path); }
            })
            .catch((error) => { console.error(error); })
    }

    const handlerSignOut = () => {
        authState.authProvider.signOut().then();
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
                            <Anchor component="button" type="button" c="dimmed" onClick={() => navigate("/register", state)} size="xs">
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

