import { StimulationPoint, LocationData } from "./StimulationPoint";

export class Electrode {
    label: string;
    side: 'left' | 'right' | undefined;
    n_contacts: number;
    confirmed: boolean;
    stim_points: StimulationPoint[];

    constructor(
        label: string,
        side: 'left' | 'right' | undefined = undefined,
        n_contacts: number = 0,
        confirmed: boolean = false,
        stim_points: StimulationPoint[] = []
    ) {
        this.label = label;
        this.side = side;
        this.n_contacts = n_contacts;
        this.confirmed = confirmed;
        this.stim_points = stim_points;

        if (this.stim_points.length === 0 && n_contacts > 0) {
            this.setContactsCount(n_contacts);
        }
    }

    setContactsCount(count: number) {
        this.n_contacts = count;
        // Typically stimulations happen between adjacent contacts, so there are (count - 1) points
        this.stim_points = Array.from({ length: Math.max(0, count - 1) }, (_, i) => new StimulationPoint(i));
    }

    confirm() {
        if (!this.side) throw new Error("Side must be set before confirming.");
        this.confirmed = true;
    }

    validate(): string | null {
        if (!this.side) return "SIDE_REQUIRED";
        return null;
    }

    addStimulationPoint(point: StimulationPoint) {
        this.stim_points.push(point);
    }

    updateStimulationPoint(index: number, location: Partial<LocationData>) {
        const point = this.stim_points.find(p => p.index === index);
        if (point) {
            point.updateLocation(location);
        }
    }
}
