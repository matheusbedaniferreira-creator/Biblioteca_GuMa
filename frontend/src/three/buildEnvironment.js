import * as THREE from 'three';

/**
 * Constrói o ambiente atmosférico cinematográfico:
 * céu crepuscular via GLSL, penhascos/ruínas basálticas, névoa em camadas,
 * partículas de brasas/poeira e sistema de pulso mágico interativo.
 */
export function buildArcaneEnvironment({ textures, magicColor = 0x4fd1c5, emberColor = 0xff8c42 }) {
  const group = new THREE.Group();
  group.name = 'ArcaneEnvironment';

  // 1. Sky dome procedural com shader GLSL crepuscular/esmeralda
  const skyGeo = new THREE.SphereGeometry(28, 28, 20);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTopColor: { value: new THREE.Color('#091915') },
      uMidColor: { value: new THREE.Color('#16382f') },
      uHorizonColor: { value: new THREE.Color('#2d5244') },
      uGlowColor: { value: new THREE.Color('#c88b4b') },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uGlowColor;
      varying vec3 vWorldPos;
      void main() {
        vec3 dir = normalize(vWorldPos);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.32, 0.62, h));
        col = mix(col, uTopColor, smoothstep(0.58, 0.92, h));
        float twilight = pow(max(0.0, dot(dir, normalize(vec3(0.55, 0.12, -0.82)))), 4.0);
        col += uGlowColor * twilight * 0.28;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  group.add(skyDome);

  // 2. Penhasco rochoso e ruínas antigas para ancorar o Mago e dar escala ao Dragão
  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stone.map,
    bumpMap: textures.stone.bumpMap,
    bumpScale: 0.08,
    roughness: 0.92,
    metalness: 0.05,
  });

  const cliff = new THREE.Mesh(new THREE.DodecahedronGeometry(2.3, 1), stoneMat);
  cliff.scale.set(2.4, 0.65, 1.5);
  cliff.position.set(0.3, -2.15, -0.5);
  cliff.receiveShadow = true;
  group.add(cliff);

  // Pilares de ruínas antigas ao fundo (profundidade para paralaxe)
  const pillarSpecs = [
    { x: -2.6, y: -0.9, z: -4.2, h: 3.1, r: 0.26, rot: 0.06 },
    { x: 0.2, y: -1.1, z: -5.4, h: 2.6, r: 0.24, rot: -0.04 },
    { x: 3.4, y: -0.7, z: -4.6, h: 3.5, r: 0.28, rot: -0.08 },
    { x: 4.5, y: -1.3, z: -3.4, h: 2.1, r: 0.22, rot: 0.1 },
  ];
  pillarSpecs.forEach((p) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(p.r * 0.86, p.r, p.h, 7), stoneMat);
    pillar.position.set(p.x, p.y, p.z);
    pillar.rotation.z = p.rot;
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    group.add(pillar);
  });

  // 3. Camadas de névoa atmosférica (profundidade suave)
  const mistLayers = [];
  for (let i = 0; i < 6; i += 1) {
    const mistMat = new THREE.SpriteMaterial({
      map: textures.glow,
      color: i % 2 === 0 ? 0x6ea693 : 0xdcb481,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mistMat);
    sprite.position.set(-3.2 + i * 1.6, -1.1 + (i % 3) * 0.45, -2.8 - (i % 2) * 1.8);
    sprite.scale.set(5.5 + (i % 3), 2.4, 1);
    group.add(sprite);
    mistLayers.push({ sprite, baseX: sprite.position.x, speed: 0.14 + i * 0.03 });
  }

  // 4. Partículas suspensas (poeira mística e brasas flutuantes)
  const particleCount = 90;
  const pPositions = new Float32Array(particleCount * 3);
  const pColors = new Float32Array(particleCount * 3);
  const pMeta = [];
  const cMagic = new THREE.Color(magicColor);
  const cEmber = new THREE.Color(emberColor);

  for (let i = 0; i < particleCount; i += 1) {
    const x = (Math.random() - 0.35) * 11;
    const y = (Math.random() - 0.45) * 5.2;
    const z = -4.5 + Math.random() * 5.5;
    pPositions[i * 3] = x;
    pPositions[i * 3 + 1] = y;
    pPositions[i * 3 + 2] = z;

    const col = i % 3 === 0 ? cMagic : cEmber;
    pColors[i * 3] = col.r;
    pColors[i * 3 + 1] = col.g;
    pColors[i * 3 + 2] = col.b;
    pMeta.push({ baseX: x, speedY: 0.12 + Math.random() * 0.24, phase: Math.random() * Math.PI * 2 });
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.13,
    map: textures.glow,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ambientParticles = new THREE.Points(particleGeo, particleMat);
  group.add(ambientParticles);

  // 5. Aura mágica do cursor no espaço 3D + Anel de pulso no clique
  const cursorAura = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: textures.glow,
      color: magicColor,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  cursorAura.scale.set(0.65, 0.65, 1);
  group.add(cursorAura);

  const pulseRingMat = new THREE.MeshBasicMaterial({
    color: magicColor,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 36), pulseRingMat);
  group.add(pulseRing);

  // Pool de centelhas de reação (pulso do mago + sopro de brasas do dragão)
  const burstCount = 42;
  const burstPos = new Float32Array(burstCount * 3);
  const burstCol = new Float32Array(burstCount * 3);
  const burstVel = Array.from({ length: burstCount }, () => new THREE.Vector3());
  const burstLife = new Float32Array(burstCount);
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  burstGeo.setAttribute('color', new THREE.BufferAttribute(burstCol, 3));
  const burstMat = new THREE.PointsMaterial({
    size: 0.19,
    map: textures.glow,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const burstPoints = new THREE.Points(burstGeo, burstMat);
  group.add(burstPoints);

  let pulseProgress = 1;

  function triggerSpellBurst(originWizard, originDragon, targetPoint) {
    pulseProgress = 0;
    pulseRing.position.copy(targetPoint);
    pulseRing.scale.setScalar(0.35);

    const dirToTarget = new THREE.Vector3().subVectors(targetPoint, originWizard).normalize();
    for (let i = 0; i < burstCount; i += 1) {
      const fromDragon = i >= burstCount / 2;
      const src = fromDragon ? originDragon : originWizard;
      burstPos[i * 3] = src.x;
      burstPos[i * 3 + 1] = src.y;
      burstPos[i * 3 + 2] = src.z;

      const col = fromDragon ? cEmber : cMagic;
      burstCol[i * 3] = col.r;
      burstCol[i * 3 + 1] = col.g;
      burstCol[i * 3 + 2] = col.b;

      if (fromDragon) {
        burstVel[i].set(
          -1.8 - Math.random() * 1.6,
          (Math.random() - 0.35) * 1.4,
          0.6 + Math.random() * 1.5,
        );
      } else {
        burstVel[i].copy(dirToTarget).multiplyScalar(2.6 + Math.random() * 1.8);
        burstVel[i].x += (Math.random() - 0.5) * 0.9;
        burstVel[i].y += (Math.random() - 0.5) * 0.9;
      }
      burstLife[i] = 0.75 + Math.random() * 0.45;
    }
    burstGeo.attributes.position.needsUpdate = true;
    burstGeo.attributes.color.needsUpdate = true;
  }

  function update(dt, elapsed, cursorWorldPos, pointerInside) {
    // Névoa flutuando
    mistLayers.forEach((m, idx) => {
      m.sprite.position.x = m.baseX + Math.sin(elapsed * m.speed + idx) * 0.65;
    });

    // Partículas ambientes subindo suavemente
    const posAttr = particleGeo.attributes.position;
    for (let i = 0; i < particleCount; i += 1) {
      let y = posAttr.getY(i) + pMeta[i].speedY * dt;
      if (y > 2.8) y = -2.2;
      const x = pMeta[i].baseX + Math.sin(elapsed * 0.6 + pMeta[i].phase) * 0.25;
      posAttr.setXY(i, x, y);
    }
    posAttr.needsUpdate = true;

    // Aura do cursor
    cursorAura.position.lerp(cursorWorldPos, 0.14);
    const targetOpacity = pointerInside ? 0.38 : 0.0;
    cursorAura.material.opacity += (targetOpacity - cursorAura.material.opacity) * 0.08;

    // Anel de pulso mágico
    if (pulseProgress < 1) {
      pulseProgress = Math.min(1, pulseProgress + dt * 1.45);
      const s = 0.35 + pulseProgress * 3.8;
      pulseRing.scale.setScalar(s);
      pulseRingMat.opacity = (1 - pulseProgress) * 0.85;
    } else {
      pulseRingMat.opacity = 0;
    }

    // Centelhas de reação
    let activeBursts = false;
    const bPos = burstGeo.attributes.position;
    for (let i = 0; i < burstCount; i += 1) {
      if (burstLife[i] > 0) {
        activeBursts = true;
        burstLife[i] -= dt;
        bPos.setXYZ(
          i,
          bPos.getX(i) + burstVel[i].x * dt,
          bPos.getY(i) + burstVel[i].y * dt,
          bPos.getZ(i) + burstVel[i].z * dt,
        );
        burstVel[i].multiplyScalar(0.965);
        if (burstLife[i] <= 0) {
          bPos.setXYZ(i, 999, 999, 999);
        }
      }
    }
    if (activeBursts) bPos.needsUpdate = true;
  }

  return { group, update, triggerSpellBurst };
}
