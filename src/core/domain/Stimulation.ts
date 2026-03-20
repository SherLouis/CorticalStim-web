export interface ParametersData {
    amplitude: number;
    duration: number;
    frequency: number;
    lenght_path: number;
}

export interface TaskData {
    category: string;
    subcategory: string;
    characteristic: string;
}

export interface EffectData {
    observed_effect: {
        class: string;
        descriptor: string;
        details: string;
    };
    observed_effect_comments: string;
    epi_manifestation: string;
    contact_in_epi_zone: string;
    contact_in_epi_zone_comments: string;
    post_discharge: boolean;
    pd_duration: string | undefined;
    pd_local: string;
    pd_type: string;
    crisis: boolean;
    crisis_comments: string;
}

export class Stimulation {
    time: string;
    parameters: ParametersData;
    task: TaskData;
    effect: EffectData;

    constructor(
        time: string,
        parameters: ParametersData,
        task: TaskData,
        effect: EffectData
    ) {
        this.time = time;
        this.parameters = parameters;
        this.task = task;
        this.effect = effect;
    }

    updateParameters(params: Partial<ParametersData>) {
        this.parameters = { ...this.parameters, ...params };
    }

    updateEffect(effect: Partial<EffectData>) {
        this.effect = { ...this.effect, ...effect };
    }
}
