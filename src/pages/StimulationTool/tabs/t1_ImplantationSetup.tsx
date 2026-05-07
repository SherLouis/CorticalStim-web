import { useState, useCallback } from "react";
import Brain3DView from "./Implantation/Brain3DView";
import ElectrodeListPanel from "./Implantation/ElectrodeListPanel";
import ContactConfigurationView from "./Implantation/ContactConfigurationView";

export default function ElectrodeSetupStep() {
    const [configuringElectrode, setConfiguringElectrode] = useState<string | null>(null);
    const [leftWidth, setLeftWidth] = useState(60);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = leftWidth;
        
        const handleMouseMove = (e: MouseEvent) => {
            const delta = ((e.clientX - startX) / window.innerWidth) * 100;
            const newWidth = Math.max(20, Math.min(80, startWidth + delta));
            setLeftWidth(newWidth);
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'default';
        };
        
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [leftWidth]);

    return (
        <div className="flex w-full h-full overflow-hidden bg-background relative">
            <div style={{ width: `${leftWidth}%` }} className="flex flex-col z-20 shadow-[5px_0_15px_-5px_rgba(0,0,0,0.1)] relative min-w-0 shrink-0 border-r border-outline-variant/30">
                <Brain3DView />
            </div>
            
            <div 
                onMouseDown={handleMouseDown}
                className="w-2 hover:bg-primary/20 active:bg-primary/30 cursor-col-resize z-30 transition-colors flex items-center justify-center shrink-0 group -ml-1"
                title="Drag to resize"
            >
                <div className="h-8 w-1 bg-outline-variant/40 group-hover:bg-primary/80 rounded-full transition-colors" />
            </div>
            
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)] bg-surface-container-lowest">
                {configuringElectrode ? (
                    <ContactConfigurationView 
                        electrodeLabel={configuringElectrode} 
                        onBack={() => setConfiguringElectrode(null)} 
                    />
                ) : (
                    <ElectrodeListPanel 
                        onConfigure={(label) => setConfiguringElectrode(label)} 
                    />
                )}
            </div>
        </div>
    );
}
