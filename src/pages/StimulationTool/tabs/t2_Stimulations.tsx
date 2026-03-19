import { ActionIcon, Alert, Box, Button, Center, Container, Divider, Flex, Grid, Group, GroupProps, HoverCard, Modal, Popover, ScrollArea, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { TabProperties } from "./tab_properties";
import { StimulationObservedEffectFormValues, StimulationEffectsValues, StimulationParametersFormValues, StimulationTaskFormValues, getStimPointLabel, ElectrodeFormValues } from "../../../core/models/stimulationForm";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import StimulationTaskSelection, { formatSelectedTask, NO_TASK } from "../../../components/StimulationTaskSelection";
import { useListState } from "@mantine/hooks";
import StimulationEffectSelection, { formatEegPostDichargeLocale, formatEpiManifestation, formatSelectedObservedEffect, NO_EFFECT } from "../../../components/StimulationEffectSelection";
import { IconAlertCircle, IconCheck, IconCircleCheck, IconCircleX, IconClockCheck, IconClockEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { t } from "i18next";
import CustomNumberInput from "../../../components/CustomNumberInput";
import StimulatedContact, { getStimulatedStyledContactBorderStyle, getStimulatedStyledContactColor } from "../../../components/StimulatedContact";
import Section from "../../../components/Section";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { useStimulationRepository } from "../../../infra/ZustandStimulationRepository";
import { Stimulation } from "../../../core/domain/Stimulation";

export default function StimulationsTab({ viewPointSummary }: StimulationTabProps) {
    // TODO: ajouter validations (ex: post discharge time cannot be 0 or negative if set to true)

    const { t } = useTranslation();
    const repository = useStimulationRepository();
    const session = repository.getSession();

    const [selectedPoint, setSelectedPoint] = useState<string>("");
    const [showConfirmNoSave, setShowConfirmNoSave] = useState<boolean>(false);

    const [stimulationTime, setStimulationTime] = useState<string>("");
    const [useDateTimePicker, setUseDateTimePicker] = useState<boolean>(false);
    const [customSelectedDateTime, setCustomSelectedDateTime] = useState<DateValue>(null);

    // Forms
    const params_form = useForm<StimulationParametersFormValues>({ initialValues: { amplitude: 1.0, duration: 0, frequency: 0, lenght_path: 0 } });
    const task_form = useForm<StimulationTaskFormValues>({ initialValues: { category: "", subcategory: "", characteristic: "" } });
    const effect_form = useForm<StimulationEffectsValues>({ initialValues: { observed_effect: { class: "", descriptor: "", details: "" }, observed_effect_comments: "", epi_manifestation: "", contact_in_epi_zone: "unknown", contact_in_epi_zone_comments: "", post_discharge: false, pd_duration: undefined, pd_local: "local", pd_type: "", crisis: false, crisis_comments: "" } });

    // Last used values
    const [lastTaskValues, lastTaskValuesHandlers] = useListState<{ category: string; subcategory: string; characteristic: string }>();
    const [lastCognitiveEffectValues, lastCognitiveEffectValuesHandlers] = useListState<StimulationObservedEffectFormValues>();
    const MAX_LAST_TASK = 5;
    const MAX_LAST_EFFECT = 5;

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
        setUseDateTimePicker(false);
        setCustomSelectedDateTime(null);
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

        session.electrodes.forEach((electrode, electrode_i) => {
            if (electrode.label === electrode_label) {
                electrode.stim_points.forEach((stim_point, stim_point_i) => {
                    const stimId = getStimPointLabel(electrode.label, stim_point_i)
                    if (stimId === selectedPoint) {
                        // Insert new stimulatinon for this stimulation point
                        repository.addStimulation(electrode.label, stim_point.index, new Stimulation(
                                stimulationTime,
                                {
                                    amplitude: params_values.amplitude,
                                    duration: params_values.duration,
                                    frequency: params_values.frequency,
                                    lenght_path: params_values.lenght_path
                                },
                                {
                                    category: task_values.category,
                                    subcategory: task_values.subcategory,
                                    characteristic: task_values.characteristic
                                },
                                effect_values
                            ));
                        // Save last used task
                        if (JSON.stringify(task_values) === JSON.stringify(NO_TASK)) {
                            // NO-OP - do not save no effect in last values
                        }
                        else if (lastTaskValues.map(t => formatSelectedTask(t)).includes(formatSelectedTask(task_values))) {
                            lastTaskValuesHandlers.reorder({ from: lastTaskValues.findIndex(t => formatSelectedTask(t) === formatSelectedTask(task_values)), to: 0 });
                        }
                        else {
                            lastTaskValuesHandlers.prepend(task_values);
                            if (lastTaskValues.length >= MAX_LAST_TASK) {
                                lastTaskValues.pop();
                            }
                        }

                        // Save last used effect
                        if (JSON.stringify(effect_values.observed_effect) === JSON.stringify(NO_EFFECT)) {
                            // NO-OP - do not save no effect in last values
                        }
                        else if (lastCognitiveEffectValues.map(e => formatSelectedObservedEffect(e)).includes(formatSelectedObservedEffect(effect_values.observed_effect))) {
                            lastCognitiveEffectValuesHandlers.reorder({ from: lastCognitiveEffectValues.findIndex(e => formatSelectedObservedEffect(e) === formatSelectedObservedEffect(effect_values.observed_effect)), to: 0 });
                        }
                        else {
                            lastCognitiveEffectValuesHandlers.prepend({
                                class: effect_values.observed_effect.class,
                                descriptor: effect_values.observed_effect.descriptor,
                                details: effect_values.observed_effect.details
                            });
                            if (lastCognitiveEffectValues.length >= MAX_LAST_EFFECT) {
                                lastCognitiveEffectValuesHandlers.pop();
                            }
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
        for (const electrode of session.electrodes) {
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

    const isSelectedPointObservedEffectSelected = useMemo<boolean>(
        () => {
            const effect = effect_form.values.observed_effect;
            return !(effect.class === "" && effect.descriptor === "" && effect.details === "");
        },
        [effect_form.values.observed_effect]
    );

    const isTaskSelected = useMemo<boolean>(
        () => {
            const task = task_form.values;
            return !(task.category === "" && task.subcategory === "" && task.characteristic === "");
        },
        [task_form.values]
    );

    const getSelectedPointEpiManifEffect = () => {
        return formatEpiManifestation(effect_form.values.epi_manifestation, t);
    }

    const getSelectedPointEEGEffect = () => {
        const effect_form_values = effect_form.values;
        const post_discharge = effect_form.values.post_discharge ? `PD: ${effect_form_values.pd_duration !== undefined ? effect_form_values.pd_duration : "-"} s / ${formatEegPostDichargeLocale(effect_form_values.pd_local, t)}` : '-'
        return `${post_discharge} ${effect_form_values.crisis ? t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_label') : ""}`
    }

    const CentralBar = () => {
        const theme = useMantineTheme();
        const formatParameters = (params: StimulationParametersFormValues): string => {
            return `${t('pages.stimulationTool.stimulation.amplitude_label')}: ${params.amplitude} (mA), ` +
                `${t('pages.stimulationTool.stimulation.frequency_label')}: ${params.frequency} (Hz), ` +
                `${t('pages.stimulationTool.stimulation.duration_label')}: ${params.duration} (s), ` +
                `${t('pages.stimulationTool.stimulation.length_path_label')}: ${params.lenght_path} (µs)`;
        }

        const stimPointConfirmedExist = useMemo<boolean>(() => {
            return session.electrodes.filter(e => e.confirmed && e.n_contacts > 0).length !== 0;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [session]);
        const stimTimeSet = useMemo<boolean>(() => stimulationTime !== '', [stimulationTime]);

        const selectedPointElectrodeLabel = selectedPoint.split('/').slice(0, -1).join('/');
        const selectedPointStims = session.electrodes.find(e => e.label === selectedPointElectrodeLabel)?.stim_points.find(p => getStimPointLabel(selectedPointElectrodeLabel, p.index) === selectedPoint)?.stimulations;
        const stims = selectedPointStims !== undefined ? selectedPointStims : [];
        const selectedContactBorderSx = getStimulatedStyledContactBorderStyle(stims, theme);
        const selectedContactBackgroundColorSx = getStimulatedStyledContactColor(stims, stims.length === 0, theme, true);

        return (
            <Box h={"100%"} style={{
                borderRadius: theme.radius.xl,
                overflow: "hidden",
                backgroundColor: 'light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-4))'
            }}>
                {/** No Contact exists */}
                <Group align='center' justify='center' h={"100%"} w={"100%"} display={!stimPointConfirmedExist ? "block" : "none"}>
                    <Alert h={"100%"}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t('pages.stimulationTool.stimulation.guide_alert_no_electrode_title')}>
                        {t('pages.stimulationTool.stimulation.guide_alert_no_electrode_text')}
                    </Alert>
                </Group>
                {/** Contact Exist */}
                <Box h={"100%"} display={stimPointConfirmedExist ? 'block' : 'none'}>
                    {/** No contact selected */}
                    <Group align='center' justify='center' h={"100%"} w={"100%"} display={selectedPoint === "" ? "block" : "none"}>
                        <Alert h={"100%"}
                            icon={<IconAlertCircle size="1rem" />}
                            title={t('pages.stimulationTool.stimulation.guide_alert_title')}>
                            {t('pages.stimulationTool.stimulation.guide_alert_text')}
                        </Alert>
                    </Group>
                    {/** Contact selected */}
                    <Flex direction={"row"} justify={"flex-start"} align={"flex-start"} wrap={"nowrap"} w={"100%"} h={"100%"} display={selectedPoint !== "" ? "flex" : "none"}>
                        {/** Selected contact */}
                        <Center
                            style={{
                                flex: 1,
                                backgroundColor: selectedContactBackgroundColorSx,
                                height: '100%',
                                padding: theme.spacing.md,
                                ...(selectedContactBorderSx as any),
                                borderTopLeftRadius: theme.radius.xl,
                                borderBottomLeftRadius: theme.radius.xl,
                            }}>
                            <Text fz={"xl"} fw={"bolder"}>{selectedPoint}</Text>
                        </Center>

                        {/** Implantation ROI or selected Effect */}
                        <Stack style={{ flex: 3 }} h={"100%"} align="center" justify="center">
                            <Text fz={"lg"} fw={"bold"} display={stimTimeSet ? 'none' : 'block'}>{getSelectedPointLocation()}</Text>
                            <Stack display={stimTimeSet ? 'block' : 'none'} align="flex-start" justify="center">
                                <Text fz={"lg"} fw={"bold"}>{t('pages.stimulationTool.stimulation.effect.observed_effect_label')}:</Text>
                                <Text fz={"lg"}>{getSelectedPointObservedEffect()}</Text>
                            </Stack>
                        </Stack>

                        {/** Time selection / Save button */}
                        <Group justify="center" align="center" h={"100%"} wrap="nowrap" style={{ flex: 3 }} >
                            <Group justify="center" align="center" h={"100%"} w={"100%"} gap={"xs"}>
                                {!stimTimeSet &&
                                    <HoverCard disabled={isTaskSelected}>
                                        <HoverCard.Target>
                                            <Box>
                                                <Group wrap="nowrap" gap={0}>
                                                    <Button size="lg"
                                                        display={useDateTimePicker ? 'none' : 'flex'}
                                                        onClick={() => setStimulationTime(new Date().toISOString())}
                                                        leftSection={<IconClockCheck />}
                                                        disabled={!isTaskSelected}>
                                                        <Text w={"9rem"} ta='center' size={"md"} style={{ whiteSpace: 'normal' }} >{t('pages.stimulationTool.stimulation.set_time_label_now')}</Text>
                                                    </Button>
                                                    <Button size="lg"
                                                        display={useDateTimePicker ? 'none' : 'flex'}
                                                        onClick={() => setUseDateTimePicker(true)}
                                                        leftSection={<IconClockEdit />}
                                                        disabled={!isTaskSelected}>
                                                        <Text w={"9rem"} ta='center' size={"md"} style={{ whiteSpace: 'normal' }} >{t('pages.stimulationTool.stimulation.set_time_label_custom')}</Text>
                                                    </Button>
                                                </Group>
                                                <Group justify="center" display={useDateTimePicker ? 'flex' : 'none'}>
                                                    <DateTimePicker
                                                        withSeconds
                                                        size="lg"
                                                        placeholder={t('pages.stimulationTool.stimulation.set_time_label_custom')}
                                                        onChange={(date) => setCustomSelectedDateTime(date)}
                                                    />
                                                    <ActionIcon variant="filled"
                                                        disabled={customSelectedDateTime === null}
                                                        color={"green"}
                                                        size={"xl"}
                                                        onClick={() => setStimulationTime(customSelectedDateTime!.toISOString())}>
                                                        <IconCheck size={20} />
                                                    </ActionIcon>
                                                </Group>
                                            </Box>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Text>{t('pages.stimulationTool.stimulation.no_task_selected')}</Text>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                }
                                {stimTimeSet &&
                                    <Title order={5}>{new Date(stimulationTime).toLocaleTimeString()}</Title>
                                }
                                {/** Save button */}
                                <HoverCard disabled={isSelectedPointObservedEffectSelected}>
                                    <HoverCard.Target>
                                        <Box>
                                            <Button variant="filled" size="md" color="green" leftSection={<IconCircleCheck />}
                                                display={stimTimeSet ? 'block' : 'none'}
                                                onClick={handleSubmit}
                                                disabled={stimulationTime === "" || !isSelectedPointObservedEffectSelected}>
                                                {t('pages.stimulationTool.stimulation.saveButtonLabel')}
                                            </Button>
                                        </Box>
                                    </HoverCard.Target>
                                    <HoverCard.Dropdown>
                                        <Text>{t('pages.stimulationTool.stimulation.no_effect_selected')}</Text>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                            </Group>
                        </Group>

                        {/** Parameters & Task or Manif & EEG */}
                        <Box style={{ flex: 5 }} h={"100%"} p={0} m={0}>
                            {/** Task & Parameters when stim time is not set */}
                            <Stack h={"100%"} w={"100%"} align="flex-start" justify="center" gap={"sm"} display={stimTimeSet ? 'none' : 'flex'}>
                                <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.task_title')} : </strong>{formatSelectedTask(task_form.values)}</Text>
                                <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.parameters_title')} : </strong>{formatParameters(params_form.values)}</Text>
                            </Stack>
                            {/** Epi manif & EEG when stim time is set */}
                            <Stack h={"100%"} w={"100%"} align="flex-start" justify="center" gap={"sm"} display={stimTimeSet ? 'flex' : 'none'}>
                                <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}:</strong> {getSelectedPointEpiManifEffect()}</Text>
                                <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.effect.eeg')} :</strong> {getSelectedPointEEGEffect()}</Text>
                            </Stack>
                        </Box>
                    </Flex >
                </Box>
            </Box>
        );
    }

    const StimulationParametersSelection = () => {
        const parameterSelection = (
            <Group justify="center" align="top" wrap="nowrap">
                <CustomNumberInput
                    h={"100%"}
                    label={t('pages.stimulationTool.stimulation.amplitude_label') + ' (mA)'}
                    decimalScale={1}
                    digit_step={1}
                    decimal_step={0.1}
                    min={0}
                    max={10}
                    variant='default'
                    useCustom={true}
                    {...params_form.getInputProps('amplitude')}
                />
                <Stack align="center" h={"100%"} gap={0}>
                    <CustomNumberInput
                        label={t('pages.stimulationTool.stimulation.frequency_label') + ' (Hz)'}
                        decimalScale={0}
                        step={1}
                        min={0}
                        styles={{ input: { textAlign: "center" } }}
                        {...params_form.getInputProps('frequency')}
                    />
                    <Group gap={0} grow w={"100%"}>
                        {[1, 5, 50, 55].map((v) =>
                            <Button size="compact-sm" key={"freq_" + v}
                                onClick={() => params_form.setFieldValue('frequency', v)}
                                variant={params_form.values.frequency === v ? 'filled' : 'default'}>
                                {v}
                            </Button>
                        )}
                    </Group>
                </Stack>

                <Stack align="center" h={"100%"} gap={0}>
                    <CustomNumberInput
                        label={t('pages.stimulationTool.stimulation.duration_label') + ' (s)'}
                        decimalScale={0}
                        step={1}
                        min={0}
                        styles={{ input: { textAlign: "center" } }}
                        {...params_form.getInputProps('duration')}
                    />
                    <Group gap={0} grow w={"100%"}>
                        {[5, 10, 30, 60].map((v) =>
                            <Button size="compact-sm" key={"duration_" + v}
                                onClick={() => params_form.setFieldValue('duration', v)}
                                variant={params_form.values.duration === v ? 'filled' : 'default'}>
                                {v}
                            </Button>
                        )}
                    </Group>
                </Stack>

                <Stack align="center" h={"100%"} gap={0}>
                    <CustomNumberInput
                        label={t('pages.stimulationTool.stimulation.length_path_label') + ' (µs)'}
                        decimalScale={0}
                        step={1}
                        min={0}
                        styles={{ input: { textAlign: "center" } }}
                        {...params_form.getInputProps('lenght_path')}
                    />
                    <Group gap={0} grow w={"100%"}>
                        {[300, 500].map((v) =>
                            <Button size="compact-sm" key={"lp_" + v}
                                onClick={() => params_form.setFieldValue('lenght_path', v)}
                                variant={params_form.values.lenght_path === v ? 'filled' : 'default'}>
                                {v}
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Group>
        );
        return (
            <Section
                header={<Title order={5}>{t('pages.stimulationTool.stimulation.parameters_title')}</Title>}
                children={parameterSelection}
            />
        );
    }

    const ContactColorLegend = (props: GroupProps) => {
        const variants = [{ variant: "selected", effect: false, label: t('pages.stimulationTool.stimulation.contact_color_legend.selected') },
        { variant: "singleStim", effect: false, label: t('pages.stimulationTool.stimulation.contact_color_legend.stimulated') },
        { variant: "multipleStim", effect: false, label: t('pages.stimulationTool.stimulation.contact_color_legend.multi_stim') },
        { variant: "postDischarge", effect: false, label: t('pages.stimulationTool.stimulation.contact_color_legend.post_discharge') },
        { variant: "crisis", effect: false, label: t('pages.stimulationTool.stimulation.contact_color_legend.crisis') },
        { variant: "singleStim", effect: true, label: t('pages.stimulationTool.stimulation.contact_color_legend.effect') }
        ] as {
            variant: 'default' | 'selected' | 'crisis' | 'postDischarge' | 'singleStim' | 'multipleStim',
            effect: boolean,
            label: string
        }[];

        return (
            <Group {...props}>
                {variants.map((v, i) =>
                    <Stack align="center" justify="center" gap={0} key={"legend" + i}>
                        <StimulatedContact size="xs" selected={false} forcedVariant={v.variant} forcedEffect={v.effect} onChange={() => { }} stimulations={[]}>
                            {"A1/2"}
                        </StimulatedContact>
                        <Text>{v.label}</Text>
                    </Stack>
                )}
            </Group>
        );
    }

    return (
        <Stack pt="md" h={{ base: "auto", lg: "100%" }} gap="md">
            {/** Confirm change contact without saving */}
            <Modal opened={showConfirmNoSave} onClose={() => setShowConfirmNoSave(false)} title={t('pages.stimulationTool.stimulation.alert_point_changed.title')}>
                <Group justify="space-between">
                    <Button leftSection={<IconCircleX color="white" />} variant="filled" onClick={() => setShowConfirmNoSave(false)}>{t('pages.stimulationTool.stimulation.alert_point_changed.cancel_label')}</Button>
                    <Button leftSection={<IconTrash color="white" />} variant="filled" color="red" onClick={() => { setShowConfirmNoSave(false); resetForNewPoint('') }}>{t('pages.stimulationTool.stimulation.alert_point_changed.confirm_label')}</Button>
                </Group>
            </Modal>

            <Grid gutter="xl">
                <Grid.Col span={{ base: 12, lg: 7 }} h={{ base: "500px", lg: "auto" }} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Section
                        header={
                            <Group justify="space-between" align="center" wrap="nowrap">
                                <Title order={3} h={"100%"}>{t('pages.stimulationTool.stimulation.contacts_title')}</Title>
                                {ContactColorLegend({ h: "100%", w: "80%", justify: "space-between", wrap: "nowrap" })}
                            </Group>
                        }
                        children={
                            <Box h={"100%"} w={"100%"} p={0} m={0}>
                                <ContactSelection
                                    electrodes={session.electrodes.filter(e => e.confirmed) as any[]}
                                    selectedContact={selectedPoint}
                                    onSelectedChanged={handleSelectedPointChanged}
                                    onViewResultsForPoint={handleViewResultsForPoint}
                                />
                            </Box>
                        }
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, lg: 5 }}>
                    <Stack gap="md" display={selectedPoint !== '' ? 'flex' : 'none'}>
                        <StimulationTaskSelection form={task_form} last_values={lastTaskValues} />
                        {StimulationParametersSelection()}
                    </Stack>
                </Grid.Col>
            </Grid>

            <Box w={"100%"} pb="sm" style={{ flexShrink: 0 }}>
                {CentralBar()}
            </Box>

            <Box w={"100%"} style={{ flexGrow: 1 }}>
                { /** Stimulation point selected, but stimulation time not set => Display instructions to specify task and stimulation parameters */
                    selectedPoint !== '' && stimulationTime === '' &&
                    <Alert h={"100%"}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t('pages.stimulationTool.stimulation.guide_alert_fill_task_and_params_title')}>
                        {t('pages.stimulationTool.stimulation.guide_alert_fill_task_and_params_text')}
                    </Alert>
                }
                { /** Stimulation point selected, and stimulation time is set => Display Stimulation Effect form */
                    selectedPoint !== '' && stimulationTime !== '' &&
                    <StimulationEffectSelection form={effect_form} observed_effect_last_values={lastCognitiveEffectValues} />
                }
            </Box>
        </Stack>
    );


}

interface StimulationTabProps extends TabProperties {
    viewPointSummary: (pointId: string) => void
}

const ContactSelection = ({ electrodes, selectedContact, onSelectedChanged, onViewResultsForPoint }: ContactSelectionProps) => {
    return (
        <ScrollArea w={"100%"} h={"100%"} style={{ alignItems: "center", padding: '0', margin: '0' }}>
            {electrodes.map((electrode, electrode_i) => {
                return (
                    <Stack key={'div_group_electrode_' + electrode_i}>
                        <Group wrap="nowrap"
                            gap='sm'
                            justify='left'
                            align='center'
                            mt={'sm'}
                            key={'div_group_electrode_' + electrode_i}
                            w={"100%"}
                        >
                            <Title order={4} w={"5%"} p={"md"}>{electrode.label}</Title>
                            <Box h={"100%"} w={"95%"} my={0}>
                                <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6, lg: 8, xl: 10 }}
                                    spacing={{ base: 'xs', sm: 'sm' }}>
                                    {electrode.stim_points.map((stim_point, stim_point_i) => {
                                        const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                        const nbStims = stim_point.stimulations.length;
                                        return (
                                            <Popover position='bottom' opened={selectedContact === pointId} key={pointId}>
                                                <Popover.Target>
                                                    <Container p={0}>
                                                        <StimulatedContact
                                                            selected={selectedContact === pointId}
                                                            stimulations={stim_point.stimulations}
                                                            size='sm'
                                                            value={pointId}
                                                            key={pointId}
                                                            onChange={(_checked) => onSelectedChanged(selectedContact !== pointId ? pointId : "")}
                                                        >
                                                            {pointId}
                                                        </StimulatedContact>
                                                    </Container>
                                                </Popover.Target>
                                                <Popover.Dropdown>
                                                    <Text>{t('pages.stimulationTool.stimulation.numberOfStimulationsLabel') + stim_point.stimulations.length}</Text>
                                                    {nbStims > 0 && <Button size="compact-sm" leftSection={<IconEye />} onClick={() => onViewResultsForPoint(pointId)}>{t('pages.stimulationTool.stimulation.viewResultsForPointIdLabel')}</Button>}
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
    electrodes: ElectrodeFormValues[],
    selectedContact: string,
    onSelectedChanged: (newValue: string) => void
    onViewResultsForPoint: (pointId: string) => void
}