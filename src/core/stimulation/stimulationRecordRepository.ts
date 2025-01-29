import StimulationRecord from "./stimulationRecord";
import StimulationRecordSummary from "./stimulationRecordSummary";

export default interface StimulationRecordRepository {
    // Get saved stimulation summaries
    listSavedStimulationRecordSummaries(): Promise<StimulationRecordSummary>;

    // Save stimulation Returns success or not
    saveStimulation(stimulation_record: StimulationRecord) : Promise<boolean>;

    // Get a specific record by id
    getStimulationRecordById(recordId: string): Promise<StimulationRecord>;
}