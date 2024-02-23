import { Box, Chip, Grid, Group, ScrollArea, Title } from "@mantine/core";
import { TabProperties } from "./tab_properties";
import StimulationFormValues, { getStimPointLabel } from "../../../models/stimulationForm";
import { useState } from "react";

export default function StimulationsTab({ form }: TabProperties) {
    const [selectedPoint, setSelectedPoint] = useState<string>("");

    return (
        <Box mt={"md"} h={"83vh"}>
            <Grid h={"100%"} gutter={"xs"}>
                <Grid.Col span={8} h={"35%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        <ContactSelection
                            form_values={form.values}
                            selectedContact={selectedPoint}
                            selectedChanged={setSelectedPoint}
                        />
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"35%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        2
                    </Box>
                </Grid.Col>
                <Grid.Col span={8} h={"15%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        3
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"15%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        4
                    </Box>
                </Grid.Col>
                <Grid.Col span={8} h={"50%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        5
                    </Box>
                </Grid.Col>
                <Grid.Col span={4} h={"50%"}>
                    <Box h={"100%"} p={0} bg={"gray"}>
                        6
                    </Box>
                </Grid.Col>
            </Grid>
        </Box>
    )
}

const ContactSelection = ({ form_values, selectedContact, selectedChanged }: ContactSelectionProps) => {
    return (
        <ScrollArea w={"100%"} h={"100%"} sx={{ alignItems: "center", padding: '0' }}>
            {form_values.electrodes.map((electrode, electrode_i) => {
                return (
                    <Group noWrap
                        spacing='md'
                        position='left'
                        align='center'
                        mt={'sm'}
                        key={'div_electrode_' + electrode_i}
                        w={"100%"}
                    >
                        <Title order={4} w={"5%"} p={"md"}>{electrode.label}</Title>

                        <Box h={"100%"} w={"95%"}>
                            <ScrollArea w={"100%"} h={"100%"} type="always" sx={{ alignItems: "center", padding: '0' }}>
                                <Chip.Group value={selectedContact} onChange={selectedChanged}>
                                    <Group position="left" align="center" noWrap w={"100%"} py={"sm"} spacing={"xs"}>
                                        {electrode.stim_points.map((stim_point, stim_point_i) => {
                                            const pointId = getStimPointLabel(electrode.label, stim_point_i);
                                            return (
                                                <Chip size='sm'
                                                    value={pointId}
                                                    key={pointId}
                                                    color={selectedContact === pointId ? 'blue' : 'gray'}>
                                                    {pointId}
                                                </Chip>);
                                        })}
                                    </Group>
                                </Chip.Group>
                            </ScrollArea>
                        </Box>
                    </Group>)
            })}
        </ScrollArea>
    );
}

interface ContactSelectionProps {
    form_values: StimulationFormValues,
    selectedContact: string,
    selectedChanged: (newValue: string) => void
}