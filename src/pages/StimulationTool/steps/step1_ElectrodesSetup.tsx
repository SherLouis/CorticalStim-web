import { ActionIcon, Box, Button, Chip, Container, Flex, Group, NumberInput, Radio, Stack, TextInput, Title } from "@mantine/core";
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

    /*TODO: Display value of done contacts*/
    return (
        <Group position='left' align="start">
            <Container sx={{ flex: 6, alignItems: "center", padding: '0' }}>
                <Title order={3}>{t('pages.stimulationTool.step1.contactConfiguration')}</Title>
                <Button onClick={addElectrode}>{t("pages.stimulationTool.step1.addElectrodeButton")}</Button>
                {form.values.electrodes.map((electrode, electrode_i) => {
                    return (
                        <Group key={electrode_i} mt="sm" align="center" position="left" w={'100%'}>
                            <ActionIcon color="red" sx={{ flex: 1 }} onClick={() => form.removeListItem('electrodes', electrode_i)}>
                                <IconTrash size="1.5rem" />
                            </ActionIcon>
                            <Flex
                                direction={{ base: 'column', lg: 'row' }}
                                gap={{ base: 'sm', lg: 'xs' }}
                                justify={{ lg: 'center' }}
                                sx={{ flex: 2 }}>

                                <TextInput
                                    size="sm"
                                    label={t("pages.stimulationTool.step1.electrodeLabel")}
                                    placeholder="A"
                                    required
                                    sx={{ flex: 6 }}
                                    {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                />
                                <NumberInput
                                    size="sm"
                                    label={t("pages.stimulationTool.step1.nbContactsLabel")}
                                    sx={{ flex: 6 }}
                                    defaultValue={electrode.contacts.length}
                                    onChange={(v) => setContactsToElectrode(electrode_i, v === "" ? 0 : v)}
                                />
                            </Flex>
                            <Box sx={{ flex: 9 }}>
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
                            </Box>
                        </Group>)
                })}
            </Container>
            <Container sx={{ flex: 6 }} >
                <Box display={(selectedContacts.length > 0) ? 'block' : 'none'}>
                    <Stack align='flex-start' justify='flex-start'>
                        <Title order={3}>{t('pages.stimulationTool.step1.placement')}</Title>
                        <ElectrodeLocationForm onSubmit={handleElectrodeLocationFormSubmit} />
                    </Stack>
                </Box>
                <Group position="right">
                    <Button onClick={onComplete}>Next</Button>
                </Group>
            </Container>
        </Group>
    );
}