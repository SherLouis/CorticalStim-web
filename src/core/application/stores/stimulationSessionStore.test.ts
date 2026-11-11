import { StimulationSessionStore } from './stimulationSessionStore';
import { StimulationParameters } from '../../domain/stimulation';

test('add electrode and stim point', () => {
    const store = new StimulationSessionStore();
    store.addElectrode('E1');
    expect(store.electrodeCount).toBe(1);
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


test('confirmElectrode', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    expect(store.toValues().electrodes[0].confirmed).toBe(false);
    store.confirmElectrode(0);
    expect(store.toValues().electrodes[0].confirmed).toBe(true);
    expect(store.isDirty).toBe(true);
});

test('updateElectrodeLabel', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    store.updateElectrodeLabel(0, 'A2');
    expect(store.toValues().electrodes[0].label).toBe('A2');
    expect(store.isDirty).toBe(true);
});

test('updateElectrodeSide', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    expect(store.toValues().electrodes[0].side).toBeUndefined();
    store.updateElectrodeSide(0, 'left');
    expect(store.toValues().electrodes[0].side).toBe('left');
    store.updateElectrodeSide(0, 'right');
    expect(store.toValues().electrodes[0].side).toBe('right');
    store.updateElectrodeSide(0, undefined);
    expect(store.toValues().electrodes[0].side).toBeUndefined();
    expect(store.isDirty).toBe(true);
});

test('updateElectrodeParams', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.updateElectrodeParams({ separation: 5 });
    const params = store.toValues().electrode_params;
    expect(params.separation).toBe(5);
    expect(params.diameter).toBe(2); // unchanged
    expect(params.length).toBe(3); // unchanged
    expect(store.isDirty).toBe(true);
});

test('setElectrodeContacts creates stimulation points', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    store.setElectrodeContacts(0, 4);
    const electrode = store.toValues().electrodes[0];
    expect(electrode.nContacts).toBe(4);
    expect(electrode.stimulationPoints.length).toBe(3); // nbContacts - 1
    expect(electrode.stimulationPoints[0].index).toBe(0);
    expect(electrode.stimulationPoints[2].index).toBe(2);
    expect(store.isDirty).toBe(true);
});

test('updateStimulationPointLocation', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    store.setElectrodeContacts(0, 3);
    store.updateStimulationPointLocation(0, 0, { type: 'mni', vep: '', destrieux: '', mni: { x: 10, y: 20, z: 30 }, isWhiteMatter: false, isDone: true });
    const point = store.toValues().electrodes[0].stimulationPoints[0];
    expect(point.location.type).toBe('mni');
    expect(point.location.mni).toEqual({ x: 10, y: 20, z: 30 });
    expect(point.location.isDone).toBe(true);
    expect(store.isDirty).toBe(true);
});

test('addStimulation', () => {
    const store = new StimulationSessionStore();
    store.setValues({ patient_id: 'p1', electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 }, electrodes: [] });
    store.addElectrode('E1');
    store.setElectrodeContacts(0, 2);
    
    const stimulation = {
        time: '2024-01-01T10:00:00Z',
        parameters: new StimulationParameters({ amplitude: 2.0, duration: 5, frequency: 50, lengthPath: 300 }),
        task: { category: 'language', subcategory: 'naming', characteristic: 'overt' },
        effect: { 
            observed_effect: [], 
            observed_effect_comments: '', 
            epi_manifestation: '', 
            contact_in_epi_zone: 'unknown', 
            contact_in_epi_zone_comments: '', 
            post_discharge: false, 
            pd_duration: undefined, 
            pd_local: 'local', 
            pd_type: '', 
            crisis: false, 
            crisis_comments: '' 
        }
    };
    
    store.addStimulation(0, 0, stimulation);
    
    const vals = store.toValues();
    expect(vals.electrodes[0].stimulationPoints[0].stimulations.length).toBe(1);
    expect(vals.electrodes[0].stimulationPoints[0].stimulations[0].parameters.amplitude).toBe(2.0);
    expect(vals.electrodes[0].stimulationPoints[0].stimulations[0].task.category).toBe('language');
    expect(store.isDirty).toBe(true);
});
