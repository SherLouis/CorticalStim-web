import { Box, Group, Stack, Table, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { StimulationEffectsValues, StimulationCognitiveEffectFormValues } from "../models/stimulationForm";
import ColumnButtonSelect from "./ColumnButtonSelect";

export default function StimulationEffectSelection({ form, cognitive_effect_last_values }: StimulationEffectSelectionProps) {
    const { t } = useTranslation();

    console.log(form.values);

    // TODO: last values for cogitive effects
    // TODO: preset
    // TODO: translations

    const handleValueChange = (level: 'category' | 'semiology' | 'characteristic', newValue: string) => {
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

    return (
        <Box w={"100%"} mah={"100%"}>
            <Group w={"100%"} h={"100%"} spacing={0} align='flex-start'>
                <Stack w={"50%"}>
                    <Title order={5}>Effet cognitif</Title>
                    <Box>
                        <CognitiveEffectTable cognitive_values={form.values.cognitive_effect} handleValueChange={handleValueChange} />
                    </Box>
                </Stack>
                <Stack w={"25%"}>
                    <Title order={5}>Manif. epi.</Title>
                    <Box>
                        ...epi
                    </Box>
                </Stack>
                <Stack w={"25%"}>
                    <Title order={5}>EEG</Title>
                    <Box>
                        ...eeg
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