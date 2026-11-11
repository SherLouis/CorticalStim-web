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
