export default interface StimulationFormValues {
    electrodes: {
        label: string;
        contacts: {
            index: number;
            location: {
                side: string;
                gyrus: string;
                region: string;
                destrieux: string;
            };
            stimulations: {
                parameters: StimulationsParametersValues;
                effects: StimulationEffectsValues;
            }[]
        }[]
    }[]
};

interface StimulationsParametersValues {
    amplitude: number;
};

interface StimulationEffectsValues {
    category: string;
};