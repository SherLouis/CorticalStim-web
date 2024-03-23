import { Box, Button, Checkbox, Group, NumberInput, Radio, Stack, Switch, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { StimulationEffectsValues, StimulationCognitiveEffectFormValues } from "../models/stimulationForm";
import ColumnButtonSelect from "./ColumnButtonSelect";
import { TFunction } from "i18next";

export default function StimulationEffectSelection({ form, cognitive_effect_last_values }: StimulationEffectSelectionProps) {
    const { t } = useTranslation();

    // TODO: preset

    const handleCognitiveEffectValueChange = (level: 'class' | 'descriptor' | 'details', newValue: string) => {
        switch (level) {
            case 'class':
                form.setFieldValue('cognitive_effect.details', "");
                form.setFieldValue('cognitive_effect.descriptor', "");
                form.setFieldValue('cognitive_effect.class', newValue);
                break;
            case 'descriptor':
                form.setFieldValue('cognitive_effect.details', "");
                form.setFieldValue('cognitive_effect.descriptor', newValue);
                break;
            case 'details':
                form.setFieldValue('cognitive_effect.details', newValue);
                break;
        }
    }

    const getEpiManifestationOptions = () => {
        return [
            { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.typical_aura'), value: "typical_aura" },
            { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.typical_crisis'), value: "typical_crisis" },
            { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.atypical_incomplete_crisis'), value: "atypical_incomplete_crisis" },
            { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.atypical_crisis'), value: "atypical_crisis" },
            { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.other'), value: "other" }
        ]
    }

    return (
        <Box w={"100%"}>
            <Group w={"100%"} h={"100%"} spacing={'sm'} align='flex-start'>
                <Stack sx={{flex:6}}>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.effect.cognitive_effect_label')}</Title>
                    <Box>
                        <Title order={5}>{t('pages.stimulationTool.stimulation.effect.last_used')}</Title>
                        <Button.Group orientation='vertical'>
                            {cognitive_effect_last_values.map((v, i) => (
                                <Button compact size="sm" key={"btn_last_effect_" + i}
                                    variant={formatSelectedCognitiveEffect(form.values.cognitive_effect) === formatSelectedCognitiveEffect(v) ? "filled" : "light"}
                                    onClick={() => { form.setFieldValue('cognitive_effect', v); }}>
                                    {formatSelectedCognitiveEffect(v)}
                                </Button>
                            ))}
                        </Button.Group>
                    </Box>
                    <Box px={'sm'}>
                        <CognitiveEffectTable cognitive_values={form.values.cognitive_effect} handleValueChange={handleCognitiveEffectValueChange} />
                    </Box>
                </Stack>
                <Stack sx={{flex:3}}>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}</Title>
                    <Box>
                        <Checkbox.Group {...form.getInputProps('epi_manifestation')}>
                            <Stack>
                                {getEpiManifestationOptions().map((option, i) => <Checkbox key={"epi_option_" + i} value={option.value} label={option.label} />)}
                            </Stack>
                        </Checkbox.Group>
                    </Box>
                </Stack>
                <Stack sx={{flex:3}}>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.effect.eeg')}</Title>
                    <Box>
                        <EEGSection form={form} t={t} />
                    </Box>
                </Stack>
            </Group>
        </Box>
    );
}

interface StimulationEffectSelectionProps {
    form: UseFormReturnType<StimulationEffectsValues>;
    cognitive_effect_last_values: StimulationCognitiveEffectFormValues[];
}

const CognitiveEffectTable = ({ cognitive_values, handleValueChange }: CognitiveEffectTableProps) => {
    const effects = [
        { level: "class", class: "Consciousness", descriptor: "", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Imp Awareness", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Imp Responsiveness", details: "" },
        { level: "class", class: "Sensory", descriptor: "", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Auditory", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Visual", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Vestibular", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Gustatory", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Olfactory", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Somatosensory", details: "" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Painful" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Non Painful" },
        { level: "descriptor", class: "Sensory", descriptor: "Body-percetion", details: "" },
        { level: "class", class: "Affective", descriptor: "", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Anger", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Anxiety", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Ecstatic", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Fear", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Guilt", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Mirth", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Mystic", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Sadness", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Sexual", details: "" },
        { level: "class", class: "Cognitive", descriptor: "", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Aphasia", details: "" },
        { level: "details", class: "Cognitive", descriptor: "Aphasia", details: "Anomia" },
        { level: "details", class: "Cognitive", descriptor: "Aphasia", details: "Spech arrest" },
        { level: "details", class: "Cognitive", descriptor: "Aphasia", details: "Receptive" },
        { level: "descriptor", class: "Cognitive", descriptor: "Alexia", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Dysmnesia", details: "" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesia", details: "Dv/Dv" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesia", details: "Reminiscence" },
        { level: "descriptor", class: "Cognitive", descriptor: "Forced thinking", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Depersonalisation", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Prosopagnosia", details: "" },
        { level: "class", class: "Motor Elementary", descriptor: "", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Tonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Clonic/Myoclonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Versive", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Gyratory", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Spasm", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Nystagmus", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Dystonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Atonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Astatic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Akinetic", details: "" },
        { level: "class", class: "Motor Complex", descriptor: "", details: "" },
        { level: "descriptor", class: "Motor Complex", descriptor: "Automatisms", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Gestual" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Grasping" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Mimic" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Oro-Alimentary" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Verbal" },
        { level: "details", class: "Motor Complex", descriptor: "Automatisms", details: "Vocal" },
        { level: "class", class: "Autonomic", descriptor: "", details: "" },
        { level: "descriptor", class: "Autonomic", descriptor: "Cardio Vascular", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Cardio Vascular", details: "Bradycardia" },
        { level: "details", class: "Autonomic", descriptor: "Cardio Vascular", details: "Tachycardia" },
        { level: "details", class: "Autonomic", descriptor: "Cardio Vascular", details: "Ictal Asystole" },
        { level: "descriptor", class: "Autonomic", descriptor: "Cutaneous", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "Flushing" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "Pallor" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "Piloerection" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "Sweating" },
        { level: "descriptor", class: "Autonomic", descriptor: "GastroIntestinal", details: "" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "Epigastric" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "Flatulence" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "Hypersalivation" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "Spitting" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "Vomiting" },
        { level: "descriptor", class: "Autonomic", descriptor: "Pupillary", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Pupillary", details: "Miosis" },
        { level: "details", class: "Autonomic", descriptor: "Pupillary", details: "Mydriasis" },
        { level: "descriptor", class: "Autonomic", descriptor: "Respiratory", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "Apnea" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "Chocking" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "Hyerventilation" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "Hypoventilation" },
        { level: "descriptor", class: "Autonomic", descriptor: "Urinary", details: "" }
    ];

    const getEffectOptions = (level: 'class' | 'descriptor' | 'details') => {
        switch (level) {
            case 'class':
                return effects.filter((effect) => effect.level === level).map((effect) => effect.class);
            case 'descriptor':
                return effects.filter((effect) => effect.level === level
                    && effect.class === cognitive_values.class).map((effect) => effect.descriptor);
            case 'details':
                return effects.filter((effect) => effect.level === level
                    && effect.class === cognitive_values.class
                    && effect.descriptor === cognitive_values.descriptor).map((effect) => effect.details);
            default:
                return [];
        }
    }

    return (
        <Table sx={{ tableLayout: 'fixed', width: "100%", border: 0 }}>
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Descriptor</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr key={"options"}>
                    <td style={{verticalAlign: 'top'}}>
                        <ColumnButtonSelect
                            data={getEffectOptions('class')}
                            currentValue={cognitive_values.class}
                            onChange={(v) => handleValueChange('class', v)}
                        />
                    </td>
                    <td style={{verticalAlign: 'top'}}>
                        <ColumnButtonSelect
                            data={getEffectOptions('descriptor')}
                            currentValue={cognitive_values.descriptor}
                            onChange={(v) => handleValueChange('descriptor', v)}
                        />
                    </td>
                    <td style={{verticalAlign: 'top'}}>
                        <ColumnButtonSelect
                            data={getEffectOptions('details')}
                            currentValue={cognitive_values.details}
                            onChange={(v) => handleValueChange('details', v)}
                        />
                    </td>
                </tr>
            </tbody>
        </Table>);
}

interface CognitiveEffectTableProps {
    cognitive_values: StimulationCognitiveEffectFormValues;
    handleValueChange: (level: 'class' | 'descriptor' | 'details', newValue: string) => void
}

const EEGSection = ({ form, t }: EEGSectionProps) => {
    const post_discharge_local_options = [
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localisation_options.local'), value: 'local' },
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localisation_options.regional'), value: 'regional' },
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localisation_options.wide'), value: 'wide' }
    ];

    const post_discharge_type = [
        { label: "DATA1", value: "data1" },
        { label: "DATA2", value: "data2" },
        { label: "DATA3", value: "data3" }
    ]

    return (
        <Stack>
            <Switch
                label={t('pages.stimulationTool.stimulation.effect.eeg_section.post_discharge_label')}
                checked={form.values.post_discharge}
                {...form.getInputProps('post_discharge')} />
            {form.values.post_discharge &&
                <Box>
                    <NumberInput
                        label={t('pages.stimulationTool.stimulation.effect.eeg_section.duration_label')}
                        formatter={(value) => `${value} sec`}
                        {...form.getInputProps('pd_duration')}
                    />
                    <Radio.Group
                        label={t('pages.stimulationTool.stimulation.effect.eeg_section.localisation_label')}
                        {...form.getInputProps('pd_local')}
                    >
                        {post_discharge_local_options.map((v, i) =>
                            <Radio value={v.value} label={v.label} key={'pd_local_option_' + i} />
                        )}
                    </Radio.Group>
                    <Radio.Group
                        label={t('pages.stimulationTool.stimulation.effect.eeg_section.type_label')}
                        {...form.getInputProps('pd_type')}
                    >
                        {post_discharge_type.map((v, i) =>
                            <Radio value={v.value} label={v.label} key={'pd_type_option_' + i} />
                        )}
                    </Radio.Group>
                </Box>
            }
            <Switch
                label={t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_label')}
                checked={form.values.crisis}
                {...form.getInputProps('crisis')} />
        </Stack>
    );
}

interface EEGSectionProps {
    form: UseFormReturnType<StimulationEffectsValues>;
    t: TFunction;
}

export const formatSelectedCognitiveEffect = (values: StimulationCognitiveEffectFormValues): string => {
    return values.class !== "" ? (values.class +
        (values.descriptor !== "" ? ('/' + values.descriptor
            + (values.details !== "" ? ('/' + values.details) : '')) : '')) : "-"
}