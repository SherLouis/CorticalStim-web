import { useState } from 'react';
import { IconChevronLeft, IconMap, IconWand, IconCalculator, IconCheck } from '@tabler/icons-react';
import { useStimulationRepository } from '../../../../infra/ZustandStimulationRepository';
import { getStimPointLabel } from '../../../../core/models/stimulationForm';
import { useTranslation } from 'react-i18next';
import { Modal } from '@mantine/core'; // Keep Mantine Modal for the advanced editor as per legacy rules
import StimulationPointLocationSelection, { ElectrodeLocationFormValues } from '../../../../components/StimulationPointLocationSelection';
import { useForm } from '@mantine/form';

export default function ContactConfigurationView({ electrodeLabel, onBack }: { electrodeLabel: string, onBack: () => void }) {
    const repository = useStimulationRepository();
    const session = repository.getSession();
    const electrode = session.electrodes.find(e => e.label === electrodeLabel);
    const { t } = useTranslation();
    
    const [advancedPointIndex, setAdvancedPointIndex] = useState<number | null>(null);

    if (!electrode) {
        return <div className="p-6 text-error">Electrode not found.</div>;
    }

    const configuredContactsCount = electrode.stim_points.filter(sp => sp.location.done).length;

    const handleMniUpdate = (index: number, axis: 'x' | 'y' | 'z', value: number | undefined) => {
        const currentLoc = electrode.stim_points.find(sp => sp.index === index)?.location;
        const currentMni = currentLoc?.mni || { x: 0, y: 0, z: 0 };
        const newMni = { ...currentMni, [axis]: value || 0 };
        
        // Auto-mark as done if they have coordinates
        const isDone = newMni.x !== 0 || newMni.y !== 0 || newMni.z !== 0;

        repository.updateStimulationPointLocation(electrode.label, index, {
            type: currentLoc?.type || (isDone ? 'mni' : undefined) as any,
            vep: currentLoc?.vep || undefined,
            destrieux: currentLoc?.destrieux || undefined,
            white_matter: currentLoc?.white_matter || undefined,
            mni: newMni,
            done: isDone
        });
    };

    const AdvancedConfigModal = () => {
        const point = advancedPointIndex !== null ? electrode.stim_points.find(sp => sp.index === advancedPointIndex) : null;
        const locationForm = useForm<ElectrodeLocationFormValues>({
            initialValues: {
                type: point?.location.type || '',
                vep: point?.location.vep || '',
                destrieux: point?.location.destrieux || '',
                white_matter: point?.location.white_matter || '',
                mni_x: point?.location.mni?.x || 0,
                mni_y: point?.location.mni?.y || 0,
                mni_z: point?.location.mni?.z || 0,
            }
        });

        const handleSave = () => {
            if (advancedPointIndex === null) return;
            const vals = locationForm.values;
            repository.updateStimulationPointLocation(electrode.label, advancedPointIndex, {
                type: vals.type as any,
                vep: vals.vep,
                destrieux: vals.destrieux,
                white_matter: vals.white_matter,
                mni: { x: vals.mni_x, y: vals.mni_y, z: vals.mni_z },
                done: true
            });
            setAdvancedPointIndex(null);
        };

        return (
            <Modal 
                opened={advancedPointIndex !== null} 
                onClose={() => setAdvancedPointIndex(null)}
                title={`${t("pages.stimulationTool.implantation.advancedRoiConfiguration", "Advanced ROI Configuration")} - ${getStimPointLabel(electrode.label, advancedPointIndex || 0, false)}`}
                size="lg"
            >
                <StimulationPointLocationSelection form={locationForm} />
                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-4 py-2 border rounded hover:bg-surface-container-high transition-colors" onClick={() => setAdvancedPointIndex(null)}>{t("common.cancel", "Cancel")}</button>
                    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-container transition-colors flex items-center gap-2" onClick={handleSave}>
                        <IconCheck size="1rem" /> {t("pages.stimulationTool.implantation.saveRoi", "Save ROI")}
                    </button>
                </div>
            </Modal>
        );
    };

    return (
        <section className="w-[420px] h-full bg-surface-container-lowest flex flex-col shadow-[-10px_0_30px_rgba(25,28,29,0.03)] z-10 shrink-0">
            {/* Header/Breadcrumb */}
            <div className="px-6 py-4 border-b border-surface-container-high bg-surface-container-low/30">
                <nav className="flex items-center gap-2 mb-2 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant shrink-0 min-w-0 pr-2">
                    <span className="hover:text-primary cursor-pointer truncate" onClick={onBack}>{t("pages.stimulationTool.implantation.electrodes", "Electrodes")}</span>
                    <span className="text-[12px] shrink-0 font-bold">&gt;</span>
                    <span className="text-primary truncate">{electrode.label}</span>
                </nav>
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant">
                        <IconChevronLeft size="1.2rem" />
                    </button>
                    <h2 className="text-xl font-headline font-extrabold tracking-tight truncate">{t("pages.stimulationTool.implantation.configureContacts", "Configure Contacts")}</h2>
                </div>
            </div>

            {/* Auto-Configure Action Card */}
            <div className="px-6 py-4 border-b border-surface-container-high bg-primary/5">
                <div className="flex items-start gap-3">
                    <IconWand className="text-primary mt-1 shrink-0" size="1.2rem" />
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-primary mb-1">{t("pages.stimulationTool.implantation.smartCalculationAvailable", "Smart Calculation Available")}</h4>
                        <p className="text-xs text-on-surface-variant mb-3 leading-relaxed" dangerouslySetInnerHTML={{
                            __html: t("pages.stimulationTool.implantation.smartCalculationDescription", "Define the position of <strong>C1</strong> and <strong>C{{n_contacts}}</strong> to automatically calculate the coordinates for all intermediate contacts.", { n_contacts: electrode.n_contacts })
                        }} />
                        <button className="w-full py-2 bg-gradient-to-r from-primary to-primary-container text-white text-xs font-bold rounded-lg shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                            <IconCalculator size="1rem" />
                            {t("pages.stimulationTool.implantation.autoConfigureContacts", "Auto-Configure Contacts")}
                        </button>
                    </div>
                </div>
            </div>

            {/* Contacts Table Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-secondary">{t("pages.stimulationTool.implantation.electrodeLabel", "Electrode")}: {electrode.label}</span>
                    <span className={`text-xs font-bold ${configuredContactsCount === electrode.n_contacts ? 'text-green-600' : 'text-error'}`}>
                        {configuredContactsCount}/{electrode.n_contacts} {t("pages.stimulationTool.implantation.placed", "placed")}
                    </span>
                </div>

                <table className="w-full text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-[10px] font-bold text-secondary tracking-widest uppercase">
                            <th className="pb-2 pl-2">{t("pages.stimulationTool.implantation.id", "ID")}</th>
                            <th className="pb-2">{t("pages.stimulationTool.implantation.mniCoordinates", "MNI (X, Y, Z)")}</th>
                            <th className="pb-2 text-right pr-2">{t("pages.stimulationTool.implantation.roi", "ROI")}</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {electrode.stim_points.map((sp) => {
                            const pointLabel = getStimPointLabel(electrode.label, sp.index, false);
                            const mni = sp.location.mni;
                            const isDone = sp.location.done;
                            
                            return (
                                <tr key={pointLabel} className={`group transition-colors rounded-lg overflow-hidden ${isDone ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-surface-container-low/50 hover:bg-surface-container-high'}`}>
                                    <td className={`py-3 pl-3 font-bold rounded-l-lg ${isDone ? 'text-primary' : 'text-on-surface-variant'}`}>{pointLabel}</td>
                                    <td className="py-3">
                                        <div className="flex gap-1 pr-2">
                                            <input 
                                                className={`w-12 h-8 border-none rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary focus:outline-none transition-all ${isDone ? 'bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/20' : 'bg-surface-container-highest border border-dashed border-outline-variant/30 text-on-surface-variant/70'}`}
                                                type="number" 
                                                placeholder="--.-"
                                                value={mni?.x !== undefined ? mni.x : ''}
                                                onChange={(e) => handleMniUpdate(sp.index, 'x', e.target.value !== '' ? parseFloat(e.target.value) : undefined)}
                                            />
                                            <input 
                                                className={`w-12 h-8 border-none rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary focus:outline-none transition-all ${isDone ? 'bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/20' : 'bg-surface-container-highest border border-dashed border-outline-variant/30 text-on-surface-variant/70'}`}
                                                type="number" 
                                                placeholder="--.-"
                                                value={mni?.y !== undefined ? mni.y : ''}
                                                onChange={(e) => handleMniUpdate(sp.index, 'y', e.target.value !== '' ? parseFloat(e.target.value) : undefined)}
                                            />
                                            <input 
                                                className={`w-12 h-8 border-none rounded text-xs font-mono text-center focus:ring-2 focus:ring-primary focus:outline-none transition-all ${isDone ? 'bg-surface-container-lowest text-on-surface shadow-sm ring-1 ring-outline-variant/20' : 'bg-surface-container-highest border border-dashed border-outline-variant/30 text-on-surface-variant/70'}`}
                                                type="number" 
                                                placeholder="--.-"
                                                value={mni?.z !== undefined ? mni.z : ''}
                                                onChange={(e) => handleMniUpdate(sp.index, 'z', e.target.value !== '' ? parseFloat(e.target.value) : undefined)}
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 text-right pr-2 rounded-r-lg">
                                        <button 
                                            onClick={() => setAdvancedPointIndex(sp.index)}
                                            className={`p-1.5 rounded transition-colors ${isDone && sp.location.type !== 'mni' ? 'bg-primary text-white shadow-sm' : 'hover:bg-primary/10 text-secondary'}`}
                                            title={t("pages.stimulationTool.implantation.advancedRoiConfiguration", "Advanced ROI Configuration")}
                                        >
                                            <IconMap size="1.2rem" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Action Area */}
            <div className="p-6 border-t border-surface-container-high bg-surface-container text-on-surface shrink-0">
                <div className="flex gap-3">
                    <button onClick={onBack} className="flex-1 px-4 py-2.5 bg-surface-container-high text-on-surface font-bold text-sm rounded-md hover:bg-surface-container-highest transition-colors active:scale-98">
                        {t("common.done", "Done")}
                    </button>
                </div>
            </div>

            <AdvancedConfigModal />
        </section>
    );
}
