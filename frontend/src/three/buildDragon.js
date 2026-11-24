import * as THREE from 'three';

function createCurvedHorn(points, baseR, tipR, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 16, baseR, 8, false);
  const pos = geo.attributes.position;
  const center = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    const ringIdx = Math.floor(i / 9);
    const t = Math.min(ringIdx / 16, 1);
    curve.getPoint(t, center);
    const scale = 1 - t * (1 - tipR / baseR);
    pos.setXYZ(
      i,
      center.x + (pos.getX(i) - center.x) * scale,
      center.y + (pos.getY(i) - center.y) * scale,
      center.z + (pos.getZ(i) - center.z) * scale,
    );
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  return mesh;
}

function createArticulatedWing(wingMat, boneMat, hornMat, side) {
  const shoulderPivot = new THREE.Group();

  // Braço interno (úmero + antebraço)
  const humerus = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.92, 10), boneMat);
  humerus.rotation.z = side * -1.02;
  humerus.position.set(side * 0.42, 0.24, 0.02);
  humerus.castShadow = true;
  shoulderPivot.add(humerus);

  // Pivô externo (pulso/mão da asa para dobrar sutilmente durante o batimento)
  const outerPivot = new THREE.Group();
  outerPivot.position.set(side * 0.82, 0.48, 0.02);
  shoulderPivot.add(outerPivot);

  // Garra do polegar da asa
  const thumbClaw = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 6), hornMat);
  thumbClaw.position.set(side * 0.04, 0.14, 0.04);
  thumbClaw.rotation.z = side * -0.35;
  outerPivot.add(thumbClaw);

  // Falanges ósseas irradiando do pulso
  const fingerTips = [
    new THREE.Vector3(side * 1.48, 0.48, -0.08),
    new THREE.Vector3(side * 1.32, -0.06, -0.14),
    new THREE.Vector3(side * 0.88, -0.58, -0.1),
    new THREE.Vector3(side * 0.34, -0.82, -0.06),
  ];

  fingerTips.forEach((tip, idx) => {
    const mid = tip.clone().multiplyScalar(0.55);
    mid.y += 0.09 - idx * 0.02;
    const bone = createCurvedHorn([new THREE.Vector3(0, 0, 0), mid, tip], 0.036 - idx * 0.004, 0.01, boneMat);
    outerPivot.add(bone);
  });

  // Membrana translúcida recortada entre as falanges
  const shape = new THREE.Shape();
  shape.moveTo(-side * 0.82, -0.48);
  shape.lineTo(0, 0);
  shape.lineTo(fingerTips[0].x, fingerTips[0].y);
  shape.quadraticCurveTo(side * 1.24, 0.16, fingerTips[1].x, fingerTips[1].y);
  shape.quadraticCurveTo(side * 0.96, -0.26, fingerTips[2].x, fingerTips[2].y);
  shape.quadraticCurveTo(side * 0.56, -0.56, fingerTips[3].x, fingerTips[3].y);
  shape.quadraticCurveTo(side * -0.22, -0.62, -side * 0.78, -0.74);
  shape.closePath();

  const membraneGeo = new THREE.ShapeGeometry(shape, 10);
  const membrane = new THREE.Mesh(membraneGeo, wingMat);
  membrane.position.z = -0.03;
  membrane.castShadow = true;
  outerPivot.add(membrane);

  return { shoulderPivot, outerPivot };
}

/**
 * Constrói um Dragão procedural detalhado com PBR de escamas, membranas translúcidas,
 * chifres curvos, mandíbula articulada, olhos com fenda e coluna/pescoço/cauda segmentados.
 */
