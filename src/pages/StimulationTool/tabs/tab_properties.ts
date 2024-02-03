import { UseFormReturnType } from "@mantine/form";
import StimulationFormValues from "../../../models/stimulationForm";

export interface TabProperties {
    form: UseFormReturnType<StimulationFormValues>;
}