import { Box, Button, Group, SimpleGrid, Stack, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";


export default function StimulationParametersSelection({ form }: StimulationParametersSelectionProps) {
    // TODO: translations
    const { t } = useTranslation();

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
                        <Button size="md" radius={0} compact>1</Button>
                        <Button size="md" radius={0} compact>2</Button>
                        <Button size="md" radius={0} compact>3</Button>
                        <Button size="md" radius={0} compact>4</Button>
                        <Button size="md" radius={0} compact>5</Button>
                        <Button size="md" radius={0} compact>6</Button>
                        <Button size="md" radius={0} compact>7</Button>
                        <Button size="md" radius={0} compact>8</Button>
                        <Button size="md" radius={0} compact>9</Button>
                        <Button size="md" radius={0} compact>0</Button>
                    </SimpleGrid>
                    <Title order={2}>{","}</Title>
                    <SimpleGrid cols={5} spacing={1} verticalSpacing={1}>
                        <Button size="md" radius={0} compact>1</Button>
                        <Button size="md" radius={0} compact>2</Button>
                        <Button size="md" radius={0} compact>3</Button>
                        <Button size="md" radius={0} compact>4</Button>
                        <Button size="md" radius={0} compact>5</Button>
                        <Button size="md" radius={0} compact>6</Button>
                        <Button size="md" radius={0} compact>7</Button>
                        <Button size="md" radius={0} compact>8</Button>
                        <Button size="md" radius={0} compact>9</Button>
                        <Button size="md" radius={0} compact>0</Button>
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
                        <Button size="md" compact>1</Button>
                        <Button size="md" compact>5</Button>
                        <Button size="md" compact>10</Button>
                        <Button size="md" compact>25</Button>
                    </Group>
                    <Title order={4} w={"5%"} p={"md"}>{"D"}</Title>
                    <Group spacing='xs' position='left' align='center'>
                        <Button size="md" compact>5</Button>
                        <Button size="md" compact>10</Button>
                        <Button size="md" compact>30</Button>
                        <Button size="md" compact>60</Button>
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
                        <Button size="md" compact>5</Button>
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