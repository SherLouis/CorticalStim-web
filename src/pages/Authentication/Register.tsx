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


export function RegisterPage(props: PaperProps) {
    // TODO: traductions
    const isPasswordSecure = (value: string) => {
        // Au moins 8 caractères avec au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial
        let regex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/);
        return regex.test(value);
    }
    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: ''
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (!isPasswordSecure(val) ? 'Password must include at least 8 characters and include at least one capital letter, one number and one special character' : null),
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
                    {"Welcome, please register to continue."}
                </Text>
                {authError !== null &&
                    <Alert color='yellow' icon={<IconAlertCircle size="1rem" />} radius={'lg'} p={'xs'}>
                        {authError === AuthenticationErrorReason.EMAIL_EXISTS &&
                            <Text>
                                {"It seems you already have an account. "}
                                <Anchor component="button" type="button" onClick={() => navigate(AppPath.LOGIN, { state: state })} size="md">
                                    {"Try to Login in instead."}
                                </Anchor>
                            </Text>
                        }
                        {authError !== AuthenticationErrorReason.EMAIL_EXISTS &&
                            "Something went wrong. Please try again later. "
                        }
                    </Alert>
                }
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label="Name"
                            placeholder="Your name"
                            value={form.values.name}
                            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                            radius="md"
                        />

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
                            placeholder="Choose a password"
                            description="Must be at least 8 characters with 1 capital letter, 1 number and 1 special character."
                            radius="md"
                            {...form.getInputProps('password')}
                        />
                    </Stack>

                    <Group position='apart' mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => navigate(AppPath.LOGIN, { state: state })} size="xs">
                            {"Already have an account? Login"}
                        </Anchor>
                        <Button type="submit" radius="xl">
                            {"Register"}
                        </Button>
                    </Group>
                </form>
            </Box>
        </Paper>
    );
}

