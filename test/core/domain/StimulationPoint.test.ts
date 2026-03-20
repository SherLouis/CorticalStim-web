import { StimulationPoint } from '@/core/domain/StimulationPoint';
import { Stimulation } from '@/core/domain/Stimulation';

describe('StimulationPoint Domain Object', () => {
    it('should initialize correctly with valid parameters', () => {
        const point = new StimulationPoint(1);
        expect(point.index).toBe(1);
        expect(point.location.done).toBe(false);
        expect(point.location.mni.x).toBe(0);
        expect(point.stimulations.length).toBe(0);
    });

    it('should allow updating location', () => {
        const point = new StimulationPoint(0);
        point.updateLocation({ type: 'mni', mni: { x: 10, y: -20, z: 30 }, done: true });

        expect(point.location.type).toBe('mni');
        expect(point.location.mni.x).toBe(10);
        expect(point.location.done).toBe(true);
    });

    it('should allow adding stimulations', () => {
        const point = new StimulationPoint(0);
        const params = { amplitude: 2, duration: 3, frequency: 50, lenght_path: 0 };
        const task = { category: '', subcategory: '', characteristic: '' };
        const effect = {
            observed_effect: { class: '', descriptor: '', details: '' },
            observed_effect_comments: '',
            epi_manifestation: '',
            contact_in_epi_zone: '',
            contact_in_epi_zone_comments: '',
            post_discharge: false,
            pd_duration: undefined,
            pd_local: '',
            pd_type: '',
            crisis: false,
            crisis_comments: ''
        };

        const stim = new Stimulation('2023-10-26T10:00:00Z', params, task, effect);
        point.addStimulation(stim);

        expect(point.stimulations.length).toBe(1);
        expect(point.stimulations[0].parameters.amplitude).toBe(2);
    });
});
