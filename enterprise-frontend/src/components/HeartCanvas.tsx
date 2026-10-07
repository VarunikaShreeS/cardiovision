"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function HeartModel({ vesselProbs }: { vesselProbs: { LAD: number; LCX: number; RCA: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const getColor = (prob: number) => {
    if (prob > 70) return "#ef4444"; // High Risk Red
    if (prob > 40) return "#f59e0b"; // Moderate Risk Amber
    return "#10b981"; // Low Risk Green
  };

  return (
    <group ref={groupRef}>
      {/* Central Myocardium Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* LAD Vessel */}
      <mesh position={[0.2, 0.4, 1.0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2, 16]} />
        <meshStandardMaterial color={getColor(vesselProbs.LAD)} emissive={getColor(vesselProbs.LAD)} emissiveIntensity={0.5} />
      </mesh>

      {/* LCX Vessel */}
      <mesh position={[-0.6, 0.5, 0.5]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.07, 0.07, 1.0, 16]} />
        <meshStandardMaterial color={getColor(vesselProbs.LCX)} emissive={getColor(vesselProbs.LCX)} emissiveIntensity={0.5} />
      </mesh>

      {/* RCA Vessel */}
      <mesh position={[0.7, -0.2, 0.6]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.07, 0.07, 1.3, 16]} />
        <meshStandardMaterial color={getColor(vesselProbs.RCA)} emissive={getColor(vesselProbs.RCA)} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function HeartCanvas({ vesselProbs }: { vesselProbs: { LAD: number; LCX: number; RCA: number } }) {
  return (
    <div className="w-full h-[400px] bg-slate-950 rounded-2xl relative overflow-hidden shadow-inner border border-slate-800">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-white font-bold flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Interactive 3D Spatial Risk Map (Three.js WebGL)</span>
      </div>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-5, 5, 5]} intensity={1} />
        <HeartModel vesselProbs={vesselProbs} />
        <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
      </Canvas>
      <div className="absolute bottom-3 right-4 z-10 text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
        Rotate & Zoom Enabled • Click & Drag
      </div>
    </div>
  );
}