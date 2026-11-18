import { makeAutoObservable, makeObservable, observable } from 'mobx';

import { Electrode } from '../../domain/electrode';
import { ElectrodeConfig } from '../../domain/electrodeConfig';
import { StimulationSession } from '../../domain/session';
import { Stimulation } from '../../domain/stimulation';
import { StimulationLocation, StimulationPoint } from '../../domain/stimulationPoint';
import { getElectrodeConfigs } from '../services/electrodeConfigCatalog';
import { SessionPersistenceService } from '../services/sessionPersistenceService';

/**
 * Shape of the serializable session values (v2, camelCase) - matches StimulationSession domain shape.
 */
export type StimulationSessionValues = {
    patientId: string;
    electrodeParameters: ElectrodeConfig | undefined;
    usedElectrodeConfigs: ElectrodeConfig[];
    electrodes: Electrode[];
};

/**
 * MobX store holding the **persisted** stimulation session state.
 * 
 * This is the single source of truth for:
 * - Patient ID and electrode configuration (electrodeParameters)
 * - Electrode list with contacts and stimulation points
 * - **Saved** stimulations (parameters, task, effects)
 * 
 * Transient in-progress form state (params_form, task_form, effect_form in t2_Stimulations)
 * stays in local React state and is pushed to this store only on "Save" via addStimulation/updateStimulation.
 * 
 * Key features:
 * - `validationErrors` (computed): business rule violations on persisted data
 * - `isDirty`: true when any mutation occurred since last load/save
 * - `lastSavedSnapshot`: serialized copy for diff/unsaved detection
 * - `canSave`: true iff no validation errors
 */
export class StimulationSessionStore {
    /** The domain aggregate root containing all session data. */
    session: StimulationSession = new StimulationSession();

    /** True if any mutation occurred since last loadFromJson()/markSaved(). */
    isDirty = false;

    /** Serialized snapshot at last successful save/load for diff comparison. */
    lastSavedSnapshot: StimulationSessionValues | null = null;

    /**
     * Make a plain electrode object observable so that mutations to its
     * fields (nContacts, stimulationPoints, etc.) trigger reactions.
     */
    private makeElectrodeObservable(electrode: Electrode): Electrode {
        makeAutoObservable(electrode);
        return electrode;
    }

    constructor() {
        makeObservable(this.session, {
            patientId: observable,
            electrodeParameters: observable,
            usedElectrodeConfigs: observable,
            electrodes: observable,
        });

        makeAutoObservable(this);
    }

    /** Number of electrodes in the session. */
    get electrodeCount() {
        return this.session.electrodes.length;
    }

    /**
     * Computed validation errors for **persisted** session data.
     * Checks: patientId present, electrode labels unique/non-empty,
     * amplitude/duration > 0 on saved stimulations.
     * Runs reactively via MobX.
     */
    get validationErrors(): Map<string, string> {
        const errors = new Map<string, string>();
        if (!this.session.patientId) {
            errors.set('patientId', 'Patient ID is required');
        }
        this.session.electrodes.forEach((electrode, eIdx) => {
            if (!electrode.label) {
                errors.set(`electrodes[${eIdx}].label`, 'Electrode label is required');
            }
            electrode.stimulationPoints.forEach((sp, spIdx) => {
                sp.stimulations.forEach((stim, sIdx) => {
                    if (stim.parameters.amplitude <= 0) {
                        errors.set(`electrodes[${eIdx}].stimPoints[${spIdx}].stimulations[${sIdx}].amplitude`, 'Amplitude must be > 0');
                    }
                    if (stim.parameters.duration <= 0) {
                        errors.set(`electrodes[${eIdx}].stimPoints[${spIdx}].stimulations[${sIdx}].duration`, 'Duration must be > 0');
                    }
                });
            });
        });
        return errors;
    }

    /** True when session can be saved (no business validation errors). */
    get canSave(): boolean {
        return this.validationErrors.size === 0;
    }

    setPatientId(patientId: string) {
        this.session.patientId = patientId;
    }

    /** Add a new electrode with default empty config. */
    addElectrode(label: string) {
        let electrode = { label, side: undefined, configId: undefined, nContacts: 0, confirmed: false, stimulationPoints: [] } as Electrode
        if (this.session.electrodeParameters) {
            this.ensureElectrodeConfig(this.session.electrodeParameters)
            electrode.configId = this.session.electrodeParameters.id;
            const points: StimulationPoint[] = [];
            for (let i = 0; i < this.session.electrodeParameters.nContacts - 1; i++) {
                points.push({
                    index: i,
                    location: { type: 'vep', vep: '', destrieux: '', mni: { x: 0, y: 0, z: 0 }, isWhiteMatter: false, isDone: false },
                    stimulations: []
                });
            }
            electrode.stimulationPoints = points;
        }
        this.session.electrodes.unshift(this.makeElectrodeObservable(electrode));
        this.markDirty();
    }

    /** Remove electrode by index. */
    removeElectrode(index: number) {
        this.session.electrodes.splice(index, 1);
        this.markDirty();
    }

    /**
     * Mark an electrode as confirmed
     * @param electrodeIndex Index of the electrode 
     * @returns Void
     */
    confirmElectrode(electrodeIndex: number) {
        if (electrodeIndex >= this.electrodeCount) return;
        const electrode = this.session.electrodes[electrodeIndex];
        electrode.confirmed = true;
        this.markDirty();
    }

