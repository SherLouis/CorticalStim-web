import { Electrode } from './electrode';
import { ElectrodeConfig } from './electrodeConfig';

export class ElectrodeParams {
    type: string = '';
    separation: number = 0;
    diameter: number = 0;
    length: number = 0;
}

export class StimulationSession {
    patientId: string = '';
    electrodeParameters: ElectrodeConfig | undefined;
    usedElectrodeConfigs: ElectrodeConfig[] = [];
    electrodes: Electrode[] = [];

    toValues() {
        return {
            patientId: this.patientId,
            electrodeParameters: this.electrodeParameters ? ({ ...this.electrodeParameters } as ElectrodeConfig) : undefined,
            usedElectrodeConfigs: this.usedElectrodeConfigs.map((c) => ({ ...c })),
            electrodes: this.electrodes.map((e) => ({ ...e })),
        };
    }
}
