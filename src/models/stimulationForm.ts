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
                type: 'gray'|'vep'|'destrieux'|'mni';
                vep: string;
                destrieux: string;
                mni: {x: number; y: number; z: number};
                done: boolean;
            };
            stimulations: {
                parameters: StimulationsParametersValues;
                effects: StimulationEffectsValues;
            }[]
        }[]
    }[]
};

interface StimulationsParametersValues {
    // TODO: to complete
    amplitude: number;
};

interface StimulationEffectsValues {
    // TODO: to complete
    category: string;
};

export const getStimPointLabel = (electrodeLabel: string, stim_point_index: number) => {
    return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
}