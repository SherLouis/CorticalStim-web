import { useState, useRef, useCallback } from 'react';
import { useTranslation } from "react-i18next";
import { IconUpload, IconMicroscope, IconGridDots, IconCirclePlus, IconLock, IconLockOpen, IconSettings, IconTrash, IconArrowRight } from "@tabler/icons-react";
import { useStimulationRepository } from "../../../../infra/ZustandStimulationRepository";
import { Electrode } from "../../../../core/domain/Electrode";
import { letters } from "../../../../lib/letterTools";
import parseMniImplantationFromTsv from "../../../../ui/tsvMniImplantationParser/tsvMniImplantationParser";

// Standard Grid pattern option is technically Grid but we'll adapt from Mantine logic
const ELECTRODE_OPTIONS = [
    { implantationType: "SEEG", diameter: 0.9, separation: 3, length: 2.3 },
    { implantationType: "SEEG", diameter: 0.9, separation: 4, length: 2.3 },
    { implantationType: "SEEG", diameter: 0.8, separation: 3.5, length: 2 },
    { implantationType: "Grid", diameter: 3.0, separation: 10, length: 1 }, // Example mock grid option
];

export default function ElectrodeListPanel({ onConfigure }: { onConfigure: (label: string) => void }) {
    const { t } = useTranslation();
    const repository = useStimulationRepository();
    const session = repository.getSession();
    
    const [nextElectrodeDefaultLabel, setNextElectrodeDefaultLabel] = useState('A');
    const [electrodeType, setElectrodeType] = useState<"SEEG" | "Grid">("SEEG");
    
    // Extracted TSV Parse Logic
    const openInputFileRef = useRef<HTMLInputElement | null>(null);
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const uploadedFile = e.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsText(uploadedFile, "UTF-8");
        fileReader.onload = () => {
            try {
                const electrodesData = parseMniImplantationFromTsv(fileReader.result as string);
                electrodesData.forEach((eData: any) => {
                    repository.addElectrode(new Electrode(eData.label, eData.side, eData.n_contacts, eData.confirmed, eData.stim_points));
                });
            } catch (err) {
                console.error(`Error loading from file: ${err}`);
            }
        }
        if (openInputFileRef.current) openInputFileRef.current.value = '';
    }, [repository]);

    const handleAddElectrode = () => {
        repository.addElectrode(new Electrode(nextElectrodeDefaultLabel));
        setNextElectrodeDefaultLabel(letters.increment(nextElectrodeDefaultLabel));
    };

    const handleDeleteElectrode = (label: string) => {
        if(window.confirm(`Delete electrode ${label}?`)) {
            repository.removeElectrode(label);
        }
    };

    const handleConfirmElectrode = (label: string) => {
        repository.confirmElectrode(label);
    };

    return (
        <section className="w-[420px] h-full bg-surface-container-lowest border-l border-outline-variant/10 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10">
            {/* Top Section: Add Electrode */}
            <div className="bg-surface-container-low/50 rounded-xl p-5 shadow-sm flex flex-col gap-4 border border-outline-variant/10">
                <div className="flex justify-between items-center">
                    <h2 className="font-headline font-bold text-lg text-on-surface">Add Electrode</h2>
                    <input type='file' onChange={handleFileChange} ref={openInputFileRef} accept=".tsv,.txt" className="hidden" />
                    <button 
                        onClick={() => openInputFileRef.current?.click()}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                    >
                        <IconUpload size="1rem" />
                        Import TSV
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">Electrode Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => setElectrodeType("SEEG")}
                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-colors border-2 ${electrodeType === "SEEG" ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-primary/50'}`}
                            >
                                <IconMicroscope size="1.2rem" /> SEEG
                            </button>
                            <button 
                                onClick={() => setElectrodeType("Grid")}
                                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-colors border-2 ${electrodeType === "Grid" ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 bg-surface-container text-on-surface-variant hover:border-primary/50'}`}
                            >
                                <IconGridDots size="1.2rem" /> Grid
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">{t('pages.stimulationTool.implantation.contactDiameterLabel', 'Diameter')}</label>
                        <div className="flex flex-row items-center gap-1">
                            <input 
                                className="w-full bg-surface-container text-on-surface border-none rounded-md text-sm font-semibold p-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                                type="number" 
                                value={session.electrode_params.diameter !== undefined ? session.electrode_params.diameter : ''}
                                onChange={(e) => repository.updateElectrodeParams({ diameter: e.target.value !== '' ? parseFloat(e.target.value) : 0 })}
                            />
                            <span className="text-[10px] text-slate-400 font-medium">mm</span>
                        </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">{t('pages.stimulationTool.implantation.contactSeparationLabel', 'Separation')}</label>
                        <div className="flex flex-row items-center gap-1">
                            <input 
                                className="w-full bg-surface-container text-on-surface border-none rounded-md text-sm font-semibold p-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                                type="number" 
                                value={session.electrode_params.separation !== undefined ? session.electrode_params.separation : ''}
                                onChange={(e) => repository.updateElectrodeParams({ separation: e.target.value !== '' ? parseFloat(e.target.value) : 0 })}
                            />
                            <span className="text-[10px] text-slate-400 font-medium">mm</span>
                        </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-on-surface-variant mb-1 ml-1">{t('pages.stimulationTool.implantation.contactLengthLabel', 'Length')}</label>
                        <div className="flex flex-row items-center gap-1">
                            <input 
                                className="w-full bg-surface-container text-on-surface border-none rounded-md text-sm font-semibold p-2 focus:ring-2 focus:ring-primary focus:outline-none" 
                                type="number" 
                                value={session.electrode_params.length !== undefined ? session.electrode_params.length : ''}
                                onChange={(e) => repository.updateElectrodeParams({ length: e.target.value !== '' ? parseFloat(e.target.value) : 0 })}
                            />
                            <span className="text-[10px] text-slate-400 font-medium">mm</span>
                        </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddElectrode}
                        className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <IconCirclePlus size="1.2rem" />
                        Generate Electrode
                    </button>
                </div>
            </div>

            {/* Bottom Section: Configured Electrodes */}
            <div className="flex-grow flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-headline font-bold text-lg text-on-surface">Configured</h2>
                    <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {session.electrodes.length} TOTAL
                    </span>
                </div>

                <div className="space-y-3">
                    {session.electrodes.length === 0 && (
                        <div className="text-center p-6 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30">
                            <p className="text-sm font-medium text-slate-400">No electrodes defined yet.</p>
                        </div>
                    )}

                    {session.electrodes.map((electrode) => {
                        const configuredContacts = electrode.stim_points.filter(sp => sp.location.done).length;
                        const isLocked = electrode.confirmed;
                        
                        return (
                            <div key={electrode.label} className={`p-4 rounded-xl border transition-colors shadow-sm ${isLocked ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-surface-container-low/50 border-primary/20 ring-1 ring-primary/10'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                        <div className={`p-2 rounded-lg shrink-0 ${isLocked ? 'bg-secondary-container/20 text-secondary' : 'bg-primary/10 text-primary'}`}>
                                            <IconMicroscope size="1.2rem" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <input 
                                                    type="text" 
                                                    value={electrode.label}
                                                    onChange={(e) => repository.updateElectrodeLabel(electrode.label, e.target.value)}
                                                    className="font-bold text-sm bg-surface-container-highest text-on-surface border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none w-16 px-1 py-0.5 rounded-sm transition-colors"
                                                    disabled={isLocked}
                                                />
                                                <select 
                                                    value={electrode.side || ''}
                                                    onChange={(e) => repository.updateElectrodeSide(electrode.label, e.target.value as 'left' | 'right')}
                                                    className="text-xs bg-surface-container rounded px-1 py-0.5 focus:outline-none font-bold text-on-surface-variant"
                                                    disabled={isLocked}
                                                >
                                                    <option value="" disabled>-</option>
                                                    <option value="left">Left</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-on-surface-variant font-bold uppercase">
                                                    {t("pages.stimulationTool.implantation.nbContactsLabel", "Contacts")}:
                                                </span>
                                                <input 
                                                    type="number"
                                                    value={electrode.n_contacts || ''}
                                                    onChange={(e) => repository.setElectrodeContacts(electrode.label, parseInt(e.target.value) || 0)}
                                                    className="w-12 text-[10px] font-bold bg-surface-container-highest text-on-surface border border-outline-variant/30 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-colors"
                                                    disabled={isLocked}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleConfirmElectrode(electrode.label)}
                                        className={`transition-colors shrink-0 ${isLocked ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                                        title={isLocked ? "Locked" : "Lock Contact Count"}
                                    >
                                        {isLocked ? <IconLock size="1.2rem" /> : <IconLockOpen size="1.2rem" />}
                                    </button>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2 flex-1">
                                        {isLocked && electrode.n_contacts > 0 ? (
                                            <>
                                                <div className="flex-1 bg-surface-container-high h-1.5 rounded-full overflow-hidden shrink-0">
                                                    <div 
                                                        className="bg-primary h-full transition-all duration-300"
                                                        style={{ width: `${(configuredContacts / electrode.n_contacts) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-on-surface-variant shrink-0 w-16 whitespace-nowrap">
                                                    {configuredContacts}/{electrode.n_contacts} Placed
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400 italic">Unconfirmed or 0 contacts</span>
                                        )}
                                    </div>
                                    <div className="flex gap-1 shrink-0 ml-2">
                                        {isLocked && (
                                            <button 
                                                onClick={() => onConfigure(electrode.label)}
                                                className="p-1.5 hover:bg-primary/10 rounded-md text-primary transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                                            >
                                                Edit MNI <IconArrowRight size="1rem" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDeleteElectrode(electrode.label)}
                                            className="p-1.5 hover:bg-error-container/50 rounded-md text-error/70 hover:text-error transition-colors ml-1"
                                        >
                                            <IconTrash size="1rem" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
        </section>
    );
}
