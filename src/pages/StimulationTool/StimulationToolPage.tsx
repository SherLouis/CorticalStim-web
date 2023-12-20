import { Box, Stepper } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTranslation } from "react-i18next";
import StimulationFormValues from "../../models/stimulationForm";
import { useState } from "react";
import ElectrodeSetupStep from "./steps/step1_ElectrodesSetup";
import StimulationsStep from "./steps/step2_Stimulations";

export default function StimulationToolPage() {
    const { t } = useTranslation();

    const form = useForm<StimulationFormValues>({
        initialValues: { electrodes: [] },
        validate: {
            electrodes: {
                label: (value, values) => values.electrodes.map((e) => e.label).filter((v) => v === value).length > 1 ? t("pages.stimulationTool.validation.electrodeLabel") : null
            }
        },
        validateInputOnBlur: true
    })

    const [activeStep, setActiveStep] = useState(0);
    const nextStep = () => setActiveStep((activeStep) => (activeStep < 2 ? activeStep + 1 : activeStep));

    return (
        <Box mx={"2%"}>
            <Stepper active={activeStep} onStepClick={setActiveStep} breakpoint="sm" allowNextStepsSelect={false} sx={{ width: "100%" }}>
                <Stepper.Step label={t("pages.stimulationTool.step1.title")} description={t("pages.stimulationTool.step1.description")}>
                    <ElectrodeSetupStep form={form} onComplete={nextStep} />
                </Stepper.Step>
                <Stepper.Step label={t("pages.stimulationTool.step2.title")} description={t("pages.stimulationTool.step2.description")}>
                    <StimulationsStep form={form} onComplete={nextStep} />
                </Stepper.Step>
                <Stepper.Completed>
                    Completed!
                </Stepper.Completed>
            </Stepper>
        </Box>
    );
}