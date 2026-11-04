import { makeAutoObservable } from 'mobx';
import { StimulationSession, ElectrodeParams } from '../../domain/session';
import { Electrode } from '../../domain/electrode';
import { StimulationPoint } from '../../domain/stimulationPoint';

export class StimulationSessionStore {
    session: StimulationSession = new StimulationSession();

    constructor() {
        makeAutoObservable(this);
    }

    get electrodeCount() {
        return this.session.electrodes.length;
    }

    addElectrode(label: string) {
        this.session.electrodes.push({ label, side: undefined, nContacts: 0, confirmed: false, stimulationPoints: [] } as Electrode);
    }

    removeElectrode(index: number) {
        this.session.electrodes.splice(index, 1);
    }

    addStimulationPoint(electrodeIndex: number) {
        const electrode = this.session.electrodes[electrodeIndex];
        if (!electrode) return;
        electrode.stimulationPoints.push({
            index: electrode.stimulationPoints.length,
            location: { type: 'white', vep: '', destrieux: '', mni: { x: 0, y: 0, z: 0 }, isWhiteMatter: false, isDone: false },
            stimulations: []
        } as StimulationPoint);
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
