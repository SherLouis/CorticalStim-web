import { StimulationPoint } from './stimulationPoint';

export type SideOptions = 'left' | 'right';

export interface Electrode {
    label: string;
    side: SideOptions | undefined;
    nContacts: number;
    confirmed: boolean;
    stimulationPoints: StimulationPoint[];
}
