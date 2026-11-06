import { makeAutoObservable } from 'mobx';
import { Electrode } from './electrode';

export class ElectrodeParams {
    type: string = '';
    separation: number = 0;
    diameter: number = 0;
    length: number = 0;
}

export class StimulationSession {
    patient_id: string = '';
    electrode_params: ElectrodeParams = new ElectrodeParams();
    electrodes: Electrode[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    toValues() {
        return {
            patient_id: this.patient_id,
            electrode_params: { ...this.electrode_params },
            electrodes: this.electrodes.map((e) => ({ ...e })),
        };
    }
}
