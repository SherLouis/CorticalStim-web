export default interface StimulationFormValues {
    patient_id: string;
    electrode_params: {
        type: string;
        separation: number;
        diameter: number;
        length: number;
    },
    electrodes: ElectrodeFormValues[]
};

export interface StimulationPoint {
    index: number;
    location: StimulationLocationFormValues;
    stimulations: Stimulation[]
}

export interface ElectrodeFormValues {
    label: string;
    side: SideOptions | undefined;
    n_contacts: number;
    confirmed: boolean;
    stim_points: StimulationPoint[];
}

export type SideOptions = 'left' | 'right';

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

export const getStimPointLabel = (electrodeLabel: string, stim_point_index: number, showDerivation: boolean = true, forDisplay: boolean = false) => {
    if (forDisplay) {
        return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
    }
    return `${electrodeLabel}/${stim_point_index + 1}${showDerivation ? '-' + (stim_point_index + 2) : ''}`;
}

export const getStimPointDisplayLabel = (pointId: string) => {
    const parts = pointId.split('/');
    if (parts.length < 2) return pointId;
    const electrodeLabel = parts.slice(0, -1).join('/');
    const indexStr = parts[parts.length - 1].split('-')[0];
    const index = parseInt(indexStr) - 1;
    if (isNaN(index)) return pointId;
    return getStimPointLabel(electrodeLabel, index, false, true);
}

export const computeChargeDensity = (amplitude_mA: number, lenght_path_us: number) => {
    // Amplitude is in mA and length_path is in us. 
    return ((amplitude_mA * lenght_path_us) / 50); // Division by 0.05 cm^2 contact surface area for 5mm diameter electrodes.
}