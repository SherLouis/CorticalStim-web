import { getStimPointDisplayLabel, getStimPointLabel } from './utils';

test('getStimPointLabel', () => {
    expect(getStimPointLabel('E1', 0)).toBe('E1/1-2');
    expect(getStimPointLabel('E1', 0, false)).toBe('E1/1');
    expect(getStimPointLabel('E1', 1, true, true)).toBe('E1/2-3');
});

test('getStimPointDisplayLabel', () => {
    expect(getStimPointDisplayLabel('E1/1-2')).toBe('E1/1-2');
});
