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
import { useNavigate } from 'react-router-dom';
import AuthenticationError from '../../core/auth/authenticationError';
import { useAuthState } from '../../context/AuthContext';

export function RegisterPage(props: PaperProps) {
    // TODO: password validation only for account creation (maybe 2 pages?)
    // TODO use useForm from mantine instead
    const form = useForm({
        initialValues: {
            email: '',
            name: '',
            password: ''
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const navigate = useNavigate();

    const authProvider = useAuthState().authProvider;

    const handleSubmit = () => {
        authProvider.createUser(form.values.email, form.values.password, form.values.name)
            .then((user) => { console.log(user.displayName + ' registered') })
            .catch((error: AuthenticationError) => { console.error(error) })
            // TODO: check error reason. If already exists, then alert to suggest login instead.
    }

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            <Box>
                <Text size="lg" fw={500}>
                    {"Welcome, please register to continue."}
                </Text>
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
                            value={form.values.email}
                            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                            error={form.errors.email && 'Invalid email'}
                            radius="md"
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                            error={form.errors.password && 'Password should include at least 6 characters'}
                            radius="md"
                        />
                    </Stack>

                    <Group position='apart' mt="xl">
                        <Anchor component="button" type="button" c="dimmed" onClick={() => navigate("/login")} size="xs">
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

