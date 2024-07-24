import { UseFormReturnType } from "@mantine/form";
import StimulationFormValues from "../../../core/models/stimulationForm";

export interface TabProperties {
    form: UseFormReturnType<StimulationFormValues>;
}