    /**
     * Update an electrode's label
     * @param electrodeIndex Index of the electrode
     * @param label New label for the electrode
     * @returns Void
     */
    updateElectrodeLabel(electrodeIndex: number, label: string) {
        if (electrodeIndex >= this.electrodeCount) return;
        const electrode = this.session.electrodes[electrodeIndex];
        electrode.label = label;
        this.markDirty();
    }

    /**
     * Update an electrode's side (left/right)
     * @param electrodeIndex Index of the electrode
     * @param side New side for the electrode
     * @returns Void
     */
    updateElectrodeSide(electrodeIndex: number, side: 'left' | 'right' | undefined) {
        if (electrodeIndex >= this.electrodeCount) return;
        const electrode = this.session.electrodes[electrodeIndex];
        electrode.side = side;
        this.markDirty();
    }

    /**
     * Update a stimulation point's location (ROI type, VEP, Destrieux, MNI, white matter).
     * @param electrodeIndex Index of the electrode
     * @param stimPointIndex Index of the stimulation point in the electrode
     * @param location New location to set
     * @returns Void
     */
    updateStimulationPointLocation(electrodeIndex: number, stimPointIndex: number, location: StimulationLocation) {
        if (electrodeIndex >= this.electrodeCount) return;
        if (stimPointIndex >= this.session.electrodes[electrodeIndex].stimulationPoints.length) return;
        const sp = this.session.electrodes[electrodeIndex].stimulationPoints[stimPointIndex];
        sp.location = location;
        this.markDirty();
    }

    /**
     * Add a new **saved** stimulation to a stimulation point.
     * Called from UI when user clicks "Save" on the transient stimulation form.
     * @param electrodeIndex Index of the electrode
     * @param stimPointIndex Index of the stimulation point
     * @param stimulation Full stimulation data (time, parameters, task, effect)
     * @returns Void
     */
    addStimulation(electrodeIndex: number, stimPointIndex: number, stimulation: Stimulation) {
        if (electrodeIndex >= this.electrodeCount) return;
        if (stimPointIndex >= this.session.electrodes[electrodeIndex].stimulationPoints.length) return;
        const sp = this.session.electrodes[electrodeIndex].stimulationPoints[stimPointIndex];
        sp.stimulations.push(stimulation);
        this.markDirty();
    }

    /**
     * Load full session from a JSON string (v1 legacy or v2 current).
     * Runs v1->v2 migration when schemaVersion is missing, resets dirty flag
     * and captures snapshot for unsaved detection.
     * @param json Serialized session JSON
     */
    loadFromJson(json: string) {
        const loaded = SessionPersistenceService.load(json);
        this.session.patientId = loaded.patientId;
        this.session.electrodeParameters = loaded.electrodeParameters ? ({ ...loaded.electrodeParameters }) : undefined;
        this.session.usedElectrodeConfigs = (loaded.usedElectrodeConfigs ?? []).map((c) => ({ ...c }));
        this.session.electrodes.splice(0, this.session.electrodes.length,
            ...loaded.electrodes.map((e) => this.makeElectrodeObservable({ ...e } as Electrode)));
        this.isDirty = false;
        this.lastSavedSnapshot = this.session.toValues();
    }

    /** Serialize current session to JSON with schemaVersion: 2. */
    toJson(): string {
        return SessionPersistenceService.serialize(this.session);
    }

    /**
     * Replace the electrode array directly (e.g. after TSV import) and mark dirty.
     * Avoids round-tripping through JSON.
     * @param electrodes New electrode list
     */
    setElectrodes(electrodes: Electrode[]) {
        this.session.electrodes.splice(0, this.session.electrodes.length,
            ...electrodes.map((e) => this.makeElectrodeObservable({ ...e } as Electrode)));
        this.markDirty();
    }

    /** Call after successful save to backend to clear dirty flag and update snapshot. */
    markSaved() {
        this.isDirty = false;
        this.lastSavedSnapshot = this.session.toValues();
    }

    /** Internal: mark session as having unsaved changes. */
    markDirty() {
        this.isDirty = true;
    }

    ensureElectrodeConfig(config: ElectrodeConfig) {
        if (!this.session.usedElectrodeConfigs.find((c) => c.id === config.id)) {
            this.session.usedElectrodeConfigs.push({ ...config });
            this.markDirty();
        }
    }

    setDefaultElectrodeConfig(configId: string) {
        const cfg = this.session.usedElectrodeConfigs.find(c => c.id === configId)
            || getElectrodeConfigs().find(c => c.id === configId);
        if (cfg !== undefined) {
            this.ensureElectrodeConfig(cfg)
            this.session.electrodeParameters = cfg ? { ...cfg } : undefined;
            this.markDirty();
        }
    }

    setElectrodeConfig(index: number, configId: string) {
        const electrode = this.session.electrodes[index];
        if (!electrode) return;
        const cfg = this.session.usedElectrodeConfigs.find((c) => c.id === configId);
        const updated = { ...electrode, configId };
        if (cfg) {
            // reuse logic
            const points: StimulationPoint[] = [];
            for (let i = 0; i < cfg.nContacts - 1; i++) {
                points.push({ index: i, location: { type: 'vep', vep: '', destrieux: '', mni: { x: 0, y: 0, z: 0 }, isWhiteMatter: false, isDone: false }, stimulations: [] });
            }
            (updated as Electrode).nContacts = cfg.nContacts;
            (updated as Electrode).stimulationPoints = points;
        }
        this.session.electrodes[index] = updated as Electrode;
        this.markDirty();
    }
}
