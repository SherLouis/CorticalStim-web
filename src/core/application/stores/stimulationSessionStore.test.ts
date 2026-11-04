import { StimulationSessionStore } from './stimulationSessionStore';

test('add electrode and stim point', () => {
    const store = new StimulationSessionStore();
    store.addElectrode('E1');
    expect(store.electrodeCount).toBe(1);
    store.addStimulationPoint(0);
    expect((store.toValues().electrodes[0] as any).stimulationPoints.length).toBe(1);
});

test('serialization roundtrip', () => {
    const store = new StimulationSessionStore();
    const values = { patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] }
    store.setValues(values);
    const v = store.toValues();
    expect(v).toEqual(values)
    expect(v.patient_id).toBe('p1')
});
