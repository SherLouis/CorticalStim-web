import { Box, Button, Group, SimpleGrid, Stack, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";


export default function StimulationParametersSelection({ form }: StimulationParametersSelectionProps) {
    // TODO: translations
    const { t } = useTranslation();

    const handleAmplitudeButtonClick = (value: number) => {
        form.setFieldValue('amplitude', value);
    }

    const getDecimals = (value: number) => {
        return (value*10)%10;
    }

    const handleAmplitudeDecimalButtonClick = (value: number) => {
        form.setFieldValue('amplitude', Math.floor(form.values.amplitude) + value / 10);
    }

    return (
        <Box w={"100%"} mah={"100%"}>
            <Stack mah={"100%"} spacing={0}>
                <Title order={3}>{"Parameters"}</Title>
                <Group noWrap
                    spacing='xs'
                    position='left'
                    align='center'
                    w={"100%"}
                >
                    <Title order={4} w={"5%"} p={"md"}>{"A"}</Title>
                    <SimpleGrid cols={5} spacing={1} verticalSpacing={1}>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 1 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(1)}>1</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 2 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(2)}>2</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 3 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(3)}>3</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 4 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(4)}>4</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 5 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(5)}>5</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 6 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(6)}>6</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 7 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(7)}>7</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 8 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(8)}>8</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 9 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(9)}>9</Button>
                        <Button size="md" radius={0} compact variant={Math.floor(form.values.amplitude) === 0 ? 'filled' : 'light'} onClick={() => handleAmplitudeButtonClick(0)}>0</Button>
                    </SimpleGrid>
                    <Title order={2}>{","}</Title>
                    <SimpleGrid cols={5} spacing={1} verticalSpacing={1}>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 1 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(1)}>1</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 2 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(2)}>2</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 3 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(3)}>3</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 4 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(4)}>4</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 5 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(5)}>5</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 6 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(6)}>6</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 7 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(7)}>7</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 8 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(8)}>8</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 9 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(9)}>9</Button>
                        <Button size="md" radius={0} compact variant={getDecimals(form.values.amplitude) === 0 ? 'filled' : 'light'} onClick={() => handleAmplitudeDecimalButtonClick(0)}>0</Button>
                    </SimpleGrid>
                </Group>
                <Group noWrap
                    spacing='xs'
                    position='left'
                    align='center'
                    w={"100%"}
                >
                    <Title order={4} w={"5%"} p={"md"}>{"F"}</Title>
                    <Group spacing='xs' position='left' align='center'>
                        <Button size="md" variant={form.values.frequency == 1 ? 'filled' : 'light'} onClick={() => form.setFieldValue('frequency', 1)} compact>1</Button>
                        <Button size="md" variant={form.values.frequency == 5 ? 'filled' : 'light'} onClick={() => form.setFieldValue('frequency', 5)} compact>5</Button>
                        <Button size="md" variant={form.values.frequency == 10 ? 'filled' : 'light'} onClick={() => form.setFieldValue('frequency', 10)} compact>10</Button>
                        <Button size="md" variant={form.values.frequency == 25 ? 'filled' : 'light'} onClick={() => form.setFieldValue('frequency', 25)} compact>25</Button>
                    </Group>
                    <Title order={4} w={"5%"} p={"md"}>{"D"}</Title>
                    <Group spacing='xs' position='left' align='center'>
                        <Button size="md" compact variant={form.values.duration === 5 ? 'filled' : 'light'} onClick={() => form.setFieldValue('duration', 5)}>5</Button>
                        <Button size="md" compact variant={form.values.duration === 10 ? 'filled' : 'light'} onClick={() => form.setFieldValue('duration', 10)}>10</Button>
                        <Button size="md" compact variant={form.values.duration === 30 ? 'filled' : 'light'} onClick={() => form.setFieldValue('duration', 30)}>30</Button>
                        <Button size="md" compact variant={form.values.duration === 60 ? 'filled' : 'light'} onClick={() => form.setFieldValue('duration', 60)}>60</Button>
                    </Group>
                </Group>
                <Group noWrap
                    spacing='xs'
                    position='left'
                    align='center'
                    w={"100%"}
                >
                    <Title order={4} w={"5%"} p={"md"}>{"PL"}</Title>
                    <Group spacing='xs' position='left' align='center'>
                        <Button size="md" variant={form.values.lenght_path == 5 ? 'filled' : 'light'} onClick={() => form.setFieldValue('lenght_path', 5)} compact>5</Button>
                    </Group>
                </Group>
            </Stack>
        </Box>
    );
}

interface StimulationParametersSelectionProps {
    form: UseFormReturnType<StimulationParametersFormValues>;
}

export interface StimulationParametersFormValues {
    amplitude: number;
    duration: number;
    frequency: number;
    lenght_path: number;
}