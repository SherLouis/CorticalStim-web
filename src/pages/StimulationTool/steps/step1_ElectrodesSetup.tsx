import { ActionIcon, Box, Button, Chip, Container, Flex, Group, NumberInput, Stack, TextInput, Title } from "@mantine/core";
import StepProperties from "./step";
import { useTranslation } from "react-i18next";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { letters } from "../../../lib/letterTools";
import ElectrodeLocationForm, { ElectrodeLocationFormValues } from "../../../components/ElectrodeLocationForm/ElectrodeLocationForm";

export default function ElectrodeSetupStep({ form, onComplete }: StepProperties) {
    const { t } = useTranslation();
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [doneContacts, setDoneContacts] = useState<string[]>([]);

    const addElectrode = () => {
        form.insertListItem('electrodes', { label: nextElectrodeDefaultLabel, contacts: [] });
        setNextElectrodeDefaultLabel(letters.increment(nextElectrodeDefaultLabel));
    }
    const setContactsToElectrode = (electrodeIndex: number, nbContacts: number) => {
        form.setFieldValue(`electrodes.${electrodeIndex}.contacts`, []);
        for (let i = 0; i < nbContacts; i++) {
            form.insertListItem(`electrodes.${electrodeIndex}.contacts`, { index: i, location: {} });
        }
    }

    const handleElectrodeLocationFormSubmit = (values: ElectrodeLocationFormValues) => {
        if (selectedContacts === undefined) { return; }
        for (let c of selectedContacts) {
            const words = c.split('-');
            const electrode_label = words.slice(0, -1).join('-');
            const contact_index = words.at(-1);

            form.values.electrodes.forEach((electrode, electrode_i) => {
                if (electrode.label === electrode_label) {
                    electrode.contacts.forEach((contact) => {
                        if (contact.index.toString() === contact_index) {
                            form.setFieldValue(`electrodes.${electrode_i}.contacts.${contact.index}.location.destrieux`, values.destieux);
                        }
                    });
                }
            });
        }

        if (values.destieux !== "") {
            const newDoneContacts = selectedContacts.filter((c) => !doneContacts.includes(c));
            setDoneContacts((prevDoneContacts) => [...prevDoneContacts, ...newDoneContacts]);
            setSelectedContacts([]);
        }
        else {
            setDoneContacts((prevDoneContacts) => prevDoneContacts.filter((c) => !selectedContacts.includes(c)));
            setSelectedContacts([]);
        }
    }

    const getSelectedContactsROIValue = (): string => {
        var roi_destrieu = "";
        selectedContacts.forEach((c, c_i) => {
            const electrode_label = c.split('-').slice(0, -1).join('-');
            const contact_index = c.split('-').at(-1);
            const destrieux = form.values.electrodes.find((electrode) => electrode.label === electrode_label)?.contacts.at(parseInt(contact_index!))?.location.destrieux;
            if (c_i === 0) { roi_destrieu = destrieux !== undefined ? destrieux : "" }
            else {
                if ((destrieux === undefined && roi_destrieu !== "") || (destrieux !== undefined && roi_destrieu !== destrieux)) { roi_destrieu = "multiple"; return; }
            }
        });
        return roi_destrieu;
    }

    const handleDeleteElectorde = (electrode_label: string) => {
        const electrode = form.values.electrodes.find((e) => e.label === electrode_label);
        setSelectedContacts(selectedContacts.filter((c) => !c.startsWith(electrode!.label)));
        setDoneContacts(doneContacts.filter((c) => !c.startsWith(electrode!.label)));
        form.removeListItem('electrodes', form.values.electrodes.findIndex((e) => e.label === electrode_label));
    }

    return (
        <Stack>
            <Flex
                direction={{ base: 'column', lg: 'row' }}
                gap={{ base: 'sm', lg: 'xs' }}
                align={'flex-start'}>
                <Container sx={{ flex: 6, alignItems: "center", padding: '0' }}>
                    <Title order={3}>{t('pages.stimulationTool.step1.contactConfiguration')}</Title>
                    <Button onClick={addElectrode}>{t("pages.stimulationTool.step1.addElectrodeButton")}</Button>
                    {form.values.electrodes.map((electrode, electrode_i) => {
                        return (
                            <>
                                <Flex
                                    direction={{ base: 'column', lg: 'row' }}
                                    gap={{ base: 'sm', lg: 'xs' }}
                                    justify={{ lg: 'center' }}
                                    mt={'sm'}>
                                    <Flex direction={'row'} align='center' justify='center' gap='sm' sx={{ flex: 4 }}>
                                        <ActionIcon color="red" sx={{ flex: 2 }} onClick={() => handleDeleteElectorde(electrode.label)}>
                                            <IconTrash size="1.5rem" />
                                        </ActionIcon>
                                        <TextInput
                                            size="sm"
                                            sx={{ flex: 6 }}
                                            label={t("pages.stimulationTool.step1.electrodeLabel")}
                                            placeholder="A"
                                            required
                                            {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                        />
                                        <NumberInput
                                            size="sm"
                                            sx={{ flex: 6 }}
                                            label={t("pages.stimulationTool.step1.nbContactsLabel")}
                                            defaultValue={electrode.contacts.length}
                                            onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                        />
                                    </Flex>
                                    <Group key={electrode_i} align="center" position="center" sx={{ flex: 8 }}>
                                        <Chip.Group multiple value={selectedContacts} onChange={setSelectedContacts}>
                                            <Group position="center">
                                                {electrode.contacts.map((contact, contact_i) => {
                                                    const contactId = `${electrode.label}-${contact.index}`;
                                                    return (
                                                        <Chip size='sm'
                                                            value={contactId}
                                                            key={contactId}
                                                            variant={doneContacts.includes(contactId) ? 'filled' : 'light'}
                                                            color={selectedContacts?.includes(contactId) ? 'blue' : doneContacts?.includes(contactId) ? 'green' : 'gray'}
                                                            checked={doneContacts.includes(contactId)}>
                                                            {contactId}
                                                        </Chip>);
                                                })}
                                            </Group>
                                        </Chip.Group>
                                    </Group>
                                </Flex>
                            </>)
                    })}
                </Container>
                <Container sx={{ flex: 6 }} >
                    <Box display={(selectedContacts.length > 0) ? 'block' : 'none'}>
                        <Stack align='flex-start' justify='flex-start'>
                            <Title order={3}>{t('pages.stimulationTool.step1.placement')}</Title>
                            <ElectrodeLocationForm destrieuxValue={getSelectedContactsROIValue()} onSubmit={handleElectrodeLocationFormSubmit} />
                        </Stack>
                    </Box>

                </Container>
            </Flex>
            <Group position="right">
                <Button onClick={onComplete}>Next</Button>
            </Group>
        </Stack>
    );
}