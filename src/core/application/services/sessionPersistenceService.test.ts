import { ElectrodeConfig } from '@/core/domain/electrodeConfig';

import { SessionPersistenceService } from './sessionPersistenceService';
import { StimulationSession } from '../../domain/session';

const legacyV1Json = JSON.stringify({
    patient_id: 'legacy-patient',
    electrode_params: { type: 'SEEG', separation: 3, diameter: 0.9, length: 2.3 },
    electrodes: [
        {
            label: 'A',
            side: 'left',
            n_contacts: 4,
            confirmed: true,
            stim_points: [
                {
                    index: 0,
                    location: {
                        type: 'mni',
                        vep: '',
                        destrieux: '',
                        mni: { x: 10, y: 20, z: 30 },
                        white_matter: '',
                        done: false,
                    },
                    stimulations: [
                        {
                            time: '2024-01-01T10:00:00Z',
                            parameters: { amplitude: 2.0, duration: 5, frequency: 50, lenght_path: 300 },
                            task: { category: 'language', subcategory: 'naming', characteristic: 'overt' },
                            effect: {
                                observed_effect: { class: 'motor', descriptor: 'speech arrest', details: '' },
                                observed_effect_comments: '',
                                epi_manifestation: '',
                                contact_in_epi_zone: 'unknown',
                                contact_in_epi_zone_comments: '',
                                post_discharge: false,
                                pd_duration: undefined,
                                pd_local: 'local',
                                pd_type: '',
                                crisis: false,
                                crisis_comments: '',
                            },
                        },
                    ],
                },
            ],
        },
    ],
});

test('load v1 legacy JSON migrates to v2 domain session', () => {
    const session = SessionPersistenceService.load(legacyV1Json) as StimulationSession;

    expect(session.patientId).toBe('legacy-patient');
    expect(session.electrodeParameters?.id).toBe('default');
    expect(session.electrodeParameters?.separation).toBe(3);
    expect(session.electrodeParameters?.diameter).toBe(0.9);
    expect(session.electrodeParameters?.length).toBe(2.3);

    expect(session.usedElectrodeConfigs.length).toBe(1);
    const usedConfig = session.usedElectrodeConfigs[0];
    expect(usedConfig).toEqual({
        id: "SEEG|0.9|3|2.3|4",
        manufacturer: '',
        model: "SEEG",
        nContacts: 4,
        diameter: 0.9,
        separation: 3,
        length: 2.3
    } as ElectrodeConfig)

    expect(session.electrodes.length).toBe(1);
    const electrode = session.electrodes[0];
    expect(electrode.label).toBe('A');
    expect(electrode.side).toBe('left');
    expect(electrode.nContacts).toBe(4);
    expect(electrode.confirmed).toBe(true);

    expect(electrode.stimulationPoints.length).toBe(1);
    const point = electrode.stimulationPoints[0];
    expect(point.index).toBe(0);
    expect(point.location.type).toBe('mni');
    expect(point.location.mni).toEqual({ x: 10, y: 20, z: 30 });
    expect(point.location.isWhiteMatter).toBe(false);
    expect(point.location.isDone).toBe(false);

    expect(point.stimulations.length).toBe(1);
    const stim = point.stimulations[0];
    expect(stim.time).toBe('2024-01-01T10:00:00Z');
    expect(stim.parameters.amplitude).toBe(2.0);
    expect(stim.parameters.duration).toBe(5);
    expect(stim.parameters.frequency).toBe(50);
    expect(stim.parameters.lengthPath).toBe(300); // lenght_path typo migrated
    expect(stim.task.category).toBe('language');
    expect(stim.effect.observed_effect).toEqual([{ class: 'motor', descriptor: 'speech arrest', details: '' }]); // single -> array
    expect(stim.effect.observed_effect_comments).toBe('');
});

test('load v1 legacy JSON with observed_effect already array keeps array', () => {
    const arrayEffectJson = JSON.stringify({
        patient_id: 'p',
        electrode_params: { type: 't', separation: 1, diameter: 2, length: 3 },
        electrodes: [
            {
                label: 'A',
                side: undefined,
                n_contacts: 2,
                confirmed: false,
                stim_points: [
                    {
                        index: 0,
                        location: { type: 'vep', vep: 'frontal', destrieux: '', mni: { x: 0, y: 0, z: 0 }, white_matter: '', done: true },
                        stimulations: [
                            {
                                time: '2024-01-01T10:00:00Z',
                                parameters: { amplitude: 1, duration: 1, frequency: 1, lenght_path: 1 },
                                task: { category: 'c', subcategory: 's', characteristic: 'ch' },
                                effect: {
                                    observed_effect: [{ class: 'a', descriptor: 'b', details: 'c' }],
                                    observed_effect_comments: '',
                                    epi_manifestation: '',
                                    contact_in_epi_zone: '',
                                    contact_in_epi_zone_comments: '',
                                    post_discharge: false,
                                    pd_duration: undefined,
                                    pd_local: '',
                                    pd_type: '',
                                    crisis: false,
                                    crisis_comments: '',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    });

    const session = SessionPersistenceService.load(arrayEffectJson) as StimulationSession;
    const stim = session.electrodes[0].stimulationPoints[0].stimulations[0];
    expect(Array.isArray(stim.effect.observed_effect)).toBe(true);
    expect(stim.effect.observed_effect.length).toBe(1);
});

test('load is idempotent for v2-shaped data without schemaVersion', () => {
    const v2ShapedJson = JSON.stringify({
        patientId: 'p2',
        electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 0, separation: 1, diameter: 2, length: 3 },
        electrodes: [
            {
                label: 'A',
                side: 'right',
                nContacts: 3,
                confirmed: false,
                stimulationPoints: [
                    {
                        index: 0,
                        location: { type: 'white', vep: '', destrieux: '', mni: { x: 0, y: 0, z: 0 }, isWhiteMatter: true, isDone: true },
                        stimulations: [],
                    },
                ],
            },
        ],
    });

    const session = SessionPersistenceService.load(v2ShapedJson) as StimulationSession;
    expect(session.patientId).toBe('p2');
    const electrode = session.electrodes[0];
    expect(electrode.nContacts).toBe(3);
    expect(electrode.side).toBe('right');
    expect(electrode.stimulationPoints[0].location.isWhiteMatter).toBe(true);
    expect(electrode.stimulationPoints[0].location.isDone).toBe(true);
});

test('load v2 JSON with schemaVersion 2 is not migrated', () => {
    const v2Json = JSON.stringify({
        schemaVersion: 2,
        patientId: 'v2-patient',
        electrodeParameters: { id: 't', manufacturer: '', model: 't', nContacts: 0, separation: 1, diameter: 2, length: 3 },
        electrodes: [],
    });

    const session = SessionPersistenceService.load(v2Json) as StimulationSession;
    expect(session.patientId).toBe('v2-patient');
    expect(session.electrodes.length).toBe(0);
});

test('serialize adds schemaVersion 2', () => {
    const session = new StimulationSession();
    session.patientId = 'serialize-patient';
    const json = SessionPersistenceService.serialize(session);
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.patientId).toBe('serialize-patient');
    expect(parsed.electrodes).toEqual([]);
});
