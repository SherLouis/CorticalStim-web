import { Badge, Box, Chip, Divider, Grid, Group, NumberInput, ScrollArea, SimpleGrid, Stack, Title, rem } from "@mantine/core";
import { TabProperties } from "./tab_properties";
import StimulationFormValues, { getStimPointLabel } from "../../../models/stimulationForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import StimulationParametersSelection, { StimulationParametersFormValues } from "../../../components/StimulationParametersSelection";

export default function StimulationsTab({ form }: TabProperties) {
    const { t } = useTranslation();

    const [selectedPoint, setSelectedPoint] = useState<string>("");
    const params_form = useForm<StimulationParametersFormValues>({ initialValues: { amplitude: 0, duration: 0, frequency: 0, lenght_path: 0 } });

    const handleSelectedPointChanged = (newPointId: string) => {
        params_form.reset();
        setSelectedPoint(newPointId);
    }

    const getSelectedPointFormInfo = () => {
        for (const electrode of form.values.electrodes) {
            let foundStimPoint = electrode.stim_points.find(point =>
                selectedPoint === getStimPointLabel(electrode.label, point.index)
            );

            if (foundStimPoint) {
                return foundStimPoint;
            }
        }
    }

    const getSelectedPointLocation = () => {
        const point = getSelectedPointFormInfo();
        switch (point?.location.type) {
            case 'white':
                return t('pages.stimulationTool.implantation.whiteMatter');
            case 'vep':
                return 'VEP - ' + point.location.vep;
            case 'destrieux':
                return 'Destrieux - ' + point.location.destrieux;
            case 'mni':
                return 'MNI - x=' + point.location.mni.x + ' y=' + point.location.mni.y + ' z=' + point.location.mni.z;
            default:
                return '-'
        }
    }

    return (
        <Box mt={"md"} h={"83vh"}>
            <Grid h={"100%"} gutter={"xs"}>
                <Grid.Col span={8} h={"35%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <ContactSelection
                            form_values={form.values}
                            selectedContact={selectedPoint}
                            selectedChanged={handleSelectedPointChanged}
                        />
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"35%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <StimulationParametersSelection form={params_form} />
                    </Box>
                </Grid.Col>
                <Grid.Col span={8} h={"15%"}>
                    <Box h={"100%"} p={0} bg={"gray"} sx={{ "alignItems": "center", "display": "flex", "justifyContent": "center" }}>
                        {selectedPoint !== "" &&
                            <Group position="center" align="center">
                                <Badge size="lg" variant="filled">{selectedPoint}</Badge>
                                <Title order={4}>{getSelectedPointLocation()}</Title>
                                <Title order={4}>{"TODO - Selected effect"}</Title>
                                <Title order={4}>{"TODO - Post-discharge?"}</Title>
                            </Group>
                        }
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"15%"}>
                    <Box h={"100%"} p={"xs"} bg={"gray"}>
                        <Group position="center" align="center" noWrap h={"100%"} w={"100%"}>
                            <NumberInput w={"25%"} size="xl"
                                label={t('pages.stimulationTool.stimulation.amplitude_label')}
                                precision={2}
                                step={0.01}
                                styles={{input: {textAlign:"center"}}}
                                {...params_form.getInputProps('amplitude')}
                            />
                            <Stack w={"75%"} align="center">
                                <Group position="center" noWrap w={"100%"}>
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.frequency_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{input: {textAlign:"center"}}}
                                        {...params_form.getInputProps('frequency')}
                                    />
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.duration_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{input: {textAlign:"center"}}}
                                        {...params_form.getInputProps('duration')}
                                    />
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.length_path_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{input: {textAlign:"center"}}}
                                        {...params_form.getInputProps('lenght_path')}
                                    />
                                </Group>
                                <Title order={4}>{"TODO - task selected"}</Title>
                            </Stack>
                        </Group>
                    </Box>
                </Grid.Col>
                <Grid.Col span={8} h={"50%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        5
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"50%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        6
                    </Box>
                </Grid.Col>
            </Grid>
        </Box>
    )
}

const ContactSelection = ({ form_values, selectedContact, selectedChanged }: ContactSelectionProps) => {
    return (
        <ScrollArea w={"100%"} h={"100%"} sx={{ alignItems: "center", padding: '0' }}>
            {form_values.electrodes.map((electrode, electrode_i) => {
                return (
                    <Stack key={'div_group_electrode_' + electrode_i}>
                        <Group noWrap
                            spacing='md'
                            position='left'
                            align='center'
                            mt={'sm'}
                            key={'div_group_electrode_' + electrode_i}
                            w={"100%"}
                        >
                            <Title order={4} w={"5%"} p={"md"}>{electrode.label}</Title>

                            <Box h={"100%"} w={"95%"}>
                                <SimpleGrid cols={10}>
                                    {electrode.stim_points.map((stim_point, stim_point_i) => {
                                        const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                        return (
                                            <Chip size='sm'
                                                value={pointId}
                                                key={pointId}
                                                onChange={(checked) => selectedChanged(checked ? pointId : "")}
                                                checked={selectedContact === pointId}
                                                variant='filled'
                                                color={selectedContact === pointId ? 'blue' : 'gray'}>
                                                {pointId}
                                            </Chip>);
                                    })}
                                </SimpleGrid>
                            </Box>
                        </Group>
                        <Divider orientation='horizontal' size={'md'} color={'black'} />
                    </Stack>
                )
            })}
        </ScrollArea>
    );
}

interface ContactSelectionProps {
    form_values: StimulationFormValues,
    selectedContact: string,
    selectedChanged: (newValue: string) => void
}