import { StimulationFormValuesV1 } from './v1/schemas';
import { ElectrodeConfig } from '../../domain/electrodeConfig';
import { StimulationSession } from '../../domain/session';
import { StimulationParameters } from '../../domain/stimulation';

type StimulationSessionValues = ReturnType<StimulationSession['toValues']>;

export class SessionPersistenceService {
    static CURRENT_VERSION = 2;

    static load(json: string): StimulationSession {
        const raw = JSON.parse(json);
        const session = new StimulationSession();
        if (raw.schemaVersion === this.CURRENT_VERSION || SessionPersistenceService.isV2Shaped(raw)) {
            this.applyV2Values(session, raw as unknown as StimulationSessionValues);
        } else {
            const migrated = this.migrateV1ToV2(raw as StimulationFormValuesV1);
            this.applyV2Values(session, migrated);
        }
        return session;
    }

    static serialize(session: StimulationSession): string {
        return JSON.stringify({ schemaVersion: this.CURRENT_VERSION, ...session.toValues() });
    }

    private static isV2Shaped(raw: unknown): boolean {
        if (!raw || typeof raw !== 'object') return false;
        const data = raw as Record<string, unknown>;
        const electrodes = data.electrodes;
        if (!Array.isArray(electrodes) || electrodes.length === 0) return false;
        const first = electrodes[0] as Record<string, unknown>;
        return 'nContacts' in first || 'stimulationPoints' in first;
    }

    private static applyV2Values(session: StimulationSession, values: StimulationSessionValues) {
        session.patientId = values.patientId;
        session.electrodeParameters = values.electrodeParameters ? ({ ...values.electrodeParameters } as ElectrodeConfig) : undefined;
        session.usedElectrodeConfigs = (values.usedElectrodeConfigs ?? []).map((c) => ({ ...c }));
        session.electrodes.splice(0, session.electrodes.length, ...values.electrodes);
    }

    private static migrateV1ToV2(data: StimulationFormValuesV1): StimulationSessionValues {
        const electrodeParameters = {
            id: 'default',
            manufacturer: '',
            model: data.electrode_params.type,
            nContacts: 0,
            separation: data.electrode_params.separation,
            diameter: data.electrode_params.diameter,
            length: data.electrode_params.length,
        };
        const usedConfigs: ElectrodeConfig[] = [];
        const configIdFor = (nContacts: number) => {
            const id = `${electrodeParameters.model}|${electrodeParameters.diameter}|${electrodeParameters.separation}|${electrodeParameters.length}|${nContacts}`;
            if (!usedConfigs.find((c) => c.id === id)) {
                usedConfigs.push({
                    id,
                    manufacturer: '',
                    model: electrodeParameters.model || 'Electrode',
                    nContacts,
                    diameter: electrodeParameters.diameter,
                    separation: electrodeParameters.separation,
                    length: electrodeParameters.length,
                });
            }
            return id;
        };

        const electrodes = (data.electrodes ?? []).map((e) => ({
            label: e.label,
            side: e.side,
            configId: configIdFor(e.n_contacts ?? 0),
            confirmed: e.confirmed,
            stimulationPoints: (e.stim_points ?? []).map((sp) => {
                const loc = sp.location;
                return {
                    index: sp.index,
                    location: {
                        type: loc.type,
                        vep: loc.vep,
                        destrieux: loc.destrieux,
                        mni: loc.mni ?? { x: 0, y: 0, z: 0 },
                        isWhiteMatter: loc.type === 'white',
                        isDone: loc.done,
                    },
                    stimulations: (sp.stimulations ?? []).map((stim) => ({
                        time: stim.time,
                        parameters: new StimulationParameters({
                            amplitude: stim.parameters.amplitude,
                            duration: stim.parameters.duration,
                            frequency: stim.parameters.frequency,
                            lengthPath: stim.parameters.lenght_path,
                        }),
                        task: {
                            category: stim.task.category,
                            subcategory: stim.task.subcategory,
                            characteristic: stim.task.characteristic,
                        },
                        effect: {
                            observed_effect: Array.isArray(stim.effect.observed_effect)
                                ? stim.effect.observed_effect
                                : [stim.effect.observed_effect],
                            observed_effect_comments: stim.effect.observed_effect_comments,
                            epi_manifestation: stim.effect.epi_manifestation,
                            contact_in_epi_zone: stim.effect.contact_in_epi_zone,
                            contact_in_epi_zone_comments: stim.effect.contact_in_epi_zone_comments,
                            post_discharge: stim.effect.post_discharge,
                            pd_duration: stim.effect.pd_duration,
                            pd_local: stim.effect.pd_local,
                            pd_type: stim.effect.pd_type,
                            crisis: stim.effect.crisis,
                            crisis_comments: stim.effect.crisis_comments,
                        },
                    })),
                };
            }),
        }));
        return {
            patientId: data.patient_id,
            electrodeParameters,
            usedElectrodeConfigs: usedConfigs,
            electrodes,
        };
    }
}
