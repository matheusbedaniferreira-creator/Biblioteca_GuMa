import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createAgedMetalTextures,
  createDragonScaleTextures,
  createFabricTextures,
  createSoftGlowTexture,
  createStoneTextures,
  createWingMembraneTextures,
  createWoodTextures,
} from '../three/proceduralTextures';
import { buildProceduralWizard } from '../three/buildWizard';
import { buildProceduralDragon } from '../three/buildDragon';
import { buildArcaneEnvironment } from '../three/buildEnvironment';

/**
 * Configurações centralizadas da cena 3D de Mago e Dragão.
 * Para substituir pelas suas próprias malhas .glb/.gltf, preencha wizardUrl ou dragonUrl.
 */
export const SCENE_CONFIG = {
  mouseParallax: 0.42,
  lookAtStrength: 1.0,
  magicColor: 0x4fd1c5,
  fireColor: 0xff8433,
  accentColor: 0xe2bd7d,
  bloom: {
    threshold: 0.85,
    strength: 0.56,
    radius: 0.42,
  },
  wizard: {
    position: [-0.35, -1.62, 0.35],
    scale: 0.92,
  },
  dragon: {
    position: [2.15, 0.28, -0.55],
    scale: 0.96,
  },
  models: {
    wizardUrl: '',
    dragonUrl: '',
  },
};

