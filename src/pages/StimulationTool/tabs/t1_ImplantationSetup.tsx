import { ActionIcon, Alert, Badge, Box, Button, Checkbox, Chip, Flex, Group, Input, Modal, NativeSelect, NumberInput, ScrollArea, SegmentedControl, SimpleGrid, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconAlertCircle, IconCircleCheck, IconCirclePlus, IconCircleX, IconDeselect, IconFileImport, IconLockCheck, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";
import StimulationFormValues, { ElectrodeFormValues, getStimPointLabel, getStimPointDisplayLabel, StimulationPoint } from "../../../core/models/stimulationForm";
import { useForm, UseFormReturnType } from "@mantine/form";
import parseMniImplantationFromTsv from "../../../ui/tsvMniImplantationParser/tsvMniImplantationParser";

export default function ElectrodeSetupStep({ form }: TabProperties) {
    const { t } = useTranslation();
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [doneContacts, setDoneContacts] = useState<string[]>([]);

    // Electrode delete
    const [showConfirmDeleteElectrode, setShowConfirmDeleteElectrode] = useState<boolean>(false);
    const [electrodeLabelToDelete, setElectrodeLabelToDelete] = useState<string | undefined>(undefined);

    // Confirm / Lock electrode - lock number of contacts
    const electrodeConfirmForm = useForm({
        initialValues: {
            electrode_label: "",
            do_not_show_again: false
        }
    });
    const [showElectrodeConfirmModal, setShowElectrodeConfirmModal] = useState<boolean>(false);
    const [doNotShowAgainElectrodeConfirmModal, setDoNotShowAgainElectrodeConfirmModal] = useState<boolean>(false);

    // Implantation from tsv file
    const openInputFileRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null) {
            return;
        }

        const uploadedFile = e.target.files[0];

        const fileReader = new FileReader();
        if (uploadedFile !== undefined)
            fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = () => {
            try {
                const electrodes = parseMniImplantationFromTsv(fileReader.result as string);
                form.setFieldValue('electrodes', electrodes);
            }
            catch (e) {
                console.error(`Error loading from file: ${e}`)
            }
        }
        // Reset the file input to nothing to allow selecting the same file again to replace the data
        if (openInputFileRef.current) { openInputFileRef.current.value = ''; }
    }, [form]);

    const addElectrode = () => {
        form.insertListItem('electrodes', { label: nextElectrodeDefaultLabel, side: undefined, n_contacts: 0, confirmed: false, stim_points: [] } as ElectrodeFormValues);
        setNextElectrodeDefaultLabel(letters.increment(nextElectrodeDefaultLabel));
        form.validate();
    }

    const setContactsToElectrode = (electrodeIndex: number, nbContacts: number) => {
        form.setFieldValue(`electrodes.${electrodeIndex}.stim_points`, []);
        form.setFieldValue(`electrodes.${electrodeIndex}.n_contacts`, nbContacts);
        for (let i = 0; i < nbContacts - 1; i++) {
            form.insertListItem(`electrodes.${electrodeIndex}.stim_points`,
                {
                    index: i,
                    location: {
                        type: 'vep',
                        vep: "",
                        destrieux: "",
                        mni: { x: 0, y: 0, z: 0 },
                        done: false,
                    },
                    stimulations: []
                });
        }
    }

    const handleElectrodeLocationFormSubmit = () => {
        locationForm.validate();
        if (!locationForm.isValid()) { return; }
        const values = locationForm.values;
        if (selectedContacts.length === 0) { return; }

        // Create a copy of the electrodes to update them all at once
        const nextElectrodes = [...form.values.electrodes];
        
        selectedContacts.forEach(selectedStimPoint => {
            const parts = selectedStimPoint.split('/');
            const electrode_label = parts.slice(0, -1).join('/');
            
            const electrode_i = nextElectrodes.findIndex(e => e.label === electrode_label);
            if (electrode_i !== -1) {
                const electrode = nextElectrodes[electrode_i];
                // We assume the stim_point index in the label matches the array index or we find it
                // getStimPointLabel uses electrode.label and index
                const stim_point_i = electrode.stim_points.findIndex((_, i) => getStimPointLabel(electrode.label, i) === selectedStimPoint);
                
                if (stim_point_i !== -1) {
                    const sp = electrode.stim_points[stim_point_i];
                    const updatedPoint = {
                        ...sp,
                        location: {
                            ...sp.location,
                            type: values.type as "vep" | "destrieux" | "mni" | "white",
                            vep: values.vep,
                            destrieux: values.destrieux,
                            white_matter: values.white_matter,
                            mni: { x: values.mni_x, y: values.mni_y, z: values.mni_z },
                            done: true
                        }
                    };
                    
                    const nextStimPoints = [...electrode.stim_points];
                    nextStimPoints[stim_point_i] = updatedPoint;
                    nextElectrodes[electrode_i] = { ...electrode, stim_points: nextStimPoints };
                }
            }
        });

        form.setFieldValue('electrodes', nextElectrodes);
        setSelectedContacts([]);
    }

    const getNewElectrodeLocationFromForm = () => {
        if (locationForm.values.type === 'white') { return t('pages.stimulationTool.implantation.whiteMatter') + ' (' + locationForm.values.white_matter + ')'; }
        if (locationForm.values.type === 'vep') { return "vep (" + locationForm.values.vep + ")"; }
        if (locationForm.values.type === 'destrieux') { return "Destrieux (" + locationForm.values.destrieux + ")"; }
        if (locationForm.values.type === 'mni') { return "MNI (" + locationForm.values.mni_x + ',' + locationForm.values.mni_y + ',' + locationForm.values.mni_z + ")"; }
    }



    const getSelectedContactsROIValue = useCallback((): ElectrodeLocationFormValues => {
        const defaults: ElectrodeLocationFormValues = {
            type: "vep",
            vep: "",
            destrieux: "",
            white_matter: "",
            mni_x: 0,
            mni_y: 0,
            mni_z: 0
        };

        if (selectedContacts.length === 0) {
            return defaults;
        }

        // Build a lookup map for faster access
        const pointMap = new Map<string, StimulationPoint>();
        form.values.electrodes.forEach(e => {
            e.stim_points.forEach((p, i) => {
                pointMap.set(getStimPointLabel(e.label, i), p);
            });
        });

        let roi_type: string | undefined = undefined;
        let roi_vep: string | undefined = undefined;
        let roi_destrieux: string | undefined = undefined;
        let roi_wm: string | undefined = undefined;
        let roi_mni = { x: 0, y: 0, z: 0 };
        let first = true;

        selectedContacts.forEach((selectedStimPoint) => {
            const stimPoint = pointMap.get(selectedStimPoint);
            if (!stimPoint) return;

            const { type, vep, destrieux, mni, white_matter } = stimPoint.location;

            if (first) {
                roi_type = type;
                roi_vep = vep;
                roi_destrieux = destrieux;
                roi_mni = mni || { x: 0, y: 0, z: 0 };
                roi_wm = white_matter;
                first = false;
            } else {
                if (type !== roi_type) roi_type = "vep"; // Reset to default if mixed
                if (vep !== roi_vep) roi_vep = "";
                if (destrieux !== roi_destrieux) roi_destrieux = "";
                if (white_matter !== roi_wm) roi_wm = "";
                if (mni?.x !== roi_mni.x || mni?.y !== roi_mni.y || mni?.z !== roi_mni.z) {
                    roi_mni = { x: 0, y: 0, z: 0 };
                }
            }
        });

        return {
            type: roi_type || "vep",
            vep: roi_vep || "",
            destrieux: roi_destrieux || "",
            white_matter: roi_wm || "",
            mni_x: roi_mni.x,
            mni_y: roi_mni.y,
            mni_z: roi_mni.z
        };
    }, [form.values.electrodes, selectedContacts]);

    const handleDeleteElectrodeButtonClicked = (electrode_label: string) => {
        setElectrodeLabelToDelete(electrode_label);
        setShowConfirmDeleteElectrode(true);
    }

    const handleDeleteElectrode = () => {
        setShowConfirmDeleteElectrode(false);
        if (electrodeLabelToDelete === undefined) { return; }
        const electrode = form.values.electrodes.find((e) => e.label === electrodeLabelToDelete);
        setSelectedContacts(selectedContacts.filter((c) => !c.startsWith(electrode!.label)));
        setDoneContacts(doneContacts.filter((c) => !c.startsWith(electrode!.label)));
        form.removeListItem('electrodes', form.values.electrodes.findIndex((e) => e.label === electrodeLabelToDelete));
        setElectrodeLabelToDelete(undefined);
    }

    const shouldShowElectrodeConfirmModal = useMemo<boolean>(
        () => {
            return !doNotShowAgainElectrodeConfirmModal && showElectrodeConfirmModal;
        },
        [doNotShowAgainElectrodeConfirmModal, showElectrodeConfirmModal]
    );

    const handleConfirmElectrodeButtonClicked = (electrode_label: string) => {
        if (doNotShowAgainElectrodeConfirmModal) {
            confirmElectrode(electrode_label)
        }
        else {
            electrodeConfirmForm.setFieldValue('electrode_label', electrode_label);
            setShowElectrodeConfirmModal(true);
        }
    }

    const handleCancelConfirmElectrode = () => {
        setShowElectrodeConfirmModal(false);
        electrodeConfirmForm.reset();
    }

    const handleConfirmElectrode = () => {
        setShowElectrodeConfirmModal(false);
        const values = electrodeConfirmForm.values;
        confirmElectrode(values.electrode_label);
        if (!doNotShowAgainElectrodeConfirmModal) { setDoNotShowAgainElectrodeConfirmModal(values.do_not_show_again); }
    }

    const confirmElectrode = (electrode_label: string) => {
        const electrode_i = form.values.electrodes.findIndex((e) => e.label === electrode_label);
        if (electrode_i === -1) { return; }
        form.setFieldValue(`electrodes.${electrode_i}.confirmed`, true);
    }

    const getElectrodeOptions = (): Map<string, ElectrodeOption> => {
        const options = [
            { implantationType: "SEEG", diameter: 0.9, separation: 3, length: 2.3 },
            { implantationType: "SEEG", diameter: 0.9, separation: 4, length: 2.3 },
            { implantationType: "SEEG", diameter: 0.8, separation: 3.5, length: 2 },
            { implantationType: "SEEG", diameter: 0.8, separation: 3.5, length: 2 },
        ] as ElectrodeOption[];
        return new Map(options.map(opt => [opt.implantationType + '|' + opt.diameter + '|' + opt.separation + '|' + opt.length, opt]));
    }
    const ElectrodeOptions = getElectrodeOptions();

    const getSideOptions = () => {
        return [
            { label: 'L', value: 'left' },
            { label: 'R', value: 'right' }
        ];
    }

    const updateDoneContacts = useCallback(() => {
        const donePoints: string[] = [];
        form.values.electrodes.forEach((electrode) => {
            electrode.stim_points.forEach((point, point_i) => {
                if (point.location.done) {
                    donePoints.push(getStimPointLabel(electrode.label, point_i));
                }
            })
        })
        setDoneContacts(donePoints);
    }, [form.values.electrodes]);

    const selectAllContacts = () => {
        var allPointsLabel = form.values.electrodes.flatMap((electrode) => electrode.stim_points.map(point => getStimPointLabel(electrode.label, point.index)));
        setSelectedContacts(allPointsLabel);
    }

    const selectAllNotDoneContacts = () => {
        var allPointsLabel = form.values.electrodes.flatMap((electrode) => electrode.stim_points.map(point => getStimPointLabel(electrode.label, point.index)));
        setSelectedContacts(allPointsLabel.filter(point => !doneContacts.includes(point)));
    }

    const unselectAllContacts = () => {
        setSelectedContacts([]);
    }

    const locationForm = useForm<ElectrodeLocationFormValues>({
        initialValues: {
            type: "vep",
            vep: "",
            destrieux: "",
            white_matter: "",
            mni_x: 0,
            mni_y: 0,
            mni_z: 0
        },
        validate: (values: ElectrodeLocationFormValues) => ({
            type: values.type === '' ? t("pages.stimulationTool.implantation.validations.location.type") : null,
            vep: values.type !== 'vep' ? null : (values.vep === '' || values.vep === null) ? t("pages.stimulationTool.implantation.validations.location.vep") : null,
            destrieux: values.type !== 'destrieux' ? null : (values.destrieux === '' || values.destrieux === null) ? t("pages.stimulationTool.implantation.validations.location.destrieux") : null,
            mni_x: values.type !== 'mni' ? null : values.mni_x === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
            mni_y: values.type !== 'mni' ? null : values.mni_y === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
            mni_z: values.type !== 'mni' ? null : values.mni_z === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
        })
    })

    // Form change (from file open for example)
    useEffect(() => { updateDoneContacts(); }, [form.values.electrodes, updateDoneContacts])

    // Selected contact changed or data model updated => sync location form values
    // We use a stringified version of selectedContacts to avoid unnecessary triggers
    const selectedContactsKey = useMemo(() => JSON.stringify(selectedContacts), [selectedContacts]);
    useEffect(() => {
        const newValues = getSelectedContactsROIValue();
        locationForm.setValues(newValues);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedContactsKey, getSelectedContactsROIValue]);



    return (
        <Box pt={"md"} h={"100%"}>
            {/** Confirm delete electrode Modal */}
            <Modal opened={showConfirmDeleteElectrode}
                onClose={() => setShowConfirmDeleteElectrode(false)}
                title={<Title order={5}>{t('pages.stimulationTool.implantation.confirmDelete.title') + ' "' + electrodeLabelToDelete + '" ?'}</Title>}>
                <Group position="apart">
                    <Button leftIcon={<IconCircleX color="white" />} variant="filled" onClick={() => setShowConfirmDeleteElectrode(false)}>{t('pages.stimulationTool.implantation.confirmDelete.cancel_label')}</Button>
                    <Button leftIcon={<IconTrash color="white" />} variant="filled" color="red" onClick={handleDeleteElectrode}>{t('pages.stimulationTool.implantation.confirmDelete.confirm_label')}</Button>
                </Group>
            </Modal>

            {/** Confirm lock of electrode Modal */}
            <Modal opened={shouldShowElectrodeConfirmModal}
                size={"lg"}
                onClose={handleCancelConfirmElectrode}
                withCloseButton={false}
                title={<Title order={5}>{t('pages.stimulationTool.implantation.confirmElectrode.title') + ' ?'}</Title>}>
                <Stack>
                    <Alert w={"100%"}
                        icon={<IconAlertCircle size="1rem" />}
                        color="yellow"
                        title={t('pages.stimulationTool.implantation.confirmElectrode.title') + ' "' + electrodeConfirmForm.values.electrode_label + '" ?'}>
                        {t('pages.stimulationTool.implantation.confirmElectrode.description')}
                    </Alert>
                    <Group position="apart">
                        <Checkbox
                            label={t('pages.stimulationTool.implantation.confirmElectrode.do_not_show_again_label')}
                            {...electrodeConfirmForm.getInputProps('do_not_show_again')} />

                        <Group position="right">
                            <Button leftIcon={<IconCircleX color="white" />} variant="filled" color="gray"
                                onClick={handleCancelConfirmElectrode}>
                                {t('pages.stimulationTool.implantation.confirmElectrode.cancel_label')}
                            </Button>
                            <Button leftIcon={<IconCircleCheck color="white" />} variant="filled" color="green.9"
                                onClick={handleConfirmElectrode}>
                                {t('pages.stimulationTool.implantation.confirmElectrode.confirm_label')}
                            </Button>
                        </Group>
                    </Group>
                </Stack>
            </Modal>

            <Box h={"10%"}>
                <Group>
                    <Title order={3}>{t('pages.stimulationTool.implantation.electrodeConfiguration')}</Title>
                    <NativeSelect
                        label="Configuration"
                        data={[{ value: '', label: '-' }, ...ElectrodeOptions.keys()]}
                        onChange={(event) => {
                            if (ElectrodeOptions.has(event.target.value)) {
                                var option = ElectrodeOptions.get(event.target.value)!;
                                form.setFieldValue('electrode_params.type', option.implantationType);
                                form.setFieldValue('electrode_params.diameter', option.diameter);
                                form.setFieldValue('electrode_params.separation', option.separation);
                                form.setFieldValue('electrode_params.length', option.length);
                            }
                        }}
                    />
                    <Group position="apart" spacing={"sm"}>
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactDiameterLabel')}
                            precision={1}
                            required
                            {...form.getInputProps('electrode_params.diameter')}
                        />
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactSeparationLabel')}
                            precision={1}
                            required
                            {...form.getInputProps('electrode_params.separation')}
                        />
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactLengthLabel')}
                            precision={1}
                            required
                            {...form.getInputProps('electrode_params.length')}
                        />
                    </Group>
                </Group>
            </Box>

            <Box py={"md"} h={"30%"} p={'0'}>
                <Group>
                    <Button onClick={addElectrode} size="xs" leftIcon={<IconCirclePlus />}>{t("pages.stimulationTool.implantation.addElectrodeButton")}</Button>
                    <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} accept=".tsv,.txt" style={{ display: 'none' }} />
                    <Button onClick={() => openInputFileRef.current?.click()} size="xs" leftIcon={<IconFileImport />}>
                        {t("pages.stimulationTool.implantation.buttonTsvOpen")}
                    </Button>
                </Group>
                <ScrollArea w={"100%"} h={"95%"} py={"xs"} type="always" sx={{ alignItems: "center", padding: '0' }}>
                    {form.values.electrodes.map((electrode, electrode_i) => {
                        return (
                            <Flex direction={"row"} justify={"space-between"} align={"center"} wrap={"nowrap"}
                                gap={"lg"}
                                mt={'sm'}
                                key={'div_electrode_' + electrode_i}
                                w={"100%"}
                            >
                                <Group sx={{ flex: 4 }} position="left" align="center">
                                    {/** Delete button */}
                                    <ActionIcon color="red" sx={{ flex: 1 }} onClick={() => handleDeleteElectrodeButtonClicked(electrode.label)}>
                                        <IconTrash size="2rem" />
                                    </ActionIcon>
                                    {/** Electrode Label */}
                                    <TextInput
                                        sx={{ flex: 3, flexGrow: 1 }}
                                        label={t("pages.stimulationTool.implantation.electrodeLabel")}
                                        placeholder="A"
                                        required
                                        {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                    />
                                    {/** Side */}
                                    <Input.Wrapper sx={{ flex: 2 }}
                                        size="sm"
                                        label={t("pages.stimulationTool.implantation.sideLabel")}
                                        required
                                        error={form.getInputProps(`electrodes.${electrode_i}.side`).error}
                                    >
                                        <SegmentedControl
                                            data={getSideOptions()}
                                            {...form.getInputProps(`electrodes.${electrode_i}.side`)}
                                        />
                                    </Input.Wrapper>
                                    {/** Number of contacts */}
                                    <NumberInput
                                        sx={{ flex: 3, flexGrow: 1 }}
                                        disabled={electrode.confirmed}
                                        label={t("pages.stimulationTool.implantation.nbContactsLabel")}
                                        min={0}
                                        defaultValue={electrode.n_contacts}
                                        onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                    />
                                    <Button sx={{ flex: 2, flexGrow: 1 }}
                                        size="sm"
                                        color="green.9"
                                        disabled={electrode.confirmed}
                                        onClick={() => handleConfirmElectrodeButtonClicked(electrode.label)}
                                        leftIcon={<IconLockCheck size="2rem" />}>
                                        {t('pages.stimulationTool.implantation.confirmElectrode.confirm_label')}
                                    </Button>
                                </Group>

                                <Box h={"100%"} sx={{ flex: 10 }} display={"flex"}>
                                    <Chip.Group multiple value={selectedContacts} onChange={setSelectedContacts}>
                                        <SimpleGrid cols={10} w={"100%"} h={"100%"}
                                            breakpoints={[
                                                { maxWidth: '90rem', cols: 8, spacing: 'sm' },
                                                { maxWidth: '70rem', cols: 6, spacing: 'sm' },
                                                { maxWidth: '50rem', cols: 4, spacing: 'xs' },
                                                { maxWidth: '40rem', cols: 3, spacing: 'xs' },
                                                { maxWidth: '35rem', cols: 2, spacing: 'sm' },
                                            ]}>
                                            {electrode.stim_points.map((stim_point, stim_point_i) => {
                                                const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                                return (
                                                    <Chip size='sm'
                                                        h={"100%"}
                                                        value={pointId}
                                                        key={pointId}
                                                        variant={doneContacts.includes(pointId) ? 'filled' : 'light'}
                                                        color={selectedContacts?.includes(pointId) ? 'blue' : doneContacts?.includes(pointId) ? 'green' : 'gray'}
                                                        checked={doneContacts.includes(pointId)}>
                                                        {getStimPointLabel(electrode.label, stim_point_i, false, true)}
                                                    </Chip>);
                                            })}
                                        </SimpleGrid>
                                    </Chip.Group>
                                </Box>
                            </Flex>)
                    })}
                </ScrollArea>
            </Box>

            {/* Central bar */}
            <Box h={"15%"} w={"100%"} sx={{ borderColor: 'grey', borderWidth: '0.2rem 0', borderStyle: 'solid' }}>
                <CentralBar
                    form={form}
                    selectedContacts={selectedContacts}
                    t={t}
                    selectAllContacts={selectAllContacts}
                    selectAllNotDoneContacts={selectAllNotDoneContacts}
                    getNewElectrodeLocationFromForm={getNewElectrodeLocationFromForm}
                    unselectAllContacts={unselectAllContacts}
                    handleElectrodeLocationFormSubmit={handleElectrodeLocationFormSubmit}
                />
            </Box>

            {/** Location */}
            <ScrollArea w={"100%"} h={"45%"} >
                <Title order={3}>{t('pages.stimulationTool.implantation.placement')}</Title>
                <Box display={(selectedContacts.length > 0) ? 'block' : 'none'}>
                    <Stack align='flex-start' justify='flex-start'>
                        <StimulationPointLocationSelection
                            form={locationForm} />
                    </Stack>
                </Box>
            </ScrollArea>
        </Box >
    );
}

