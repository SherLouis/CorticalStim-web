import { Button, Container, Group, NativeSelect, Radio, Table } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ColumnButtonSelect from "../ColumnButtonSelect";

export default function ElectrodeLocationForm({ onSubmit, onReset, formInitialValues }: ElectrodeLocationFormProps) {
    const { t } = useTranslation();
    const form = useForm<ElectrodeLocationFormValues>({ initialValues: formInitialValues })
    const getSideOptions = (): { value: string; label: string; }[] => {
        return [{ value: "left", label: "Left" }, { value: "right", label: "Right" }];
    }
    const getRoiDestrieuxOptions = (): { value: string; label: string; }[] => {
        return [
            { value: "", label: "-" },
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
    const getRoiOptions = (level: 'lobe' | 'gyrus' | 'region') => {
        const rois: { level: string, lobe: string, gyrus?: string, region?: string }[] = [{ level: 'lobe', lobe: 'frontal' }];
        switch (level) {
            case 'lobe':
                return rois.filter((roi) => roi.level === level).map((roi) => roi.lobe);
            case 'gyrus':
                return rois.filter((roi) => roi.level === level
                    && roi.lobe === form.getInputProps('lobe').value).map((roi) => roi.gyrus!);
            case 'region':
                return rois.filter((roi) => roi.level === level
                    && roi.lobe === form.getInputProps('lobe').value
                    && roi.gyrus === form.getInputProps('gyrus').value).map((roi) => roi.region!);
            default:
                return [];
        }
    }
    const handleSubmit = () => {
        onSubmit(form.values);
    }
    useEffect(() => { form.reset(); form.setValues(formInitialValues); }, [formInitialValues]);
    return (
        <Container>
            <Radio.Group
                label="Side"
                {...form.getInputProps('side')}
            >
                <Group mt="xs">
                    {getSideOptions().map((side_i) => {
                        return <Radio value={side_i.value} label={side_i.label} />
                    })}
                </Group>
            </Radio.Group>
            <NativeSelect
                label="Destrieux"
                data={getRoiDestrieuxOptions()} {...form.getInputProps('destrieux')}
            />
            <Table sx={{ tableLayout: 'fixed', width: "100%", border: 0 }}>
                <thead>
                    <tr>
                        <th>Lobe</th>
                        <th>Gyrus</th>
                        <th>Region</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key={"options"}>
                        <td>
                            <ColumnButtonSelect
                                data={getRoiOptions('lobe')}
                                onChange={(v) => {
                                    form.setFieldValue('gyrus', '');
                                    form.setFieldValue('sub', '');
                                    form.setFieldValue('precision', '');
                                    form.getInputProps('lobe').onChange(v)
                                }}
                                form={form} form_path='lobe'
                            />
                        </td>
                        <td>
                            <ColumnButtonSelect
                                data={getRoiOptions('gyrus')}
                                form={form} form_path="gyrus"
                                onChange={(v) => {
                                    form.setFieldValue('sub', '');
                                    form.setFieldValue('precision', '');
                                    form.getInputProps('gyrus').onChange(v)
                                }}
                            />
                        </td>
                        <td>
                            <ColumnButtonSelect
                                data={getRoiOptions('region')}
                                form={form} form_path="region"
                                onChange={(v) => {
                                    form.setFieldValue('precision', '');
                                    form.getInputProps('region').onChange(v)
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>

            <Group>
                <Button type='submit' variant="filled" onClick={() => handleSubmit()}>{t('common.okButtonLabel')}</Button>
                <Button type='reset' variant="light" color="red" onClick={() => onReset()}>{t('common.resetButtonLabel')}</Button>
            </Group>
        </Container>
    )
}

interface ElectrodeLocationFormProps {
    formInitialValues: ElectrodeLocationFormValues;
    onSubmit: (values: ElectrodeLocationFormValues) => void;
    onReset: () => void;
}

export interface ElectrodeLocationFormValues {
    side: string;
    lobe: string;
    gyrus: string;
    region: string;
    destrieux: string;
}