export default function HeroDragon3D() {
  const containerRef = useRef(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [veilLevel, setVeilLevel] = useState('normal'); // 'soft' | 'normal' | 'strong'

  const stateRef = useRef({ paused: false, lowPower: false });
  stateRef.current.paused = paused;
  stateRef.current.lowPower = lowPower;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      setWebglUnavailable(true);
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x112923, 0.048);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    const baseCamPos = new THREE.Vector3(0.45, 0.25, 6.85);
    const camLookTarget = new THREE.Vector3(0.65, -0.1, -0.2);
    camera.position.copy(baseCamPos);
    camera.lookAt(camLookTarget);

    // Environment Map procedural (reflexos realistas em metais, olhos e escamas)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();

    // Iluminação cinematográfica 3 pontos + atmosfera
    const hemiLight = new THREE.HemisphereLight(0x9ec7bc, 0x15251f, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe9c8, 2.35);
    keyLight.position.set(4.5, 6.2, 4.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 4.5;
    keyLight.shadow.camera.bottom = -4.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.035;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x5da9b8, 0.95);
    fillLight.position.set(-5.5, 2.2, 3.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf6c989, 1.85);
    rimLight.position.set(-2.2, 4.5, -5.2);
    scene.add(rimLight);

    // Texturas PBR procedurais
    const textures = {
      scales: createDragonScaleTextures(),
      wing: createWingMembraneTextures(),
      fabric: createFabricTextures(),
      metal: createAgedMetalTextures(),
      wood: createWoodTextures(),
      stone: createStoneTextures(),
      glow: createSoftGlowTexture(),
    };

    // Ambiente (céu GLSL, penhasco, ruínas, névoa, partículas e sistema de pulso)
    const environment = buildArcaneEnvironment({
      textures,
      magicColor: SCENE_CONFIG.magicColor,
      emberColor: SCENE_CONFIG.fireColor,
    });
    scene.add(environment.group);

    // Mago e Dragão procedurais (ativos imediatamente, sem depender de assets externos)
    const wizard = buildProceduralWizard({
      textures,
      magicColor: SCENE_CONFIG.magicColor,
      accentColor: SCENE_CONFIG.accentColor,
    });
    wizard.root.position.set(...SCENE_CONFIG.wizard.position);
    wizard.root.scale.setScalar(SCENE_CONFIG.wizard.scale);
    wizard.root.rotation.y = 0.42;
    scene.add(wizard.root);

    const dragon = buildProceduralDragon({
      textures,
      fireColor: SCENE_CONFIG.fireColor,
    });
    dragon.root.position.set(...SCENE_CONFIG.dragon.position);
    dragon.root.scale.setScalar(SCENE_CONFIG.dragon.scale);
    dragon.root.rotation.y = -0.68;
    scene.add(dragon.root);

    // Suporte opcional para carregar modelos .glb/.gltf externos caso configurados
    const gltfLoader = new GLTFLoader();
    if (SCENE_CONFIG.models.wizardUrl) {
      gltfLoader.load(
        SCENE_CONFIG.models.wizardUrl,
        (gltf) => {
          gltf.scene.position.copy(wizard.root.position);
          gltf.scene.scale.copy(wizard.root.scale);
          gltf.scene.rotation.copy(wizard.root.rotation);
          scene.remove(wizard.root);
          scene.add(gltf.scene);
        },
        undefined,
        () => {
          // Mantém o mago procedural em caso de erro no carregamento externo
        },
      );
    }
    if (SCENE_CONFIG.models.dragonUrl) {
      gltfLoader.load(
        SCENE_CONFIG.models.dragonUrl,
        (gltf) => {
          gltf.scene.position.copy(dragon.root.position);
          gltf.scene.scale.copy(dragon.root.scale);
          gltf.scene.rotation.copy(dragon.root.rotation);
          scene.remove(dragon.root);
          scene.add(gltf.scene);
        },
        undefined,
        () => {
          // Mantém o dragão procedural em caso de erro no carregamento externo
        },
      );
    }

    // Pós-processamento seletivo (UnrealBloomPass + OutputPass)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      SCENE_CONFIG.bloom.strength,
      SCENE_CONFIG.bloom.radius,
      SCENE_CONFIG.bloom.threshold,
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // Responsividade do canvas limitada à primeira seção (.hero)
    const updateSize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      const dpr = stateRef.current.lowPower ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);

      if (w < 720) {
        wizard.root.position.set(-0.95, -1.7, 0.1);
        wizard.root.scale.setScalar(0.72);
        dragon.root.position.set(0.85, 0.45, -1.1);
        dragon.root.scale.setScalar(0.72);
        baseCamPos.set(0, 0.35, 7.6);
      } else {
        wizard.root.position.set(...SCENE_CONFIG.wizard.position);
        wizard.root.scale.setScalar(SCENE_CONFIG.wizard.scale);
        dragon.root.position.set(...SCENE_CONFIG.dragon.position);
        dragon.root.scale.setScalar(SCENE_CONFIG.dragon.scale);
        baseCamPos.set(0.45, 0.25, 6.85);
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    // Captura global não-invasiva de ponteiro (sem bloquear cliques ou rolagem)
    const pointerTarget = { x: 0, y: 0 };
    const pointerSmooth = { x: 0, y: 0 };
    let pointerInside = false;
    let spellImpulse = 0;

    const raycaster = new THREE.Raycaster();
    const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.2);
    const cursorWorld = new THREE.Vector3(0.8, 0.1, -0.2);
    const ndcVec = new THREE.Vector2();

    const updateCursorWorld = (nx, ny) => {
      ndcVec.set(nx, -ny);
      raycaster.setFromCamera(ndcVec, camera);
      raycaster.ray.intersectPlane(interactionPlane, cursorWorld);
    };

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const inVert = e.clientY >= rect.top - 120 && e.clientY <= rect.bottom + 120;
      pointerInside = inVert;
      const nx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      pointerTarget.x = nx;
      pointerTarget.y = ny;
      updateCursorWorld(nx, ny);
    };

    const onPointerDown = (e) => {
      if (stateRef.current.paused || reducedMotion) return;
      // Não dispara efeitos ao clicar em links, botões, inputs ou controles
      if (e.target instanceof Element && e.target.closest('a,button,input,textarea,select,label,.scene-controls')) {
        return;
      }
      const rect = container.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      const nx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      updateCursorWorld(nx, ny);

      spellImpulse = 1.0;
      const wizardOrigin = new THREE.Vector3();
      const dragonOrigin = new THREE.Vector3();
      wizard.rig.crystal.getWorldPosition(wizardOrigin);
      dragon.rig.jawPivot.getWorldPosition(dragonOrigin);
      environment.triggerSpellBurst(wizardOrigin, dragonOrigin, cursorWorld);
    };

    const onPointerLeave = () => {
      pointerInside = false;
      pointerTarget.x = 0;
      pointerTarget.y = 0;
    };

    const onContextLost = (e) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

    if (reducedMotion) {
      composer.render();
      return () => {
        ro.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        envTarget.dispose();
        pmrem.dispose();
        composer.dispose();
        if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
        renderer.dispose();
      };
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave);
    window.addEventListener('blur', onPointerLeave);

    let rafId = 0;
    let elapsed = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (stateRef.current.paused) return;

      elapsed += dt;
      const damp = 1 - Math.exp(-dt * 4.5);
      pointerSmooth.x += (pointerTarget.x - pointerSmooth.x) * damp;
      pointerSmooth.y += (pointerTarget.y - pointerSmooth.y) * damp;
      spellImpulse = Math.max(0, spellImpulse - dt * 1.35);

      const lookK = SCENE_CONFIG.lookAtStrength;

      // 1. Câmera com paralaxe 3D suave
      camera.position.x = baseCamPos.x + pointerSmooth.x * SCENE_CONFIG.mouseParallax;
      camera.position.y = baseCamPos.y - pointerSmooth.y * (SCENE_CONFIG.mouseParallax * 0.55) + Math.sin(elapsed * 0.6) * 0.04;
      camera.lookAt(camLookTarget);

      // 2. Micro-animações e Look-At do Mago
      const wRig = wizard.rig;
      const breath = Math.sin(elapsed * 1.7);
      wRig.torsoPivot.position.y = 1.18 + breath * 0.018;
      wRig.torsoPivot.rotation.y = pointerSmooth.x * 0.16 * lookK;
      wRig.headPivot.rotation.y = THREE.MathUtils.clamp(pointerSmooth.x * 0.36 * lookK, -0.45, 0.45);
      wRig.headPivot.rotation.x = THREE.MathUtils.clamp(pointerSmooth.y * 0.22 * lookK, -0.28, 0.28);
      wRig.beardPivot.rotation.x = Math.sin(elapsed * 2.1) * 0.04;
      wRig.capePivot.rotation.x = 0.08 + Math.sin(elapsed * 1.4) * 0.055;

      // Cajado e runas reagindo ao clique mágico
      wRig.rightArmPivot.rotation.x = -spellImpulse * 0.34 + Math.sin(elapsed * 1.1) * 0.04;
      wRig.leftArmPivot.rotation.x = -0.15 - spellImpulse * 0.28 + Math.cos(elapsed * 1.3) * 0.05;
      wRig.crystal.rotation.y = elapsed * 1.4;
      wRig.crystal.position.y = 0.14 + Math.sin(elapsed * 2.6) * 0.025;
      wRig.runeRingA.rotation.z = elapsed * 1.1;
      wRig.runeRingA.rotation.x = Math.sin(elapsed * 0.9) * 0.45;
      wRig.runeRingB.rotation.y = -elapsed * 1.5;
      wRig.handSigil.rotation.z = -elapsed * 1.6;
      wRig.staffLight.intensity = 3.2 + Math.sin(elapsed * 3.5) * 0.45 + spellImpulse * 4.5;
      wRig.crystalMat.emissiveIntensity = 2.6 + spellImpulse * 2.8;
      wRig.runeMat.emissiveIntensity = 2.1 + spellImpulse * 2.2;

      // 3. Animação orgânica e reação do Dragão
      const dRig = dragon.rig;
      const wingSpeed = 2.1 + spellImpulse * 2.4;
      const flap = Math.sin(elapsed * wingSpeed);
      dRig.bodyGroup.position.y = Math.sin(elapsed * 1.45) * 0.14 + spellImpulse * 0.16;
      dRig.bodyGroup.rotation.z = Math.sin(elapsed * 1.1) * 0.03 - pointerSmooth.x * 0.05;

      dRig.leftWing.shoulderPivot.rotation.z = flap * (0.28 + spellImpulse * 0.18) - 0.06;
      dRig.leftWing.outerPivot.rotation.z = Math.sin(elapsed * wingSpeed - 0.55) * 0.22;
      dRig.rightWing.shoulderPivot.rotation.z = -flap * (0.28 + spellImpulse * 0.18) + 0.06;
      dRig.rightWing.outerPivot.rotation.z = -Math.sin(elapsed * wingSpeed - 0.55) * 0.22;

      // Pescoço e cabeça acompanhando cursor com limites anatômicos
      dRig.neckSegments.forEach((seg, i) => {
        const w = (i + 1) / dRig.neckSegments.length;
        seg.rotation.y = THREE.MathUtils.clamp(pointerSmooth.x * 0.11 * w * lookK, -0.18, 0.18);
        seg.rotation.x = Math.sin(elapsed * 1.5 - i * 0.35) * 0.04 + pointerSmooth.y * 0.06 * w * lookK - spellImpulse * 0.07 * w;
      });
      dRig.headPivot.rotation.y = THREE.MathUtils.clamp(pointerSmooth.x * 0.34 * lookK, -0.45, 0.45);
      dRig.headPivot.rotation.x = THREE.MathUtils.clamp(pointerSmooth.y * 0.22 * lookK - spellImpulse * 0.22, -0.35, 0.3);
      dRig.jawPivot.rotation.x = 0.08 + Math.max(0, Math.sin(elapsed * 1.3)) * 0.08 + spellImpulse * 0.36;
      dRig.throatMat.emissiveIntensity = 0.45 + spellImpulse * 3.4;
      dRig.mouthLight.intensity = 0.4 + spellImpulse * 3.8;

      // Cauda ondulando
      dRig.tailSegments.forEach((seg, i) => {
        seg.rotation.y = Math.sin(elapsed * 1.65 - i * 0.42) * 0.16;
        seg.rotation.x = Math.cos(elapsed * 1.2 - i * 0.3) * 0.05;
      });

      // 4. Atmosfera, névoa, partículas e aura do cursor
      environment.update(dt, elapsed, cursorWorld, pointerInside);

      if (stateRef.current.lowPower) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('mouseleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      ro.disconnect();

      Object.values(textures).forEach((entry) => {
        if (entry instanceof THREE.Texture) {
          entry.dispose();
        } else if (entry && typeof entry === 'object') {
          Object.values(entry).forEach((t) => {
            if (t && typeof t.dispose === 'function') t.dispose();
          });
        }
      });

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      envTarget.dispose();
      pmrem.dispose();
      composer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Reajusta DPR ao alternar modo leve
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, [lowPower]);

  if (webglUnavailable) {
    return (
      <div className="hero-dragon-layer hero-dragon-fallback" aria-hidden="true">
        <div className="hero-veil veil-normal"/>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="hero-dragon-layer" aria-hidden="true"/>
      <div className={`hero-veil veil-${veilLevel}`} aria-hidden="true"/>
      <div className="scene-controls">
        {controlsOpen && (
          <div className="scene-controls-panel" role="group" aria-label="Controles do cenário 3D">
            <button type="button" onClick={() => setPaused((v) => !v)}>
              {paused ? 'Retomar' : 'Pausar'}
            </button>
            <button type="button" onClick={() => setLowPower((v) => !v)}>
              {lowPower ? 'Qualidade: Alta' : 'Modo leve'}
            </button>
            <button
              type="button"
              onClick={() => setVeilLevel((v) => (v === 'normal' ? 'strong' : v === 'strong' ? 'soft' : 'normal'))}
            >
              Contraste: {veilLevel === 'normal' ? 'Médio' : veilLevel === 'strong' ? 'Alto' : 'Suave'}
            </button>
          </div>
        )}
        <button
          type="button"
          className="scene-controls-toggle"
          onClick={() => setControlsOpen((v) => !v)}
          aria-expanded={controlsOpen}
          title="Ajustar cena 3D"
        >
          3D
        </button>
      </div>
    </>
  );
}
