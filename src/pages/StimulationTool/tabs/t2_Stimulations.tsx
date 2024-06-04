import { Alert, Badge, Box, Button, Chip, Container, Divider, Group, Modal, Popover, ScrollArea, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { TabProperties } from "./tab_properties";
import StimulationFormValues, { StimulationObservedEffectFormValues, StimulationEffectsValues, StimulationParametersFormValues, StimulationTaskFormValues, getStimPointLabel } from "../../../models/stimulationForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import StimulationTaskSelection, { formatSelectedTask } from "../../../components/StimulationTaskSelection";
import { useListState } from "@mantine/hooks";
import StimulationEffectSelection, { formatEegPostDichargeLocale, formatSelectedObservedEffect } from "../../../components/StimulationEffectSelection";
import { IconAlertCircle, IconCircleCheck, IconCircleX, IconClockCheck, IconEye, IconTrash } from "@tabler/icons-react";
import { t } from "i18next";
import CustomNumberInput from "../../../components/CustomNumberInput";

export default function StimulationsTab({ form, viewPointSummary }: StimulationTabProps) {
    // TODO: ajouter validations (ex: post discharge time cannot be 0 or negative if set to true)

    const { t } = useTranslation();

    const [selectedPoint, setSelectedPoint] = useState<string>("");
    const [showConfirmNoSave, setShowConfirmNoSave] = useState<boolean>(false);

    const [stimulationTime, setStimulationTime] = useState<string>("");

    const params_form = useForm<StimulationParametersFormValues>({ initialValues: { amplitude: 1.0, duration: 0, frequency: 0, lenght_path: 0 } });
    const task_form = useForm<StimulationTaskFormValues>({ initialValues: { category: "", subcategory: "", characteristic: "" } });
    const effect_form = useForm<StimulationEffectsValues>({ initialValues: { observed_effect: { class: "", descriptor: "", details: "" }, observed_effect_comments: "", epi_manifestation: "", post_discharge: false, pd_duration: 0, pd_local: "local", pd_type: "", crisis: false } });

    const [lastTaskValues, lastTaskValuesHandlers] = useListState<{ category: string; subcategory: string; characteristic: string }>();
    const [lastCognitiveEffectValues, lastCognitiveEffectValuesHandlers] = useListState<StimulationObservedEffectFormValues>();

    const handleSelectedPointChanged = (newPointId: string) => {
        if (stimulationTime === '') {
            resetForNewPoint(newPointId);
        }
        else { setShowConfirmNoSave(true); }
    }

    const handleViewResultsForPoint = (pointId: string) => {
        viewPointSummary(pointId);
    }

    const resetForNewPoint = (newPointId: string) => {
        // Do not reset params_form to keep previously selected values
        task_form.reset();
        effect_form.reset();
        setSelectedPoint(newPointId);
        setStimulationTime('');
    }

    const handleSubmit = () => {
        if (selectedPoint === undefined) { return; }
        if (stimulationTime === '') { return; }

        // validate forms
        params_form.validate();
        task_form.validate();
        effect_form.validate();
        if (!params_form.isValid() || !task_form.isValid() || !effect_form.isValid()) { return; }

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
                                time: stimulationTime,
                                parameters: {
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
                        if (lastTaskValues.map(t => formatSelectedTask(t)).includes(formatSelectedTask(task_values))) {
                            lastTaskValuesHandlers.reorder({ from: lastTaskValues.findIndex(t => formatSelectedTask(t) === formatSelectedTask(task_values)), to: 0 });
                        }
                        else {
                            lastTaskValuesHandlers.prepend(task_values);
                            if (lastTaskValues.length >= 3) { lastTaskValues.pop(); }
                        }

                        // Save last used effect
                        if (lastCognitiveEffectValues.map(e => formatSelectedObservedEffect(e)).includes(formatSelectedObservedEffect(effect_values.observed_effect))) {
                            lastCognitiveEffectValuesHandlers.reorder({ from: lastCognitiveEffectValues.findIndex(e => formatSelectedObservedEffect(e) === formatSelectedObservedEffect(effect_values.observed_effect)), to: 0 });
                        }
                        else {
                            lastCognitiveEffectValuesHandlers.prepend({
                                class: effect_values.observed_effect.class,
                                descriptor: effect_values.observed_effect.descriptor,
                                details: effect_values.observed_effect.details
                            });
                            if (lastCognitiveEffectValues.length >= 3) { lastCognitiveEffectValuesHandlers.pop(); }
                        }

                        // unselect point and reset inner forms to prepare for next stimulation
                        resetForNewPoint('');
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
                return point.location.vep;
            case 'destrieux':
                return point.location.destrieux;
            case 'mni':
                return 'x=' + point.location.mni.x + ' y=' + point.location.mni.y + ' z=' + point.location.mni.z;
            default:
                return '-'
        }
    }

    const getSelectedPointObservedEffect = () => {
        return formatSelectedObservedEffect(effect_form.values.observed_effect);
    }

    const getSelectedPointEpiManifEffect = () => {
        return effect_form.values.epi_manifestation !== "" ? effect_form.values.epi_manifestation : "-";
    }

    const getSelectedPointEEGEffect = () => {
        const effect_form_values = effect_form.values;
        const post_discharge = effect_form.values.post_discharge ? `PD: ${effect_form_values.pd_duration}s / ${formatEegPostDichargeLocale(effect_form_values.pd_local, t)}` : '-'
        return `${post_discharge} ${effect_form_values.crisis ? t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_label') : ""}`
    }

    const CentralBar = () => {
        return (
            <Box h={"100%"}>
                <Group align='center' position='center' h={"100%"} w={"100%"} display={form.values.electrodes.length === 0 || form.values.electrodes.flatMap(e => e.stim_points).length === 0 ? "block" : "none"}>
                    <Alert h={"100%"}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t('pages.stimulationTool.stimulation.guide_alert_no_electrode_title')}>
                        {t('pages.stimulationTool.stimulation.guide_alert_no_electrode_text')}
                    </Alert>
                </Group>
                <Box h={"100%"} display={form.values.electrodes.length > 0 && form.values.electrodes.flatMap(e => e.stim_points).length > 0 ? 'block' : 'none'}>
                    <Group align='center' position='center' h={"100%"} w={"100%"} display={selectedPoint === "" ? "block" : "none"}>
                        <Alert h={"100%"}
                            icon={<IconAlertCircle size="1rem" />}
                            title={t('pages.stimulationTool.stimulation.guide_alert_title')}>
                            {t('pages.stimulationTool.stimulation.guide_alert_text')}
                        </Alert>
                    </Group>
                    <Box h={"100%"} display={selectedPoint !== "" ? "block" : "none"}>
                        <Group position="center" align="center" h={"100%"} w={"100%"}>
                            <Stack sx={{ flex: 5 }} h={"100%"} spacing={"xs"}>
                                <Group position="left" align="center" h={"50%"} w={"100%"}>
                                    <Text><strong>{t('pages.stimulationTool.stimulation.selectedStimPoint')}:</strong> </Text>
                                    <Badge size="lg" variant="filled">{selectedPoint}</Badge>
                                    <Text>({getSelectedPointLocation()})</Text>
                                </Group>
                                <Stack align="left" h={"50%"} w={"100%"} spacing={"0"}>
                                    <Text><strong>{t('pages.stimulationTool.stimulation.effect.observed_effect_label')}: </strong>{getSelectedPointObservedEffect()}</Text>
                                    <Group>
                                        <Text><strong>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}:</strong> {getSelectedPointEpiManifEffect()}</Text>
                                        <Text><strong>{t('pages.stimulationTool.stimulation.effect.eeg')} :</strong> {getSelectedPointEEGEffect()}</Text>
                                    </Group>
                                </Stack>
                            </Stack>

                            <Group position="center" align="center" sx={{ flex: 2 }} h={"100%"}>
                                {stimulationTime === '' &&
                                    <Button size="md" onClick={() => setStimulationTime(new Date().toISOString())} leftIcon={<IconClockCheck />}>
                                        <Text>{t('pages.stimulationTool.stimulation.set_time_label')}</Text>
                                    </Button>
                                }
                                {stimulationTime !== '' &&
                                    <Title order={5}>{new Date(stimulationTime).toLocaleTimeString()}</Title>
                                }
                                <Button variant="filled" size="md" color="green" leftIcon={<IconCircleCheck />}
                                    display={stimulationTime !== '' ? 'block' : 'none'}
                                    onClick={handleSubmit} disabled={stimulationTime === ""}>
                                    {t('pages.stimulationTool.stimulation.saveButtonLabel')}
                                </Button>
                            </Group>
                            <Stack sx={{ flex: 5 }} h={"100%"} align="center" spacing={"sm"}>
                                <Text h={"10%"}><strong>{t('pages.stimulationTool.stimulation.task_title')} : </strong>{formatSelectedTask(task_form.values)}</Text>
                                <Group position="center" align="top" h={"90%"} noWrap>
                                    <CustomNumberInput
                                        h={"100%"}
                                        label={t('pages.stimulationTool.stimulation.amplitude_label')}
                                        precision={1}
                                        digit_step={1}
                                        decimal_step={0.1}
                                        min={0}
                                        max={10}
                                        variant='default'
                                        useCustom={true}
                                        {...params_form.getInputProps('amplitude')}
                                    />
                                    <Stack align="center" h={"100%"} spacing={0}>
                                        <CustomNumberInput
                                            label={t('pages.stimulationTool.stimulation.frequency_label')}
                                            precision={0}
                                            step={1}
                                            min={0}
                                            styles={{ input: { textAlign: "center" } }}
                                            {...params_form.getInputProps('frequency')}
                                        />
                                        <Group spacing={0} grow w={"100%"}>
                                            {[1, 5, 50, 55].map((v) =>
                                                <Button compact
                                                    onClick={() => params_form.setFieldValue('frequency', v)}
                                                    variant={params_form.values.frequency === v ? 'filled' : 'default'}>
                                                    {v}
                                                </Button>
                                            )}
                                        </Group>
                                    </Stack>

                                    <Stack align="center" h={"100%"} spacing={0}>
                                        <CustomNumberInput
                                            label={t('pages.stimulationTool.stimulation.duration_label')}
                                            precision={0}
                                            step={1}
                                            min={0}
                                            styles={{ input: { textAlign: "center" } }}
                                            {...params_form.getInputProps('duration')}
                                        />
                                        <Group spacing={0} grow w={"100%"}>
                                            {[5, 10, 30, 60].map((v) =>
                                                <Button compact
                                                    onClick={() => params_form.setFieldValue('duration', v)}
                                                    variant={params_form.values.duration === v ? 'filled' : 'default'}>
                                                    {v}
                                                </Button>
                                            )}
                                        </Group>
                                    </Stack>

                                    <Stack align="center" h={"100%"} spacing={0}>
                                        <CustomNumberInput
                                            label={t('pages.stimulationTool.stimulation.length_path_label')}
                                            precision={0}
                                            step={1}
                                            min={0}
                                            styles={{ input: { textAlign: "center" } }}
                                            {...params_form.getInputProps('lenght_path')}
                                        />
                                        <Group spacing={0} grow w={"100%"}>
                                            {[300, 500].map((v) =>
                                                <Button compact
                                                    onClick={() => params_form.setFieldValue('lenght_path', v)}
                                                    variant={params_form.values.lenght_path === v ? 'filled' : 'default'}>
                                                    {v}
                                                </Button>
                                            )}
                                        </Group>
                                    </Stack>
                                </Group>
                            </Stack>
                        </Group>
                    </Box >
                </Box>
            </Box>
        );
    }

    return (
        <Box pt={"md"} h={"100%"}>
            <Modal opened={showConfirmNoSave} onClose={() => setShowConfirmNoSave(false)} title={t('pages.stimulationTool.stimulation.alert_point_changed.title')}>
                <Group position="apart">
                    <Button leftIcon={<IconCircleX color="white" />} variant="filled" onClick={() => setShowConfirmNoSave(false)}>{t('pages.stimulationTool.stimulation.alert_point_changed.cancel_label')}</Button>
                    <Button leftIcon={<IconTrash color="white" />} variant="filled" color="red" onClick={() => { setShowConfirmNoSave(false); resetForNewPoint('') }}>{t('pages.stimulationTool.stimulation.alert_point_changed.confirm_label')}</Button>
                </Group>
            </Modal>

            <Box h={"40%"} w={"100%"}>
                <Group w={"100%"} h={"100%"} align='flex-start' >
                    <Box h={"100%"} sx={{ flex: 8 }}>
                        <ContactSelection
                            form_values={form.values}
                            selectedContact={selectedPoint}
                            onSelectedChanged={handleSelectedPointChanged}
                            onViewResultsForPoint={handleViewResultsForPoint}
                        />
                    </Box>
                    <Box h={"100%"} sx={{ flex: 4 }}>
                        {selectedPoint !== '' &&
                            <StimulationTaskSelection form={task_form} last_values={lastTaskValues} />
                        }
                    </Box>
                </Group>
            </Box>

            <Box h={"15%"} w={"100%"} sx={{ borderColor: 'grey', borderWidth: '0.2rem 0', borderStyle: 'solid' }}>
                <CentralBar />
            </Box>

            <Box h={"45%"}>
                {selectedPoint !== '' &&
                    <StimulationEffectSelection form={effect_form} observed_effect_last_values={lastCognitiveEffectValues} />
                }
            </Box>
        </Box>
    );


}

