import { toDomainSession } from './sessionMapper';
import { StimulationSession } from '../../../core/domain/session';

test('toDomainSession builds domain session from values', () => {
    const values = {
        patientId: 'p1',
        electrodeParameters: { type: 't', separation: 1, diameter: 2, length: 3 },
        electrodes: [],
    };
    const session = toDomainSession(values);
    expect(session instanceof StimulationSession).toBe(true);
    expect(session.patientId).toBe('p1');
    expect(session.electrodeParameters.type).toBe('t');
    expect(session.electrodeParameters.separation).toBe(1);
    expect(session.electrodeParameters.diameter).toBe(2);
    expect(session.electrodeParameters.length).toBe(3);
    expect(session.electrodes).toEqual([]);
});
