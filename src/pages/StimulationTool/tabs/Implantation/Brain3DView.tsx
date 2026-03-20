import { IconZoomIn, IconZoomOut, IconBox, IconRefresh } from "@tabler/icons-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, Html, useGLTF } from "@react-three/drei";
import { useStimulationRepository } from "../../../../infra/ZustandStimulationRepository";
import { getStimPointLabel } from "../../../../core/models/stimulationForm";
import { useMemo, Suspense, useRef, useState } from "react";
import * as THREE from 'three';

const BrainPlaceholder = () => {
    return (
        <mesh>
            <sphereGeometry args={[75, 32, 32]} />
            <meshStandardMaterial 
                color="#0ea5e9"
                wireframe={true}
                transparent 
                opacity={0.15} 
                depthWrite={false} 
            />
        </mesh>
    );
};

const CustomBrainModel = () => {
    const { scene } = useGLTF(`${process.env.PUBLIC_URL}/assets/models/human_brain.glb`);
    
    useMemo(() => {
        // Auto-scaling heuristic:
        // MNI coordinates are universally logged in millimeters (mm).
        // If a user downloaded a model built in meters, it will be ~0.15 units wide and invisible.
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        if (maxDim > 0 && maxDim < 5) {
            // Model is likely in meters. Scale to millimeters.
            scene.scale.set(1000, 1000, 1000);
        } else if (maxDim > 500) {
            // Model is likely unnecessarily massive, scale down to a typical ~150mm bounding width
            const scale = 150 / maxDim;
            scene.scale.set(scale, scale, scale);
        }

        scene.traverse((child: any) => {
            if (child.isMesh && child.material) {
                // We want the cortex to be somewhat transparent so internal contacts are visible
                child.material.transparent = true;
                child.material.opacity = 0.35;
                child.material.depthWrite = false;
                child.material.needsUpdate = true;
            }
        });
    }, [scene]);

    // Positions maintain origin [0,0,0] as this generally maps to the Anterior Commissure in MNI space
    return <primitive object={scene} />;
};

useGLTF.preload(`${process.env.PUBLIC_URL}/assets/models/human_brain.glb`);

const ElectrodesLayer = () => {
    const repository = useStimulationRepository();
    const session = repository.getSession();

    const renderData = useMemo(() => {
        const lines: any[] = [];
        const contacts: any[] = [];
        
        session.electrodes.forEach((electrode) => {
            const hasEnoughValidPoints = electrode.stim_points.filter(p => 
                p.location.mni?.x !== undefined && p.location.mni?.x !== 0 &&
                p.location.mni?.y !== undefined && p.location.mni?.y !== 0 &&
                p.location.mni?.z !== undefined && p.location.mni?.z !== 0
            ).length > 0;

            if (hasEnoughValidPoints) {
                let firstValidMni: THREE.Vector3 | null = null;
                let lastValidMni: THREE.Vector3 | null = null;
                
                electrode.stim_points.forEach((point, pIdx) => {
                    const mni = point.location.mni;
                    if (mni && (mni.x !== undefined && mni.y !== undefined && mni.z !== undefined)) {
                        // Exclude pure 0,0,0 as they are unset placeholders
                        if (mni.x !== 0 || mni.y !== 0 || mni.z !== 0) {
                            const pos = new THREE.Vector3(mni.x, mni.z, -mni.y); // Mapping MNI to WebGL config
                            
                            contacts.push({
                                label: getStimPointLabel(electrode.label, point.index, false),
                                eLabel: electrode.label,
                                position: pos,
                                done: point.location.done
                            });

                            if (!firstValidMni) firstValidMni = pos;
                            lastValidMni = pos;
                        }
                    }
                });

                if (firstValidMni && lastValidMni && firstValidMni !== lastValidMni) {
                    lines.push({ start: firstValidMni, end: lastValidMni, label: electrode.label });
                }
            }
        });
        
        return { lines, contacts };
    }, [session.electrodes]);

    return (
        <group>
            {renderData.contacts.map((c, i) => (
                <Sphere key={i} args={[Math.max(session.electrode_params.diameter || 1.5, 2.5), 16, 16]} position={c.position}>
                    <meshStandardMaterial color={c.done ? "#10b981" : "#0ea5e9"} roughness={0.3} metalness={0.6} />
                    <Html distanceFactor={150} position={[0, 2, 0]} center>
                        <div className="bg-slate-900/80 text-white text-[10px] px-1 rounded-sm backdrop-blur-sm pointer-events-none select-none">
                            {c.eLabel}{c.label}
                        </div>
                    </Html>
                </Sphere>
            ))}
        </group>
    );
};

