import { Electrode } from '../../../src/core/domain/Electrode';

describe('Electrode Domain Object', () => {
    it('initializes with default values when only label is provided', () => {
        const electrode = new Electrode("A");
        expect(electrode.label).toBe("A");
        expect(electrode.side).toBeUndefined();
        expect(electrode.n_contacts).toBe(0);
        expect(electrode.confirmed).toBe(false);
        expect(electrode.stim_points.length).toBe(0);
    });

    it('creates appropriate number of stimulation points based on contacts count', () => {
        const electrode = new Electrode("B", 'left', 5);
        expect(electrode.n_contacts).toBe(5);
        expect(electrode.stim_points.length).toBe(4);
        expect(electrode.stim_points[0].index).toBe(0);
        expect(electrode.stim_points[3].index).toBe(3);
    });

    it('requires a side to be confirmed safely', () => {
        const electrode = new Electrode("C");
        expect(() => electrode.confirm()).toThrow("Side must be set before confirming.");
        electrode.side = "right";
        expect(() => electrode.confirm()).not.toThrow();
        expect(electrode.confirmed).toBe(true);
    });

    it('validates side presence', () => {
        const electrode = new Electrode("D");
        expect(electrode.validate()).toBe("SIDE_REQUIRED");
        electrode.side = "left";
        expect(electrode.validate()).toBeNull();
    });
});
