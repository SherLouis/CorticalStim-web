import {
    StimulationEffects,
    StimulationObservedEffect,
    StimulationParameters,
    StimulationTask,
    Stimulation,
} from '@/core/domain';
import {
    StimulationEffectsValues,
    StimulationObservedEffectFormValues,
    StimulationParametersFormValues,
    StimulationTaskFormValues,
} from '@/ui/core/types';

export const toStimulationParameters = (values: StimulationParametersFormValues): StimulationParameters => {
    return new StimulationParameters({
        amplitude: values.amplitude,
        duration: values.duration,
        frequency: values.frequency,
        lengthPath: values.lengthPath,
    });
};

export const toStimulationTask = (values: StimulationTaskFormValues): StimulationTask => {
    return {
        category: values.category,
        subcategory: values.subcategory,
        characteristic: values.characteristic,
    };
};

export const toStimulationObservedEffect = (values: StimulationObservedEffectFormValues): StimulationObservedEffect => {
    return {
        class: values.class,
        descriptor: values.descriptor,
        details: values.details,
    };
};

export const toStimulationEffects = (values: StimulationEffectsValues): StimulationEffects => {
    return {
        observed_effect: values.observed_effect.map(toStimulationObservedEffect),
        observed_effect_comments: values.observed_effect_comments,
        epi_manifestation: values.epi_manifestation,
        contact_in_epi_zone: values.contact_in_epi_zone,
        contact_in_epi_zone_comments: values.contact_in_epi_zone_comments,
        post_discharge: values.post_discharge,
        pd_duration: values.pd_duration,
        pd_local: values.pd_local,
        pd_type: values.pd_type,
        crisis: values.crisis,
        crisis_comments: values.crisis_comments,
    };
};

export const toStimulation = (
    time: string,
    params: StimulationParametersFormValues,
    task: StimulationTaskFormValues,
    effect: StimulationEffectsValues,
): Stimulation => {
    return {
        time,
        parameters: toStimulationParameters(params),
        task: toStimulationTask(task),
        effect: toStimulationEffects(effect),
    };
};
