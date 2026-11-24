import { useEffect, useMemo, useRef, useState } from "react";

import { ActionIcon, Alert, Box, Button, Center, Container, Divider, Flex, Group, GroupProps, HoverCard, Modal, Popover, ScrollArea, SimpleGrid, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { DateTimePicker, DateValue } from "@mantine/dates";
import { useForm, UseFormReturnType } from "@mantine/form";
import { useListState } from "@mantine/hooks";
import { IconAlertCircle, IconCancel, IconCheck, IconCircleCheck, IconCircleX, IconClockCheck, IconClockEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

import { StimulationSessionStore } from "@/core/application/stores/stimulationSessionStore";
import { Electrode } from "@/core/domain/electrode";
import { StimulationPoint } from "@/core/domain/stimulationPoint";
import { computeChargeDensity, getStimPointDisplayLabel, getStimPointLabel } from "@/core/domain/utils";
import { toStimulation } from "@/ui/application/mappers/stimulationMapper";
import Section from "@/ui/components/Section";
import StimulatedContact, { getStimulatedStyledContactBorderStyle, getStimulatedStyledContactColor } from "@/ui/components/StimulatedContact";
import StimulationEffectSelection, { formatEegPostDichargeLocale, formatEpiManifestation, formatSelectedObservedEffect, NO_EFFECT } from "@/ui/components/StimulationEffectSelection";
import StimulationParametersSelection from "@/ui/components/StimulationParametersSelection";
import StimulationTaskSelection, { formatSelectedTask, NO_TASK } from "@/ui/components/StimulationTaskSelection";
import { StimulationEffectsValues, StimulationObservedEffectFormValues, StimulationParametersFormValues, StimulationTaskFormValues } from "@/ui/core/types";


import { TabProperties } from "./tab_properties";

const StimulationsTab = function StimulationsTab({ store, viewPointSummary, editStimulation }: StimulationTabProps) {
    // TODO: ajouter validations (ex: post discharge time cannot be 0 or negative if set to true)

    const { t } = useTranslation();

    // Edit mode state
    const isEditMode = !!editStimulation;
    const loadedEditStimulationRef = useRef<{
        electrodeIndex: number;
        stimPointIndex: number;
        stimulationIndex: number;
    } | null>(null);

    const [selectedPoint, setSelectedPoint] = useState<string>(isEditMode && editStimulation ? getStimPointLabel(store.session.electrodes[editStimulation.electrodeIndex].label, editStimulation.stimPointIndex) : "");
    const [showConfirmNoSave, setShowConfirmNoSave] = useState<boolean>(false);

    const [stimulationTime, setStimulationTime] = useState<string>(isEditMode && editStimulation ? store.session.electrodes[editStimulation.electrodeIndex].stimulationPoints[editStimulation.stimPointIndex].stimulations[editStimulation.stimulationIndex].time : "");

    // Forms
    const params_form = useForm<StimulationParametersFormValues>({
        initialValues: { amplitude: 1.0, duration: 0, frequency: 0, lengthPath: 0 },
        validate: {
            "amplitude": (value) => value <= 0 ? t('pages.stimulationTool.stimulation.validations.amplitude') : null,
            "frequency": (value) => value <= 0 ? t('pages.stimulationTool.stimulation.validations.frequency') : null,
            "duration": (value) => value <= 0 ? t('pages.stimulationTool.stimulation.validations.duration') : null,
            "lengthPath": (value) => value <= 0 ? t('pages.stimulationTool.stimulation.validations.length_path') : null,
        },
        validateInputOnBlur: true, validateInputOnChange: true
    });
    const task_form = useForm<StimulationTaskFormValues>({ initialValues: { category: "", subcategory: "", characteristic: "" } });
    const effect_form = useForm<StimulationEffectsValues>({ initialValues: { observed_effect: [], observed_effect_comments: "", epi_manifestation: "", contact_in_epi_zone: "unknown", contact_in_epi_zone_comments: "", post_discharge: false, pd_duration: undefined, pd_local: "local", pd_type: "", crisis: false, crisis_comments: "" } });

    // Last used values
    const [lastTaskValues, lastTaskValuesHandlers] = useListState<{ category: string; subcategory: string; characteristic: string }>();
    const [lastCognitiveEffectValues, lastCognitiveEffectValuesHandlers] = useListState<StimulationObservedEffectFormValues>();
    const MAX_LAST_TASK = 5;
    const MAX_LAST_EFFECT = 5;

    // Load existing stimulation data when in edit mode
    useEffect(() => {
        if (!isEditMode || !editStimulation || !store) {
            loadedEditStimulationRef.current = null;
            return;
        }
        const { electrodeIndex, stimPointIndex, stimulationIndex } = editStimulation;
        const prev = loadedEditStimulationRef.current;
        if (prev && prev.electrodeIndex === electrodeIndex && prev.stimPointIndex === stimPointIndex && prev.stimulationIndex === stimulationIndex) {
            return;
        }
        const electrode = store.session.electrodes[electrodeIndex];
        const stimPoint = electrode?.stimulationPoints[stimPointIndex];
        const stimulation = stimPoint?.stimulations[stimulationIndex];

        if (stimulation) {
            // Set the selected point to disable contact selection
            const pointId = getStimPointLabel(electrode.label, stimPointIndex);
            setSelectedPoint(pointId);
            setStimulationTime(stimulation.time);

            // Load forms with existing data
            params_form.setValues({
                amplitude: stimulation.parameters.amplitude,
                duration: stimulation.parameters.duration,
                frequency: stimulation.parameters.frequency,
                lengthPath: stimulation.parameters.lengthPath,
            });

            task_form.setValues({
                category: stimulation.task.category,
                subcategory: stimulation.task.subcategory,
                characteristic: stimulation.task.characteristic,
            });

            effect_form.setValues({
                // Keep MobX observables in the session store out of Mantine's local form state.
                observed_effect: stimulation.effect.observed_effect.map((effect) => ({ ...effect })),
                observed_effect_comments: stimulation.effect.observed_effect_comments,
                epi_manifestation: stimulation.effect.epi_manifestation,
                contact_in_epi_zone: stimulation.effect.contact_in_epi_zone,
                contact_in_epi_zone_comments: stimulation.effect.contact_in_epi_zone_comments,
                post_discharge: stimulation.effect.post_discharge,
                pd_duration: stimulation.effect.pd_duration,
                pd_local: stimulation.effect.pd_local,
                pd_type: stimulation.effect.pd_type,
                crisis: stimulation.effect.crisis,
                crisis_comments: stimulation.effect.crisis_comments,
            });
        }

        loadedEditStimulationRef.current = { electrodeIndex, stimPointIndex, stimulationIndex };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, editStimulation, store, getStimPointLabel]);

    const resetForNewPoint = (newPointId: string) => {
        // Do not reset params_form to keep previously selected values
        task_form.reset();
        effect_form.reset();
        setSelectedPoint(newPointId);
        setStimulationTime('');
    }

    const handleSelectedPointChanged = (newPointId: string) => {
        if (isEditMode) { return; } // Disable point selection in edit mode
        if (stimulationTime === '') {
            resetForNewPoint(newPointId);
        }
        else {
            setShowConfirmNoSave(true);
        }
    }

    const handleViewResultsForPoint = (pointId: string) => {
        viewPointSummary(pointId);
    }

    const handleSubmit = () => {
        if (selectedPoint === undefined) { return; }
        if (stimulationTime === '') { return; }
        if (!store) { return; }

        // validate forms
        params_form.validate();
        task_form.validate();
        effect_form.validate();
        if (!params_form.isValid() || !task_form.isValid() || !effect_form.isValid()) { return; }

        let electrode_i = -1;
        let stim_point_i = -1;
        let stimulationIndex = -1;

        if (isEditMode && editStimulation) {
            // In edit mode, use the provided indices
            electrode_i = editStimulation.electrodeIndex;
            stim_point_i = editStimulation.stimPointIndex;
            stimulationIndex = editStimulation.stimulationIndex;
        } else {
            // In add mode, find from selected point
            const electrode_label = selectedPoint.split('/').slice(0, -1).join('/');
            store.session.electrodes.forEach((electrode, ei) => {
                if (electrode.label === electrode_label) {
                    electrode_i = ei;
                    electrode.stimulationPoints.forEach((stim_point, spi) => {
                        const stimId = getStimPointLabel(electrode.label, spi);
                        if (stimId === selectedPoint) {
                            stim_point_i = spi;
                        }
                    });
                }
            });
        }

        if (electrode_i === -1 || stim_point_i === -1) { return; }

        const stimulation = toStimulation(stimulationTime, params_form.values, task_form.values, effect_form.values);

        if (isEditMode && stimulationIndex !== -1) {
            // Update existing stimulation
            store.updateStimulation(electrode_i, stim_point_i, stimulationIndex, stimulation);
            editStimulation.onSave?.();
        } else {
            // Add new stimulation
            store.addStimulation(electrode_i, stim_point_i, stimulation);
        }

        // Save last used task
        if (JSON.stringify(task_form.values) === JSON.stringify(NO_TASK)) {
            // NO-OP - do not save no effect in last values
        }
        else if (lastTaskValues.map(t => formatSelectedTask(t)).includes(formatSelectedTask(task_form.values))) {
            lastTaskValuesHandlers.reorder({ from: lastTaskValues.findIndex(t => formatSelectedTask(t) === formatSelectedTask(task_form.values)), to: 0 });
        }
        else {
            lastTaskValuesHandlers.prepend(task_form.values);
            if (lastTaskValues.length >= MAX_LAST_TASK) {
                lastTaskValues.pop();
            }
        }

        // Save last used effect
        effect_form.values.observed_effect.forEach(effect => {
            if (JSON.stringify(effect) === JSON.stringify(NO_EFFECT)) {
                // NO-OP - do not save no effect in last values
            }
            else if (lastCognitiveEffectValues.map(e => formatSelectedObservedEffect(e)).includes(formatSelectedObservedEffect(effect))) {
                lastCognitiveEffectValuesHandlers.reorder({ from: lastCognitiveEffectValues.findIndex(e => formatSelectedObservedEffect(e) === formatSelectedObservedEffect(effect)), to: 0 });
            }
            else {
                lastCognitiveEffectValuesHandlers.prepend({
                    class: effect.class,
                    descriptor: effect.descriptor,
                    details: effect.details
                });
                if (lastCognitiveEffectValues.length >= MAX_LAST_EFFECT) {
                    lastCognitiveEffectValues.pop();
                }
            }
        });

        // unselect point and reset inner forms to prepare for next stimulation
        resetForNewPoint('');
        return;
    }

    const getSelectedPointLocationFormInfo = () => {
        for (const electrode of store.session.electrodes) {
            let foundStimPoint = electrode.stimulationPoints.find(point =>
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
            return effect_form.values.observed_effect.some(e => e.class !== "" || e.descriptor !== "" || e.details !== "");
        },
        [effect_form.values.observed_effect]
    );

    const allowStimulationTimeSet = useMemo<boolean>(
        () => {
            const task = task_form.values;
            const taskSelected = !(task.category === "" && task.subcategory === "" && task.characteristic === "");
            return taskSelected && params_form.isValid();
        },
        [task_form.values, params_form]
    )

    const getSelectedPointEpiManifEffect = () => {
        return formatEpiManifestation(effect_form.values.epi_manifestation, t);
    }

    const getSelectedPointEEGEffect = () => {
        const effect_form_values = effect_form.values;
        const post_discharge = effect_form.values.post_discharge ? `PD: ${effect_form_values.pd_duration !== undefined ? effect_form_values.pd_duration : "-"} s / ${formatEegPostDichargeLocale(effect_form_values.pd_local, t)}` : '-'
        return `${post_discharge} ${effect_form_values.crisis ? t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_label') : ""}`
    }

    return (
        <Box pt={"md"} h={"100%"}>
            {/** Confirm change contact without saving */}
            <Modal opened={showConfirmNoSave} onClose={() => setShowConfirmNoSave(false)} title={t('pages.stimulationTool.stimulation.alert_point_changed.title')}>
                <Group position="apart">
                    <Button leftIcon={<IconCircleX color="white" />} variant="filled" onClick={() => setShowConfirmNoSave(false)}>{t('pages.stimulationTool.stimulation.alert_point_changed.cancel_label')}</Button>
                    <Button leftIcon={<IconTrash color="white" />} variant="filled" color="red" onClick={() => { setShowConfirmNoSave(false); resetForNewPoint('') }}>{t('pages.stimulationTool.stimulation.alert_point_changed.confirm_label')}</Button>
                </Group>
            </Modal>

            <Box h={"45%"} w={"100%"}>
                <Group w={"100%"} h={"100%"} align='flex-start' >
                    <Box h={"100%"} sx={{ flex: 7 }}>
                        <Section
                            header={
                                <Group position="apart" align="center" noWrap>
                                    <Title order={3} h={"100%"}>{t('pages.stimulationTool.stimulation.contacts_title')}</Title>
                                    <ContactColorLegend h={"100%"} w={"80%"} position="apart" noWrap t={t} />
                                </Group>
                            }
                            children={
                                <Box h={"100%"} w={"100%"} p={0} m={0}>
                                    <ContactSelection store={store}
                                        electrodes={store.session.electrodes.filter(e => e.confirmed)}
                                        selectedContact={selectedPoint}
                                        onSelectedChanged={handleSelectedPointChanged}
                                        onViewResultsForPoint={handleViewResultsForPoint}
                                    />
                                </Box>
                            }
                        />
                    </Box>
                    <Box h={"100%"} sx={{ flex: 5 }}>
                        <Stack h={"100%"} w={"100%"} spacing={0} display={selectedPoint !== '' ? 'flex' : 'none'}>
                            <StimulationTaskSelection form={task_form} last_values={lastTaskValues} />
                            <StimulationParametersSelection form={params_form} />
                        </Stack>

                    </Box>
                </Group>
            </Box>

            <Box h={"15%"} w={"100%"} py={"sm"}>
                <CentralBar
                    store={store}
                    selectedPoint={selectedPoint}
                    stimulationTime={stimulationTime}
                    setStimulationTime={setStimulationTime}
                    params_form={params_form}
                    task_form={task_form}
                    effect_form={effect_form}
                    handleSubmit={handleSubmit}
                    getSelectedPointLocation={getSelectedPointLocation}
                    getSelectedPointObservedEffect={getSelectedPointObservedEffect}
                    allowStimulationTimeSet={allowStimulationTimeSet}
                    isSelectedPointObservedEffectSelected={isSelectedPointObservedEffectSelected}
                    getSelectedPointEpiManifEffect={getSelectedPointEpiManifEffect}
                    getSelectedPointEEGEffect={getSelectedPointEEGEffect}
                    t={t}
                    isEditMode={isEditMode}
                    onCancel={editStimulation?.onCancel}
                />
            </Box>

            <Box h={"40%"} w={"100%"}>
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
        </Box>
    );


}

interface StimulationTabProps extends TabProperties {
    viewPointSummary: (pointId: string) => void;
    editStimulation?: {
        electrodeIndex: number;
        stimPointIndex: number;
        stimulationIndex: number;
        onSave: () => void;
        onCancel: () => void;
    };
}

const ContactSelection = ({ electrodes, selectedContact, onSelectedChanged, onViewResultsForPoint }: ContactSelectionProps) => {
    return (
        <ScrollArea w={"100%"} h={"100%"} sx={{ alignItems: "center", padding: '0', margin: '0' }}>
            {electrodes.map((electrode, electrode_i) => {
                return (
                    <Stack key={'div_group_electrode_' + electrode_i}>
                        <Group noWrap
                            spacing='sm'
                            position='left'
                            align='center'
                            mt={'sm'}
                            key={'div_group_electrode_' + electrode_i}
                            w={"100%"}
                        >
                            <Title order={4} w={"5%"} p={"md"}>{electrode.label}</Title>
                            <Box h={"100%"} w={"95%"} my={0}>
                                <SimpleGrid cols={10}
                                    breakpoints={[
                                        { maxWidth: '90rem', cols: 8, spacing: 'sm' },
                                        { maxWidth: '70rem', cols: 6, spacing: 'sm' },
                                        { maxWidth: '50rem', cols: 4, spacing: 'xs' },
                                        { maxWidth: '40rem', cols: 3, spacing: 'xs' },
                                        { maxWidth: '35rem', cols: 2, spacing: 'sm' },
                                    ]}>
                                    {electrode.stimulationPoints.map((stim_point, stim_point_i) => {
                                        const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                        const nbStims = stim_point.stimulations.length;
                                        return (
                                            <Popover position='bottom' opened={selectedContact === pointId} key={pointId} withinPortal>
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
                                                            {getStimPointLabel(electrode.label, stim_point_i, false, true)}
                                                        </StimulatedContact>
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
    electrodes: Electrode[];
    selectedContact: string;
    onSelectedChanged: (newValue: string) => void;
    onViewResultsForPoint: (pointId: string) => void;
    store: StimulationSessionStore;
}

interface CentralBarProps {
    store: StimulationSessionStore;
    selectedPoint: string;
    stimulationTime: string;
    setStimulationTime: (time: string) => void;
    params_form: UseFormReturnType<StimulationParametersFormValues>;
    task_form: UseFormReturnType<StimulationTaskFormValues>;
    effect_form: UseFormReturnType<StimulationEffectsValues>;
    handleSubmit: () => void;
    getSelectedPointLocation: () => string;
    getSelectedPointObservedEffect: () => string;
    allowStimulationTimeSet: boolean;
    isSelectedPointObservedEffectSelected: boolean;
    getSelectedPointEpiManifEffect: () => string;
    getSelectedPointEEGEffect: () => string;
    t: any;
    isEditMode?: boolean;
    onCancel?: () => void;
}

const CentralBar = ({
    store,
    selectedPoint,
    stimulationTime,
    setStimulationTime,
    params_form,
    task_form,
    handleSubmit,
    getSelectedPointLocation,
    getSelectedPointObservedEffect,
    allowStimulationTimeSet,
    isSelectedPointObservedEffectSelected,
    getSelectedPointEpiManifEffect,
    getSelectedPointEEGEffect,
    t,
    isEditMode,
    onCancel
}: CentralBarProps) => {
    const theme = useMantineTheme();
    const formatParameters = (params: StimulationParametersFormValues): string => {
        return t('pages.stimulationTool.stimulation.amplitude_label') + ': ' + params.amplitude + ' (mA), ' +
            t('pages.stimulationTool.stimulation.frequency_label') + ': ' + params.frequency + ' (Hz), ' +
            t('pages.stimulationTool.stimulation.duration_label') + ': ' + params.duration + ' (s), ' +
            t('pages.stimulationTool.stimulation.length_path_label') + ': ' + params.lengthPath + ' (µs), ' +
            t('pages.stimulationTool.stimulation.charge_density_label') + ': ' + computeChargeDensity(params.amplitude, params.lengthPath).toFixed(2) + ' (µC/cm²)';
    }
    const stimPointConfirmedExist = useMemo<boolean>(() => {
        return store.session.electrodes.filter((e: Electrode) => e.confirmed && e.configId).length !== 0;
    }, [store.session.electrodes]);
    const stimTimeSet = stimulationTime !== '';

    const [useDateTimePicker, setUseDateTimePicker] = useState<boolean>(false);
    const [customSelectedDateTime, setCustomSelectedDateTime] = useState<DateValue>(null);

    const selectedPointElectrodeLabel = selectedPoint.split('/').slice(0, -1).join('/');
    const selectedPointStims = store.session.electrodes.find((e: Electrode) => e.label === selectedPointElectrodeLabel)?.stimulationPoints.find((p: StimulationPoint) => getStimPointLabel(selectedPointElectrodeLabel, p.index) === selectedPoint)?.stimulations;
    const stims = selectedPointStims !== undefined ? selectedPointStims : [];
    const selectedContactBorderSx = getStimulatedStyledContactBorderStyle(stims, theme);
    const selectedContactBackgroundColorSx = getStimulatedStyledContactColor(stims, stims.length === 0, theme, true);

    return (
        <Box h={"100%"} sx={(theme) => (
            {
                borderRadius: theme.radius.xl,
                overflow: "hidden",
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[6]
            })}>
            {/** No Contact exists */}
            <Group align='center' position='center' h={"100%"} w={"100%"} display={!stimPointConfirmedExist ? "block" : "none"}>
                <Alert h={"100%"}
                    icon={<IconAlertCircle size="1rem" />}
                    title={t('pages.stimulationTool.stimulation.guide_alert_no_electrode_title')}>
                    {t('pages.stimulationTool.stimulation.guide_alert_no_electrode_text')}
                </Alert>
            </Group>
            {/** Contact Exist */}
            <Box h={"100%"} display={stimPointConfirmedExist ? 'block' : 'none'}>
                {/** No contact selected */}
                <Group align='center' position='center' h={"100%"} w={"100%"} display={selectedPoint === "" ? "block" : "none"}>
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
                        sx={(theme) => ({
                            flex: 1,
                            backgroundColor: selectedContactBackgroundColorSx,
                            height: '100%',
                            padding: theme.spacing.md,
                            ...selectedContactBorderSx,
                            borderTopLeftRadius: theme.radius.xl,
                            borderBottomLeftRadius: theme.radius.xl,
                        })}>
                        <Text fz={"xl"} fw={"bolder"}>{getStimPointDisplayLabel(selectedPoint)}</Text>
                    </Center>

                    {/** Implantation ROI or selected Effect */}
                    <Stack sx={{ flex: 3 }} h={"100%"} align="center" justify="center">
                        <Text fz={"lg"} fw={"bold"} display={stimTimeSet ? 'none' : 'block'}>{getSelectedPointLocation()}</Text>
                        <Stack display={stimTimeSet ? 'block' : 'none'} align="flex-start" justify="center" spacing={2}>
                            <Text fz={"lg"} fw={"bold"}>{t('pages.stimulationTool.stimulation.effect.observed_effect_label')}:</Text>
                            <ScrollArea h={40} type="auto" sx={{ overflowX: 'hidden' }}>
                                <Text fz={"lg"}>{getSelectedPointObservedEffect()}</Text>
                            </ScrollArea>
                        </Stack>
                    </Stack>

                    {/** Time selection / Save button */}
                    <Group position="center" align="center" h={"100%"} noWrap sx={{ flex: 3 }} >
                        <Group position="center" align="center" h={"100%"} w={"100%"} spacing={"xs"}>
                            {!stimTimeSet &&
                                <HoverCard disabled={allowStimulationTimeSet}>
                                    <HoverCard.Target>
                                        <Box>
                                            <Button.Group orientation="horizontal">
                                                <Button size="lg"
                                                    display={useDateTimePicker ? 'none' : 'flex'}
                                                    onClick={() => setStimulationTime(new Date().toISOString())}
                                                    leftIcon={<IconClockCheck />}
                                                    disabled={!allowStimulationTimeSet}>
                                                    <Text w={"9rem"} align='center' size={"md"} sx={{ whiteSpace: 'normal' }} >{t('pages.stimulationTool.stimulation.set_time_label_now')}</Text>
                                                </Button>
                                                <Button size="lg"
                                                    display={useDateTimePicker ? 'none' : 'flex'}
                                                    onClick={() => setUseDateTimePicker(true)}
                                                    leftIcon={<IconClockEdit />}
                                                    disabled={!allowStimulationTimeSet}>
                                                    <Text w={"9rem"} align='center' size={"md"} sx={{ whiteSpace: 'normal' }} >{t('pages.stimulationTool.stimulation.set_time_label_custom')}</Text>
                                                </Button>
                                            </Button.Group>
                                            <Group position="center" display={useDateTimePicker ? 'flex' : 'none'}>
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
                            <Stack spacing={5} align="stretch">
                                <HoverCard disabled={isSelectedPointObservedEffectSelected}>
                                    <HoverCard.Target>
                                        <Button variant="filled" size="md" color="green" leftIcon={<IconCircleCheck />}
                                            display={stimTimeSet ? 'block' : 'none'}
                                            onClick={handleSubmit}
                                            disabled={stimulationTime === "" || !isSelectedPointObservedEffectSelected}>
                                            {isEditMode ? t('pages.stimulationTool.stimulation.updateButtonLabel') : t('pages.stimulationTool.stimulation.saveButtonLabel')}
                                        </Button>
                                    </HoverCard.Target>
                                    <HoverCard.Dropdown>
                                        <Text>{t('pages.stimulationTool.stimulation.no_effect_selected')}</Text>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                                <Button variant="filled" size="md" color="gray.7"
                                    display={(isEditMode && onCancel) ? 'block' : 'none'}
                                    leftIcon={<IconCancel />}
                                    onClick={onCancel}>
                                    {t('pages.stimulationTool.stimulation.cancelButtonLabel')}
                                </Button>
                            </Stack>
                        </Group>
                    </Group>

                    {/** Parameters & Task or Manif & EEG */}
                    <Box sx={{ flex: 5 }} h={"100%"} p={0} m={0}>
                        {/** Task & Parameters when stim time is not set, or always in edit mode */}
                        <Stack h={"100%"} w={"100%"} align="flex-start" justify="center" spacing={"sm"} display={stimTimeSet && !isEditMode ? 'none' : 'flex'}>
                            <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.task_title')} : </strong>{formatSelectedTask(task_form.values)}</Text>
                            <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.parameters_title')} : </strong>{formatParameters(params_form.values)}</Text>
                        </Stack>
                        {/** Epi manif & EEG when stim time is set, or always in edit mode */}
                        <Stack h={"100%"} w={"100%"} align="flex-start" justify="center" spacing={"sm"} display={(stimTimeSet || isEditMode) ? 'flex' : 'none'}>
                            <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}:</strong> {getSelectedPointEpiManifEffect()}</Text>
                            <Text fz={"lg"}><strong>{t('pages.stimulationTool.stimulation.effect.eeg')} :</strong> {getSelectedPointEEGEffect()}</Text>
                        </Stack>
                    </Box>
                </Flex >
            </Box>
        </Box>
    );
};

export default StimulationsTab;
const ContactColorLegend = ({ t, ...props }: GroupProps & { t: any }) => {
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
            {variants.map((v) =>
                <Stack align="center" justify="center" spacing={0} key={v.label}>
                    <StimulatedContact size="xs" selected={false} forcedVariant={v.variant} forcedEffect={v.effect} onChange={() => { }} stimulations={[]}>
                        {"A1/2"}
                    </StimulatedContact>
                    <Text>{v.label}</Text>
                </Stack>
            )}
        </Group>
    );
}