import { ActionIcon, Box, Button, Chip, Container, Divider, Flex, Group, NumberInput, TextInput } from "@mantine/core";
import StepProperties from "./step";
import { useTranslation } from "react-i18next";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { letters } from "../../../lib/letterTools";

export default function ElectrodeSetupStep({ form, onComplete }: StepProperties) {
    const { t } = useTranslation();
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [selectedContacts, setSelectedContacts] = useState<string[]>();
    const addElectrode = () => {
        form.insertListItem('electrodes', { label: nextElectrodeDefaultLabel, contacts: [] });
        setNextElectrodeDefaultLabel(letters.increment(nextElectrodeDefaultLabel));
    }
    const setContactsToElectrode = (electrodeIndex: number, nbContacts: number) => {
        form.setFieldValue(`electrodes.${electrodeIndex}.contacts`, []);
        for (let i = 0; i < nbContacts; i++) {
            form.insertListItem(`electrodes.${electrodeIndex}.contacts`, { index: i });
        }
    }
    return (<>
        <Group align="center">
            <Container sx={{ flex: 1 }}>
                {/*TODO: Electrodes input form*/}
                <Button onClick={addElectrode}>{t("pages.stimulationTool.step1.addElectrodeButton")}</Button>
                {form.values.electrodes.map((electrode, electrode_i) => {
                    return (
                        <Group key={electrode.label} mt="xs">
                            <ActionIcon color="red" onClick={() => form.removeListItem('electrodes', electrode_i)}>
                                <IconTrash size="1rem" />
                            </ActionIcon>
                            <Flex
                                direction={{ base: 'column', lg: 'row' }}
                                gap={{ base: 'sm', lg: 'xs' }}
                                justify={{ lg: 'center' }}
                                sx={{ flex: 2 }}>
                                <TextInput
                                    size="xs"
                                    label={t("pages.stimulationTool.step1.electrodeLabel")}
                                    placeholder="A"
                                    required
                                    sx={{ flex: 6 }}
                                    {...form.getInputProps(`electrodes.${electrode_i}.label`)}
                                />
                                <NumberInput
                                    size="xs"
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
                                            return (<Chip size='xs' value={contactId}>{contactId}</Chip>);
                                        })}
                                    </Group>
                                </Chip.Group>
                            </Box>
                        </Group>)
                })}
            </Container>
            <Divider orientation="vertical" />
            <Container sx={{ flex: 1 }}>
                {/*TODO: ROI setup for each contact*/}
                {selectedContacts?.join("|")}
                <Button onClick={onComplete}>Next</Button>
            </Container>
        </Group>
    </>);
}