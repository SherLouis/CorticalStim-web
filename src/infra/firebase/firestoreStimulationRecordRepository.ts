import StimulationRecordRepository from "../../core/stimulation/stimulationRecordRepository";
import StimulationRecord from "../../core/stimulation/stimulationRecord";
import StimulationRecordSummary from "../../core/stimulation/stimulationRecordSummary";

export default class FirebaseStimulationRecordRepository implements StimulationRecordRepository {
    listSavedStimulationRecordSummaries(): Promise<StimulationRecordSummary> {
        throw new Error("Method not implemented.");
    }
    saveStimulation(stimulation_record: StimulationRecord): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    getStimulationRecordById(recordId: string): Promise<StimulationRecord> {
        throw new Error("Method not implemented.");
    }
}

/**
 * Stimulations
 *  <stimId>
 *      userId: <uid>
 *      stimulationData
 * Users
 *  <UserId>
 *      optionalOtherUserInfo: ...
 *      listOfStimulations: [<stimulationSummary: stimId, name, lastModified>]
 */