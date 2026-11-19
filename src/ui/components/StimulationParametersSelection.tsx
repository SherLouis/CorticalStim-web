import { Button, Group, Stack, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { useTranslation } from "react-i18next";

import { StimulationParametersFormValues } from "@/ui/core/types";

import CustomNumberInput from "./CustomNumberInput";
import Section from "./Section";


export default function StimulationParametersSelection({ form: params_form }: StimulationParametersSelectionProps) {
    const { t } = useTranslation();

    const parameterSelection = (
        <Group position="center" align="top" noWrap>
            <CustomNumberInput
                h={"100%"}
                label={t('pages.stimulationTool.stimulation.amplitude_label') + ' (mA)'}
                precision={1}
                digit_step={1}
                decimal_step={0.1}
                min={0}
                max={10}
                variant='default'
                useCustom={true}
                value={params_form.values.amplitude} onChange={(v) => params_form.setFieldValue('amplitude', v)}
            />
            <Stack align="center" h={"100%"} spacing={0}>
                <CustomNumberInput
                    label={t('pages.stimulationTool.stimulation.frequency_label') + ' (Hz)'}
                    precision={0}
                    step={1}
                    min={0}
                    styles={{ input: { textAlign: "center" } }}
                    value={params_form.values.frequency} onChange={(v) => params_form.setFieldValue('frequency', v)}
                />
                <Group spacing={0} grow w={"100%"}>
                    {[1, 5, 50, 55].map((v) =>
                        <Button compact key={"freq_" + v}
                            onClick={() => params_form.setFieldValue('frequency', v)}
                            variant={params_form.values.frequency === v ? 'filled' : 'default'}>
                            {v}
                        </Button>
                    )}
                </Group>
            </Stack>

            <Stack align="center" h={"100%"} spacing={0}>
                <CustomNumberInput
                    label={t('pages.stimulationTool.stimulation.duration_label') + ' (s)'}
                    precision={0}
                    step={1}
                    min={0}
                    styles={{ input: { textAlign: "center" } }}
                    value={params_form.values.duration} onChange={(v) => params_form.setFieldValue('duration', v)}
                />
                <Group spacing={0} grow w={"100%"}>
                    {[5, 10, 30, 60].map((v) =>
                        <Button compact key={"duration_" + v}
                            onClick={() => params_form.setFieldValue('duration', v)}
                            variant={params_form.values.duration === v ? 'filled' : 'default'}>
                            {v}
                        </Button>
                    )}
                </Group>
            </Stack>

            <Stack align="center" h={"100%"} spacing={0}>
                <CustomNumberInput
                    label={t('pages.stimulationTool.stimulation.length_path_label') + ' (µs)'}
                    precision={0}
                    step={1}
                    min={0}
                    styles={{ input: { textAlign: "center" } }}
                    value={params_form.values.lengthPath} onChange={(v) => params_form.setFieldValue('lengthPath', v)}
                />
                <Group spacing={0} grow w={"100%"}>
                    {[300, 500].map((v) =>
                        <Button compact key={"lp_" + v}
                            onClick={() => params_form.setFieldValue('lengthPath', v)}
                            variant={params_form.values.lengthPath === v ? 'filled' : 'default'}>
                            {v}
                        </Button>
                    )}
                </Group>
            </Stack>
        </Group>
    );
    return (
        <Section
            header={<Title order={5}>{t('pages.stimulationTool.stimulation.parameters_title')}</Title>}
            children={parameterSelection}
        />
    );
}

interface StimulationParametersSelectionProps {
    form: UseFormReturnType<StimulationParametersFormValues>;
}