import { ActionIcon, Alert, Badge, Box, Button, Center, Chip, Group, Input, NativeSelect, NumberInput, ScrollArea, SegmentedControl, SimpleGrid, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconAlertCircle, IconCircleCheck, IconRestore, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";
import { useForm } from "@mantine/form";
import { getStimPointLabel } from "../../../core/models/stimulationForm";

export default function ElectrodeSetupStep({ form }: TabProperties) {
    const { t } = useTranslation();
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [doneContacts, setDoneContacts] = useState<string[]>([]);

    const addElectrode = () => {
        form.insertListItem('electrodes', { label: nextElectrodeDefaultLabel, side: "", n_contacts: 0, stim_points: [] });
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
        if (locationForm.values.type === 'gray') { return t('pages.stimulationTool.implantation.grayMatter'); }
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

    const getSelectedContactsROIValue = (): ElectrodeLocationFormValues => {
        var roi_type = "";
        var roi_vep = "";
        var roi_destrieux = "";
        var roi_mni = { x: 0, y: 0, z: 0 };
        selectedContacts.forEach((selectedStimPoint, selectedStimPoint_i) => {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');
            const stimPoint = form.values.electrodes.find((electrode) => electrode.label === electrode_label)?.stim_points.find((point) => getStimPointLabel(electrode_label, point.index) === selectedStimPoint);
            const type = stimPoint?.location.type;
            const vep = stimPoint?.location.vep;
            const destrieux = stimPoint?.location.destrieux;
            const mni = stimPoint?.location.mni;

            if (selectedStimPoint_i === 0) {
                roi_vep = vep !== undefined ? vep : roi_vep;
                roi_destrieux = destrieux !== undefined ? destrieux : roi_destrieux;
                roi_mni = mni !== undefined ? mni : roi_mni;
                roi_type = type !== undefined ? type : roi_type;
            }
            else {
                if ((vep === undefined && roi_vep !== "") || (vep !== undefined && roi_vep !== vep)) { roi_vep = ""; }
                if ((destrieux === undefined && roi_destrieux !== "") || (destrieux !== undefined && roi_destrieux !== destrieux)) { roi_destrieux = ""; }
                if ((mni === undefined && roi_mni.x !== 0) || (mni !== undefined && roi_mni.x !== 0)) { roi_mni = { x: 0, y: 0, z: 0 }; }
                if ((type === undefined && roi_type !== "") || (type !== undefined && roi_type !== type)) { roi_type = "vep"; }
            }
        });
        const return_value = { vep: roi_vep, destrieux: roi_destrieux, mni_x: roi_mni.x, mni_y: roi_mni.y, mni_z: roi_mni.z, type: roi_type };
        return return_value;
    }

    const handleDeleteElectrode = (electrode_label: string) => {
        const electrode = form.values.electrodes.find((e) => e.label === electrode_label);
        setSelectedContacts(selectedContacts.filter((c) => !c.startsWith(electrode!.label)));
        setDoneContacts(doneContacts.filter((c) => !c.startsWith(electrode!.label)));
        form.removeListItem('electrodes', form.values.electrodes.findIndex((e) => e.label === electrode_label));
    }

    const getElectrodeOptions = (): Map<string, ElectrodeOption> => {
        const options = [
            { implantationType: "SEEG", diameter: 0.9, separation: 3, lenght: 2.3 },
            { implantationType: "SEEG", diameter: 0.9, separation: 4, lenght: 2.3 },
            { implantationType: "SEEG", diameter: 0.8, separation: 3.5, lenght: 2 },
            { implantationType: "SEEG", diameter: 0.8, separation: 3.5, lenght: 2 },
        ] as ElectrodeOption[];
        return new Map(options.map(opt => [opt.implantationType + '|' + opt.diameter + '|' + opt.separation + '|' + opt.lenght, opt]));
    }
    const ElectrodeOptions = getElectrodeOptions();

    const getSideOptions = () => {
        return [
            { label: 'L', value: 'left' },
            { label: 'R', value: 'right' }
        ];
    }

    const updateDoneContacts = () => {
        form.values.electrodes.forEach((electrode) => {
            electrode.stim_points.forEach((point, point_i) => {
                if (point.location.done) {
                    const pointId = getStimPointLabel(electrode.label, point_i);
                    setDoneContacts((prevDone) => [...prevDone, pointId]);
                }
            })
        })
    }

    const selectAllContacts = () => {
        var allPointsLabel = form.values.electrodes.flatMap((electrode) => electrode.stim_points.map(point => getStimPointLabel(electrode.label, point.index)));
        setSelectedContacts(allPointsLabel);
    }

    const selectAllNotDoneContacts = () => {
        var allPointsLabel = form.values.electrodes.flatMap((electrode) => electrode.stim_points.map(point => getStimPointLabel(electrode.label, point.index)));
        setSelectedContacts(allPointsLabel.filter(point => !doneContacts.includes(point)));
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
    useEffect(() => { locationForm.reset(); locationForm.setValues(getSelectedContactsROIValue()); }, [selectedContacts]);
    useEffect(() => { updateDoneContacts(); }, [form])
    
    const CentralBar = () => {
        const electrode_parameters_selected = form.values.electrode_params.diameter > 0;
        const contacts_configured = form.values.electrodes.flatMap(e => e.stim_points).length > 0;
        const contacts_selected = selectedContacts.length > 0;
        return (
            <Box h={"100%"} >
                {/** Electrode parameters are not set */}
                <Box h={"100%"} display={!electrode_parameters_selected ? "block" : "none"}>
                    <Alert w={"100%"} h={"100%"}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t('pages.stimulationTool.implantation.guide_params_title')}>
                        {t('pages.stimulationTool.implantation.guide_params_text')}
                    </Alert>
                </Box>

                {/** No contact exists */}
                <Box h={"100%"} display={electrode_parameters_selected && !contacts_configured ? "block" : "none"}>
                    <Alert w={"100%"} h={"100%"}
                        display={form.values.electrodes.flatMap(e => e.stim_points).length === 0 ? "flex" : "none"}
                        icon={<IconAlertCircle size="1rem" />}
                        title={t("pages.stimulationTool.implantation.guide_configure_electrodes_title")}>
                        {t("pages.stimulationTool.implantation.guide_configure_electrodes_text")}
                    </Alert>
                </Box >

                {/** Contact exists but none selected */}
                <Box h={"100%"} w={"100%"} display={electrode_parameters_selected && contacts_configured && !contacts_selected ? "block" : "none"}>
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
                <Box h={"100%"} w={"100%"} display={electrode_parameters_selected && contacts_configured && contacts_selected ? "block" : "none"}>
                    <Group position='apart' align='flex-start' h={"100%"} w={"100%"}>
                        <Stack w={"80%"} h={"100%"} spacing={0}>
                            {/** Selected contacts */}
                            <Group h={"35%"} w={"100%"} noWrap>
                                {t('pages.stimulationTool.implantation.selected_contacts') + ':'}
                                <ScrollArea type='always' h={"100%"} w={"80%"} sx={{ alignItems: "center", padding: '0' }}>
                                    <Group align="center" position='left' noWrap h={"100%"} w={"100%"}>
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

                        <Stack w={"15%"} align="center">
                            {/** Display selected location */}
                            {t('pages.stimulationTool.implantation.selected_location')}: {getNewElectrodeLocationFromForm()}
                            {/** Confirm buttons */}
                            <Button
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

    // TODO: revoir layout pour que ce soit plus clair quoi faire et mieux utiliser l'espace
    // TODO: Cacher / afficher sections selon sélection ? (cacher positionnement si pas de contact sélectionné ?)
    return (
        <Box pt={"md"} h={"100%"}>
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
                                form.setFieldValue('electrode_params.length', option.lenght);
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
                <Button onClick={addElectrode} size="xs">{t("pages.stimulationTool.implantation.addElectrodeButton")}</Button>
                <ScrollArea w={"100%"} h={"95%"} py={"xs"} type="always" sx={{ alignItems: "center", padding: '0' }}>
                    {form.values.electrodes.map((electrode, electrode_i) => {
                        return (
                            <Group noWrap
                                spacing='md'
                                position='center'
                                align='center'
                                mt={'sm'}
                                key={'div_electrode_' + electrode_i}
                                w={"100%"}
                            >
                                <Group w={"25%"} position="left" align="center">
                                    <ActionIcon color="red" sx={{ flex: 1 }} onClick={() => handleDeleteElectrode(electrode.label)}>
                                        <IconTrash size="1.5rem" />
                                    </ActionIcon>
                                    <TextInput
                                        sx={{ flex: 4 }}
                                        size="sm"
                                        label={t("pages.stimulationTool.implantation.electrodeLabel")}
                                        placeholder="A"
                                        required
                                        {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                    />
                                    <Input.Wrapper
                                        label={t("pages.stimulationTool.implantation.sideLabel")} sx={{ flex: 3 }} size="sm"
                                        required
                                        error={form.getInputProps(`electrodes.${electrode_i}.side`).error}
                                    >
                                        <SegmentedControl
                                            data={getSideOptions()}
                                            {...form.getInputProps(`electrodes.${electrode_i}.side`)}
                                        />
                                    </Input.Wrapper>
                                    <NumberInput
                                        sx={{ flex: 4 }}
                                        size="sm"
                                        label={t("pages.stimulationTool.implantation.nbContactsLabel")}
                                        min={0}
                                        defaultValue={electrode.n_contacts}
                                        onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                    />
                                </Group>

                                <Box mih={"100%"} w={"75%"}>
                                    <Chip.Group multiple value={selectedContacts} onChange={setSelectedContacts}>
                                        <SimpleGrid cols={10}>
                                            {electrode.stim_points.map((stim_point, stim_point_i) => {
                                                const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                                return (
                                                    <Chip size='sm'
                                                        value={pointId}
                                                        key={pointId}
                                                        variant={doneContacts.includes(pointId) ? 'filled' : 'light'}
                                                        color={selectedContacts?.includes(pointId) ? 'blue' : doneContacts?.includes(pointId) ? 'green' : 'gray'}
                                                        checked={doneContacts.includes(pointId)}>
                                                        {pointId}
                                                    </Chip>);
                                            })}
                                        </SimpleGrid>
                                    </Chip.Group>
                                </Box>
                            </Group>)
                    })}
                </ScrollArea>
            </Box>

            {/* Central bar */}
            <Box h={"15%"} w={"100%"} sx={{ borderColor: 'grey', borderWidth: '0.2rem 0', borderStyle: 'solid' }}>
                <CentralBar />
            </Box>

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

interface ElectrodeOption { implantationType: "SEEG" | "Grids", diameter: number, separation: number, lenght: number }
