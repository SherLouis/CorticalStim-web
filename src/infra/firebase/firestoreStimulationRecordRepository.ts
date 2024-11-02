import StimulationRecordRepository from "../../core/stimulation/stimulatinoRecordRepository";
import StimulationRecord from "../../core/stimulation/stimulationRecord";

export default class FirebaseStimulationRecordRepository implements StimulationRecordRepository {
    // TODO: firestore configuration
    listStimulationRecordIds(): Promise<String[]> {
        throw new Error("Method not implemented.");
    }
    getStimulationRecordById(recordId: string): Promise<StimulationRecord> {
        throw new Error("Method not implemented.");
    }

}

/**
 * Users
 *  <UserId>
 *      optionalOtherUserInfo: ...
 *      listOfStimulations: [<stimulationSummary: stimId, name>]
 *      stimulations
 *          <stimId> : stimulationData (form values)
 */

/**
 * Stimulations
 *  <stimId>
 *      userId: <uid>
 *      stimulationData
 * Users
 *  <UserId>
 *      optionalOtherUserINfo: ...
 *      listOfStimulations: [<stimulationSummary: stimId, name>]
 */