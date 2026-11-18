import configs from '@/resources/electrodeConfigs.json';

import { ElectrodeConfig } from '../../domain/electrodeConfig';

export function getElectrodeConfigs(): ElectrodeConfig[] {
    return configs as ElectrodeConfig[];
}
