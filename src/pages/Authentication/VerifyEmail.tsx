import { Box, Button, Text, Paper, PaperProps } from "@mantine/core";
import { useAuthState } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppPath } from "../Routes";
import { useTranslation } from "react-i18next";


export function VerifyEmailPage(props: PaperProps) {

    const authState = useAuthState();
    const navigate = useNavigate();
    const { t } = useTranslation();

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
                        {t('pages.verify_email.message')}
                    </Text>
                    <Button radius="xl"
                        disabled={buttonClicked}
                        onClick={handleButtonClick}>
                        {t('pages.verify_email.send_email_btn')}
                    </Button>
                </Box>
            }
            {authState.user?.isVerifiedUser &&
                <Box>
                    <Text size={"lg"} fw={500}>
                        {t('pages.verify_email.email_confirmed')}
                    </Text>
                    <Button onClick={() => navigate(AppPath.APP_ROOT)} size="md">
                        {t('pages.verify_email.go_to_root')}
                    </Button>
                </Box>
            }
        </Paper>
    );
}