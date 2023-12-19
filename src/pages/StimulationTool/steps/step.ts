import { UseFormReturnType } from "@mantine/form";
import StimulationFormValues from "../../../models/stimulationForm";

export default interface StepProperties {
    form: UseFormReturnType<StimulationFormValues>;
    onComplete: ()=>void;
}