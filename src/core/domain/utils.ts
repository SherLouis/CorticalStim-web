export const getStimPointLabel = (electrodeLabel: string, stim_point_index: number, showDerivation: boolean = true, forDisplay: boolean = false) => {
    if (forDisplay) {
        return `${electrodeLabel}/${stim_point_index + 1}-${stim_point_index + 2}`;
    }
    return `${electrodeLabel}/${stim_point_index + 1}${showDerivation ? '-' + (stim_point_index + 2) : ''}`;
};

export const getStimPointDisplayLabel = (pointId: string) => {
    const parts = pointId.split('/');
    if (parts.length < 2) return pointId;
    const electrodeLabel = parts.slice(0, -1).join('/');
    const indexStr = parts[parts.length - 1].split('-')[0];
    const index = parseInt(indexStr) - 1;
    if (isNaN(index)) return pointId;
    return getStimPointLabel(electrodeLabel, index, false, true);
};

export const computeChargeDensity = (amplitude_mA: number, length_path_us: number) => {
    return ((amplitude_mA * length_path_us) / 50);
};

