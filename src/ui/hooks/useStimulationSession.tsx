import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../providers/RootStoreProvider';
import { StimulationSessionStore } from '../../core/application/stores/stimulationSessionStore';
import StimulationFormValues from '../../core/models/stimulationForm';
import { toStimulationSession, toStimulationFormValues } from '../../core/application/mappers/stimulationSessionMapper';
import { Stimulation } from '../../core/domain/stimulation';

/**
 * Root store context for direct store access in components.
 * @see RootStoreProvider
 */
export { RootStoreContext };

/**
 * Adapter interface exposed to UI components during transition.
 * Mirrors the shape of Mantine Form's return type so existing components
 * can gradually migrate without breaking changes.
 * 
 * - formValues: current session serialized to legacy StimulationFormValues
 * - validationErrors: business validation from store (computed)
 * - isDirty: true if unsaved changes exist
 * - canSave: true if no validation errors
 * - load/save: bridge to/from legacy form values
 * - mutation methods: delegate to store actions
 */
export interface StimulationSessionAdapter {
    formValues: StimulationFormValues;
    validationErrors: Map<string, string>;
    isDirty: boolean;
    canSave: boolean;
    electrodeCount: number;
    load: (values: StimulationFormValues) => void;
    save: () => StimulationFormValues;
    markSaved: () => void;
    addElectrode: (label: string) => void;
    removeElectrode: (index: number) => void;
    updateElectrodeParams: (params: { type?: string; separation?: number; diameter?: number; length?: number }) => void;
    setElectrodeContacts: (electrodeIndex: number, nbContacts: number) => void;
    confirmElectrode: (electrodeIndex: number) => void;
    updateElectrodeLabel: (electrodeIndex: number, label: string) => void;
    updateElectrodeSide: (electrodeIndex: number, side: 'left' | 'right' | undefined) => void;
    updateStimulationPointLocation: (electrodeIndex: number, stimPointIndex: number, location: any) => void;
    addStimulation: (electrodeIndex: number, stimPointIndex: number, stimulation: Stimulation) => void;
}

/**
 * React hook providing the StimulationSessionAdapter.
 * Reads from the singleton StimulationSessionStore via RootStoreContext.
 * Provides a stable interface for components during the form→MobX migration.
 * 
 * Usage:
 *   const adapter = useStimulationSession();
 *   // adapter.formValues for reading, adapter.addElectrode() for mutations
 */
export function useStimulationSession(): StimulationSessionAdapter {
    const rootStore = useContext(RootStoreContext);
    const store: StimulationSessionStore = rootStore.stimulationSession;

    const load = (values: StimulationFormValues) => {
        const session = toStimulationSession(values);
        store.setValues(session.toValues());
    };

    const save = (): StimulationFormValues => {
        return toStimulationFormValues(store.session);
    };

    const adapter = {
        formValues: toStimulationFormValues(store.session),
        validationErrors: store.validationErrors,
        isDirty: store.isDirty,
        canSave: store.canSave,
        electrodeCount: store.electrodeCount,
        load,
        save,
        markSaved: () => store.markSaved(),
        addElectrode: (label: string) => store.addElectrode(label),
        removeElectrode: (index: number) => store.removeElectrode(index),
        updateElectrodeParams: (params: { type?: string; separation?: number; diameter?: number; length?: number }) => store.updateElectrodeParams(params),
        setElectrodeContacts: (electrodeIndex: number, nbContacts: number) => store.setElectrodeContacts(electrodeIndex, nbContacts),
        confirmElectrode: (electrodeIndex: number) => store.confirmElectrode(electrodeIndex),
        updateElectrodeLabel: (electrodeIndex: number, label: string) => store.updateElectrodeLabel(electrodeIndex, label),
        updateElectrodeSide: (electrodeIndex: number, side: 'left' | 'right' | undefined) => store.updateElectrodeSide(electrodeIndex, side),
        updateStimulationPointLocation: (electrodeIndex: number, stimPointIndex: number, location: any) => store.updateStimulationPointLocation(electrodeIndex, stimPointIndex, location),
        addStimulation: (electrodeIndex: number, stimPointIndex: number, stimulation: Stimulation) => store.addStimulation(electrodeIndex, stimPointIndex, stimulation),
    };

    return adapter;
}

/**
 * HOC that injects `stimulationAdapter` prop into a component.
 * Wraps with MobX `observer` so component re-renders on store changes.
 * 
 * Usage:
 *   export default withStimulationSession(MyComponent);
 *   // MyComponent receives { stimulationAdapter: StimulationSessionAdapter }
 */
export function withStimulationSession<P extends object>(Component: React.ComponentType<P>) {
    const Wrapped = observer((props: P) => {
        const adapter = useStimulationSession();
        return <Component {...props} stimulationAdapter={adapter} />;
    });
    Wrapped.displayName = `withStimulationSession(${Component.displayName || Component.name || 'Component'})`;
    return Wrapped as React.ComponentType<P>;
}