interface ElectrodeOption { implantationType: "SEEG" | "Grids", diameter: number, separation: number, length: number }

interface CentralBarProps {
    form: UseFormReturnType<StimulationFormValues>;
    selectedContacts: string[];
    t: any;
    selectAllContacts: () => void;
    selectAllNotDoneContacts: () => void;
    getNewElectrodeLocationFromForm: () => string | undefined;
    unselectAllContacts: () => void;
    handleElectrodeLocationFormSubmit: () => void;
}

const CentralBar = ({
    form,
    selectedContacts,
    t,
    selectAllContacts,
    selectAllNotDoneContacts,
    getNewElectrodeLocationFromForm,
    unselectAllContacts,
    handleElectrodeLocationFormSubmit
}: CentralBarProps) => {
    const electrode_parameters_selected = form.values.electrode_params.diameter > 0;
    const contacts_configured = form.values.electrodes.flatMap((e: ElectrodeFormValues) => e.stim_points).length > 0;
    const all_contacts_roi_configured = form.values.electrodes.flatMap((e: ElectrodeFormValues) => e.stim_points).every((sp: StimulationPoint) => sp.location.done === true);
    const contacts_selected = selectedContacts.length > 0;

    return (
        <Box h={"100%"} >
            {/** Electrode parameters are not set */}
            <Box h={"100%"} display={!electrode_parameters_selected && !contacts_selected ? "block" : "none"}>
                <Alert w={"100%"} h={"100%"}
                    icon={<IconAlertCircle size="1rem" />}
                    title={t('pages.stimulationTool.implantation.guide_params_title')}>
                    {t('pages.stimulationTool.implantation.guide_params_text')}
                </Alert>
            </Box>

            {/** No contact exists */}
            <Box h={"100%"} display={electrode_parameters_selected && !contacts_configured && !contacts_selected ? "block" : "none"}>
                <Alert w={"100%"} h={"100%"}
                    display={form.values.electrodes.flatMap((e: ElectrodeFormValues) => e.stim_points).length === 0 ? "flex" : "none"}
                    icon={<IconAlertCircle size="1rem" />}
                    title={t("pages.stimulationTool.implantation.guide_configure_electrodes_title")}>
                    {t("pages.stimulationTool.implantation.guide_configure_electrodes_text")}
                </Alert>
            </Box >

            {/** All contacts done */}
            <Box h={"100%"} display={electrode_parameters_selected && contacts_configured && all_contacts_roi_configured && !contacts_selected ? "block" : "none"}>
                <Alert w={"100%"} h={"100%"}
                    icon={<IconAlertCircle size="1rem" />}
                    title={t("pages.stimulationTool.implantation.guide_goto_stimulations_title")}>
                    {t("pages.stimulationTool.implantation.guide_goto_stimulations_text")}
                </Alert>
            </Box >

            {/** Contact exists but none selected */}
            <Box h={"100%"} w={"100%"} display={electrode_parameters_selected && contacts_configured && !all_contacts_roi_configured && !contacts_selected ? "block" : "none"}>
                <Group h={"100%"} display={"flex"} w={"100%"}>
                    <Alert
                        h={"100%"}
                        sx={{ flex: 9 }}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t("pages.stimulationTool.implantation.guide_select_contact_title")}>
                        {t("pages.stimulationTool.implantation.guide_select_contact_text")}
                    </Alert>
                    {/** Select all and selct all not done buttons */}
                    <Stack sx={{ flex: 3 }}>
                        <Button onClick={selectAllContacts}>{t("pages.stimulationTool.implantation.selectAllContactsButtonLabel")}</Button>
                        <Button onClick={selectAllNotDoneContacts}>{t("pages.stimulationTool.implantation.selectAllNotDoneContactsButtonLabel")}</Button>
                    </Stack>
                </Group>
            </Box>

            {/** Contact(s) selected */}
            <Box h={"100%"} w={"100%"} display={electrode_parameters_selected && contacts_configured && contacts_selected ? "flex" : "none"}>
                <Group position='apart' align='flex-start' h={"100%"} w={"100%"} noWrap>
                    <Stack h={"100%"} w={"80%"} spacing={0}>
                        {/** Selected contacts */}
                        <Group h={"35%"} w={"100%"} noWrap>
                            {t('pages.stimulationTool.implantation.selected_contacts') + ':'}
                            <ScrollArea type='always' h={"100%"} w={"100%"} sx={{ alignItems: "center", padding: '0' }}>
                                <Group align="center" position='left' noWrap spacing={"xs"}>
                                    {selectedContacts.map((pointId) => {
                                        return (
                                            <Badge key={pointId} size="lg" variant="filled">
                                                {getStimPointDisplayLabel(pointId)}
                                            </Badge>
                                        );
                                    })}
                                </Group>
                            </ScrollArea>
                        </Group>
                        <Alert w={"100%"}
                            h={"60%"}
                            icon={<IconAlertCircle size="1rem" />}
                            title={t('pages.stimulationTool.implantation.guide_placement_title')}>
                            {t('pages.stimulationTool.implantation.guide_placement_text')}
                        </Alert>
                    </Stack>

                    <Stack w={"20%"} h={"100%"} align="center" spacing={0}>
                        {/** Display selected location */}
                        {t('pages.stimulationTool.implantation.selected_location')}: {getNewElectrodeLocationFromForm()}
                        {/** Unselect all Buttons */}
                        <Button w={"100%"}
                            leftIcon={<IconDeselect />}
                            onClick={unselectAllContacts}
                            display={selectedContacts.length > 0 ? "block" : "none"}
                        > {t('pages.stimulationTool.implantation.deselectAllContactsButtonLabel')}
                        </Button>
                        {/** Confirm button */}
                        <Button
                            w={"100%"}
                            variant='filled'
                            color='green'
                            size="lg"
                            leftIcon={<IconCircleCheck />}
                            onClick={handleElectrodeLocationFormSubmit}
                            display={selectedContacts.length > 0 ? "block" : "none"}
                        > {t('pages.stimulationTool.implantation.saveButtonLabel')}
                        </Button>
                    </Stack>
                </Group>
            </Box>
        </Box>
    )
}

