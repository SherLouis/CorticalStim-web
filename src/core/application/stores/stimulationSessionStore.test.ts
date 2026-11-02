import { StimulationSessionStore } from './stimulationSessionStore';

test('serialization roundtrip', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    const v = store.toValues();
    expect(v.patient_id).toBe('p1');
    const store2 = new StimulationSessionStore();
    store2.setValues(v);
    expect(store2.toValues()).toEqual(v);
});
