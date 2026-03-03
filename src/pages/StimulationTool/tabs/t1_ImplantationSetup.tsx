import { ActionIcon, Alert, Badge, Box, Button, Checkbox, Chip, Flex, Group, Input, Modal, NativeSelect, NumberInput, ScrollArea, SegmentedControl, SimpleGrid, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconAlertCircle, IconCircleCheck, IconCirclePlus, IconCircleX, IconDeselect, IconFileImport, IconLockCheck, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";
import { useForm } from "@mantine/form";
import { ElectrodeFormValues, getStimPointLabel } from "../../../core/models/stimulationForm";
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
        if (selectedContacts === undefined) { return; }
        for (let selectedStimPoint of selectedContacts) {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.stim_points.forEach((stim_point, stim_point_i) => {
                        const stimId = getStimPointLabel(electrode.label, stim_point_i)
                        if (stimId === selectedStimPoint) {
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.type`, values.type);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.vep`, values.vep);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.destrieux`, values.destrieux);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.white_matter`, values.white_matter);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.mni`, { x: values.mni_x, y: values.mni_y, z: values.mni_z });
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.done`, true);
                        }
                    });
                }
            });
        }

        const newDoneContacts = selectedContacts.filter((c) => !doneContacts.includes(c));
        setDoneContacts((prevDoneContacts) => [...prevDoneContacts, ...newDoneContacts]);
        setSelectedContacts([]);
    }

    const getNewElectrodeLocationFromForm = () => {
        if (locationForm.values.type === 'white') { return t('pages.stimulationTool.implantation.whiteMatter') + ' (' + locationForm.values.white_matter + ')'; }
        if (locationForm.values.type === 'vep') { return "vep (" + locationForm.values.vep + ")"; }
        if (locationForm.values.type === 'destrieux') { return "Destrieux (" + locationForm.values.destrieux + ")"; }
        if (locationForm.values.type === 'mni') { return "MNI (" + locationForm.values.mni_x + ',' + locationForm.values.mni_y + ',' + locationForm.values.mni_z + ")"; }
    }

    const resetSelectedContacts = () => {
        if (selectedContacts === undefined) { return; }
        for (let selectedStimPoint of selectedContacts) {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.stim_points.forEach((stim_point, stim_point_i) => {
                        const stimId = getStimPointLabel(electrode.label, stim_point_i)
                        if (stimId === selectedStimPoint) {
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.type`, "vep");
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.vep`, "");
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.destrieux`, "");
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.mni`, { x: 0, y: 0, z: 0 });
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.done`, false);
                        }
                    });
                }
            });
        }
        const newDoneContacts = doneContacts.filter((c) => !selectedContacts.includes(c));
        setDoneContacts(newDoneContacts);
        setSelectedContacts([]);
    }

    const getSelectedContactsROIValue = useCallback((): ElectrodeLocationFormValues => {
        var roi_type = "";
        var roi_vep = "";
        var roi_destrieux = "";
        var roi_wm = "";
        var roi_mni = { x: 0, y: 0, z: 0 };
        selectedContacts.forEach((selectedStimPoint, selectedStimPoint_i) => {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');
            const stimPoint = form.values.electrodes.find((electrode) => electrode.label === electrode_label)?.stim_points.find((point) => getStimPointLabel(electrode_label, point.index) === selectedStimPoint);
            const type = stimPoint?.location.type;
            const vep = stimPoint?.location.vep;
            const destrieux = stimPoint?.location.destrieux;
            const mni = stimPoint?.location.mni;
            const wm = stimPoint?.location.white_matter;

            if (selectedStimPoint_i === 0) {
                roi_vep = vep !== undefined ? vep : roi_vep;
                roi_destrieux = destrieux !== undefined ? destrieux : roi_destrieux;
                roi_mni = mni !== undefined ? mni : roi_mni;
                roi_wm = wm !== undefined ? wm : roi_wm;
                roi_type = type !== undefined ? type : roi_type;
            }
            else {
                if ((vep === undefined && roi_vep !== "") || (vep !== undefined && roi_vep !== vep)) { roi_vep = ""; }
                if ((wm === undefined && roi_wm !== "") || (wm !== undefined && roi_wm !== wm)) { roi_wm = ""; }
                if ((destrieux === undefined && roi_destrieux !== "") || (destrieux !== undefined && roi_destrieux !== destrieux)) { roi_destrieux = ""; }
                if ((mni === undefined && roi_mni.x !== 0) || (mni !== undefined && roi_mni.x !== 0)) { roi_mni = { x: 0, y: 0, z: 0 }; }
                if ((type === undefined && roi_type !== "") || (type !== undefined && roi_type !== type)) { roi_type = "vep"; }
            }
        });
        const return_value = { vep: roi_vep, destrieux: roi_destrieux, white_matter: roi_wm, mni_x: roi_mni.x, mni_y: roi_mni.y, mni_z: roi_mni.z, type: roi_type };
        return return_value;
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
        setDoneContacts([]);
        form.values.electrodes.forEach((electrode) => {
            electrode.stim_points.forEach((point, point_i) => {
                if (point.location.done) {
                    const pointId = getStimPointLabel(electrode.label, point_i);
                    setDoneContacts((prevDone) => [...prevDone, pointId]);
                }
            })
        })
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
        initialValues: getSelectedContactsROIValue(),
        validate: (values) => ({
            type: values.type === '' ? t("pages.stimulationTool.implantation.validations.location.type") : null,
            vep: values.type !== 'vep' ? null : (values.vep === '' || values.vep === null) ? t("pages.stimulationTool.implantation.validations.location.vep") : null,
            destrieux: values.type !== 'destrieux' ? null : (values.destrieux === '' || values.destrieux === null) ? t("pages.stimulationTool.implantation.validations.location.destrieux") : null,
            mni_x: values.type !== 'mni' ? null : values.mni_x === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
            mni_y: values.type !== 'mni' ? null : values.mni_y === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
            mni_z: values.type !== 'mni' ? null : values.mni_z === 0 ? t("pages.stimulationTool.implantation.validations.location.mni") : null,
        })
    })

    // Form change (from file open for example)
    useEffect(() => { updateDoneContacts(); }, [form, updateDoneContacts])
    // Selected contact changed => reset location form values
    useEffect(() => { locationForm.reset(); locationForm.setValues(getSelectedContactsROIValue()); }, [selectedContacts]);

    const CentralBar = () => {
        // TODO: Add instruction when at least 1 electrode configured and all contacts done, but not all electrodes confirmed
        const electrode_parameters_selected = form.values.electrode_params.diameter > 0;
        const contacts_configured = form.values.electrodes.flatMap(e => e.stim_points).length > 0;
        const all_contacts_roi_configured = form.values.electrodes.flatMap(e => e.stim_points).every(sp => sp.location.done === true);
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
                        display={form.values.electrodes.flatMap(e => e.stim_points).length === 0 ? "flex" : "none"}
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
                            style={{ flex: 9 }}
                            icon={<IconAlertCircle size="1rem" />}
                            title={t("pages.stimulationTool.implantation.guide_select_contact_title")}>
                            {t("pages.stimulationTool.implantation.guide_select_contact_text")}
                        </Alert>
                        {/** Select all and selct all not done buttons */}
                        <Stack style={{ flex: 3 }}>
                            <Button onClick={selectAllContacts}>{t("pages.stimulationTool.implantation.selectAllContactsButtonLabel")}</Button>
                            <Button onClick={selectAllNotDoneContacts}>{t("pages.stimulationTool.implantation.selectAllNotDoneContactsButtonLabel")}</Button>
                        </Stack>
                    </Group>
                </Box>

                {/** Contact(s) selected */}
                <Box h={"100%"} w={"100%"} display={electrode_parameters_selected && contacts_configured && contacts_selected ? "flex" : "none"}>
                    <Group justify='space-between' align='flex-start' h={"100%"} w={"100%"} wrap="nowrap">
                        <Stack h={"100%"} w={"80%"} gap={0}>
                            {/** Selected contacts */}
                            <Group h={"35%"} w={"100%"} wrap="nowrap">
                                {t('pages.stimulationTool.implantation.selected_contacts') + ':'}
                                <ScrollArea type='always' h={"100%"} w={"100%"} style={{ alignItems: "center", padding: '0' }}>
                                    <Group align="center" justify='left' wrap="nowrap" gap={"xs"}>
                                        {selectedContacts.map((point) => {
                                            return (
                                                <Badge key={point} size="lg" variant="filled">{point}</Badge>
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

                        <Stack w={"20%"} h={"100%"} align="center" gap={0}>
                            {/** Display selected location */}
                            {t('pages.stimulationTool.implantation.selected_location')}: {getNewElectrodeLocationFromForm()}
                            {/** Unselect all Buttons */}
                            <Button w={"100%"}
                                leftSection={<IconDeselect />}
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
                                leftSection={<IconCircleCheck />}
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

    return (
        <Box pt={"md"} h={"100%"}>
            {/** Confirm delete electrode Modal */}
            <Modal opened={showConfirmDeleteElectrode}
                onClose={() => setShowConfirmDeleteElectrode(false)}
                title={<Title order={5}>{t('pages.stimulationTool.implantation.confirmDelete.title') + ' "' + electrodeLabelToDelete + '" ?'}</Title>}>
                <Group justify="space-between">
                    <Button leftSection={<IconCircleX color="white" />} variant="filled" onClick={() => setShowConfirmDeleteElectrode(false)}>{t('pages.stimulationTool.implantation.confirmDelete.cancel_label')}</Button>
                    <Button leftSection={<IconTrash color="white" />} variant="filled" color="red" onClick={handleDeleteElectrode}>{t('pages.stimulationTool.implantation.confirmDelete.confirm_label')}</Button>
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
                    <Group justify="space-between">
                        <Checkbox
                            label={t('pages.stimulationTool.implantation.confirmElectrode.do_not_show_again_label')}
                            {...electrodeConfirmForm.getInputProps('do_not_show_again')} />

                        <Group justify="right">
                            <Button leftSection={<IconCircleX color="white" />} variant="filled" color="gray"
                                onClick={handleCancelConfirmElectrode}>
                                {t('pages.stimulationTool.implantation.confirmElectrode.cancel_label')}
                            </Button>
                            <Button leftSection={<IconCircleCheck color="white" />} variant="filled" color="green.9"
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
                    <Group justify="space-between" gap={"sm"}>
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactDiameterLabel')}
                            decimalScale={1}
                            required
                            {...form.getInputProps('electrode_params.diameter')}
                        />
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactSeparationLabel')}
                            decimalScale={1}
                            required
                            {...form.getInputProps('electrode_params.separation')}
                        />
                        <NumberInput
                            label={t('pages.stimulationTool.implantation.contactLengthLabel')}
                            decimalScale={1}
                            required
                            {...form.getInputProps('electrode_params.length')}
                        />
                    </Group>
                </Group>
            </Box>

            <Box py={"md"} h={"30%"} p={'0'}>
                <Group>
                    <Button onClick={addElectrode} size="xs" leftSection={<IconCirclePlus />}>{t("pages.stimulationTool.implantation.addElectrodeButton")}</Button>
                    <input type='file' id='file' onChange={handleFileChange} ref={openInputFileRef} accept=".tsv,.txt" style={{ display: 'none' }} />
                    <Button onClick={() => openInputFileRef.current?.click()} size="xs" leftSection={<IconFileImport />}>
                        {t("pages.stimulationTool.implantation.buttonTsvOpen")}
                    </Button>
                </Group>
                <ScrollArea w={"100%"} h={"95%"} py={"xs"} type="always" style={{ alignItems: "center", padding: '0' }}>
                    {form.values.electrodes.map((electrode, electrode_i) => {
                        return (
                            <Flex direction={"row"} justify={"space-between"} align={"center"} wrap={"nowrap"}
                                gap={"lg"}
                                mt={'sm'}
                                key={'div_electrode_' + electrode_i}
                                w={"100%"}
                            >
                                <Group style={{ flex: 4 }} justify="left" align="center">
                                    {/** Delete button */}
                                    <ActionIcon color="red" style={{ flex: 1 }} onClick={() => handleDeleteElectrodeButtonClicked(electrode.label)}>
                                        <IconTrash size="2rem" />
                                    </ActionIcon>
                                    {/** Electrode Label */}
                                    <TextInput
                                        style={{ flex: 3, flexGrow: 1 }}
                                        label={t("pages.stimulationTool.implantation.electrodeLabel")}
                                        placeholder="A"
                                        required
                                        {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                    />
                                    {/** Side */}
                                    <Input.Wrapper style={{ flex: 2 }}
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
                                        style={{ flex: 3, flexGrow: 1 }}
                                        disabled={electrode.confirmed}
                                        label={t("pages.stimulationTool.implantation.nbContactsLabel")}
                                        min={0}
                                        defaultValue={electrode.n_contacts}
                                        onChange={(v) => setContactsToElectrode(electrode_i, v === "" || typeof v === 'string' ? 0 : v)}
                                    />
                                    <Button style={{ flex: 2, flexGrow: 1 }}
                                        size="sm"
                                        color="green.9"
                                        disabled={electrode.confirmed}
                                        onClick={() => handleConfirmElectrodeButtonClicked(electrode.label)}
                                        leftSection={<IconLockCheck size="2rem" />}>
                                        {t('pages.stimulationTool.implantation.confirmElectrode.confirm_label')}
                                    </Button>
                                </Group>

                                <Box h={"100%"} style={{ flex: 10 }} display={"flex"}>
                                    <Chip.Group multiple value={selectedContacts} onChange={setSelectedContacts}>
                                        <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 6, lg: 8, xl: 10 }} w={"100%"} h={"100%"}
                                            spacing={{ base: 'xs', sm: 'sm' }}>
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
                                                        {getStimPointLabel(electrode.label, stim_point_i, false)}
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
            <Box h={"15%"} w={"100%"} style={{ borderColor: 'grey', borderWidth: '0.2rem 0', borderStyle: 'solid' }}>
                <CentralBar />
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
