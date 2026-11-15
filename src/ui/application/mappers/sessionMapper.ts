import { StimulationSessionValues } from '@/core/application/stores/stimulationSessionStore';
import { ElectrodeParams, StimulationSession } from '@/core/domain/session';

export const toDomainSession = (values: StimulationSessionValues): StimulationSession => {
    const session = new StimulationSession();
    session.patientId = values.patientId;
    session.electrodeParameters = Object.assign(new ElectrodeParams(), values.electrodeParameters);
    session.electrodes = [...values.electrodes];
    return session;
};
