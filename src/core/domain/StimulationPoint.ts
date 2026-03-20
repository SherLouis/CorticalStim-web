import { Stimulation } from "./Stimulation";

export interface LocationData {
    type: 'white' | 'vep' | 'destrieux' | 'mni';
    vep: string;
    destrieux: string;
    mni: { x: number; y: number; z: number };
    white_matter: string;
    done: boolean;
}

export class StimulationPoint {
    index: number;
    location: LocationData;
    stimulations: Stimulation[];

    constructor(index: number, location?: LocationData, stimulations: Stimulation[] = []) {
        this.index = index;
        this.location = location || {
            type: 'vep',
            vep: "",
            destrieux: "",
            mni: { x: 0, y: 0, z: 0 },
            white_matter: "",
            done: false,
        };
        this.stimulations = stimulations;
    }

    updateLocation(location: Partial<LocationData>) {
        this.location = { ...this.location, ...location };
    }

    addStimulation(stim: Stimulation) {
        this.stimulations.push(stim);
    }
}
