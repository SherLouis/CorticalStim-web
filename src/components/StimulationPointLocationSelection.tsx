import { Box, Button, Group, Input, NumberInput, ScrollArea, SegmentedControl, Select, SimpleGrid, Stack, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

// TODO: from figure

export default function StimulationPointLocationSelection({ form }: StimulationPointLocationSelectionProps) {
    const { t } = useTranslation();

    const getRoiTypeOptions = () => {
        return [
            { label: t('pages.stimulationTool.implantation.whiteMatter'), value: "white" },
            { label: "VEP", value: "vep" },
            { label: "Destrieux", value: "destrieux" },
            { label: "MNI", value: "mni" }
        ]
    }

    const getRoiDestrieuxOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "G_and_S_frontomargin", label: "1-G_and_S_frontomargin" },
            { value: "G_and_S_occipital_inf", label: "2-G_and_S_occipital_inf" },
            { value: "G_and_S_paracentral", label: "3-G_and_S_paracentral" },
            { value: "G_and_S_subcentral", label: "4-G_and_S_subcentral" },
            { value: "G_and_S_transv_frontopol", label: "5-G_and_S_transv_frontopol" },
            { value: "G_and_S_cingul-Ant", label: "6-G_and_S_cingul-Ant" },
            { value: "G_and_S_cingul-Mid-Ant", label: "7-G_and_S_cingul-Mid-Ant" },
            { value: "G_and_S_cingul-Mid-Post", label: "8-G_and_S_cingul-Mid-Post" },
            { value: "G_cingul-Post-dorsal", label: "9-G_cingul-Post-dorsal" },
            { value: "G_cingul-Post-ventral", label: "10-G_cingul-Post-ventral" },
            { value: "G_cuneus", label: "11-G_cuneus" },
            { value: "G_front_inf-Opercular", label: "12-G_front_inf-Opercular" },
            { value: "G_front_inf-Orbital", label: "13-G_front_inf-Orbital" },
            { value: "G_front_inf-Triangul", label: "14-G_front_inf-Triangul" },
            { value: "G_front_middle", label: "15-G_front_middle" },
            { value: "G_front_sup", label: "16-G_front_sup" },
            { value: "G_Ins_lg_and_S_cent_ins", label: "17-G_Ins_lg_and_S_cent_ins" },
            { value: "G_insular_short", label: "18-G_insular_short" },
            { value: "G_occipital_middle", label: "19-G_occipital_middle" },
            { value: "G_occipital_sup", label: "20-G_occipital_sup" },
            { value: "G_oc-temp_lat-fusifor", label: "21-G_oc-temp_lat-fusifor" },
            { value: "G_oc-temp_med-Lingual", label: "22-G_oc-temp_med-Lingual" },
            { value: "G_oc-temp_med-Parahip", label: "23-G_oc-temp_med-Parahip" },
            { value: "G_orbital", label: "24-G_orbital" },
            { value: "G_pariet_inf-Angular", label: "25-G_pariet_inf-Angular" },
            { value: "G_pariet_inf-Supramar", label: "26-G_pariet_inf-Supramar" },
            { value: "G_parietal_sup", label: "27-G_parietal_sup" },
            { value: "G_postcentral", label: "28-G_postcentral" },
            { value: "G_precentral", label: "29-G_precentral" },
            { value: "G_precuneus", label: "30-G_precuneus" },
            { value: "G_rectus", label: "31-G_rectus" },
            { value: "G_subcallosal", label: "32-G_subcallosal" },
            { value: "G_T_transv", label: "33-G_temp_sup-G_T_transv" },
            { value: "G_temp_sup-Lateral", label: "34-G_temp_sup-Lateral" },
            { value: "G_temp_sup-Plan_polar", label: "35-G_temp_sup-Plan_polar" },
            { value: "G_temp_sup-Plan_tempo", label: "36-G_temp_sup-Plan_tempo" },
            { value: "G_temporal_inf", label: "37-G_temporal_inf" },
            { value: "G_temporal_middle", label: "38-G_temporal_middle" },
            { value: "Lat_Fis-ant-Horizont", label: "39-Lat_Fis-ant-Horizont" },
            { value: "Lat_Fis-ant-Vertical", label: "40-Lat_Fis-ant-Vertical" },
            { value: "Lat_Fis-post", label: "41-Lat_Fis-post" },
            { value: "Pole_occipital", label: "42-Pole_occipital" },
            { value: "Pole_temporal", label: "43-Pole_temporal" },
            { value: "S_calcarine", label: "44-S_calcarine" },
            { value: "S_central", label: "45-S_central" },
            { value: "S_cingul-Marginalis", label: "46-S_cingul-Marginalis" },
            { value: "S_circular_insula_ant", label: "47-S_circular_insula_ant" },
            { value: "S_circular_insula_inf", label: "48-S_circular_insula_inf" },
            { value: "S_circular_insula_sup", label: "49-S_circular_insula_sup" },
            { value: "S_collat_transv_ant", label: "50-S_collat_transv_ant" },
            { value: "S_collat_transv_post", label: "51-S_collat_transv_post" },
            { value: "S_front_inf", label: "52-S_front_inf" },
            { value: "S_front_middle", label: "53-S_front_middle" },
            { value: "S_front_sup", label: "54-S_front_sup" },
            { value: "S_interm_prim-Jensen", label: "55-S_interm_prim-Jensen" },
            { value: "S_intrapariet_and_P_trans", label: "56-S_intrapariet_and_P_trans" },
            { value: "S_oc_middle_and_Lunatus", label: "57-S_oc_middle_and_Lunatus" },
            { value: "S_oc_sup_and_transversal", label: "58-S_oc_sup_and_transversal" },
            { value: "S_occipital_ant", label: "59-S_occipital_ant" },
            { value: "S_oc-temp_lat", label: "60-S_oc-temp_lat" },
            { value: "S_oc-temp_med_and_Lingual", label: "61-S_oc-temp_med_and_Lingual" },
            { value: "S_orbital_lateral", label: "62-S_orbital_lateral" },
            { value: "S_orbital_med-olfact", label: "63-S_orbital_med-olfact" },
            { value: "S_orbital-H_Shaped", label: "64-S_orbital-H_Shaped" },
            { value: "S_parieto_occipital", label: "65-S_parieto_occipital" },
            { value: "S_pericallosal", label: "66-S_pericallosal" },
            { value: "S_postcentral", label: "67-S_postcentral" },
            { value: "S_precentral-inf-part", label: "68-S_precentral-inf-part" },
            { value: "S_precentral-sup-part", label: "69-S_precentral-sup-part" },
            { value: "S_suborbital", label: "70-S_suborbital" },
            { value: "S_subparietal", label: "71-S_subparietal" },
            { value: "S_temporal_inf", label: "72-S_temporal_inf" },
            { value: "S_temporal_sup", label: "73-S_temporal_sup" },
            { value: "S_temporal_transverse", label: "74-S_temporal_transverse" }
        ];
    }
    
    // TODO: group Destrieux by blocks by region
    return (
        <Box w={"100%"}>
            <Stack h={"100%"}>
                <Input.Wrapper
                    error={form.getInputProps('type').error}
                >
                    <SegmentedControl
                        fullWidth
                        data={getRoiTypeOptions()}
                        defaultValue=""
                        {...form.getInputProps('type')}
                    />
                </Input.Wrapper>
                <ScrollArea h={"45vh"}>
                    {form.getInputProps('type').value === "white" &&
                        <Title order={4}>{t('pages.stimulationTool.implantation.thisIsWhiteMatter')}</Title>
                    }
                    {form.getInputProps('type').value === "vep" &&
                        <VEPSelection form={form} />
                    }
                    {form.getInputProps('type').value === "destrieux" &&
                        <Select
                            label="Destrieux"
                            data={getRoiDestrieuxOptions()}
                            {...form.getInputProps('destrieux')}
                            clearable
                            searchable
                            dropdownPosition="bottom"
                        />
                    }
                    {form.getInputProps('type').value === "mni" &&
                        <Group position="apart">
                            <NumberInput
                                label="X"
                                precision={2}
                                {...form.getInputProps('mni_x')}
                            />
                            <NumberInput
                                label="Y"
                                precision={2}
                                {...form.getInputProps('mni_y')}
                            />
                            <NumberInput
                                label="Z"
                                precision={2}
                                {...form.getInputProps('mni_z')}
                            />
                        </Group>
                    }
                </ScrollArea>
            </Stack>
        </Box>
    )
}