export default function Brain3DView() {
    const orbitRef = useRef<any>(null);
    const [showBrain, setShowBrain] = useState(true);

    const zoomIn = () => {
        if (!orbitRef.current) return;
        orbitRef.current.object.position.lerp(orbitRef.current.target, 0.2);
        orbitRef.current.update();
    };

    const zoomOut = () => {
        if (!orbitRef.current) return;
        orbitRef.current.object.position.lerp(orbitRef.current.target, -0.25);
        orbitRef.current.update();
    };

    const resetView = () => {
        if (!orbitRef.current) return;
        orbitRef.current.object.position.set(150, 50, 150);
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.update();
    };

    return (
        <section className="w-full h-full relative bg-surface-container-low overflow-hidden flex items-center justify-center">
            {/* The 3D Canvas rendering the brain and configured electrodes */}
            <div className="absolute inset-0 cursor-move">
                <Canvas camera={{ position: [150, 50, 150], fov: 45, near: 0.1, far: 5000 }}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[100, 100, 50]} intensity={2} />
                    <directionalLight position={[-100, -100, -50]} intensity={1} />
                    <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffff" />
                    
                    {showBrain && (
                        <Suspense fallback={<BrainPlaceholder />}>
                            <CustomBrainModel />
                        </Suspense>
                    )}
                    <ElectrodesLayer />
                    
                    <OrbitControls 
                        ref={orbitRef}
                        enableDamping 
                        dampingFactor={0.05} 
                        minDistance={20} 
                        maxDistance={2000} 
                    />
                </Canvas>
            </div>

            {/* Floating toolbar for 3D interactions */}
            <div className="absolute bottom-6 left-6 flex gap-2 bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg shadow-sm backdrop-blur-md border border-outline-variant/30">
                <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-on-surface-variant transition-colors group relative" aria-label="Zoom In" title="Zoom In">
                    <IconZoomIn size="1.2rem" />
                </button>
                <div className="w-[1px] bg-outline-variant/30 my-1 mx-0.5"></div>
                <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-on-surface-variant transition-colors group relative" aria-label="Zoom Out" title="Zoom Out">
                    <IconZoomOut size="1.2rem" />
                </button>
                <div className="w-[1px] bg-outline-variant/30 my-1 mx-0.5"></div>
                <button onClick={resetView} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-on-surface-variant transition-colors group relative" aria-label="Reset View" title="Reset Camera">
                    <IconRefresh size="1.2rem" />
                </button>
                <div className="w-[1px] bg-outline-variant/30 my-1 mx-0.5"></div>
                <button onClick={() => setShowBrain(!showBrain)} className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors group relative ${showBrain ? 'bg-primary/10 text-primary dark:bg-primary/20 hover:bg-primary/20' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-on-surface-variant'}`} aria-label="Toggle Brain Model" title="Toggle Brain Cortical Surface">
                    <IconBox size="1.2rem" />
                </button>
            </div>
            
            <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
                <h2 className="text-xl font-headline font-bold text-on-surface drop-shadow-md">Cortical Implantation</h2>
                <p className="text-sm text-on-surface-variant font-medium bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded-md inline-block w-fit backdrop-blur-sm border border-outline-variant/20 shadow-sm">
                    Interactive 3D MNI Coordinates
                </p>
            </div>
        </section>
    );
}