export function buildProceduralDragon({ textures, fireColor = 0xff7b29 }) {
  const root = new THREE.Group();
  root.name = 'ProceduralDragon';

  const scaleMat = new THREE.MeshStandardMaterial({
    map: textures.scales.map,
    bumpMap: textures.scales.bumpMap,
    bumpScale: 0.06,
    roughnessMap: textures.scales.roughnessMap,
    roughness: 0.75,
    metalness: 0.22,
  });

  const darkScaleMat = new THREE.MeshStandardMaterial({
    map: textures.scales.map,
    bumpMap: textures.scales.bumpMap,
    bumpScale: 0.05,
    color: 0x0e241d,
    roughness: 0.58,
    metalness: 0.26,
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    map: textures.metal.map,
    roughnessMap: textures.metal.roughnessMap,
    color: 0xaa8652,
    roughness: 0.56,
    metalness: 0.32,
  });

  const hornMat = new THREE.MeshStandardMaterial({
    color: 0xdcc59b,
    roughness: 0.34,
    metalness: 0.28,
  });

  const wingMat = new THREE.MeshPhysicalMaterial({
    map: textures.wing.map,
    bumpMap: textures.wing.bumpMap,
    bumpScale: 0.03,
    color: 0x265848,
    roughness: 0.58,
    metalness: 0.06,
    transmission: 0.18,
    thickness: 0.25,
    transparent: true,
    opacity: 0.88,
    sheen: 0.35,
    sheenColor: new THREE.Color(0x8bc9ae),
    side: THREE.DoubleSide,
  });

  const eyeIrisMat = new THREE.MeshStandardMaterial({
    color: 0xffd24c,
    emissive: new THREE.Color(fireColor),
    emissiveIntensity: 2.8,
    roughness: 0.12,
    metalness: 0.2,
  });

  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x080605 });

  const throatMat = new THREE.MeshStandardMaterial({
    color: fireColor,
    emissive: new THREE.Color(fireColor),
    emissiveIntensity: 0.45,
    roughness: 0.4,
  });

  // 1. Corpo principal musculoso + placas ventrais + espinhos dorsais
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.68, 22, 18), scaleMat);
  chest.scale.set(0.86, 0.82, 1.38);
  chest.castShadow = true;
  chest.receiveShadow = true;
  bodyGroup.add(chest);

  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 14), scaleMat);
  abdomen.scale.set(0.82, 0.72, 1.25);
  abdomen.position.set(0, -0.06, -0.75);
  abdomen.castShadow = true;
  bodyGroup.add(abdomen);

  // Placas ventrais douradas/bronze segmentadas
  for (let i = 0; i < 6; i += 1) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.38 - i * 0.03, 0.35 - i * 0.03, 0.22, 12), bellyMat);
    plate.rotation.x = Math.PI / 2 + 0.12;
    plate.scale.set(1.05, 1, 0.42);
    plate.position.set(0, -0.36 + Math.abs(i - 2) * 0.03, 0.45 - i * 0.27);
    bodyGroup.add(plate);
  }

  // Crista dorsal
  for (let i = 0; i < 7; i += 1) {
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28 - i * 0.014, 5), hornMat);
    spine.position.set(0, 0.56 - i * 0.04, 0.52 - i * 0.28);
    spine.rotation.x = -0.45;
    spine.castShadow = true;
    bodyGroup.add(spine);
  }

  // Patas dianteiras e traseiras com garras
  [-1, 1].forEach((side) => {
    const frontLeg = new THREE.Group();
    frontLeg.position.set(side * 0.46, -0.22, 0.42);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.56, 10), scaleMat);
    upper.position.set(side * 0.05, -0.24, 0.05);
    upper.rotation.x = 0.28;
    frontLeg.add(upper);
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), darkScaleMat);
    paw.scale.set(1.1, 0.55, 1.35);
    paw.position.set(side * 0.06, -0.52, 0.18);
    frontLeg.add(paw);
    for (let c = -1; c <= 1; c += 1) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.15, 5), hornMat);
      claw.position.set(side * 0.06 + c * 0.06, -0.54, 0.34);
      claw.rotation.x = 1.25;
      frontLeg.add(claw);
    }
    bodyGroup.add(frontLeg);

    const hindLeg = new THREE.Group();
    hindLeg.position.set(side * 0.42, -0.2, -0.78);
    const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), scaleMat);
    thigh.scale.set(0.75, 1.2, 1.15);
    thigh.position.set(side * 0.04, -0.12, 0);
    hindLeg.add(thigh);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.48, 10), darkScaleMat);
    shin.position.set(side * 0.06, -0.42, -0.06);
    shin.rotation.x = -0.25;
    hindLeg.add(shin);
    bodyGroup.add(hindLeg);
  });

  // 2. Pescoço segmentado articulado em curva S
  const neckSegments = [];
  let neckParent = bodyGroup;
  for (let i = 0; i < 5; i += 1) {
    const segPivot = new THREE.Group();
    segPivot.position.set(0, i === 0 ? 0.24 : 0.24, i === 0 ? 0.72 : 0.18);
    const rTop = 0.24 - i * 0.018;
    const rBot = 0.28 - i * 0.018;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, 0.34, 12), scaleMat);
    seg.rotation.x = 0.55 - i * 0.06;
    seg.position.set(0, 0.12, 0.08);
    seg.castShadow = true;
    segPivot.add(seg);

    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 5), hornMat);
    spike.position.set(0, 0.24, -0.08);
    spike.rotation.x = -0.68;
    segPivot.add(spike);

    neckParent.add(segPivot);
    neckSegments.push(segPivot);
    neckParent = segPivot;
  }

  // 3. Cabeça Dracônica Esculpida + Mandíbula + Olhos com Fenda + Chifres Curvos
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.2, 0.16);
  neckParent.add(headPivot);

  const cranium = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), darkScaleMat);
  cranium.scale.set(0.95, 0.78, 1.25);
  cranium.position.set(0, 0.06, 0.16);
  cranium.castShadow = true;
  headPivot.add(cranium);

  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.23, 0.62, 7), scaleMat);
  snout.rotation.x = Math.PI / 2;
  snout.scale.set(1.05, 1, 0.72);
  snout.position.set(0, 0.03, 0.56);
  snout.castShadow = true;
  headPivot.add(snout);

  // Chifre nasal
  const nasalHorn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.2, 6), hornMat);
  nasalHorn.position.set(0, 0.16, 0.76);
  nasalHorn.rotation.x = -0.3;
  headPivot.add(nasalHorn);

  // Interior luminoso da boca/garganta (intensifica no clique)
  const throatGlow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), throatMat);
  throatGlow.position.set(0, -0.05, 0.42);
  headPivot.add(throatGlow);

  const mouthLight = new THREE.PointLight(fireColor, 0.4, 3.8, 1.8);
  mouthLight.position.set(0, -0.04, 0.78);
  headPivot.add(mouthLight);

  // Mandíbula articulada + presas
  const jawPivot = new THREE.Group();
  jawPivot.position.set(0, -0.06, 0.24);
  headPivot.add(jawPivot);

  const lowerJaw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.17, 0.54, 6), darkScaleMat);
  lowerJaw.rotation.x = Math.PI / 2;
  lowerJaw.scale.set(1, 1, 0.55);
  lowerJaw.position.set(0, -0.04, 0.28);
  jawPivot.add(lowerJaw);

  [-0.08, 0.08].forEach((fx) => {
    const upperFang = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.11, 5), hornMat);
    upperFang.rotation.x = Math.PI;
    upperFang.position.set(fx, -0.07, 0.72);
    headPivot.add(upperFang);

    const lowerFang = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.08, 5), hornMat);
    lowerFang.position.set(fx * 0.85, 0.02, 0.44);
    jawPivot.add(lowerFang);
  });

  // Olhos reptilianos brilhantes com pupila vertical + chifres principais e secundários
  [-1, 1].forEach((side) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.24), darkScaleMat);
    brow.position.set(side * 0.21, 0.17, 0.34);
    brow.rotation.z = side * -0.25;
    headPivot.add(brow);

    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 12), eyeIrisMat);
    eye.position.set(side * 0.21, 0.1, 0.35);
    headPivot.add(eye);

    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.085, 0.025), pupilMat);
    pupil.position.set(side * 0.255, 0.1, 0.38);
    headPivot.add(pupil);

    const mainHorn = createCurvedHorn(
      [
        new THREE.Vector3(side * 0.16, 0.2, 0.04),
        new THREE.Vector3(side * 0.34, 0.44, -0.32),
        new THREE.Vector3(side * 0.42, 0.62, -0.78),
      ],
      0.075,
      0.012,
      hornMat,
    );
    headPivot.add(mainHorn);

    const cheekHorn = createCurvedHorn(
      [
        new THREE.Vector3(side * 0.22, 0.02, 0.04),
        new THREE.Vector3(side * 0.36, 0.06, -0.26),
        new THREE.Vector3(side * 0.42, 0.14, -0.46),
      ],
      0.042,
      0.008,
      hornMat,
    );
    headPivot.add(cheekHorn);
  });

  // 4. Asas Membranosas Amplas
  const leftWing = createArticulatedWing(wingMat, darkScaleMat, hornMat, -1);
  leftWing.shoulderPivot.position.set(-0.34, 0.32, 0.18);
  leftWing.shoulderPivot.rotation.y = 0.24;
  bodyGroup.add(leftWing.shoulderPivot);

  const rightWing = createArticulatedWing(wingMat, darkScaleMat, hornMat, 1);
  rightWing.shoulderPivot.position.set(0.34, 0.32, 0.18);
  rightWing.shoulderPivot.rotation.y = -0.24;
  bodyGroup.add(rightWing.shoulderPivot);

  // 5. Cauda longa segmentada com espinhos e ponta laminada
  const tailSegments = [];
  let tailParent = bodyGroup;
  for (let i = 0; i < 7; i += 1) {
    const tPivot = new THREE.Group();
    tPivot.position.set(0, i === 0 ? -0.06 : 0, i === 0 ? -1.16 : -0.36);
    const radius = Math.max(0.24 - i * 0.03, 0.04);
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.78, radius, 0.42, 10), scaleMat);
    seg.rotation.x = Math.PI / 2;
    seg.position.z = -0.18;
    seg.castShadow = true;
    tPivot.add(seg);

    if (i < 5) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14 - i * 0.015, 4), hornMat);
      sp.position.set(0, radius + 0.03, -0.18);
      sp.rotation.x = -0.5;
      tPivot.add(sp);
    } else if (i === 6) {
      const spade = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), hornMat);
      spade.rotation.x = -Math.PI / 2;
      spade.scale.set(1.3, 1, 0.35);
      spade.position.z = -0.44;
      tPivot.add(spade);
    }

    tailParent.add(tPivot);
    tailSegments.push(tPivot);
    tailParent = tPivot;
  }

  return {
    root,
    rig: {
      bodyGroup,
      neckSegments,
      headPivot,
      jawPivot,
      leftWing,
      rightWing,
      tailSegments,
      throatMat,
      mouthLight,
      eyeIrisMat,
    },
  };
}