interface StimulationPointLocationSelectionProps {
    form: UseFormReturnType<ElectrodeLocationFormValues>;
}

const VEPSelection = ({ form }: VEPSelectionProps) => {
    const getFrontalGyriVepOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "Pole_F_G", label: "1 - Pole_F_G" },
            { value: "Orbital_Cortex_F_G", label: "2 - Orbital_Cortex_F_G" },
            { value: "Rectus_F_G", label: "3 - Rectus_F_G" },
            { value: "Inferior_Orbitalis_F_G", label: "4 - Inferior_Orbitalis_F_G" },
            { value: "Inferior_Triangularis_F_G", label: "5 - Inferior_Triangularis_F_G" },
            { value: "Inferior_Opercularis_F_G", label: "6 - Inferior_Opercularis_F_G" },
            { value: "Middle_Rostral_F_G", label: "8 - Middle_Rostral_F_G" },
            { value: "Middle_Caudal_F_G", label: "9 - Middle_Caudal_F_G" },
            { value: "Sup_Mesial_Pre_F_G", label: "13 - Sup_Mesial_Pre_F_G" },
            { value: "Sup_Mesial_PreSMA_F_G", label: "14 - Sup_Mesial_PreSMA_F_G" },
            { value: "Sup_Mesial_SMA_F_G", label: "15 - Sup_Mesial_SMA_F_G" },
            { value: "Sup_Lateral_Pre_F_G", label: "16 - Sup_Lateral_Pre_F_G" },
            { value: "Sup_Lateral_Premotor_F_G", label: "17 - Sup_Lateral_Premotor_F_G" },
            { value: "Subcallosal_F_G", label: "18 - Subcallosal_F_G" },
            { value: "Precentral_head_face_F_G", label: "21 - Precentral_head_face_F_G" },
            { value: "Precentral_upper_limb_F_G", label: "22 - Precentral_upper_limb_F_G" },
            { value: "Paracentral_F_G", label: "25 - Paracentral_F_G" },
            { value: "Central_Operculum_F_G", label: "26 - Central_Operculum_F_G" },
            { value: "Anterior_Cingulate_F_G", label: "28 - Anterior_Cingulate_F_G" },
            { value: "Middle_Cingulate_Ant_F_G", label: "29 - Middle_Cingulate_Ant_F_G" },
            { value: "Middle_Cingulate_Post_F_G", label: "30 - Middle_Cingulate_Post_F_G" }
        ];
    }
    const getFrontalSulciVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Inferior_F_S", label: "7 - Inferior_F_S" },
            { value: "Middle_F_S", label: "10 - Middle_F_S" },
            { value: "Sup_Rostral_F_S", label: "11 - Sup_Rostral_F_S" },
            { value: "Sup_Caudal_F_S", label: "12 - Sup_Caudal_F_S" },
            { value: "Precentral_Inferior_F_S", label: "19 - Precentral_Inferior_F_S" },
            { value: "Precentral_Superior_F_S", label: "20 - Precentral_Superior_F_S" },
            { value: "Central_head_face_F_S", label: "23 - Central_head_face_F_S" },
            { value: "Central_upper_limb_F_S", label: "24 - Central_upper_limb_F_S" }
        ];
    }
    const getOccipitalGyriVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Inferior_O_G", label: "66 - Inferior_O_G" },
            { value: "Middle_O_G", label: "67 - Middle_O_G" },
            { value: "Superior_O_G", label: "68 - Superior_O_G" },
            { value: "Pole_O_G", label: "69 - Pole_O_G" },
            { value: "Lingual_O_G", label: "70 - Lingual_O_G" },
            { value: "Cuneus_O_G", label: "72 - Cuneus_O_G" }
        ];
    }
    const getOccipitalSulciVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Lingual_O_S", label: "52 - Lingual_O_S" },
            { value: "Parieto_O_S", label: "64 - Parieto_O_S" },
            { value: "Anterior_O_S", label: "65 - Anterior_O_S" },
            { value: "Calcarine_O_S", label: "71 - Calcarine_O_S" }
        ];
    }
    const getTemporalGyriVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Pole_T_G", label: "35 - Pole_T_G" },
            { value: "Superior_Pl_Polare_T_G", label: "36 - Superior_Pl_Polare_T_G" },
            { value: "Superior_Heschl_T_G", label: "37 - Superior_Heschl_T_G" },
            { value: "Superior_Pl_Temporale_T_G", label: "38 - Superior_Pl_Temporale_T_G" },
            { value: "Superior_Lateral_Ant_T_G", label: "39 - Superior_Lateral_Ant_T_G" },
            { value: "Superior_Lateral_Post_T_G", label: "40 - Superior_Lateral_Post_T_G" },
            { value: "Middle_Ant_T_G", label: "45 - Middle_Ant_T_G" },
            { value: "Middle_Post_T_G", label: "46 - Middle_Post_T_G" },
            { value: "Inferior_Ant_T_G", label: "47 - Inferior_Ant_T_G" },
            { value: "Inferior_Post_T_G", label: "48 - Inferior_Post_T_G" },
            { value: "Fusiform_T_G", label: "49 - Fusiform_T_G" },
            { value: "Parahippocampal_T_G", label: "53 - Parahippocampal_T_G" },
            { value: "Rhinal_T_G", label: "54 - Rhinal_T_G" }
        ];
    }
    const getTemporalSulciVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Superior_Ant_T_S", label: "41 - Superior_Ant_T_S" },
            { value: "Superior_Post_T_S", label: "42 - Superior_Post_T_S" },
            { value: "Inferior_Ant_T_S", label: "43 - Inferior_Ant_T_S" },
            { value: "Inferior_Post_T_S", label: "44 - Inferior_Post_T_S" },
            { value: "Occipito_T_S", label: "50 - Occipito_T_S" },
            { value: "Coleral_T_S", label: "51 - Coleral_T_S" }
        ];
    }
    const getParietalGyriVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Parietal_Operculum_P_G", label: "27 - Parietal_Operculum_P_G" },
            { value: "Posterior_Cingulate_Dorsal_P_G", label: "31 - Posterior_Cingulate_Dorsal_P_G" },
            { value: "Posterior_Cingulate_RetroSpl_P_G", label: "32 - Posterior_Cingulate_RetroSpl_P_G" },
            { value: "Postcentral_P_G", label: "55 - Postcentral_P_G" },
            { value: "Superior_P_G", label: "57 - Superior_P_G" },
            { value: "Supramarginal_Ant_P_G", label: "58 - Supramarginal_Ant_P_G" },
            { value: "Supramarginal_Post_P_G", label: "59 - Supramarginal_Post_P_G" },
            { value: "Angular_P_G", label: "60 - Angular_P_G" },
            { value: "Precuneus_P_G", label: "62 - Precuneus_P_G" }
        ];
    }
    const getParietalSulciVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Intraparietal_P_S", label: "61 - Intraparietal_P_S" },
            { value: "Postcentral_P_S", label: "56 - Postcentral_P_S" },
            { value: "Marginal_Cingulate_P_S", label: "63 - Marginal_Cingulate_P_S" }
        ];
    }
    const getInsulaVepOptions = (): { value: string; label: string }[] => {
        return [
            { value: "Insula-gyri-brevi", label: "33 - Insula-gyri-brevi" },
            { value: "Insula-gyri-longi", label: "34 - Insula-gyri-longi" }
        ];
    }

    return (
        <SimpleGrid cols={4}>
            <Stack>
                <Box>
                    <Title order={5}>{"Frontal Gyri"}</Title>
                    <Button.Group orientation='vertical'>
                        {getFrontalGyriVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
            </Stack>
            <Stack>
                <Box>
                    <Title order={5}>{"Frontal Sulci"}</Title>
                    <Button.Group orientation='vertical'>
                        {getFrontalSulciVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
                <Box>
                    <Title order={5}>{"Occipital Gyri"}</Title>
                    <Button.Group orientation='vertical'>
                        {getOccipitalGyriVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
                <Box>
                    <Title order={5}>{"Occipital Sulci"}</Title>
                    <Button.Group orientation='vertical'>
                        {getOccipitalSulciVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
            </Stack>
            <Stack>
                <Box>
                    <Title order={5}>{"Temporal Gyri"}</Title>
                    <Button.Group orientation='vertical'>
                        {getTemporalGyriVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
                <Box>
                    <Title order={5}>{"Temporal Sulci"}</Title>
                    <Button.Group orientation='vertical'>
                        {getTemporalSulciVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
            </Stack>
            <Stack>
                <Box>
                    <Title order={5}>{"Parietal Gyri"}</Title>
                    <Button.Group orientation='vertical'>
                        {getParietalGyriVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
                <Box>
                    <Title order={5}>{"Parietal Sulci"}</Title>
                    <Button.Group orientation='vertical'>
                        {getParietalSulciVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
                <Box>
                    <Title order={5}>{"Insula"}</Title>
                    <Button.Group orientation='vertical'>
                        {getInsulaVepOptions().map(option =>
                            <Button compact
                                onClick={() => form.setFieldValue('vep', option.value)}
                                variant={option.value === form.values.vep ? 'filled' : 'light'}>
                                {option.label}
                            </Button>)}
                    </Button.Group>
                </Box>
            </Stack>
        </SimpleGrid>
    );
}

interface VEPSelectionProps {
    form: UseFormReturnType<ElectrodeLocationFormValues>;
}

export interface ElectrodeLocationFormValues {
    type: string;
    vep: string;
    destrieux: string;
    mni_x: number;
    mni_y: number;
    mni_z: number;
}