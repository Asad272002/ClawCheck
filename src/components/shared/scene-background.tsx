"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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

export function SceneBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    const animationGroup = new THREE.Group();
    const points = NETWORK_POINTS.map((point) => new THREE.Vector3(...point));
    const nodeMeshes: THREE.Mesh[] = [];
    const lineMaterials: THREE.Material[] = [];
    const startTime = performance.now();
    let frameId = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.className = "h-full w-full";
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0, 8);

    scene.add(new THREE.AmbientLight("#ffffff", 1));

    const primaryLight = new THREE.DirectionalLight("#ffffff", 0.65);
    primaryLight.position.set(3, 4, 5);
    scene.add(primaryLight);

    const secondaryLight = new THREE.DirectionalLight("#93c5fd", 0.45);
    secondaryLight.position.set(-2, -1, 3);
    scene.add(secondaryLight);

    NETWORK_CONNECTIONS.forEach(([from, to], index) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([points[from], points[to]]);
      const material = new THREE.LineBasicMaterial({
        color: index % 2 === 0 ? "#4f46e5" : "#10b981",
        transparent: true,
        opacity: 0.22,
      });
      const line = new THREE.Line(geometry, material);
      animationGroup.add(line);
      lineMaterials.push(material);
    });

    points.forEach((position, index) => {
      const geometry = new THREE.SphereGeometry(index === 2 ? 0.18 : 0.12, 24, 24);
      const material = new THREE.MeshStandardMaterial({
        color: index === 2 ? "#ffffff" : "#dbeafe",
        emissive: index === 2 ? new THREE.Color("#60a5fa") : new THREE.Color("#a5b4fc"),
        emissiveIntensity: index === 2 ? 0.5 : 0.18,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      nodeMeshes.push(mesh);
      animationGroup.add(mesh);
    });

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.025, 18, 80),
      new THREE.MeshBasicMaterial({
        color: "#4f46e5",
        transparent: true,
        opacity: 0.34,
      })
    );
    torus.position.copy(points[2]);
    torus.scale.setScalar(1.2);
    animationGroup.add(torus);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.74, 0.8, 80),
      new THREE.MeshBasicMaterial({
        color: "#10b981",
        transparent: true,
        opacity: 0.12,
      })
    );
    ring.position.copy(points[2]);
    ring.scale.setScalar(1.48);
    animationGroup.add(ring);

    scene.add(animationGroup);

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;

      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      animationGroup.rotation.z = Math.sin(elapsed * 0.18) * 0.05;
      animationGroup.position.y = Math.sin(elapsed * 0.25) * 0.08;
      torus.rotation.z = elapsed * 0.24;

      renderer.render(scene, camera);
    };

    updateSize();
    animate();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();

      animationGroup.traverse((child) => {
        const geometry = (child as THREE.Mesh).geometry;
        const material = (child as THREE.Mesh).material;

        if (geometry instanceof THREE.BufferGeometry) {
          geometry.dispose();
        }

        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else if (material instanceof THREE.Material) {
          material.dispose();
        }
      });

      lineMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-90"
      style={{
        maskImage: "radial-gradient(circle at center, black 0%, black 54%, transparent 92%)",
      }}
    >
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
