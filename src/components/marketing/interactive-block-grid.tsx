"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COLUMNS = 18;
const ROWS = 10;
const BOX_SIZE = 0.34;
const BOX_DEPTH = 0.18;
const GAP = 0.58;

export function InteractiveBlockGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(2, 2);
    const boxes: THREE.Mesh[] = [];

    let hoveredBox: THREE.Mesh | null = null;
    let animationFrameId = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.domElement.className = "h-full w-full";
    renderer.setClearColor(0xffffff, 0);
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0.35, 8.8);

    const ambientLight = new THREE.AmbientLight("#ffffff", 1.25);
    const keyLight = new THREE.DirectionalLight("#9fb8ff", 1.55);
    const fillLight = new THREE.DirectionalLight("#9ff6d2", 0.9);
    keyLight.position.set(3, 4, 6);
    fillLight.position.set(-2, -1, 5);
    scene.add(ambientLight, keyLight, fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_DEPTH, 1, 1, 1);

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLUMNS; col += 1) {
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#f8fbff"),
          transparent: true,
          opacity: 0.22,
          roughness: 0.38,
          metalness: 0.08,
          emissive: new THREE.Color("#4f46e5"),
          emissiveIntensity: 0.06,
        });

        const mesh = new THREE.Mesh(geometry, material);
        const x = (col - (COLUMNS - 1) / 2) * GAP + (row % 2 === 0 ? 0 : GAP * 0.5);
        const y = ((ROWS - 1) / 2 - row) * GAP * 0.82;
        const z = Math.sin(col * 0.4 + row * 0.3) * 0.05;

        mesh.position.set(x, y, z);
        mesh.userData = {
          basePosition: mesh.position.clone(),
          hoverMix: 0,
        };

        boxes.push(mesh);
        group.add(mesh);
      }
    }

    group.position.set(0.35, 0.25, 0);
    group.rotation.x = -0.28;
    group.rotation.y = -0.22;

    const updateSize = () => {
      const { clientWidth, clientHeight } = container;

      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const insideX = event.clientX >= rect.left && event.clientX <= rect.right;
      const insideY = event.clientY >= rect.top && event.clientY <= rect.bottom;

      if (!insideX || !insideY) {
        mouse.set(2, 2);
        hoveredBox = null;
        return;
      }

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleMouseLeave = () => {
      mouse.set(2, 2);
      hoveredBox = null;
    };

    const animate = () => {
      animationFrameId = window.requestAnimationFrame(animate);

      raycaster.setFromCamera(mouse, camera);
      const intersections = raycaster.intersectObjects(boxes, false);
      hoveredBox = intersections.length > 0 ? (intersections[0].object as THREE.Mesh) : null;

      boxes.forEach((box) => {
        const material = box.material as THREE.MeshStandardMaterial;
        const basePosition = box.userData.basePosition as THREE.Vector3;
        const hoverMix = THREE.MathUtils.lerp(
          box.userData.hoverMix as number,
          hoveredBox === box ? 1 : 0,
          0.12
        );
        const targetScale = 1 + hoverMix * 0.52;
        const targetZ = basePosition.z + hoverMix * 0.82;
        const targetOpacity = 0.16 + hoverMix * 0.82;
        const targetEmissive = 0.05 + hoverMix * 0.72;

        box.userData.hoverMix = hoverMix;
        box.scale.x = THREE.MathUtils.lerp(box.scale.x, targetScale, 0.14);
        box.scale.y = THREE.MathUtils.lerp(box.scale.y, targetScale, 0.14);
        box.scale.z = THREE.MathUtils.lerp(box.scale.z, 1 + hoverMix * 0.28, 0.14);
        box.position.z = THREE.MathUtils.lerp(box.position.z, targetZ, 0.14);
        box.position.y = THREE.MathUtils.lerp(
          box.position.y,
          basePosition.y + hoverMix * 0.08,
          0.14
        );
        box.rotation.x = THREE.MathUtils.lerp(box.rotation.x, hoverMix * 0.16, 0.12);
        box.rotation.y = THREE.MathUtils.lerp(box.rotation.y, hoverMix * -0.14, 0.12);
        material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.14);
        material.emissiveIntensity = THREE.MathUtils.lerp(
          material.emissiveIntensity,
          targetEmissive,
          0.14
        );
      });

      const pointerTiltX = mouse.y >= -1 && mouse.y <= 1 ? mouse.y * 0.12 : 0;
      const pointerTiltY = mouse.x >= -1 && mouse.x <= 1 ? mouse.x * 0.18 : 0;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, -0.28 + pointerTiltX, 0.04);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, -0.22 + pointerTiltY, 0.04);

      renderer.render(scene, camera);
    };

    updateSize();
    animate();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);

      boxes.forEach((box) => {
        (box.material as THREE.Material).dispose();
      });

      geometry.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[40rem] overflow-hidden lg:block"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 72%, transparent 100%)",
      }}
    />
  );
}
