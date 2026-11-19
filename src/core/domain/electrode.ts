import { StimulationPoint } from './stimulationPoint';

export type SideOptions = 'left' | 'right';

export interface Electrode {
    label: string;
    side: SideOptions | undefined;
    configId?: string;
    confirmed: boolean;
    stimulationPoints: StimulationPoint[];
}
