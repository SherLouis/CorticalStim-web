import StimulationFormValues from '../../models/stimulationForm';
import { StimulationSession } from '../../domain/session';
import { Electrode } from '../../domain/electrode';
import { StimulationPoint as DomainStimulationPoint, StimulationLocation as DomainStimulationLocation } from '../../domain/stimulationPoint';
import { StimulationPoint as LegacyStimulationPoint, StimulationLocationFormValues } from '../../models/stimulationForm';
import { Stimulation as DomainStimulation } from '../../domain/stimulation';
import { Stimulation as LegacyStimulation } from '../../models/stimulationForm';

function toDomainStimulationPoint(p: LegacyStimulationPoint): DomainStimulationPoint {
    return {
        index: p.index,
        location: {
            type: p.location.type,
            vep: p.location.vep,
            destrieux: p.location.destrieux,
            mni: p.location.mni,
            isWhiteMatter: p.location.white_matter !== '',
            isDone: p.location.done,
        },
        stimulations: p.stimulations.map(toDomainStimulation),
    };
}

function toLegacyStimulationPoint(p: DomainStimulationPoint): LegacyStimulationPoint {
    return {
        index: p.index,
        location: {
            type: p.location.type,
            vep: p.location.vep,
            destrieux: p.location.destrieux,
            mni: p.location.mni,
            white_matter: p.location.isWhiteMatter ? 'white' : '',
            done: p.location.isDone,
        },
        stimulations: p.stimulations.map(toLegacyStimulation),
    };
}

function toDomainStimulation(s: LegacyStimulation): DomainStimulation {
    return {
        time: s.time,
        parameters: {
            amplitude: s.parameters.amplitude,
            duration: s.parameters.duration,
            frequency: s.parameters.frequency,
            lengthPath: s.parameters.lenght_path,
        },
        task: s.task,
        effect: s.effect,
    } as unknown as DomainStimulation;
}

function toLegacyStimulation(s: DomainStimulation): LegacyStimulation {
    return {
        time: s.time,
        parameters: {
            amplitude: s.parameters.amplitude,
            duration: s.parameters.duration,
            frequency: s.parameters.frequency,
            lenght_path: s.parameters.lengthPath,
        },
        task: s.task,
        effect: s.effect,
    };
}

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
        stimulationPoints: e.stim_points.map(toDomainStimulationPoint),
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
            stim_points: e.stimulationPoints.map(toLegacyStimulationPoint),
        })) as unknown as StimulationFormValues['electrodes'],
    };
}
