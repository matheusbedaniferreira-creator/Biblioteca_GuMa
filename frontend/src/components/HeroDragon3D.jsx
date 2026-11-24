import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function createWing(wingMat, boneMat, hornMat, side) {
  const wing = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.95, 8), boneMat);
  arm.rotation.z = side * -0.95;
  arm.position.set(side * 0.42, 0.25, 0);
  wing.add(arm);

  const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 6), hornMat);
  claw.position.set(side * 0.84, 0.56, 0.02);
  claw.rotation.z = side * -0.35;
  wing.add(claw);

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(side * 0.85, 0.56);
  shape.lineTo(side * 1.95, 0.72);
  shape.lineTo(side * 1.68, 0.14);
  shape.lineTo(side * 1.32, -0.34);
  shape.lineTo(side * 0.85, -0.18);
  shape.lineTo(side * 0.42, -0.42);
  shape.closePath();

  const membrane = new THREE.Mesh(new THREE.ShapeGeometry(shape), wingMat);
  membrane.position.z = -0.02;
  wing.add(membrane);

  const ribs = [
    [side * 0.85, 0.56, side * 1.95, 0.72],
    [side * 0.85, 0.56, side * 1.68, 0.14],
    [side * 0.85, 0.56, side * 1.32, -0.34],
  ];
  ribs.forEach(([x1, y1, x2, y2]) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.01, len, 6), boneMat);
    rib.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
    rib.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
    wing.add(rib);
  });

  return wing;
}

export default function HeroDragon3D() {
  const containerRef = useRef(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      setWebglUnavailable(true);
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      setWebglUnavailable(true);
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0.35, 6.2);

    // Lighting
    scene.add(new THREE.AmbientLight(0xdbe7dc, 1.35));
    const keyLight = new THREE.DirectionalLight(0xfff4dc, 2.2);
    keyLight.position.set(3.5, 4.5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5ab, 1.4);
    rimLight.position.set(-4, 2, -2);
    scene.add(rimLight);

    // Materials
    const scaleMat = new THREE.MeshStandardMaterial({ color: 0x1e4d3f, roughness: 0.44, metalness: 0.18 });
    const boneMat = new THREE.MeshStandardMaterial({ color: 0x15392e, roughness: 0.52, metalness: 0.15 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xc9a063, roughness: 0.38, metalness: 0.28 });
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xe6cfa4, roughness: 0.32, metalness: 0.35 });
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x2a6553,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });

    const dragonRoot = new THREE.Group();
    dragonRoot.rotation.y = -0.35;
    scene.add(dragonRoot);

    // Torso
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 14), scaleMat);
    torso.scale.set(0.85, 0.78, 1.38);
    dragonRoot.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), bellyMat);
    chest.scale.set(0.72, 0.65, 1.15);
    chest.position.set(0, -0.14, 0.12);
    dragonRoot.add(chest);

    for (let i = 0; i < 4; i += 1) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 5), hornMat);
      spine.position.set(0, 0.52 - i * 0.04, 0.42 - i * 0.32);
      spine.rotation.x = -0.35;
      dragonRoot.add(spine);
    }

    // Neck & Head
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.28, 0.66);
    dragonRoot.add(neckPivot);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.72, 12), scaleMat);
    neck.position.set(0, 0.32, 0.14);
    neck.rotation.x = 0.42;
    neckPivot.add(neck);

    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.66, 0.28);
    neckPivot.add(headPivot);

    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.56), scaleMat);
    skull.position.set(0, 0.04, 0.14);
    headPivot.add(skull);

    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.46), scaleMat);
    snout.position.set(0, 0.01, 0.52);
    headPivot.add(snout);

    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.4), boneMat);
    jaw.position.set(0, -0.12, 0.48);
    jaw.rotation.x = 0.12;
    headPivot.add(jaw);

    [-1, 1].forEach((side) => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.58, 7), hornMat);
      horn.position.set(side * 0.16, 0.3, -0.14);
      horn.rotation.x = -0.78;
      horn.rotation.z = side * -0.22;
      headPivot.add(horn);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 10), eyeMat);
      eye.position.set(side * 0.2, 0.1, 0.32);
      headPivot.add(eye);
    });

    // Wings
    const leftWing = createWing(wingMat, boneMat, hornMat, -1);
    leftWing.position.set(-0.28, 0.28, 0.1);
    leftWing.rotation.y = 0.25;
    dragonRoot.add(leftWing);

    const rightWing = createWing(wingMat, boneMat, hornMat, 1);
    rightWing.position.set(0.28, 0.28, 0.1);
    rightWing.rotation.y = -0.25;
    dragonRoot.add(rightWing);

    // Tail
    const tailSegments = [];
    let parentGroup = dragonRoot;
    for (let i = 0; i < 5; i += 1) {
      const segPivot = new THREE.Group();
      segPivot.position.set(0, i === 0 ? -0.05 : 0, i === 0 ? -0.78 : -0.36);
      const radius = 0.22 - i * 0.036;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.78, radius, 0.42, 10), scaleMat);
      seg.rotation.x = Math.PI / 2;
      seg.position.z = -0.18;
      segPivot.add(seg);
      parentGroup.add(segPivot);
      tailSegments.push(segPivot);
      parentGroup = segPivot;
    }

    const updateSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);

      if (w < 680) {
        dragonRoot.position.set(0.4, -0.2, 0);
        dragonRoot.scale.setScalar(0.72);
      } else {
        dragonRoot.position.set(1.65, -0.05, 0);
        dragonRoot.scale.setScalar(1.0);
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.x = THREE.MathUtils.clamp(nx, -1, 1);
      target.y = THREE.MathUtils.clamp(ny, -1, 1);
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
      return () => {
        ro.disconnect();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
        renderer.dispose();
      };
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    let rafId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      // Subtle breathing & cursor tracking
      dragonRoot.position.y = (container.clientWidth < 680 ? -0.2 : -0.05) + Math.sin(t * 1.5) * 0.08;
      dragonRoot.rotation.y = -0.35 + current.x * 0.14;
      neckPivot.rotation.y = current.x * 0.25;
      neckPivot.rotation.x = current.y * 0.14;
      headPivot.rotation.y = current.x * 0.35;
      headPivot.rotation.x = current.y * 0.22;

      // Subtle wing flap
      const flap = Math.sin(t * 2.2) * 0.2;
      leftWing.rotation.z = flap - 0.08;
      rightWing.rotation.z = -flap + 0.08;

      // Tail sway
      tailSegments.forEach((seg, idx) => {
        seg.rotation.y = Math.sin(t * 1.6 - idx * 0.45) * 0.14;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="hero-dragon-layer hero-dragon-fallback" aria-hidden="true">
        <svg viewBox="0 0 360 220" className="dragon-fallback-svg">
          <path d="M120 155 C140 110, 190 95, 230 115 C250 125, 265 100, 290 88 C310 80, 325 88, 320 100 C305 106, 285 110, 270 135 C255 162, 225 180, 175 180 C140 180, 110 170, 120 155 Z" fill="#1e4d3f" opacity=".28"/>
          <path d="M165 118 C135 58, 82 32, 34 44 C64 64, 78 90, 74 116 C100 104, 124 110, 140 128 Z" fill="#2a6553" opacity=".24"/>
        </svg>
      </div>
    );
  }

  return <div ref={containerRef} className="hero-dragon-layer" aria-hidden="true"/>;
}
