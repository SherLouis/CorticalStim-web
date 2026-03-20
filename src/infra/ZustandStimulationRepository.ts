import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StimulationRepository } from '../core/domain/repositories/StimulationRepository';
import { Session } from '../core/domain/Session';
import { Electrode } from '../core/domain/Electrode';
import { StimulationPoint, LocationData } from '../core/domain/StimulationPoint';
import { Stimulation } from '../core/domain/Stimulation';
import { immerable } from 'immer';

// Inform immer that our Domain classes can be drafted
(Session.prototype as any)[immerable] = true;
(Electrode.prototype as any)[immerable] = true;
(StimulationPoint.prototype as any)[immerable] = true;
(Stimulation.prototype as any)[immerable] = true;

interface StimulationStoreState {
    session: Session;
}

export const useStimulationStore = create<StimulationStoreState & Omit<StimulationRepository, 'getSession'>>()(immer((set) => ({
    session: new Session(),

    loadSession: (session: Session) => set((state) => {
        state.session = session;
    }),

    setPatientId: (id: string) => set((state) => {
        state.session.patient_id = id;
    }),

    updateElectrodeParams: (params: Partial<Session['electrode_params']>) => set((state) => {
        state.session.electrode_params = {
            ...state.session.electrode_params,
            ...params
        };
    }),

    addElectrode: (electrode: Electrode) => set((state) => {
        state.session.electrodes.push(electrode);
    }),

    removeElectrode: (label: string) => set((state) => {
        state.session.electrodes = state.session.electrodes.filter(e => e.label !== label);
    }),

    setElectrodeContacts: (label: string, count: number) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === label);
        if (electrode) {
            electrode.n_contacts = count;
            electrode.setContactsCount(count); 
        }
    }),

    updateElectrodeLabel: (oldLabel: string, newLabel: string) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === oldLabel);
        if (electrode) electrode.label = newLabel;
    }),

    updateElectrodeSide: (label: string, side: 'left' | 'right' | undefined) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === label);
        if (electrode) electrode.side = side;
    }),

    confirmElectrode: (label: string) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === label);
        if (electrode) electrode.confirmed = true;
    }),

    updateStimulationPointLocation: (electrodeLabel: string, pointIndex: number, location: Partial<LocationData>) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === electrodeLabel);
        if (electrode) {
            const point = electrode.stim_points.find(p => p.index === pointIndex);
            if (point) {
                Object.assign(point.location, location);
            }
        }
    }),

    addStimulation: (electrodeLabel: string, pointIndex: number, stimulation: Stimulation) => set((state) => {
        const electrode = state.session.electrodes.find(e => e.label === electrodeLabel);
        if (electrode) {
            const point = electrode.stim_points.find(p => p.index === pointIndex);
            if (point) {
                point.stimulations.push(stimulation);
            }
        }
    })
})));

export const useStimulationRepository = (): StimulationRepository => {
    const store = useStimulationStore();
    return {
        getSession: () => store.session,
        loadSession: store.loadSession,
        setPatientId: store.setPatientId,
        updateElectrodeParams: store.updateElectrodeParams,
        addElectrode: store.addElectrode,
        removeElectrode: store.removeElectrode,
        setElectrodeContacts: store.setElectrodeContacts,
        updateElectrodeLabel: store.updateElectrodeLabel,
        updateElectrodeSide: store.updateElectrodeSide,
        confirmElectrode: store.confirmElectrode,
        updateStimulationPointLocation: store.updateStimulationPointLocation,
        addStimulation: store.addStimulation
    };
};
