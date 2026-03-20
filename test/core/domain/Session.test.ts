import { Session } from '@/core/domain/Session';
import { Electrode } from '@/core/domain/Electrode';

describe('Session Domain Object', () => {
    it('initializes with default values', () => {
        const session = new Session("P123");
        expect(session.patient_id).toBe("P123");
        expect(session.electrodes.length).toBe(0);
        expect(session.electrode_params.type).toBe("");
    });

    it('validates params correctly', () => {
        const session = new Session("P123");
        session.updateElectrodeParams({ separation: 0, diameter: 2, length: 0 });
        const errors = session.validateParams();
        expect(errors.separation).toBe("SEPARATION_REQUIRED");
        expect(errors.diameter).toBeUndefined();
        expect(errors.length).toBe("LENGTH_REQUIRED");
    });

    it('validates electrodes correctly and catches missing sides and duplicate labels', () => {
        const session = new Session("P123");
        const e1 = new Electrode("A");
        e1.side = "left";
        const e2 = new Electrode("A"); // Duplicate label, no side
        const e3 = new Electrode("B");
        e3.side = "right";
        
        session.addElectrode(e1);
        session.addElectrode(e2);
        session.addElectrode(e3);

        const errors = session.validateElectrodes();
        
        expect(errors[0]).toBeUndefined(); // e1 is valid
        // e2 is missing a side AND has a duplicate label
        expect(errors[1].side).toBe("SIDE_REQUIRED"); 
        expect(errors[1].label).toBe("LABEL_DUPLICATED");
        expect(errors[2]).toBeUndefined(); // e3 is valid
    });

    it('removes electrodes by label', () => {
        const session = new Session("P123");
        session.addElectrode(new Electrode("A"));
        expect(session.electrodes.length).toBe(1);
        session.removeElectrode("A");
        expect(session.electrodes.length).toBe(0);
    });
});
