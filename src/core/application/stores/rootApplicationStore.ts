import { StimulationSessionStore } from './stimulationSessionStore';

export class RootApplicationStore {
    stimulationSession = new StimulationSessionStore();
}
