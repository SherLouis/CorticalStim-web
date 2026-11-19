import { toStimulationParameters, toStimulationTask, toStimulationObservedEffect, toStimulationEffects, toStimulation } from './stimulationMapper';
import { StimulationParametersFormValues, StimulationTaskFormValues, StimulationEffectsValues, StimulationObservedEffectFormValues } from '../../core/types';

const paramsValues: StimulationParametersFormValues = { amplitude: 2.0, duration: 5, frequency: 50, lengthPath: 300 };
const taskValues: StimulationTaskFormValues = { category: 'language', subcategory: 'naming', characteristic: 'overt' };
const observedEffectValues: StimulationObservedEffectFormValues = { class: 'motor', descriptor: 'speech arrest', details: '' };
const effectValues: StimulationEffectsValues = {
    observed_effect: [observedEffectValues],
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
};

test('toStimulationParameters maps form values to domain', () => {
    const params = toStimulationParameters(paramsValues);
    expect(params.amplitude).toBe(2.0);
    expect(params.duration).toBe(5);
    expect(params.frequency).toBe(50);
    expect(params.lengthPath).toBe(300);
});

test('toStimulationTask maps form values to domain', () => {
    const task = toStimulationTask(taskValues);
    expect(task.category).toBe('language');
    expect(task.subcategory).toBe('naming');
    expect(task.characteristic).toBe('overt');
});

test('toStimulationObservedEffect maps form values to domain', () => {
    const effect = toStimulationObservedEffect(observedEffectValues);
    expect(effect.class).toBe('motor');
    expect(effect.descriptor).toBe('speech arrest');
    expect(effect.details).toBe('');
});

test('toStimulationEffects maps form values to domain', () => {
    const effects = toStimulationEffects(effectValues);
    expect(effects.observed_effect).toEqual([{ class: 'motor', descriptor: 'speech arrest', details: '' }]);
    expect(effects.epi_manifestation).toBe('');
    expect(effects.post_discharge).toBe(false);
});

test('toStimulation builds full domain stimulation', () => {
    const stim = toStimulation('2024-01-01T10:00:00Z', paramsValues, taskValues, effectValues);
    expect(stim.time).toBe('2024-01-01T10:00:00Z');
    expect(stim.parameters.amplitude).toBe(2.0);
    expect(stim.task.category).toBe('language');
    expect(stim.effect.observed_effect.length).toBe(1);
});
