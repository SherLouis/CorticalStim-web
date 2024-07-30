import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Text,
    Paper,
    Group,
    PaperProps,
    Button,
    Divider,
    Checkbox,
    Anchor,
    Stack,
    Box,
} from '@mantine/core';
import { useAuthState } from '../../App';
import { useEffect, useState } from 'react';
import User from '../../core/auth/user';
import { useNavigate } from 'react-router-dom';

export function LoginPage(props: PaperProps) {
    // TODO: error if invalid credentials for sigin
    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        }
    });

    const authState = useAuthState();

    const navigate = useNavigate();

    const handleSubmit = () => {

        authState.authProvider.signIn(form.values.email, form.values.password)
            .then((user) => {
                console.log(user.displayName + ' signed in:');
                console.log(user);
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
                                value={form.values.email}
                                onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                                radius="md"
                            />

                            <PasswordInput
                                required
                                label="Password"
                                placeholder="Your password"
                                value={form.values.password}
                                onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                                radius="md"
                            />
                        </Stack>

                        <Group position='apart' mt="xl">
                            <Anchor component="button" type="button" c="dimmed" onClick={() => navigate("/register")} size="xs">
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

