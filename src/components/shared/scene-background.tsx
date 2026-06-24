"use client";

import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

const NETWORK_POINTS = [
  [-2.7, 1.2, 0],
  [-1.2, 2.2, -0.4],
  [0.2, 1, -0.2],
  [1.8, 1.8, 0.2],
  [2.8, 0.3, 0.1],
  [1.1, -1.4, -0.1],
  [-0.8, -1.9, -0.4],
  [-2.4, -0.8, 0.1],
] as const satisfies ReadonlyArray<[number, number, number]>;

const NETWORK_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [2, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [1, 6],
  [0, 2],
] as const satisfies ReadonlyArray<readonly [number, number]>;

function NetworkField() {
  const groupRef = useRef<Group>(null);
  const coreRef = useRef<Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(elapsed * 0.18) * 0.05;
      groupRef.current.position.y = Math.sin(elapsed * 0.25) * 0.08;
    }

    if (coreRef.current) {
      coreRef.current.rotation.z = elapsed * 0.24;
    }
  });

  const points = useMemo(() => NETWORK_POINTS.map((point) => [...point] as [number, number, number]), []);

  return (
    <group ref={groupRef}>
      {NETWORK_CONNECTIONS.map(([from, to], index) => (
        <Line
          key={`${from}-${to}`}
          points={[points[from], points[to]]}
          color={index % 2 === 0 ? "#4f46e5" : "#10b981"}
          lineWidth={0.75}
          transparent
          opacity={0.22}
        />
      ))}

      {points.map((position, index) => (
        <mesh key={index} position={position} scale={index === 2 ? 0.18 : 0.12}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            color={index === 2 ? "#ffffff" : "#dbeafe"}
            emissive={index === 2 ? "#60a5fa" : "#a5b4fc"}
            emissiveIntensity={index === 2 ? 0.5 : 0.18}
            transparent
            opacity={0.95}
          />
        </mesh>
      ))}

      <mesh ref={coreRef} position={points[2]} scale={1.2}>
        <torusGeometry args={[0.55, 0.025, 18, 80]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.34} />
      </mesh>
      <mesh position={points[2]} scale={1.48}>
        <ringGeometry args={[0.74, 0.8, 80]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function SceneBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-90"
      style={{
        maskImage: "radial-gradient(circle at center, black 0%, black 54%, transparent 92%)",
      }}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 8], fov: 48 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0xffffff, 0);
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[3, 4, 5]} intensity={0.6} />
        <directionalLight position={[-2, -1, 3]} intensity={0.4} />
        <NetworkField />
      </Canvas>
    </div>
  );
}
