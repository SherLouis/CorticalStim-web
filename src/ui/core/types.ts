export interface StimulationParametersFormValues {
    amplitude: number;
    duration: number;
    frequency: number;
    lengthPath: number;
}

export interface StimulationTaskFormValues {
    category: string;
    subcategory: string;
    characteristic: string;
}

export const POST_DISCHARGE_VALUE_OPTIONS = ['<5', '5-10', '>10'];

export interface StimulationObservedEffectFormValues {
    class: string;
    descriptor: string;
    details: string;
}

export interface StimulationEffectsValues {
    observed_effect: StimulationObservedEffectFormValues[];
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

export interface ElectrodeLocationFormValues {
    type: string;
    vep: string;
    destrieux: string;
    white_matter: string;
    mni_x: number;
    mni_y: number;
    mni_z: number;
}

export interface Result {
    id: string;
    electrode: string;
    pointId: string;
    roi: string;
    stimulation_time: string;
    amplitude: number;
    duration: number;
    frequency: number;
    length_path: number;
    charge_density: number;
    task: string;
    cognitive_effect: string;
    epi_manifestation: string;
    contact_in_epi_zone: string;
    contact_in_epi_zone_comments: string;
    post_discharge: boolean;
    post_discharge_details: string;
    crisis: boolean;
    crisis_comments: string;
}
