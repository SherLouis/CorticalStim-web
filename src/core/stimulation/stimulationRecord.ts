import { StimulationSessionValues } from "@/core/application/stores/stimulationSessionStore";

// TODO: unsure how to use this yet ...
export default interface StimulationRecord {
    id: string;
    stimulation_data: StimulationSessionValues;
}