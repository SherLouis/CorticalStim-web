import { StimulationLocation } from '@/core/domain';

import { StimulationSessionStore } from './stimulationSessionStore';
import { StimulationParameters } from '../../domain/stimulation';


test('add electrode and stim point', () => {
    const store = new StimulationSessionStore();
    store.addElectrode('E1');
    expect(store.electrodeCount).toBe(1);
});

test('serialization roundtrip', () => {
    const store = new StimulationSessionStore();
    const values = { patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, ...values }));
    expect(store.session.patientId).toBe('p1')
    expect(store.session.electrodeParameters).toEqual(values.electrodeParameters)
    expect(store.session.electrodes).toEqual(values.electrodes)
});

test('validationErrors computed', () => {
    const store = new StimulationSessionStore();
    expect(store.validationErrors.has('patientId')).toBe(true);
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    expect(store.validationErrors.has('patientId')).toBe(false);
});

test('isDirty and markSaved', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    expect(store.isDirty).toBe(false);
    store.addElectrode('E1');
    expect(store.isDirty).toBe(true);
    store.markSaved();
    expect(store.isDirty).toBe(false);
});

test('canSave computed', () => {
    const store = new StimulationSessionStore();
    expect(store.canSave).toBe(false); // no patientId = validation error
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    expect(store.canSave).toBe(true); // clean, no dirty
    store.addElectrode('E1');
    expect(store.canSave).toBe(true); // dirty but no validation errors
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: '', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    expect(store.canSave).toBe(false); // dirty with validation error
});

test('setDefaultElectrodeConfig sets default config', () => {
    const store = new StimulationSessionStore();
    const cfg = { id: 'cfg1', manufacturer: 'M', model: 'Model', nContacts: 4, diameter: 0.9, separation: 3, length: 2.3 };
    store.session.usedElectrodeConfigs.push(cfg);
    store.setDefaultElectrodeConfig('cfg1');
    expect(store.session.electrodeParameters?.id).toBe('cfg1');
    expect(store.isDirty).toBe(true);
});

test('confirmElectrode', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    expect(store.session.electrodes[0].confirmed).toBe(false);
    store.confirmElectrode(0);
    expect(store.session.electrodes[0].confirmed).toBe(true);
    expect(store.isDirty).toBe(true);
});

test('updateElectrodeLabel', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    store.updateElectrodeLabel(0, 'A2');
    expect(store.session.electrodes[0].label).toBe('A2');
    expect(store.isDirty).toBe(true);
});

test('updateElectrodeSide', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    expect(store.session.electrodes[0].side).toBeUndefined();
    store.updateElectrodeSide(0, 'left');
    expect(store.session.electrodes[0].side).toBe('left');
    store.updateElectrodeSide(0, 'right');
    expect(store.session.electrodes[0].side).toBe('right');
    store.updateElectrodeSide(0, undefined);
    expect(store.session.electrodes[0].side).toBeUndefined();
    expect(store.isDirty).toBe(true);
});


test('updateStimulationPointLocation', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    store.updateStimulationPointLocation(0, 0, { type: 'mni', vep: '', destrieux: '', mni: { x: 10, y: 20, z: 30 }, isWhiteMatter: false, isDone: true } as StimulationLocation);
    const point = store.session.electrodes[0].stimulationPoints[0];
    expect(point.location.type).toBe('mni');
    expect(point.location.mni).toEqual({ x: 10, y: 20, z: 30 });
    expect(point.location.isDone).toBe(true);
    expect(store.isDirty).toBe(true);
});

test('addStimulation', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    store.addElectrode('E1');
    
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
    
    expect(store.session.electrodes[0].stimulationPoints[0].stimulations.length).toBe(1);
    expect(store.session.electrodes[0].stimulationPoints[0].stimulations[0].parameters.amplitude).toBe(2.0);
    expect(store.session.electrodes[0].stimulationPoints[0].stimulations[0].task.category).toBe('language');
    expect(store.isDirty).toBe(true);
});

test('loadFromJson captures snapshot and clears dirty', () => {
    const store = new StimulationSessionStore();
    store.addElectrode('E1');
    expect(store.isDirty).toBe(true);
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    expect(store.isDirty).toBe(false);
    expect(store.lastSavedSnapshot?.patientId).toBe('p1');
    expect(store.electrodeCount).toBe(0);
});

test('toJson includes schemaVersion 2', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    const json = store.toJson();
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.patientId).toBe('p1');
});

test('setElectrodes replaces electrode array and marks dirty', () => {
    const store = new StimulationSessionStore();
    store.loadFromJson(JSON.stringify({ schemaVersion: 2, patientId: 'p1', electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 2, separation: 1, diameter: 2, length: 3 }, electrodes: [] }));
    expect(store.isDirty).toBe(false);
    store.setElectrodes([{ label: 'E1', side: 'left', nContacts: 2, confirmed: false, stimulationPoints: [] }]);
    expect(store.isDirty).toBe(true);
    expect(store.session.electrodes).toEqual([{ label: 'E1', side: 'left', nContacts: 2, confirmed: false, stimulationPoints: [] }]);
});
