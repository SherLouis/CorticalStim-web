import { ActionIcon, Box, Button, Chip, Container, Flex, Group, NumberInput, ScrollArea, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { letters } from "../../../lib/letterTools";
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from "../../../components/StimulationPointLocationSelection";
import { TabProperties } from "./tab_properties";


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

    const handleElectrodeLocationFormSubmit = (values: ElectrodeLocationFormValues) => {
        if (selectedContacts === undefined) { return; }
        for (let c of selectedContacts) {
            const words = c.split('-');
            const electrode_label = words.slice(0, -1).join('-');
            const stim_point_index = words.at(-1);

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.stim_points.forEach((stim_point) => {
                        if (stim_point.index.toString() === stim_point_index) {
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
        selectedContacts.forEach((c, c_i) => {
            const electrode_label = c.split('-').slice(0, -1).join('-');
            const stim_point_index = c.split('-').at(-1);
            const contact = form.values.electrodes.find((electrode) => electrode.label === electrode_label)?.stim_points.at(parseInt(stim_point_index!));
            const vep = contact?.location.vep;
            const destrieux = contact?.location.destrieux;
            const mni = contact?.location.mni;
            const is_gray = contact?.location.is_gray;

            if (c_i === 0) {
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
        console.log(return_value);
        return return_value;
    }

    const handleDeleteElectorde = (electrode_label: string) => {
        const electrode = form.values.electrodes.find((e) => e.label === electrode_label);
        setSelectedContacts(selectedContacts.filter((c) => !c.startsWith(electrode!.label)));
        setDoneContacts(doneContacts.filter((c) => !c.startsWith(electrode!.label)));
        form.removeListItem('electrodes', form.values.electrodes.findIndex((e) => e.label === electrode_label));
    }

    // TODO: useEffect to update done contacts on file open (form changes)

    // TODO new layout!
    return (
        <Box>
            <ScrollArea w={"100%"} h={"35vh"} sx={{ flex: 6, alignItems: "center", padding: '0' }}>
                <Button onClick={addElectrode}>{t("pages.stimulationTool.implantation.addElectrodeButton")}</Button>
                {form.values.electrodes.map((electrode, electrode_i) => {
                    return (
                        <Flex
                            direction={{ base: 'column', lg: 'row' }}
                            gap={{ base: 'sm', lg: 'xs' }}
                            justify={{ lg: 'center' }}
                            mt={'sm'}
                            key={'div_electrode_' + electrode_i}
                        >
                            <Flex direction={'row'} align='center' justify='center' gap='sm' sx={{ flex: 4 }}>
                                <ActionIcon color="red" sx={{ flex: 2 }} onClick={() => handleDeleteElectorde(electrode.label)}>
                                    <IconTrash size="1.5rem" />
                                </ActionIcon>
                                <TextInput
                                    size="sm"
                                    sx={{ flex: 6 }}
                                    label={t("pages.stimulationTool.implantation.electrodeLabel")}
                                    placeholder="A"
                                    required
                                    {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                />
                                <NumberInput
                                    size="sm"
                                    sx={{ flex: 6 }}
                                    label={t("pages.stimulationTool.implantation.nbContactsLabel")}
                                    defaultValue={electrode.n_contacts}
                                    onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                />
                            </Flex>
                            <Group key={electrode_i} align="center" position="center" sx={{ flex: 8 }}>
                                <Chip.Group multiple value={selectedContacts} onChange={setSelectedContacts}>
                                    <Group position="center">
                                        {electrode.stim_points.map((stim_point, stim_point_i) => {
                                            const pointId = `${electrode.label}-${stim_point.index}`;
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
                            </Group>
                        </Flex>)
                })}
            </ScrollArea>

            <Container w={"100%"} h={"10vh"} >
            </Container>

            <ScrollArea w={"100%"} h={"35vh"} >
                <Title order={3}>{t('pages.stimulationTool.implantation.placement')}</Title>
                <Box display={(selectedContacts.length > 0) ? 'block' : 'none'}>
                    <Stack align='flex-start' justify='flex-start'>
                        <StimulationPointLocationSelection
                            formInitialValues={getSelectedContactsROIValue()}
                            onSubmit={handleElectrodeLocationFormSubmit}
                            onReset={resetSelectedContacts} />
                    </Stack>
                </Box>
            </ScrollArea>
        </Box>
    );
}