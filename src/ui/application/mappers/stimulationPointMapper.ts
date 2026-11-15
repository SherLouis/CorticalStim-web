import { StimulationLocation } from '@/core/domain/stimulationPoint';
import { ElectrodeLocationFormValues } from '@/ui/core/types';

export const toStimulationLocation = (values: ElectrodeLocationFormValues): StimulationLocation => {
    return {
        type: values.type as StimulationLocation['type'],
        vep: values.vep,
        destrieux: values.destrieux,
        mni: { x: values.mni_x, y: values.mni_y, z: values.mni_z },
        isWhiteMatter: values.type === 'white',
        isDone: true,
    };
};
