import { Electrode } from './electrode';

export class ElectrodeParams {
    type: string = '';
    separation: number = 0;
    diameter: number = 0;
    length: number = 0;
}

export class StimulationSession {
    patientId: string = '';
    electrodeParameters: ElectrodeParams = new ElectrodeParams();
    electrodes: Electrode[] = [];

    toValues() {
        return {
            patientId: this.patientId,
            electrodeParameters: { ...this.electrodeParameters },
            electrodes: this.electrodes.map((e) => ({ ...e })),
        };
    }
}
