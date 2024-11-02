import StimulationRecord from "./stimulationRecord";

export default interface StimulationRecordRepository {
    // List stimulation record ids
    listStimulationRecordIds() : Promise<String[]>;

    // Get a specific record by id
    getStimulationRecordById(recordId: string): Promise<StimulationRecord>;
}