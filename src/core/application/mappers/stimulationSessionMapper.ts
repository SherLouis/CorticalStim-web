import StimulationFormValues from '../../models/stimulationForm';
import { StimulationSession } from '../../domain/session';
import { Electrode } from '../../domain/electrode';

export function toStimulationSession(values: StimulationFormValues): StimulationSession {
    const session = new StimulationSession();
    session.patient_id = values.patient_id;
    session.electrode_params.type = values.electrode_params.type;
    session.electrode_params.separation = values.electrode_params.separation;
    session.electrode_params.diameter = values.electrode_params.diameter;
    session.electrode_params.length = values.electrode_params.length;
    session.electrodes = values.electrodes.map((e) => ({
        label: e.label,
        side: e.side,
        nContacts: e.n_contacts,
        confirmed: e.confirmed,
        stimulationPoints: e.stim_points,
    })) as unknown as Electrode[];
    return session;
}

export function toStimulationFormValues(session: StimulationSession): StimulationFormValues {
    return {
        patient_id: session.patient_id,
        electrode_params: {
            type: session.electrode_params.type,
            separation: session.electrode_params.separation,
            diameter: session.electrode_params.diameter,
            length: session.electrode_params.length,
        },
        electrodes: session.electrodes.map((e: Electrode) => ({
            label: e.label,
            side: e.side,
            n_contacts: e.nContacts,
            confirmed: e.confirmed,
            stim_points: e.stimulationPoints,
        })) as unknown as StimulationFormValues['electrodes'],
    };
}
