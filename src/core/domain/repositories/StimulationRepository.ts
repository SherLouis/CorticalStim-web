import { Session } from '../Session';
import { Electrode } from '../Electrode';
import { Stimulation } from '../Stimulation';
import { LocationData } from '../StimulationPoint';

export interface StimulationRepository {
    // State Access
    getSession(): Session;

    // Mutators
    loadSession(session: Session): void;
    setPatientId(id: string): void;
    updateElectrodeParams(params: Partial<Session['electrode_params']>): void;
    addElectrode(electrode: Electrode): void;
    removeElectrode(label: string): void;
    setElectrodeContacts(label: string, count: number): void;
    updateElectrodeLabel(oldLabel: string, newLabel: string): void;
    updateElectrodeSide(label: string, side: 'left' | 'right' | undefined): void;
    confirmElectrode(label: string): void;
    updateStimulationPointLocation(electrodeLabel: string, pointIndex: number, location: Partial<LocationData>): void;
    addStimulation(electrodeLabel: string, pointIndex: number, stimulation: Stimulation): void;
}
