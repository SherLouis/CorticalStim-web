import { Stimulation } from '../../../src/core/domain/Stimulation';

describe('Stimulation Domain Object', () => {
    it('should initialize correctly with valid parameters', () => {
        const time = '2023-10-26T10:00:00Z';
        const params = { amplitude: 2, duration: 3, frequency: 50, lenght_path: 0 };
        const task = { category: 'Motor', subcategory: 'Finger', characteristic: 'Tapping' };
        const effect = {
            observed_effect: { class: '', descriptor: '', details: '' },
            observed_effect_comments: '',
            epi_manifestation: '',
            contact_in_epi_zone: '',
            contact_in_epi_zone_comments: '',
            post_discharge: true,
            pd_duration: '5-10',
            pd_local: 'local',
            pd_type: '',
            crisis: false,
            crisis_comments: ''
        };

        const stim = new Stimulation(time, params, task, effect);

        expect(stim.time).toBe(time);
        expect(stim.parameters.amplitude).toBe(2);
        expect(stim.task.category).toBe('Motor');
        expect(stim.effect.post_discharge).toBe(true);
        expect(stim.effect.pd_duration).toBe('5-10');
    });

    it('should allow updating parameters and effects', () => {
        const time = '2023-10-26T10:00:00Z';
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

        const stim = new Stimulation(time, params, task, effect);

        stim.updateParameters({ amplitude: 5 });
        stim.updateEffect({ post_discharge: true, pd_duration: '<5' });

        expect(stim.parameters.amplitude).toBe(5);
        expect(stim.parameters.duration).toBe(3);
        expect(stim.effect.post_discharge).toBe(true);
        expect(stim.effect.pd_duration).toBe('<5');
    });
});
