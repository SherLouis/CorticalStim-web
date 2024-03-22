import { Box, Button, Checkbox, Group, NumberInput, Radio, Stack, Switch, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { StimulationEffectsValues, StimulationCognitiveEffectFormValues } from "../models/stimulationForm";
import ColumnButtonSelect from "./ColumnButtonSelect";
import { TFunction } from "i18next";

export default function StimulationEffectSelection({ form, cognitive_effect_last_values }: StimulationEffectSelectionProps) {
    const { t } = useTranslation();

    // TODO: preset

    const handleCognitiveEffectValueChange = (level: 'category' | 'semiology' | 'characteristic', newValue: string) => {
        switch (level) {
            case 'category':
                form.setFieldValue('cognitive_effect.characteristic', "");
                form.setFieldValue('cognitive_effect.semiology', "");
                form.setFieldValue('cognitive_effect.category', newValue);
                break;
            case 'semiology':
                form.setFieldValue('cognitive_effect.characteristic', "");
                form.setFieldValue('cognitive_effect.semiology', newValue);
                break;
            case 'characteristic':
                form.setFieldValue('cognitive_effect.characteristic', newValue);
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
        <Box w={"100%"} mah={"100%"}>
            <Group w={"100%"} h={"100%"} spacing={0} align='flex-start'>
                <Stack w={"50%"}>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.effect.cognitive_effect_label')}</Title>
                    <Box mih={"25%"}>
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
                    <Box>
                        <CognitiveEffectTable cognitive_values={form.values.cognitive_effect} handleValueChange={handleCognitiveEffectValueChange} />
                    </Box>
                </Stack>
                <Stack w={"25%"}>
                    <Title order={5}>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}</Title>
                    <Box>
                        <Checkbox.Group {...form.getInputProps('epi_manifestation')}>
                            <Stack>
                                {getEpiManifestationOptions().map((option, i) => <Checkbox key={"epi_option_" + i} value={option.value} label={option.label} />)}
                            </Stack>
                        </Checkbox.Group>
                    </Box>
                </Stack>
                <Stack w={"25%"}>
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
        { level: "category", category: "Consciousness", semiology: "", characteristic: "" },
        { level: "semiology", category: "Consciousness", semiology: "Awareness", characteristic: "" },
        { level: "semiology", category: "Consciousness", semiology: "Responsiveness", characteristic: "" },
        { level: "category", category: "Sensory", semiology: "", characteristic: "" },
        { level: "semiology", category: "Sensory", semiology: "Somatosensory", characteristic: "" },
        { level: "characteristic", category: "Sensory", semiology: "Somatosensory", characteristic: "Non painful" },
        { level: "characteristic", category: "Sensory", semiology: "Somatosensory", characteristic: "Painful" }];

    const getEffectOptions = (level: 'category' | 'semiology' | 'characteristic') => {
        switch (level) {
            case 'category':
                return effects.filter((effect) => effect.level === level).map((effect) => effect.category);
            case 'semiology':
                return effects.filter((effect) => effect.level === level
                    && effect.category === cognitive_values.category).map((effect) => effect.semiology);
            case 'characteristic':
                return effects.filter((effect) => effect.level === level
                    && effect.category === cognitive_values.category
                    && effect.semiology === cognitive_values.semiology).map((effect) => effect.characteristic);
            default:
                return [];
        }
    }

    return (
        <Table sx={{ tableLayout: 'fixed', width: "100%", border: 0 }}>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Semiology</th>
                    <th>Characteristic</th>
                </tr>
            </thead>
            <tbody>
                <tr key={"options"}>
                    <td>
                        <ColumnButtonSelect
                            data={getEffectOptions('category')}
                            currentValue={cognitive_values.category}
                            onChange={(v) => handleValueChange('category', v)}
                        />
                    </td>
                    <td>
                        <ColumnButtonSelect
                            data={getEffectOptions('semiology')}
                            currentValue={cognitive_values.semiology}
                            onChange={(v) => handleValueChange('semiology', v)}
                        />
                    </td>
                    <td>
                        <ColumnButtonSelect
                            data={getEffectOptions('characteristic')}
                            currentValue={cognitive_values.characteristic}
                            onChange={(v) => handleValueChange('characteristic', v)}
                        />
                    </td>
                </tr>
            </tbody>
        </Table>);
}

interface CognitiveEffectTableProps {
    cognitive_values: StimulationCognitiveEffectFormValues;
    handleValueChange: (level: 'category' | 'semiology' | 'characteristic', newValue: string) => void
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
                        formatter={(value)=>`${value} sec`}
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
                            <Radio value={v.value} label={v.label} key={'pd_type_option_' + i}/>
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
    return values.category !== "" ? (values.category +
        (values.semiology !== "" ? ('/' + values.semiology
            + (values.characteristic !== "" ? ('/' + values.characteristic) : '')) : '')) : "-"
}