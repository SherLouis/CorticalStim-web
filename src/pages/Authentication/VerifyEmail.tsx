import { Box, Button, Text, Paper, PaperProps } from "@mantine/core";
import { useAuthState } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppPath } from "../Routes";


export function VerifyEmailPage(props: PaperProps) {

    const authState = useAuthState();
    const navigate = useNavigate();

    // Redirect to login if not loged in ? Maybe not required
    // TODO: traductions
    const [buttonClicked, setButtonClicked] = useState(false);

    const handleButtonClick = () => {
        authState.authProvider.sendVerification()
            .then(() => setButtonClicked(true))
    };

    return (
        <Paper radius="md" p="xl" withBorder {...props}>
            {!authState.user?.isVerifiedUser &&
                <Box>
                    <Text size="lg" fw={500}>
                        {"Please verify email address to continue."}
                    </Text>
                    <Button radius="xl"
                        disabled={buttonClicked}
                        onClick={handleButtonClick}>
                        {"Send verification email"}
                    </Button>
                </Box>
            }
            {authState.user?.isVerifiedUser &&
                <Box>
                    <Text size={"lg"} fw={500}>
                        {"Thanks for confirming your email."}
                    </Text>
                    <Button onClick={() => navigate(AppPath.APP_ROOT)} size="md">
                        {"Go to main page"}
                    </Button>
                </Box>
            }
        </Paper>
    );
}