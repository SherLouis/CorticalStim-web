import { Box, Button, Checkbox, Group, Text, Radio, ScrollArea, Stack, Switch, TextInput, Title, Flex } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";
import { PostDischargeValueOptions, StimulationEffectsValues, StimulationObservedEffectFormValues } from "../core/models/stimulationForm";
import ColumnButtonSelect from "./ColumnButtonSelect";
import { TFunction } from "i18next";
import Section from "./Section";

export default function StimulationEffectSelection({ form, observed_effect_last_values }: StimulationEffectSelectionProps) {
    const { t } = useTranslation();

    // TODO: preset

    const handleCognitiveEffectValueChange = (level: 'class' | 'descriptor' | 'details', newValue: string) => {
        switch (level) {
            case 'class':
                form.setFieldValue('observed_effect.details', "");
                form.setFieldValue('observed_effect.descriptor', "");
                form.setFieldValue('observed_effect.class', newValue === form.values.observed_effect.class ? "" : newValue);
                break;
            case 'descriptor':
                form.setFieldValue('observed_effect.details', "");
                form.setFieldValue('observed_effect.descriptor', newValue === form.values.observed_effect.descriptor ? "" : newValue);
                break;
            case 'details':
                form.setFieldValue('observed_effect.details', newValue === form.values.observed_effect.details ? "" : newValue);
                break;
        }
    }

    const getContactInEpiZoneOptions = () => {
        return [
            { label: t('pages.stimulationTool.stimulation.effect.contact_in_epi_zone_options.yes'), value: 'yes' },
            { label: t('pages.stimulationTool.stimulation.effect.contact_in_epi_zone_options.no'), value: 'no' },
            { label: t('pages.stimulationTool.stimulation.effect.contact_in_epi_zone_options.unknown'), value: 'unknown' }
        ]
    }

    const observedEffect = (
        <Group w={"100%"} h={"90%"} align='flex-start'>
            <Box sx={{ flex: 3 }} h={"100%"}>
                <Stack h={"100%"}>
                    <Button compact size="sm"
                        variant={form.values.observed_effect === NO_EFFECT ? "filled" : "light"}
                        onClick={() => { form.setFieldValue('observed_effect', NO_EFFECT); }}>
                        {t('pages.stimulationTool.stimulation.effect.no_effect')}
                    </Button>
                    <Title order={6}>{t('pages.stimulationTool.stimulation.effect.last_used')}</Title>
                    <Button.Group orientation='vertical'>
                        {observed_effect_last_values.map((v, i) => (
                            <Button compact size="sm" key={"btn_last_effect_" + i}
                                variant={formatSelectedObservedEffect(form.values.observed_effect) === formatSelectedObservedEffect(v) ? "filled" : "light"}
                                onClick={() => { form.setFieldValue('observed_effect', v); }}>
                                {formatSelectedObservedEffect(v)}
                            </Button>
                        ))}
                    </Button.Group>
                </Stack>
            </Box>

            <Box sx={{ flex: 9 }} h={"100%"}>
                <Stack w={"100%"} h={"100%"} spacing={0}>
                    <Box h={"90%"}>
                        <CognitiveEffectTable
                            cognitive_values={form.values.observed_effect}
                            handleValueChange={handleCognitiveEffectValueChange}
                            t={t}
                        />
                    </Box>
                    <TextInput
                        h={"10%"}
                        placeholder={t("pages.stimulationTool.stimulation.effect.comments_label")}
                        {...form.getInputProps('observed_effect_comments')}
                    />
                </Stack>
            </Box>
        </Group>
    );

    const clinicalManif = (
        <Stack h={"100%"} w={"100%"} spacing={'xs'}>
            <Box w={"100%"} sx={{ flex: 6 }}>
                <Stack w={"100%"} spacing={"xs"}>
                    {getEpiManifestationOptions(t).map((option, i) => <Checkbox key={"epi_option_" + i} value={option.value} label={option.label}
                        onChange={(e) => form.setFieldValue('epi_manifestation', e.target.checked ? e.target.value : "")}
                        checked={option.value === form.values.epi_manifestation}
                    />)}
                    <TextInput
                        placeholder={t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.other')}
                        {...form.getInputProps('epi_manifestation')}
                    />
                </Stack>
            </Box>
            <Box w={"100%"} sx={{ flex: 6 }}>
                <Radio.Group
                    defaultValue="unknown"
                    label={t('pages.stimulationTool.stimulation.effect.contact_in_epi_zone_label')}
                    {...form.getInputProps('contact_in_epi_zone')}>
                    <Group>
                        {getContactInEpiZoneOptions().map((option, i) =>
                            <Radio
                                key={"in_epi_zone_" + i}
                                label={option.label}
                                value={option.value}
                            />)}
                    </Group>
                </Radio.Group>
                <TextInput
                    label={t('pages.stimulationTool.stimulation.effect.contact_in_epi_zone_comments_label')}
                    {...form.getInputProps('contact_in_epi_zone_comments')}
                />
            </Box>
        </Stack>
    );

    return (
        <Box w={"100%"} h={"100%"}>
            <Group w={"100%"} h={"100%"} align='flex-start'>
                <Section
                    sx={{ flex: 7 }}
                    header={<Title order={5}>{t('pages.stimulationTool.stimulation.effect.observed_effect_label')}</Title>}
                    children={observedEffect}
                />

                <Box sx={{ flex: 5 }} h={"100%"}>
                    <Group w={"100%"} h={"100%"} align='flex-start'>
                        <Section
                            sx={{ flex: 6 }}
                            header={<Title order={5}>{t('pages.stimulationTool.stimulation.effect.epi_manifestation')}</Title>}
                            children={clinicalManif}
                        />

                        <Section
                            sx={{ flex: 6 }}
                            header={<Title order={5}>{t('pages.stimulationTool.stimulation.effect.eeg')}</Title>}
                            children={<EEGSection form={form} t={t} />}
                            bodyOpts={{ h: "90%" }}
                        />
                    </Group>
                </Box>
            </Group>
        </Box>
    );
}

interface StimulationEffectSelectionProps {
    form: UseFormReturnType<StimulationEffectsValues>;
    observed_effect_last_values: StimulationObservedEffectFormValues[];
}

const getEpiManifestationOptions = (t: TFunction) => {
    return [
        { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.typical_aura'), value: 'typical_aura' },
        { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.typical_crisis'), value: 'typical_crisis' },
        { label: t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.atypical_crisis'), value: 'atypical_crisis' }
    ];
};

const CognitiveEffectTable = ({ cognitive_values, handleValueChange, t }: CognitiveEffectTableProps) => {
    const effects = [
        // Consciousness
        { level: "class", class: "Consciousness", descriptor: "", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Imp Awareness", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Imp Responsiveness", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Imp awar & resp", details: "" },
        { level: "descriptor", class: "Consciousness", descriptor: "Other consc", details: "" },
        // Sensory
        { level: "class", class: "Sensory", descriptor: "", details: "" },
        { level: "descriptor", class: "Sensory", descriptor: "Auditory", details: "" },
        { level: "details", class: "Sensory", descriptor: "Auditory", details: "Illusion" },
        { level: "details", class: "Sensory", descriptor: "Auditory", details: "Hallucination" },
        { level: "details", class: "Sensory", descriptor: "Auditory", details: "Combined" },
        { level: "descriptor", class: "Sensory", descriptor: "Gustatory", details: "" },
        { level: "details", class: "Sensory", descriptor: "Gustatory", details: "Illusion" },
        { level: "details", class: "Sensory", descriptor: "Gustatory", details: "Hallucination" },
        { level: "details", class: "Sensory", descriptor: "Gustatory", details: "Combined" },
        { level: "descriptor", class: "Sensory", descriptor: "Olfactory", details: "" },
        { level: "details", class: "Sensory", descriptor: "Olfactory", details: "Illusion" },
        { level: "details", class: "Sensory", descriptor: "Olfactory", details: "Hallucination" },
        { level: "details", class: "Sensory", descriptor: "Olfactory", details: "Combined" },
        { level: "descriptor", class: "Sensory", descriptor: "Somatosensory", details: "" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Dysesthesia" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Thermal" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Combined" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Pain" },
        { level: "details", class: "Sensory", descriptor: "Somatosensory", details: "Other" },
        { level: "descriptor", class: "Sensory", descriptor: "Vestibular", details: "" },
        { level: "details", class: "Sensory", descriptor: "Vestibular", details: "Rotation" },
        { level: "details", class: "Sensory", descriptor: "Vestibular", details: "Translation" },
        { level: "details", class: "Sensory", descriptor: "Vestibular", details: "Combined" },
        { level: "details", class: "Sensory", descriptor: "Vestibular", details: "Other" },
        { level: "descriptor", class: "Sensory", descriptor: "Visual", details: "" },
        { level: "details", class: "Sensory", descriptor: "Visual", details: "Illusion" },
        { level: "details", class: "Sensory", descriptor: "Visual", details: "Hallucination" },
        { level: "details", class: "Sensory", descriptor: "Visual", details: "Combined" },
        { level: "descriptor", class: "Sensory", descriptor: "Body-illusion", details: "" },
        { level: "details", class: "Sensory", descriptor: "Body-illusion", details: "Autoscopy" },
        { level: "details", class: "Sensory", descriptor: "Body-illusion", details: "Heautoscopy" },
        { level: "details", class: "Sensory", descriptor: "Body-illusion", details: "Out of body exp" },
        { level: "details", class: "Sensory", descriptor: "Body-illusion", details: "Levity" },
        { level: "details", class: "Sensory", descriptor: "Body-illusion", details: "Other" },
        { level: "descriptor", class: "Sensory", descriptor: "Other", details: "" },
        // Affective
        { level: "class", class: "Affective", descriptor: "", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Anger", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Anxiety", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Fear", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Sadness", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Guilt", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Mirth", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Ecstatic", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Mystic", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Sexual", details: "" },
        { level: "descriptor", class: "Affective", descriptor: "Other", details: "" },
        // Cognitive
        { level: "class", class: "Cognitive", descriptor: "", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Dysphasic", details: "" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Anomia" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Paraphasia" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Imp comprehension" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Semantic imp" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Alexia" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Combined" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Speech arrest" },
        { level: "details", class: "Cognitive", descriptor: "Dysphasic", details: "Dysarthria" },

        { level: "descriptor", class: "Cognitive", descriptor: "Dysmnesic", details: "" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesic", details: "Amnesia" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesic", details: "(un)familiarity illusions" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesic", details: "Reminiscence" },
        { level: "details", class: "Cognitive", descriptor: "Dysmnesic", details: "Other dysmnesic" },

        { level: "descriptor", class: "Cognitive", descriptor: "Dyspraxic", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Time illusion", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Forced thinking", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Depersonalisation", details: "" },
        { level: "descriptor", class: "Cognitive", descriptor: "Other", details: "" },
        // Motor Elementary
        { level: "class", class: "Motor Elementary", descriptor: "", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Akinetic", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Akinetic", details: "Aphemic" },
        { level: "details", class: "Motor Elementary", descriptor: "Akinetic", details: "Other" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Astatic", details: "" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Atonic", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Atonic", details: "Negative myoclonic" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Paretic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Dystonic", details: "" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Tonic", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Tonic", details: "Fencing posture" },
        { level: "details", class: "Motor Elementary", descriptor: "Tonic", details: "Figure-of-4 sign" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Spasm", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Myoclonic", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Myoclonic", details: "Rythmic myoclonic" },
        { level: "details", class: "Motor Elementary", descriptor: "Myoclonic", details: "Asymetric clonic" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Myoclonic-atonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Tonic-clonic", details: "" },
        { level: "descriptor", class: "Motor Elementary", descriptor: "Eye blinking", details: "" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Epileptic nystagmus" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Exploratory gaze" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Head nodding" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Head orientation" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Version" },
        { level: "details", class: "Motor Elementary", descriptor: "Eye & Head & Dev", details: "Other" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Gyration", details: "" },
        { level: "details", class: "Motor Elementary", descriptor: "Gyration", details: "Ipsilateral " },
        { level: "details", class: "Motor Elementary", descriptor: "Gyration", details: "Controlateral" },

        { level: "descriptor", class: "Motor Elementary", descriptor: "Other", details: "" },
        // Motor Complex
        { level: "class", class: "Motor Complex", descriptor: "", details: "" },
        { level: "descriptor", class: "Motor Complex", descriptor: "Affect related behav", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "laughing" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "crying" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "pouting" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "biting" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "fighting" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "screaming" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "humming" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "kissing" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "copulatory" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "praying" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "getting-up impulse" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "running away" },
        { level: "details", class: "Motor Complex", descriptor: "Affect related behav", details: "other affect-R behav" },

        { level: "descriptor", class: "Motor Complex", descriptor: "axial automatisms", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "axial automatisms", details: "body rocking" },
        { level: "details", class: "Motor Complex", descriptor: "axial automatisms", details: "body rolling" },
        { level: "details", class: "Motor Complex", descriptor: "axial automatisms", details: "body turning" },
        { level: "details", class: "Motor Complex", descriptor: "axial automatisms", details: "other axial aut" },

        { level: "descriptor", class: "Motor Complex", descriptor: "distal automatisms", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "purposeful" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "non purposeful" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "genital" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "grasping" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "nose-wipping" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "rinch" },
        { level: "details", class: "Motor Complex", descriptor: "distal automatisms", details: "other distal aut" },

        { level: "descriptor", class: "Motor Complex", descriptor: "proximal automatisms", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "proximal automatisms", details: "crawling" },
        { level: "details", class: "Motor Complex", descriptor: "proximal automatisms", details: "flying" },
        { level: "details", class: "Motor Complex", descriptor: "proximal automatisms", details: "pedaling" },
        { level: "details", class: "Motor Complex", descriptor: "proximal automatisms", details: "other prox. aut." },

        { level: "descriptor", class: "Motor Complex", descriptor: "oral automatisms", details: "" },
        { level: "details", class: "Motor Complex", descriptor: "oral automatisms", details: "chewing" },
        { level: "details", class: "Motor Complex", descriptor: "oral automatisms", details: "lip smacking" },
        { level: "details", class: "Motor Complex", descriptor: "oral automatisms", details: "swallowing" },
        { level: "details", class: "Motor Complex", descriptor: "oral automatisms", details: "other oral aut." },

        { level: "descriptor", class: "Motor Complex", descriptor: "verbal automatisms", details: "" },
        { level: "descriptor", class: "Motor Complex", descriptor: "vocal automatisms", details: "" },
        { level: "descriptor", class: "Motor Complex", descriptor: "wandering", details: "" },
        { level: "descriptor", class: "Motor Complex", descriptor: "other complex motor", details: "" },

        // Autonomic
        { level: "class", class: "Autonomic", descriptor: "", details: "" },
        { level: "descriptor", class: "Autonomic", descriptor: "CardioVascular", details: "" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "asystole" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "bradycardia" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "tachycardia" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "hypotension" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "hypertension" },
        { level: "details", class: "Autonomic", descriptor: "CardioVascular", details: "other cardiovascular" },

        { level: "descriptor", class: "Autonomic", descriptor: "Cutaneous", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "flushing" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "pallor" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "piloerection" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "anhydrosis" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "sweating" },
        { level: "details", class: "Autonomic", descriptor: "Cutaneous", details: "other cutaneous" },

        { level: "descriptor", class: "Autonomic", descriptor: "GastroIntestinal", details: "" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "sensation" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "painful sensation" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "flatulence" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "nausea" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "vomiting" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "hypersalivation" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "spitting" },
        { level: "details", class: "Autonomic", descriptor: "GastroIntestinal", details: "other gastrointestinal" },

        { level: "descriptor", class: "Autonomic", descriptor: "lacrimatory", details: "" },

        { level: "descriptor", class: "Autonomic", descriptor: "Pupillary", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Pupillary", details: "Miosis" },
        { level: "details", class: "Autonomic", descriptor: "Pupillary", details: "Mydriasis" },
        { level: "details", class: "Autonomic", descriptor: "Pupillary", details: "Other" },

        { level: "descriptor", class: "Autonomic", descriptor: "Respiratory", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "hyperventilation" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "hypoventilation" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "apnea" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "chocking" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "coughing" },
        { level: "details", class: "Autonomic", descriptor: "Respiratory", details: "other respiratory" },

        { level: "descriptor", class: "Autonomic", descriptor: "Urinary", details: "" },
        { level: "details", class: "Autonomic", descriptor: "Urinary", details: "incontinence" },
        { level: "details", class: "Autonomic", descriptor: "Urinary", details: "imperiosity" },

        { level: "descriptor", class: "Autonomic", descriptor: "Other", details: "" },
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
        <Stack w={"100%"} h={"100%"} p={0} spacing={"xs"}>
            <Flex direction={"row"} justify={"flex-start"} align={"flex-start"} wrap={"nowrap"} w={"100%"} h={"100%"}>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }}>
                    <Text h={"5%"}>{t("pages.stimulationTool.stimulation.effect.effect_table.class")}</Text>
                    <Box h={"95%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getEffectOptions('class')}
                            currentValue={cognitive_values.class}
                            onChange={(v) => handleValueChange('class', v)}
                        />
                    </Box>
                </Stack>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }} px={"sm"}>
                    <Text h={"5%"}>{t("pages.stimulationTool.stimulation.effect.effect_table.descriptor")}</Text>
                    <Box h={"95%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getEffectOptions('descriptor')}
                            currentValue={cognitive_values.descriptor}
                            onChange={(v) => handleValueChange('descriptor', v)}
                        />
                    </Box>
                </Stack>
                <Stack spacing={0} h={"100%"} sx={{ flex: 4 }}>
                    <Text h={"5%"}>{t("pages.stimulationTool.stimulation.effect.effect_table.details")}</Text>
                    <Box h={"95%"} sx={{ flex: 4 }}>
                        <ColumnButtonSelect
                            data={getEffectOptions('details')}
                            currentValue={cognitive_values.details}
                            onChange={(v) => handleValueChange('details', v)}
                        />
                    </Box>
                </Stack>
            </Flex>
        </Stack>
    );
}

export const NO_EFFECT: StimulationObservedEffectFormValues = { class: "None", descriptor: "", details: "" };

interface CognitiveEffectTableProps {
    cognitive_values: StimulationObservedEffectFormValues;
    handleValueChange: (level: 'class' | 'descriptor' | 'details', newValue: string) => void;
    t: TFunction;
}

const getEegPostDischargeLocalOptions = (t: TFunction) => {
    return [
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localization_options.local'), value: 'local' },
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localization_options.regional'), value: 'regional' },
        { label: t('pages.stimulationTool.stimulation.effect.eeg_section.localization_options.wide'), value: 'wide' }
    ];
}

export const formatEegPostDichargeLocale = (value: string, t: TFunction) => {
    const foundOption = getEegPostDischargeLocalOptions(t).find(i => value === i.value)
    return foundOption ? foundOption.label : value;
}

const EEGSection = ({ form, t }: EEGSectionProps) => {
    const post_discharge_local_options = getEegPostDischargeLocalOptions(t);

    const post_discharge_type = [
        { label: "Spike-wave", value: "spike-wave" },
        { label: "Polyspike", value: "polyspike" },
        { label: "Sequential", value: "sequential" }
    ]

    return (
        <ScrollArea w={"100%"} h={"100%"} py={"xs"} type="auto" sx={{ padding: '0' }}>
            <Stack align="stretch" justify="flex-start">
                <Switch
                    label={t('pages.stimulationTool.stimulation.effect.eeg_section.post_discharge_label')}
                    checked={form.values.post_discharge}
                    {...form.getInputProps('post_discharge')} />
                <Box display={form.values.post_discharge === true ? 'block' : 'none'}>
                    <Stack spacing={0}>
                        <TextInput
                            label={t('pages.stimulationTool.stimulation.effect.eeg_section.duration_label') + ' (s)'}
                            styles={{ input: { textAlign: 'center' } }}
                            {...form.getInputProps('pd_duration')}
                        />
                        <Group spacing={0} grow w={"100%"}>
                            {PostDischargeValueOptions.map((v, i) =>
                                <Button compact key={"pd_duration_" + i}
                                    onClick={() => form.setFieldValue('pd_duration', v)}
                                    variant={form.values.pd_duration === v ? 'filled' : 'default'}>
                                    {v}
                                </Button>
                            )}
                        </Group>
                    </Stack>
                    <Stack spacing={0}>
                        <label>{t('pages.stimulationTool.stimulation.effect.eeg_section.localization_label')}</label>
                        <Group spacing={0} grow w={"100%"}>
                            {post_discharge_local_options.map((v, i) =>
                                <Button compact key={"pd_local_option_" + i}
                                    onClick={() => form.setFieldValue('pd_local', v.value)}
                                    variant={form.values.pd_local === v.value ? 'filled' : 'default'}>
                                    {v.label}
                                </Button>
                            )}
                        </Group>
                    </Stack>
                    <Stack spacing={0}>
                        <label>{t('pages.stimulationTool.stimulation.effect.eeg_section.type_label')}</label>
                        <Group spacing={0} grow w={"100%"}>
                            {post_discharge_type.map((v, i) =>
                                <Button compact key={"pd_type_option_" + i}
                                    onClick={() => form.setFieldValue('pd_type', v.value)}
                                    variant={form.values.pd_type === v.value ? 'filled' : 'default'}>
                                    {v.label}
                                </Button>
                            )}
                        </Group>
                    </Stack>
                </Box>

                <Switch
                    label={t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_label')}
                    checked={form.values.crisis}
                    {...form.getInputProps('crisis')} />
                {form.values.crisis &&
                    <TextInput
                        placeholder={t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_comments_label')}
                        label={t('pages.stimulationTool.stimulation.effect.eeg_section.crisis_comments_label')}
                        {...form.getInputProps('crisis_comments')}
                    />
                }
            </Stack>
        </ScrollArea>
    );
}

interface EEGSectionProps {
    form: UseFormReturnType<StimulationEffectsValues>;
    t: TFunction;
}

export const formatEpiManifestation = (epiManif: string, t: TFunction): string => {
    if (epiManif === '') {
        return '-';
    };
    if (getEpiManifestationOptions(t).map(option => option.value).includes(epiManif)) {
        return t('pages.stimulationTool.stimulation.effect.epi_manifestation_options_labels.' + epiManif);
    }
    return epiManif;
};

export const formatSelectedObservedEffect = (values: StimulationObservedEffectFormValues): string => {
    return values.class !== "" ? (values.class +
        (values.descriptor !== "" ? ('/' + values.descriptor
            + (values.details !== "" ? ('/' + values.details) : '')) : '')) : "-";
};