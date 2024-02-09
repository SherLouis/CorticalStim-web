import { ActionIcon, Badge, Box, Button, Chip, Container, Group, Input, NativeSelect, NumberInput, ScrollArea, SegmentedControl, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";
import { useForm } from "@mantine/form";


// TODO: adjust page layout and everything else for implantation page
export default function ElectrodeSetupStep({ form }: TabProperties) {
    const { t } = useTranslation();
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [doneContacts, setDoneContacts] = useState<string[]>([]);

    const addElectrode = () => {
        form.insertListItem('electrodes', { label: nextElectrodeDefaultLabel, side: "", n_contacts: 0, stim_points: [] });
        setNextElectrodeDefaultLabel(letters.increment(nextElectrodeDefaultLabel));
    }

    const setContactsToElectrode = (electrodeIndex: number, nbContacts: number) => {
        form.setFieldValue(`electrodes.${electrodeIndex}.stim_points`, []);
        form.setFieldValue(`electrodes.${electrodeIndex}.n_contacts`, nbContacts);
        for (let i = 0; i < nbContacts - 1; i++) {
            form.insertListItem(`electrodes.${electrodeIndex}.stim_points`, { index: i, location: {}, stimulations: [] });
        }
    }

    const getStimPointLabel = (electrodeLabel: string, stim_point_index: number) => {
        return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
    }

    const handleElectrodeLocationFormSubmit = () => {
        const values = locationForm.values;
        if (selectedContacts === undefined) { return; }
        for (let selectedStimPoint of selectedContacts) {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.stim_points.forEach((stim_point, stim_point_i) => {
                        const stimId = getStimPointLabel(electrode.label, stim_point_i)
                        if (stimId === selectedStimPoint) {
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.vep`, values.vep);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.destrieux`, values.destrieux);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.mni`, values.mni);
                            form.setFieldValue(`electrodes.${electrode_i}.stim_points.${stim_point.index}.location.is_gray`, values.is_gray);
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

    const resetSelectedContacts = () => {
        if (selectedContacts === undefined) { return; }
        for (let c of selectedContacts) {
            const words = c.split('-');
            const electrode_label = words.slice(0, -1).join('-');
            const stim_point_index = words.at(-1);

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.stim_points.forEach((stim_point) => {
                        if (stim_point.index.toString() === stim_point_index) {
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${stim_point.index}.location.vep`, "");
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${stim_point.index}.location.destrieux`, "");
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${stim_point.index}.location.mni`, { x: 0, y: 0, z: 0 });
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${stim_point.index}.location.is_gray`, false);
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${stim_point.index}.location.done`, false);
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
        var roi_vep = "";
        var roi_destrieux = "";
        var roi_mni = { x: 0, y: 0, z: 0 };
        var roi_is_gray: boolean | null = null;
        selectedContacts.forEach((selectedStimPoint, selectedStimPoint_i) => {
            const electrode_label = selectedStimPoint.split('/').slice(0, -1).join('/');
            const stimPoint = form.values.electrodes.find((electrode) => electrode.label === electrode_label)?.stim_points.find((point) => getStimPointLabel(electrode_label, point.index) === selectedStimPoint);
            const vep = stimPoint?.location.vep;
            const destrieux = stimPoint?.location.destrieux;
            const mni = stimPoint?.location.mni;
            const is_gray = stimPoint?.location.is_gray;

            if (selectedStimPoint_i === 0) {
                roi_vep = vep !== undefined ? vep : roi_vep;
                roi_destrieux = destrieux !== undefined ? destrieux : roi_destrieux;
                roi_mni = mni !== undefined ? mni : roi_mni;
                roi_is_gray = is_gray !== undefined ? is_gray : null;
            }
            else {
                if ((vep === undefined && roi_vep !== "") || (vep !== undefined && roi_vep !== vep)) { roi_vep = "multiple"; }
                if ((destrieux === undefined && roi_destrieux !== "") || (destrieux !== undefined && roi_destrieux !== destrieux)) { roi_destrieux = "multiple"; }
                if ((mni === undefined && roi_mni.x !== 0) || (mni !== undefined && roi_mni.x !== 0)) { roi_mni = { x: 0, y: 0, z: 0 }; }
                if ((is_gray === undefined && roi_is_gray !== null) || (is_gray !== undefined && roi_is_gray !== is_gray)) { roi_is_gray = null; }
            }
        });
        const return_value = { vep: roi_vep, destrieux: roi_destrieux, mni: roi_mni, is_gray: roi_is_gray === null ? false : roi_is_gray };
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

    const locationForm = useForm<ElectrodeLocationFormValues>({ initialValues: getSelectedContactsROIValue() })
    useEffect(() => { locationForm.reset(); locationForm.setValues(getSelectedContactsROIValue()); }, [selectedContacts]);

    useEffect(() => { updateDoneContacts(); }, [form])

    // TODO: Make inner scrollArea work

    // TODO new layout!
    return (
        <Box mt={"md"}>
            <Box h={"5vh"}>
                <Group>
                    <Title order={3}>{t('pages.stimulationTool.implantation.electrodeConfiguration')}</Title>
                    <NativeSelect
                        label="Configuration"
                        data={[{ value: '', label: 'Pick One' }, ...ElectrodeOptions.keys()]}
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
                            label="Contact diameter (mm)"
                            precision={1}
                            {...form.getInputProps('electrode_params.diameter')}
                        />
                        <NumberInput
                            label="Contact separation (mm)"
                            precision={1}
                            {...form.getInputProps('electrode_params.separation')}
                        />
                        <NumberInput
                            label="Contact length (mm)"
                            precision={1}
                            {...form.getInputProps('electrode_params.length')}
                        />
                    </Group>
                </Group>
            </Box>

            <Box my={"md"} h={"30vh"}>
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
                                        label={"Side"} sx={{ flex: 3 }} required size="sm">
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
                                        <Group align="center" noWrap w={"70vw"} py={"sm"} spacing={"xs"} sx={{ overflowX: 'auto' }}>
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
                                        </Group>
                                    </Chip.Group>
                                </Box>
                            </Group>)
                    })}
                </ScrollArea>
            </Box>

            <Group position="center" align="start" h={"5vh"} w={"100%"}>
                <ScrollArea type="always" h={"100%"} w={"80%"} sx={{ alignItems: "center", padding: '0' }}>
                    <Group align="center" position="center" noWrap h={"100%"} w={"100%"}>
                        {selectedContacts.map((point) => {
                            return (
                                <Badge key={point} size="lg" variant="filled">{point}</Badge>
                            );
                        })}
                    </Group>
                </ScrollArea>
                <Button
                    onClick={handleElectrodeLocationFormSubmit}
                    display={selectedContacts.length > 0 ? "block" : "none"}>
                    {t("pages.stimulationTool.implantation.setLocationButtonLabel")}
                </Button>
            </Group>


            <ScrollArea w={"100%"} h={"40vh"} >
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
