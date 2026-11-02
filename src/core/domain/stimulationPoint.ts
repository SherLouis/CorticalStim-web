import { Stimulation } from './stimulation';

export interface StimulationLocation {
    type: 'white' | 'vep' | 'destrieux' | 'mni';
    vep: string;
    destrieux: string;
    mni: { x: number; y: number; z: number };
    isWhiteMatter: boolean;
    idDone: boolean;
}

export interface StimulationPoint {
    index: number;
    location: StimulationLocation;
    stimulations: Stimulation[];
}
