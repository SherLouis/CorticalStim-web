import { Electrode } from "./Electrode";
import { StimulationPoint } from "./StimulationPoint";

export interface ElectrodeParams {
    type: string;
    separation: number;
    diameter: number;
    length: number;
}

export class Session {
    id: string; 
    patient_id: string;
    electrode_params: ElectrodeParams;
    electrodes: Electrode[];

    constructor(patient_id: string = "", electrode_params?: ElectrodeParams, electrodes: Electrode[] = []) {
        this.id = Date.now().toString();
        this.patient_id = patient_id;
        this.electrode_params = electrode_params || {
            type: "",
            separation: 0,
            diameter: 0,
            length: 0
        };
        this.electrodes = electrodes;
    }

    setPatientId(id: string) {
        this.patient_id = id;
    }

    updateElectrodeParams(params: Partial<ElectrodeParams>) {
        this.electrode_params = { ...this.electrode_params, ...params };
    }

    validateParams(): Record<string, string> {
        const errors: Record<string, string> = {};
        if (this.electrode_params.separation === 0) errors.separation = "SEPARATION_REQUIRED";
        if (this.electrode_params.diameter === 0) errors.diameter = "DIAMETER_REQUIRED";
        if (this.electrode_params.length === 0) errors.length = "LENGTH_REQUIRED";
        return errors;
    }
    
    validateElectrodes(): Record<number, Record<string, string>> {
        const errors: Record<number, Record<string, string>> = {};
        const labels = new Set<string>();
        
        this.electrodes.forEach((e, idx) => {
            const eErrors: Record<string, string> = {};
            if (!e.side) eErrors.side = "SIDE_REQUIRED";
            if (labels.has(e.label)) eErrors.label = "LABEL_DUPLICATED";
            labels.add(e.label);
            
            if (Object.keys(eErrors).length > 0) {
                errors[idx] = eErrors;
            }
        });
        
        return errors;
    }

    addElectrode(electrode: Electrode) {
        this.electrodes.push(electrode);
    }

    removeElectrode(label: string) {
        this.electrodes = this.electrodes.filter(e => e.label !== label);
    }

    getElectrodeByLabel(label: string): Electrode | undefined {
        return this.electrodes.find(e => e.label === label);
    }

    /**
     * Rehydrates a Session from a JSON object (for importing / loading state)
     */
    static fromJSON(data: any): Session {
        const electrodes = (data.electrodes || []).map((eData: any) => {
            const stim_points = (eData.stim_points || []).map((spData: any) => {
                return new StimulationPoint(spData.index, spData.location, spData.stimulations || []);
            });
            return new Electrode(eData.label, eData.side, eData.n_contacts, eData.confirmed, stim_points);
        });

        return new Session(data.patient_id, data.electrode_params, electrodes);
    }
}
