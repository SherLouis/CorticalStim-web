import { toStimulationLocation } from './stimulationPointMapper';
import { ElectrodeLocationFormValues } from '../../core/types';

test('toStimulationLocation maps form values to domain', () => {
    const values: ElectrodeLocationFormValues = {
        type: 'mni',
        vep: '',
        destrieux: '',
        white_matter: '',
        mni_x: 10,
        mni_y: 20,
        mni_z: 30,
    };
    const loc = toStimulationLocation(values);
    expect(loc.type).toBe('mni');
    expect(loc.mni).toEqual({ x: 10, y: 20, z: 30 });
    expect(loc.isWhiteMatter).toBe(false);
    expect(loc.isDone).toBe(true);
});

test('white matter type sets isWhiteMatter true', () => {
    const values: ElectrodeLocationFormValues = {
        type: 'white',
        vep: '',
        destrieux: '',
        white_matter: 'AC',
        mni_x: 0,
        mni_y: 0,
        mni_z: 0,
    };
    const loc = toStimulationLocation(values);
    expect(loc.isWhiteMatter).toBe(true);
});
