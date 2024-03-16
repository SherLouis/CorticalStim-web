import { ActionIcon, Badge, Box, Button, Center, Chip, Group, Input, NativeSelect, NumberInput, ScrollArea, SegmentedControl, SimpleGrid, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";
import { useForm } from "@mantine/form";
import { getStimPointLabel } from "../../../models/stimulationForm";

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
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.type`, "");
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

    return (
        <Box mt={"md"}>
            <Box h={"5vh"}>
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

            <Box my={"md"} h={"30vh"} p={'sm'}>
                <Button onClick={addElectrode} size="xs">{t("pages.stimulationTool.implantation.addElectrodeButton")}</Button>
                <ScrollArea w={"100%"} h={"95%"} type="always" sx={{ alignItems: "center", padding: '0' }}>
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
                                        defaultValue={electrode.n_contacts}
                                        onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                    />
                                </Group>

                                <Box h={"100%"} w={"75%"}>
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

            <Group position="center" align="center" h={"5vh"} w={"100%"} bg={'gray'}>
                {selectedContacts.length === 0 &&
                    <Group position="center" align="center">
                        <Button onClick={selectAllContacts}>{t("pages.stimulationTool.implantation.selectAllContactsButtonLabel")}</Button>
                        <Button onClick={selectAllNotDoneContacts}>{t("pages.stimulationTool.implantation.selectAllNotDoneContactsButtonLabel")}</Button>
                    </Group>}
                <ScrollArea type='auto' h={"100%"} w={"75%"} sx={{ alignItems: "center", padding: '0' }}>
                    <Group align="center" position="center" noWrap h={"100%"} w={"100%"}>
                        {selectedContacts.map((point) => {
                            return (
                                <Badge key={point} size="lg" variant="filled">{point}</Badge>
                            );
                        })}
                    </Group>
                </ScrollArea>
                <Center w={"10%"}>
                    {getNewElectrodeLocationFromForm()}
                </Center>
                <Button.Group w={"10%"}>
                    {selectedContacts.filter((s) => doneContacts.includes(s)).length > 0 &&
                        <Button
                            variant='light'
                            onClick={resetSelectedContacts}>
                            {t("pages.stimulationTool.implantation.clearLocationButtonLabel")}
                        </Button>
                    }
                    <Button
                        variant="filled"
                        onClick={handleElectrodeLocationFormSubmit}
                        display={selectedContacts.length > 0 ? "block" : "none"}>
                        {t("pages.stimulationTool.implantation.setLocationButtonLabel")}
                    </Button>
                </Button.Group>
            </Group>

            <ScrollArea w={"100%"} h={"39vh"} >
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
