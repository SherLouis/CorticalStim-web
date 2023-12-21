import { Button, Container, Radio } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";

export default function ElectrodeLocationForm({onSubmit}: ElectrodeLocationFormProps) {
    const form = useForm<ElectrodeLocationFormValues>({initialValues:{destieux:""}})
    const { t } = useTranslation();
    const getRoiDestrieuxOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "", label: "None" },
            { value: "1", label: "G_and_S_frontomargin" },
            { value: "2", label: "G_and_S_occipital_inf" },
            { value: "3", label: "G_and_S_paracentral" },
            { value: "4", label: "G_and_S_subcentral" },
            { value: "5", label: "G_and_S_transv_frontopol" },
            { value: "6", label: "G_and_S_cingul-Ant" },
            { value: "7", label: "G_and_S_cingul-Mid-Ant" },
            { value: "8", label: "G_and_S_cingul-Mid-Post" },
            { value: "9", label: "G_cingul-Post-dorsal" },
            { value: "10", label: "G_cingul-Post-ventral" },
            { value: "11", label: "G_cuneus" },
            { value: "12", label: "G_front_inf-Opercular" },
            { value: "13", label: "G_front_inf-Orbital" },
            { value: "14", label: "G_front_inf-Triangul" },
            { value: "15", label: "G_front_middle" },
            { value: "16", label: "G_front_sup" },
            { value: "17", label: "G_Ins_lg_and_S_cent_ins" },
            { value: "18", label: "G_insular_short" },
            { value: "19", label: "G_occipital_middle" },
            { value: "20", label: "G_occipital_sup" },
            { value: "21", label: "G_oc-temp_lat-fusifor" },
            { value: "22", label: "G_oc-temp_med-Lingual" },
            { value: "23", label: "G_oc-temp_med-Parahip" },
            { value: "24", label: "G_orbital" },
            { value: "25", label: "G_pariet_inf-Angular" },
            { value: "26", label: "G_pariet_inf-Supramar" },
            { value: "27", label: "G_parietal_sup" },
            { value: "28", label: "G_postcentral" },
            { value: "29", label: "G_precentral" },
            { value: "30", label: "G_precuneus" },
            { value: "31", label: "G_rectus" },
            { value: "32", label: "G_subcallosal" },
            { value: "33", label: "G_temp_sup-G_T_transv" },
            { value: "34", label: "G_temp_sup-Lateral" },
            { value: "35", label: "G_temp_sup-Plan_polar" },
            { value: "36", label: "G_temp_sup-Plan_tempo" },
            { value: "37", label: "G_temporal_inf" },
            { value: "38", label: "G_temporal_middle" },
            { value: "39", label: "Lat_Fis-ant-Horizont" },
            { value: "40", label: "Lat_Fis-ant-Vertical" },
            { value: "41", label: "Lat_Fis-post" },
            { value: "42", label: "Pole_occipital" },
            { value: "43", label: "Pole_temporal" },
            { value: "44", label: "S_calcarine" },
            { value: "45", label: "S_central" },
            { value: "46", label: "S_cingul-Marginalis" },
            { value: "47", label: "S_circular_insula_ant" },
            { value: "48", label: "S_circular_insula_inf" },
            { value: "49", label: "S_circular_insula_sup" },
            { value: "50", label: "S_collat_transv_ant" },
            { value: "51", label: "S_collat_transv_post" },
            { value: "52", label: "S_front_inf" },
            { value: "53", label: "S_front_middle" },
            { value: "54", label: "S_front_sup" },
            { value: "55", label: "S_interm_prim-Jensen" },
            { value: "56", label: "S_intrapariet_and_P_trans" },
            { value: "57", label: "S_oc_middle_and_Lunatus" },
            { value: "58", label: "S_oc_sup_and_transversal" },
            { value: "59", label: "S_occipital_ant" },
            { value: "60", label: "S_oc-temp_lat" },
            { value: "61", label: "S_oc-temp_med_and_Lingual" },
            { value: "62", label: "S_orbital_lateral" },
            { value: "63", label: "S_orbital_med-olfact" },
            { value: "64", label: "S_orbital-H_Shaped" },
            { value: "65", label: "S_parieto_occipital" },
            { value: "66", label: "S_pericallosal" },
            { value: "67", label: "S_postcentral" },
            { value: "68", label: "S_precentral-inf-part" },
            { value: "69", label: "S_precentral-sup-part" },
            { value: "70", label: "S_suborbital" },
            { value: "71", label: "S_subparietal" },
            { value: "72", label: "S_temporal_inf" },
            { value: "73", label: "S_temporal_sup" },
            { value: "74", label: "S_temporal_transverse" }
        ];
    }
    // TODO: find a better way to select Destrieux (more compact, no spill over)
    return (
        <Container m={'sm'}>
            <Radio.Group
                label={t('pages.stimulationTool.step1.destrieuxRegionLabel')}
                {...form.getInputProps('destieux')}
            >
                <Container sx={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(25,1fr)', gap: '10px' }}>
                    {getRoiDestrieuxOptions().map((roi_destrieux, i) =>
                        <Radio size='xs'
                            value={roi_destrieux.value}
                            label={roi_destrieux.value + " - " + roi_destrieux.label} key={i}
                        />)}
                </Container>
            </Radio.Group>
            <Button type='submit' onClick={()=>onSubmit(form.values)}>{t('common.okButtonLabel')}</Button>
        </Container>
    )
}

interface ElectrodeLocationFormProps {
    onSubmit: (values:ElectrodeLocationFormValues) => void;
}

export interface ElectrodeLocationFormValues {
    destieux: string;
}