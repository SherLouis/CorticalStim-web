import { toStimulationSession, toStimulationFormValues } from './stimulationSessionMapper';

test('roundtrip', () => {
    const values = { patient_id: 'p', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] } as any;
    const session = toStimulationSession(values);
    const back = toStimulationFormValues(session);
    expect(back).toEqual(values);
});
