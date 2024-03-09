import { Box, Stack, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";


export default function StimulationTaskSelection({ form }: StimulationTaskSelectionProps) {
    // TODO: translations
    const { t } = useTranslation();

    // TODO: quick preset with last 4 used values

    return (
        <Box w={"100%"} mah={"100%"}>
            <Stack h={"100%"} spacing={"xs"}>
                <Title order={3}>{t('pages.stimulationTool.stimulation.task_title')}</Title>
            </Stack>
        </Box>
    );
}

interface StimulationTaskSelectionProps {
    form: UseFormReturnType<StimulationTaskFormValues>;
}

export interface StimulationTaskFormValues {
    category: string;
    subcategory: string;
    characteristic: string;
}