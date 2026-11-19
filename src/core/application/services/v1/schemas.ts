export interface StimulationObservedEffectV1 {
    class: string;
    descriptor: string;
    details: string;
}

export interface StimulationParametersV1 {
    amplitude: number;
    duration: number;
    frequency: number;
    lenght_path: number;
}

export interface ElectrodeParamsV1 {
    type: string;
    separation: number;
    diameter: number;
    length: number;
}

export interface StimulationTaskV1 {
    category: string;
    subcategory: string;
    characteristic: string;
}

export interface StimulationLocationV1 {
    type: 'white' | 'vep' | 'destrieux' | 'mni';
    vep: string;
    destrieux: string;
    mni: { x: number; y: number; z: number };
    white_matter: string;
    done: boolean;
}

export interface StimulationEffectsV1 {
    observed_effect: StimulationObservedEffectV1 | StimulationObservedEffectV1[];
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

export interface StimulationV1 {
    time: string;
    parameters: StimulationParametersV1;
    task: StimulationTaskV1;
    effect: StimulationEffectsV1;
}

export interface StimulationPointV1 {
    index: number;
    location: StimulationLocationV1;
    stimulations: StimulationV1[];
}

export interface ElectrodeFormValuesV1 {
    label: string;
    side: 'left' | 'right' | undefined;
    n_contacts: number;
    confirmed: boolean;
    stim_points: StimulationPointV1[];
}

export interface StimulationFormValuesV1 {
    patient_id: string;
    electrode_params: ElectrodeParamsV1;
    electrodes: ElectrodeFormValuesV1[];
}
