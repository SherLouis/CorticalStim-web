import { makeAutoObservable } from 'mobx';
import { StimulationSession, ElectrodeParams } from '../../domain/session';

export class StimulationSessionStore {
    session: StimulationSession = new StimulationSession();

    constructor() {
        makeAutoObservable(this);
    }

    setValues(values: { patient_id: string; electrode_params: { type: string; separation: number; diameter: number; length: number }; electrodes: any[] }) {
        this.session.patient_id = values.patient_id;
        this.session.electrode_params = Object.assign(new ElectrodeParams(), values.electrode_params);
        this.session.electrodes = values.electrodes.map((e) => ({ ...e }));
    }

    toValues() {
        return this.session.toValues();
    }
}
