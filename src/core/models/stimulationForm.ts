export default interface StimulationFormValues {
    patient_id: string;
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
            location: StimulationLocationFormValues;
            stimulations: Stimulation[]
        }[]
    }[]
};

export interface Stimulation {
    time: string,
    parameters: StimulationParametersFormValues;
    task: StimulationTaskFormValues;
    effect: StimulationEffectsValues;
}

export interface StimulationLocationFormValues {
    type: 'white' | 'vep' | 'destrieux' | 'mni';
    vep: string;
    destrieux: string;
    mni: { x: number; y: number; z: number };
    white_matter: string;
    done: boolean;
}

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
    observed_effect: StimulationObservedEffectFormValues;
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
};

export const PostDischargeValueOptions = ['<5', '5-10', '>10'];

export interface StimulationObservedEffectFormValues {
    class: string;
    descriptor: string;
    details: string;
}

export const getStimPointLabel = (electrodeLabel: string, stim_point_index: number) => {
    return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
}