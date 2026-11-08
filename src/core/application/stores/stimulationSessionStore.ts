import { makeAutoObservable, makeObservable, observable } from 'mobx';
import { StimulationSession, ElectrodeParams } from '../../domain/session';
import { Electrode } from '../../domain/electrode';
import { StimulationLocation, StimulationPoint } from '../../domain/stimulationPoint';
import { Stimulation, StimulationParameters } from '../../domain/stimulation';

/**
 * Shape returned by toValues() - matches legacy StimulationFormValues for JSON compatibility.
 */
export type StimulationSessionValues = ReturnType<StimulationSession['toValues']>;

/**
 * MobX store holding the **persisted** stimulation session state.
 * 
 * This is the single source of truth for:
 * - Patient ID and electrode configuration (electrode_params)
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

    /** True if any mutation occurred since last setValues()/markSaved(). */
    isDirty = false;

    /** Serialized snapshot at last successful save/load for diff comparison. */
    lastSavedSnapshot: StimulationSessionValues | null = null;

    constructor() {
        makeObservable(this.session, {
            patient_id: observable,
            electrode_params: observable,
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
     * Checks: patient_id present, electrode labels unique/non-empty,
     * amplitude/duration > 0 on saved stimulations.
     * Runs reactively via MobX.
     */
    get validationErrors(): Map<string, string> {
        const errors = new Map<string, string>();
        if (!this.session.patient_id) {
            errors.set('patient_id', 'Patient ID is required');
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

    /** Add a new electrode with default empty config. */
    addElectrode(label: string) {
        this.session.electrodes.unshift({ label, side: undefined, nContacts: 0, confirmed: false, stimulationPoints: [] } as Electrode);
        this.markDirty();
    }

    /** Remove electrode by index. */
    removeElectrode(index: number) {
        this.session.electrodes.splice(index, 1);
        this.markDirty();
    }

    /** Update electrode_params (type, separation, diameter, length). */
    updateElectrodeParams(params: { type?: string; separation?: number; diameter?: number; length?: number }) {
        Object.assign(this.session.electrode_params, params);
        this.markDirty();
    }

    // TODO (future): reference electrodes by label instead of index
    /**
     * Configure an electrode's contact count and create corresponding stimulation points.
     * Called when user sets the number of contacts for an electrode.
     * Creates (nbContacts - 1) stimulation points (between adjacent contacts).
     * @param electrodeIndex Index of the electrode
     * @param nbContacts Number of contacts to set for this electrode
     * @returns Void
     */
    setElectrodeContacts(electrodeIndex: number, nbContacts: number) {
        if (electrodeIndex >= this.electrodeCount + 1) return;
        const electrode = this.session.electrodes[electrodeIndex];
        electrode.nContacts = nbContacts;
        electrode.stimulationPoints = [];
        // Stimulation point is between 2 contacts, so nb stimulation points = nb contacts - 1
        for (let i = 0; i < nbContacts - 1; i++) {
            electrode.stimulationPoints.push({
                index: i,
                location: { type: 'vep', vep: '', destrieux: '', mni: { x: 0, y: 0, z: 0 }, isWhiteMatter: false, isDone: false },
                stimulations: []
            } as StimulationPoint);
        }
        this.markDirty();
    }

    /**
     * Mark an electrode as confirmed
     * @param electrodeIndex Index of the electrode 
     * @returns Void
     */
    confirmElectrode(electrodeIndex: number) {
        if (electrodeIndex >= this.electrodeCount + 1) return;
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
        if (electrodeIndex >= this.electrodeCount + 1) return;
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
        if (electrodeIndex >= this.electrodeCount + 1) return;
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
        if (electrodeIndex >= this.electrodeCount + 1) return;
        if (stimPointIndex >= this.session.electrodes[electrodeIndex].stimulationPoints.length + 1) return;
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
        if (electrodeIndex >= this.electrodeCount + 1) return;
        if (stimPointIndex >= this.session.electrodes[electrodeIndex].stimulationPoints.length + 1) return;
        const sp = this.session.electrodes[electrodeIndex].stimulationPoints[stimPointIndex];
        sp.stimulations.push(stimulation);
        this.markDirty();
    }

    /**
     * Load full session from serialized values (e.g. from JSON file or Firebase).
     * Resets dirty flag and captures snapshot for unsaved detection.
     */
    setValues(values: StimulationSessionValues) {
        this.session.patient_id = values.patient_id;
        this.session.electrode_params = Object.assign(new ElectrodeParams(), values.electrode_params);
        // Replace observable array contents instead of replacing the array reference
        const newElectrodes = values.electrodes.map((e) => ({ ...e }));
        this.session.electrodes.splice(0, this.session.electrodes.length, ...newElectrodes);
        this.isDirty = false;
        this.lastSavedSnapshot = this.toValues();
    }

    /** Serialize current session to StimulationSessionValues (JSON-compatible). */
    toValues(): StimulationSessionValues {
        return this.session.toValues();
    }

    /** Call after successful save to backend to clear dirty flag and update snapshot. */
    markSaved() {
        this.isDirty = false;
        this.lastSavedSnapshot = this.toValues();
    }

    /** Internal: mark session as having unsaved changes. */
    private markDirty() {
        this.isDirty = true;
    }
}