interface StimulationTabProps extends TabProperties {
    viewPointSummary: (pointId: string) => void
}

const ContactSelection = ({ form_values, selectedContact, onSelectedChanged, onViewResultsForPoint }: ContactSelectionProps) => {
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
                                        const nbStims = stim_point.stimulations.length;
                                        const color = selectedContact === pointId ? 'blue' : (nbStims > 0 ? (nbStims === 1 ? 'green' : 'orange') : 'gray');
                                        return (
                                            <Popover position='bottom' opened={selectedContact === pointId} key={pointId}>
                                                <Popover.Target>
                                                    <Container>
                                                        <Chip size='sm'
                                                            value={pointId}
                                                            key={pointId}
                                                            onChange={(checked) => onSelectedChanged(selectedContact !== pointId ? pointId : "")}
                                                            checked={selectedContact === pointId || nbStims > 0}
                                                            variant={selectedContact === pointId || nbStims > 0 ? 'filled' : 'light'}
                                                            color={color}>
                                                            {pointId}
                                                        </Chip>
                                                    </Container>
                                                </Popover.Target>
                                                <Popover.Dropdown>
                                                    <Text>{t('pages.stimulationTool.stimulation.numberOfStimulationsLabel') + stim_point.stimulations.length}</Text>
                                                    {nbStims > 0 && <Button compact leftIcon={<IconEye />} onClick={() => onViewResultsForPoint(pointId)}>{t('pages.stimulationTool.stimulation.viewResultsForPointIdLabel')}</Button>}
                                                </Popover.Dropdown>
                                            </Popover>
                                        );
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
    onSelectedChanged: (newValue: string) => void
    onViewResultsForPoint: (pointId: string) => void
}