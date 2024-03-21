export default interface StimulationFormValues {
    electrode_params: {
        type: string;
        separation: number;
        diameter: number;
        length: number;
    },
    electrodes: {
        label: string;
        side: string;
        n_contacts: number;
        stim_points: {
            index: number;
            location: {
                type: 'white' | 'vep' | 'destrieux' | 'mni';
                vep: string;
                destrieux: string;
                mni: { x: number; y: number; z: number };
                done: boolean;
            };
            stimulations: {
                parameters: StimulationParametersFormValues;
                task: StimulationTaskFormValues;
                effect: StimulationEffectsValues;
            }[]
        }[]
    }[]
};

export interface StimulationParametersFormValues {
    amplitude: number;
    duration: number;
    frequency: number;
    lenght_path: number;
}

export interface StimulationTaskFormValues {
    category: string;
    subcategory: string;
    characteristic: string;
}

export interface StimulationEffectsValues {
    cognitive_effect: StimulationCognitiveEffectFormValues;
    epi_manifestation: string[];
    post_discharge: boolean;
    pd_duration: number;
    pd_local: string;
    pd_type: string;
    crisis: boolean;
};

export interface StimulationCognitiveEffectFormValues {
    category: string;
    semiology: string;
    characteristic: string;
}

export const getStimPointLabel = (electrodeLabel: string, stim_point_index: number) => {
    return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
}