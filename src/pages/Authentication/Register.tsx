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
            password: (val) => (!isPasswordSecure(val) ? 'Password should include at least 8 characters and include at least one capital letter, one number and one special character' : null),
        },
    });

    const navigate = useNavigate();

    const authProvider = useAuthState().authProvider;

    const handleSubmit = () => {
        authProvider.createUser(form.values.email, form.values.password, form.values.name)
            .then((user) => { console.log(user.displayName + ' registered') })
            .catch((error: AuthenticationError) => { console.error(error) })
            // TODO: check error reason. If already exists, then alert to suggest login instead.
            // TODO, upoon successful register, navigate to home page ?
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

