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
                vep: string;
                destrieux: string;
                mni: {x: number; y: number; z: number};
                is_gray: boolean;
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