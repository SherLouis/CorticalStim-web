import { UseFormReturnType } from "@mantine/form";
import StimulationFormValues from "../../../../core/models/stimulationForm";
import { StimulationSessionAdapter } from "../../../hooks/useStimulationSession";

export interface TabProperties {
    form: UseFormReturnType<StimulationFormValues>;
    stimulationAdapter: StimulationSessionAdapter;
}