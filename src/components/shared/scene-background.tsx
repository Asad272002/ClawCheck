"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function ClawMark({
  position,
  rotation,
  scale,
  delay = 0,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  delay?: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const t = state.clock.elapsedTime + delay;
    groupRef.current.rotation.z = rotation[2] + Math.sin(t * 0.7) * 0.08;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.12;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {[-0.55, 0, 0.55].map((offset, index) => (
        <mesh
          key={offset}
          position={[offset, 0, index * 0.02]}
          rotation={[0, 0, -0.18 + index * 0.18]}
        >
          <torusGeometry args={[1.28, 0.065, 20, 80, 1.15]} />
          <meshStandardMaterial
            color="#111111"
            emissive="#ffffff"
            emissiveIntensity={0.02}
            metalness={0.08}
            roughness={0.22}
            transparent
            opacity={0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

function ClawParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const spread = index * 0.42;

        return {
          id: index,
          position: [
            Math.cos(spread) * (2.8 + (index % 4) * 0.8),
            Math.sin(spread * 1.4) * (1.4 + (index % 3) * 0.6),
            -1.4 + (index % 5) * 0.24,
          ] as [number, number, number],
          scale: 0.035 + (index % 4) * 0.012,
        };
      }),
    []
  );

  return (
    <>
      {particles.map((particle) => (
        <mesh key={particle.id} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.08} />
        </mesh>
      ))}
    </>
  );
}

function CentralCore() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.z = state.clock.elapsedTime * 0.18;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.15, -1.8]} scale={1.15}>
      <torusKnotGeometry args={[0.68, 0.15, 120, 14, 2, 3]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.03}
        metalness={0.05}
        roughness={0.3}
        transparent
        opacity={0.14}
      />
    </mesh>
  );
}

export function SceneBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 4, 5]} intensity={1} />
        <directionalLight position={[-4, -2, 2]} intensity={0.45} />
        <CentralCore />
        <ClawMark position={[-2.8, 1.6, -0.7]} rotation={[0.08, 0.12, 0.48]} scale={1.28} />
        <ClawMark position={[2.9, -1.45, -0.35]} rotation={[-0.12, -0.08, -0.62]} scale={1.18} delay={0.8} />
        <ClawMark position={[0.4, 2.6, -1.2]} rotation={[0.06, 0.02, 0.14]} scale={0.78} delay={1.3} />
        <ClawParticles />
      </Canvas>
    </div>
  );
}
