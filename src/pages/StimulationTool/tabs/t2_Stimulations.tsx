import { Badge, Box, Button, Chip, Divider, Grid, Group, NumberInput, ScrollArea, SimpleGrid, Stack, Title } from "@mantine/core";
import { TabProperties } from "./tab_properties";
import StimulationFormValues, { StimulationCognitiveEffectFormValues, StimulationEffectsValues, StimulationParametersFormValues, StimulationTaskFormValues, getStimPointLabel } from "../../../models/stimulationForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import StimulationParametersSelection from "../../../components/StimulationParametersSelection";
import StimulationTaskSelection, { formatSelectedTask } from "../../../components/StimulationTaskSelection";
import { useListState } from "@mantine/hooks";
import StimulationEffectSelection, { formatSelectedCognitiveEffect } from "../../../components/StimulationEffectSelection";

// TODO: pouvoir ajouter plusieurs stimulations / afficher valeurs de stimulations enregistrées

// TODO: stimulation time
export default function StimulationsTab({ form }: TabProperties) {
    const { t } = useTranslation();

    console.log(form.values);

    const [selectedPoint, setSelectedPoint] = useState<string>("");
    const params_form = useForm<StimulationParametersFormValues>({ initialValues: { amplitude: 0, duration: 0, frequency: 0, lenght_path: 0 } });
    const task_form = useForm<StimulationTaskFormValues>({ initialValues: { category: "", subcategory: "", characteristic: "" } });
    const effect_form = useForm<StimulationEffectsValues>({ initialValues: { cognitive_effect: { category: "", semiology: "", characteristic: "" }, epi_manifestation: [], post_discharge: false, pd_duration: 0, pd_local: "", pd_type: "", crisis: false } });

    const [lastTaskValues, lastTaskValuesHandlers] = useListState<{ category: string; subcategory: string; characteristic: string }>();
    const [lastCognitiveEffectValues, lastCognitiveEffectValuesHandlers] = useListState<StimulationCognitiveEffectFormValues>();

    const handleSelectedPointChanged = (newPointId: string) => {
        params_form.reset();
        task_form.reset();
        effect_form.reset();
        setSelectedPoint(newPointId);
    }

    const handleSubmit = () => {
        if (selectedPoint === undefined) { return; }

        // validate forms
        params_form.validate();
        task_form.validate();
        if (!params_form.isValid() || !task_form.isValid()) { return; }

        const params_values = params_form.values;
        const task_values = task_form.values;
        const effect_values = effect_form.values;

        const electrode_label = selectedPoint.split('/').slice(0, -1).join('/');

        form.values.electrodes.forEach((electrode, electrode_i) => {
            if (electrode.label === electrode_label) {
                electrode.stim_points.forEach((stim_point, stim_point_i) => {
                    const stimId = getStimPointLabel(electrode.label, stim_point_i)
                    if (stimId === selectedPoint) {
                        // Insert new stimulatinon for this stimulation point
                        form.insertListItem(`electrodes.${electrode_i}.stim_points.${stim_point.index}.stimulations`,
                            {
                                paremeters: {
                                    amplitude: params_values.amplitude,
                                    duration: params_values.duration,
                                    frequency: params_values.frequency,
                                    lenght_path: params_values.lenght_path
                                },
                                task: {
                                    category: task_values.category,
                                    subcategory: task_values.subcategory,
                                    characteristic: task_values.characteristic
                                },
                                effect: effect_values
                            });
                        // Save last used task
                        lastTaskValuesHandlers.prepend({ category: task_form.values.category, subcategory: task_form.values.subcategory, characteristic: task_form.values.characteristic });
                        if (lastTaskValues.length >= 3) { lastTaskValues.pop(); }

                        // Save last used effect
                        lastCognitiveEffectValuesHandlers.prepend({
                            category: effect_values.cognitive_effect.category,
                            semiology: effect_values.cognitive_effect.semiology,
                            characteristic: effect_values.cognitive_effect.characteristic
                        });
                        if (lastCognitiveEffectValues.length >= 3) { lastCognitiveEffectValuesHandlers.pop(); }

                        // unselect point and reset inner forms to prepare for next stimulation
                        setSelectedPoint("");
                        params_form.reset();
                        task_form.reset();
                        effect_form.reset();
                        return;
                    }
                });
            }
        });
    }


    const getSelectedPointLocationFormInfo = () => {
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
        const point = getSelectedPointLocationFormInfo();
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

    const getSelectedPointEffect = () => {
        return formatSelectedCognitiveEffect(effect_form.values.cognitive_effect);
    }

    return (
        <Box mt={"md"} h={"83vh"}>
            <Grid h={"100%"} gutter={"xs"}>
                <Grid.Col span={8} h={"30%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <ContactSelection
                            form_values={form.values}
                            selectedContact={selectedPoint}
                            selectedChanged={handleSelectedPointChanged}
                        />
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"30%"}>
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
                                <Title order={4}>{getSelectedPointEffect()}</Title>
                                <Title order={4}>{"TODO - Post-discharge?"}</Title>
                                <Button onClick={handleSubmit}>{t('pages.stimulationTool.stimulation.saveButtonLabel')}</Button>
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
                                styles={{ input: { textAlign: "center" } }}
                                {...params_form.getInputProps('amplitude')}
                            />
                            <Stack w={"75%"} align="center">
                                <Group position="center" noWrap w={"100%"}>
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.frequency_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{ input: { textAlign: "center" } }}
                                        {...params_form.getInputProps('frequency')}
                                    />
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.duration_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{ input: { textAlign: "center" } }}
                                        {...params_form.getInputProps('duration')}
                                    />
                                    <NumberInput size="md"
                                        label={t('pages.stimulationTool.stimulation.length_path_label')}
                                        precision={2}
                                        step={0.01}
                                        styles={{ input: { textAlign: "center" } }}
                                        {...params_form.getInputProps('lenght_path')}
                                    />
                                </Group>
                                <Title order={4}>{formatSelectedTask(task_form.values)}</Title>
                            </Stack>
                        </Group>
                    </Box>
                </Grid.Col>
                <Grid.Col span={8} h={"55%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <StimulationEffectSelection form={effect_form} cognitive_effect_last_values={lastCognitiveEffectValues} />
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"55%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <StimulationTaskSelection form={task_form} last_values={lastTaskValues} />
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