export interface StimulationObservedEffect {
    class: string;
    descriptor: string;
    details: string;
}

export interface StimulationEffects {
    observed_effect: StimulationObservedEffect[];
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
