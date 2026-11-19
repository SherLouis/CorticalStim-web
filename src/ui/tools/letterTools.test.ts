import { letters, increment } from './letterTools';

describe('letterTools', () => {
    test('increment single letter', () => {
        expect(increment('A')).toBe('B');
        expect(increment('B')).toBe('C');
        expect(increment('Y')).toBe('Z');
    });

    test('increment wraps Z to AA', () => {
        expect(increment('Z')).toBe('AA');
    });

    test('increment multi-letter', () => {
        expect(increment('AA')).toBe('AB');
        expect(increment('AZ')).toBe('BA');
        expect(increment('ZZ')).toBe('AAA');
    });

    test('increment case insensitive', () => {
        expect(increment('a')).toBe('B');
        expect(increment('z')).toBe('AA');
    });

    test('letters object export', () => {
        expect(letters.increment('A')).toBe('B');
    });

    test('throws on non-letter', () => {
        expect(() => increment('1')).toThrow('Letters Only');
        expect(() => increment('A1')).toThrow('Letters Only');
    });
});