import { StimulationEffects } from './stimulationEffects';

export class StimulationParameters {
    amplitude: number = 0;
    duration: number = 0;
    frequency: number = 0;
    lengthPath: number = 0;

    constructor(init?: Partial<StimulationParameters>) {
        Object.assign(this, init);
    }

    chargeDensity(): number {
        return ((this.amplitude * this.lengthPath) / 50);
    }
}

export interface StimulationTask {
    category: string;
    subcategory: string;
    characteristic: string;
}

export interface Stimulation {
    time: string;
    parameters: StimulationParameters;
    task: StimulationTask;
    effect: StimulationEffects;
}
