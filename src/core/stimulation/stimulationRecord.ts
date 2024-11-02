import StimulationFormValues from "../models/stimulationForm";

export default interface StimulationRecord {
    id: string;
    stimulation_data: StimulationFormValues;
}