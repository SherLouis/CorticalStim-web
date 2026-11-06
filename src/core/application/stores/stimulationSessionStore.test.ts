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

test('validationErrors computed', () => {
    const store = new StimulationSessionStore();
    expect(store.validationErrors.has('patient_id')).toBe(true);
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    expect(store.validationErrors.has('patient_id')).toBe(false);
});

test('isDirty and markSaved', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    expect(store.isDirty).toBe(false);
    store.addElectrode('E1');
    expect(store.isDirty).toBe(true);
    store.markSaved();
    expect(store.isDirty).toBe(false);
});

test('canSave computed', () => {
    const store = new StimulationSessionStore();
    expect(store.canSave).toBe(false); // no patient_id = validation error
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    expect(store.canSave).toBe(true); // clean, no dirty
    store.addElectrode('E1');
    expect(store.canSave).toBe(true); // dirty but no validation errors
    store.setValues({ patient_id: '', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    expect(store.canSave).toBe(false); // dirty with validation error
});

test('addStimulation', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    store.addStimulationPoint(0);
    store.addStimulation(0, 0);
    const vals = store.toValues();
    expect(vals.electrodes[0].stimulationPoints[0].stimulations.length).toBe(1);
});