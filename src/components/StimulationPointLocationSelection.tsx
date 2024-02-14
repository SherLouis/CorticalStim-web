import { Box, Group, NumberInput, SegmentedControl, Select, Stack } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";


// TODO: VEP, Destrieux, MNI
// TODO: from figure

export default function StimulationPointLocationSelection({ form }: StimulationPointLocationSelectionProps) {
    const { t } = useTranslation();

    const getRoiTypeOptions = () => {
        return [
            { label: t('pages.stimulationTool.implantation.grayMatter'), value: "gray" },
            { label: "VEP", value: "vep" },
            { label: "Destrieux", value: "destrieux" },
            { label: "MNI", value: "mni" }
        ]
    }

    const getRoiVepOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "1", label: "1-Pole_F_G" },
            { value: "2", label: "2-Orbital_Cortex_F_G" },
            { value: "3", label: "3-Rectus_F_G" },
            { value: "4", label: "4-Inferior_Orbitalis_F_G" },
            { value: "5", label: "5-Inferior_Triangularis_F_G" },
            { value: "6", label: "6-Inferior_Opercularis_F_G" },
            { value: "7", label: "7-Inferior_F_S" },
            { value: "8", label: "8-Middle_Rostral_F_G" },
            { value: "9", label: "9-Middle_Caudal_F_G" },
            { value: "10", label: "10-Middle_F_S" },
            { value: "11", label: "11-Sup_Rostral_F_S" },
            { value: "12", label: "12-Sup_Caudal_F_S" },
            { value: "13", label: "13-Sup_Mesial_Pre_F_G" },
            { value: "14", label: "14-Sup_Mesial_PreSMA_F_G" },
            { value: "15", label: "15-Sup_Mesial_SMA_F_G" },
            { value: "16", label: "16-Sup_Lateral_Pre_F_G" },
            { value: "17", label: "17-Sup_Lateral_Premotor_F_G" },
            { value: "18", label: "18-Subcallosal_F_G" },
            { value: "19", label: "19-Precentral_Inferior_F_S" },
            { value: "20", label: "20-Precentral_Superior_F_S" },
            { value: "21", label: "21-Precentral_head_face _F_G" },
            { value: "22", label: "22-Precentral_upper_limb_F_G" },
            { value: "23", label: "23-Central_head_face_F_S" },
            { value: "24", label: "24-Central_upper_limb_F_S" },
            { value: "25", label: "25-Paracentral_F_G" },
            { value: "26", label: "26-Central_Operculum_F_G" },
            { value: "27", label: "27-Parietal_Operculum_P_G" },
            { value: "28", label: "28-Anterior_Cingulate_F_G" },
            { value: "29", label: "29-Middle_Cingulate_Ant_F_G" },
            { value: "30", label: "30-Middle_Cingulate_Post_F_G" },
            { value: "31", label: "31-Posterior_Cingulate_Dorsal_P_G" },
            { value: "32", label: "32-Posterior_Cingulate_RetroSpl_P_G" },
            { value: "33", label: "33-Insula-gyri-brevi" },
            { value: "34", label: "34-Insula-gyri-longi" },
            { value: "35", label: "35-Pole_T_G" },
            { value: "36", label: "36-Superior_Pl_Polare_T_G" },
            { value: "37", label: "37-Superior_Heschl_T_G" },
            { value: "38", label: "38-Superior_Pl_Temporale_T_G" },
            { value: "39", label: "39-Superior_Lateral_Ant_T_G" },
            { value: "40", label: "40-Superior_Lateral_Post_T_G" },
            { value: "41", label: "41-Superior_Ant_T_S" },
            { value: "42", label: "42-Superior_Post_T_S" },
            { value: "43", label: "43-Inferior_Ant_T_S" },
            { value: "44", label: "44-Inferior_Post_T_S" },
            { value: "45", label: "45-Middle_Ant_T_G" },
            { value: "46", label: "46-Middle_Post_T_G" },
            { value: "47", label: "47-Inferior_Ant_T_G" },
            { value: "48", label: "48-Inferior_Post_T_G" },
            { value: "49", label: "49-Fusiform_T_G" },
            { value: "50", label: "50-Occipito_T_S" },
            { value: "51", label: "51-Coleral_T_S" },
            { value: "52", label: "52-Lingual_O_S" },
            { value: "53", label: "53-Parahippocampal_T_G" },
            { value: "54", label: "54-Rhinal_T_G" },
            { value: "55", label: "55-Postcentral_P_G" },
            { value: "56", label: "56-Postcentral_P_S" },
            { value: "57", label: "57-Superior_P_G" },
            { value: "58", label: "58-Supramarginal_Ant_P_G" },
            { value: "59", label: "59-Supramarginal_Post_P_G" },
            { value: "60", label: "60-Angular_P_G" },
            { value: "61", label: "61-Intraparietal_P_S" },
            { value: "62", label: "62-Precuneus_P_G" },
            { value: "63", label: "63-Marginal_Cingulate_P_S" },
            { value: "64", label: "64-Parieto_O_S" },
            { value: "65", label: "65-Anterior_O_S" },
            { value: "66", label: "66-Inferior_O_G" },
            { value: "67", label: "67-Middle_O_G" },
            { value: "68", label: "68-Superior_O_G" },
            { value: "69", label: "69-Pole_O_G" },
            { value: "70", label: "70-Lingual_O_G" },
            { value: "71", label: "71-Calcarine_O_S" },
            { value: "72", label: "72-Cuneus_O_G" },
        ];
    }

    const getRoiDestrieuxOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "1", label: "1-G_and_S_frontomargin" },
            { value: "2", label: "2-G_and_S_occipital_inf" },
            { value: "3", label: "3-G_and_S_paracentral" },
            { value: "4", label: "4-G_and_S_subcentral" },
            { value: "5", label: "5-G_and_S_transv_frontopol" },
            { value: "6", label: "6-G_and_S_cingul-Ant" },
            { value: "7", label: "7-G_and_S_cingul-Mid-Ant" },
            { value: "8", label: "8-G_and_S_cingul-Mid-Post" },
            { value: "9", label: "9-G_cingul-Post-dorsal" },
            { value: "10", label: "10-G_cingul-Post-ventral" },
            { value: "11", label: "11-G_cuneus" },
            { value: "12", label: "12-G_front_inf-Opercular" },
            { value: "13", label: "13-G_front_inf-Orbital" },
            { value: "14", label: "14-G_front_inf-Triangul" },
            { value: "15", label: "15-G_front_middle" },
            { value: "16", label: "16-G_front_sup" },
            { value: "17", label: "17-G_Ins_lg_and_S_cent_ins" },
            { value: "18", label: "18-G_insular_short" },
            { value: "19", label: "19-G_occipital_middle" },
            { value: "20", label: "20-G_occipital_sup" },
            { value: "21", label: "21-G_oc-temp_lat-fusifor" },
            { value: "22", label: "22-G_oc-temp_med-Lingual" },
            { value: "23", label: "23-G_oc-temp_med-Parahip" },
            { value: "24", label: "24-G_orbital" },
            { value: "25", label: "25-G_pariet_inf-Angular" },
            { value: "26", label: "26-G_pariet_inf-Supramar" },
            { value: "27", label: "27-G_parietal_sup" },
            { value: "28", label: "28-G_postcentral" },
            { value: "29", label: "29-G_precentral" },
            { value: "30", label: "30-G_precuneus" },
            { value: "31", label: "31-G_rectus" },
            { value: "32", label: "32-G_subcallosal" },
            { value: "33", label: "33-G_temp_sup-G_T_transv" },
            { value: "34", label: "34-G_temp_sup-Lateral" },
            { value: "35", label: "35-G_temp_sup-Plan_polar" },
            { value: "36", label: "36-G_temp_sup-Plan_tempo" },
            { value: "37", label: "37-G_temporal_inf" },
            { value: "38", label: "38-G_temporal_middle" },
            { value: "39", label: "39-Lat_Fis-ant-Horizont" },
            { value: "40", label: "40-Lat_Fis-ant-Vertical" },
            { value: "41", label: "41-Lat_Fis-post" },
            { value: "42", label: "42-Pole_occipital" },
            { value: "43", label: "43-Pole_temporal" },
            { value: "44", label: "44-S_calcarine" },
            { value: "45", label: "45-S_central" },
            { value: "46", label: "46-S_cingul-Marginalis" },
            { value: "47", label: "47-S_circular_insula_ant" },
            { value: "48", label: "48-S_circular_insula_inf" },
            { value: "49", label: "49-S_circular_insula_sup" },
            { value: "50", label: "50-S_collat_transv_ant" },
            { value: "51", label: "51-S_collat_transv_post" },
            { value: "52", label: "52-S_front_inf" },
            { value: "53", label: "53-S_front_middle" },
            { value: "54", label: "54-S_front_sup" },
            { value: "55", label: "55-S_interm_prim-Jensen" },
            { value: "56", label: "56-S_intrapariet_and_P_trans" },
            { value: "57", label: "57-S_oc_middle_and_Lunatus" },
            { value: "58", label: "58-S_oc_sup_and_transversal" },
            { value: "59", label: "59-S_occipital_ant" },
            { value: "60", label: "60-S_oc-temp_lat" },
            { value: "61", label: "61-S_oc-temp_med_and_Lingual" },
            { value: "62", label: "62-S_orbital_lateral" },
            { value: "63", label: "63-S_orbital_med-olfact" },
            { value: "64", label: "64-S_orbital-H_Shaped" },
            { value: "65", label: "65-S_parieto_occipital" },
            { value: "66", label: "66-S_pericallosal" },
            { value: "67", label: "67-S_postcentral" },
            { value: "68", label: "68-S_precentral-inf-part" },
            { value: "69", label: "69-S_precentral-sup-part" },
            { value: "70", label: "70-S_suborbital" },
            { value: "71", label: "71-S_subparietal" },
            { value: "72", label: "72-S_temporal_inf" },
            { value: "73", label: "73-S_temporal_sup" },
            { value: "74", label: "74-S_temporal_transverse" }
        ];
    }

    return (
        <Box w={"100%"}>
            <Stack>
                <SegmentedControl
                    data={getRoiTypeOptions()}
                    {...form.getInputProps('type')}
                />
                {form.getInputProps('type').value === "vep" &&
                    <Select
                        label="VEP"
                        data={getRoiVepOptions()} {...form.getInputProps('vep')}
                        clearable
                        searchable
                        dropdownPosition="bottom"
                    />
                }
                {form.getInputProps('type').value === "destrieux" &&
                    <Select
                        label="Destrieux"
                        data={getRoiDestrieuxOptions()} {...form.getInputProps('destrieux')}
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
                            {...form.getInputProps('mni.x')}
                        />
                        <NumberInput
                            label="Y"
                            precision={2}
                            {...form.getInputProps('mni.y')}
                        />
                        <NumberInput
                            label="Z"
                            precision={2}
                            {...form.getInputProps('mni.z')}
                        />
                    </Group>
                }
            </Stack>
        </Box>
    )
}

interface StimulationPointLocationSelectionProps {
    form: UseFormReturnType<ElectrodeLocationFormValues>;
}

export interface ElectrodeLocationFormValues {
    type: string;
    vep: string;
    destrieux: string;
    mni: { x: number; y: number; z: number };
}