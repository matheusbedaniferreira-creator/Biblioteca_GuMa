import * as THREE from 'three';

/**
 * Constrói um Mago Arcano procedural em 3D com materiais PBR, dobras de tecido,
 * ombreiras metálicas envelhecidas, cajado rúnico com cristal emissivo e rig articulado.
 */
export function buildProceduralWizard({ textures, magicColor = 0x4fd1c5, accentColor = 0xf6c478 }) {
  const root = new THREE.Group();
  root.name = 'ProceduralWizard';

  const robeMat = new THREE.MeshPhysicalMaterial({
    map: textures.fabric.map,
    bumpMap: textures.fabric.bumpMap,
    bumpScale: 0.035,
    color: 0x1b3342,
    roughness: 0.88,
    metalness: 0.04,
    sheen: 0.45,
    sheenRoughness: 0.72,
    sheenColor: new THREE.Color(0x6ba6b8),
  });

  const innerRobeMat = new THREE.MeshStandardMaterial({
    map: textures.fabric.map,
    bumpMap: textures.fabric.bumpMap,
    bumpScale: 0.025,
    color: 0x132622,
    roughness: 0.92,
    metalness: 0.02,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    map: textures.metal.map,
    roughnessMap: textures.metal.roughnessMap,
    color: accentColor,
    metalness: 0.86,
    roughness: 0.36,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xc9a389,
    roughness: 0.68,
    metalness: 0.02,
  });

  const beardMat = new THREE.MeshStandardMaterial({
    color: 0xd8dce0,
    roughness: 0.86,
    metalness: 0.03,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.wood.map,
    bumpMap: textures.wood.bumpMap,
    bumpScale: 0.04,
    color: 0x523726,
    roughness: 0.84,
    metalness: 0.05,
  });

  // Emissive > 1.0 dispara o bloom seletivo sem estourar o restante do manto
  const crystalMat = new THREE.MeshStandardMaterial({
    color: magicColor,
    emissive: new THREE.Color(magicColor),
    emissiveIntensity: 2.6,
    roughness: 0.14,
    metalness: 0.1,
  });

  const runeMat = new THREE.MeshStandardMaterial({
    color: magicColor,
    emissive: new THREE.Color(magicColor),
    emissiveIntensity: 2.1,
    roughness: 0.25,
    metalness: 0.3,
  });

  // 1. Saia / Túnica inferior drapeada com ondulações orgânicas
  const robePoints = [
    new THREE.Vector2(0.56, 0.0),
    new THREE.Vector2(0.49, 0.28),
    new THREE.Vector2(0.42, 0.65),
    new THREE.Vector2(0.35, 1.02),
    new THREE.Vector2(0.32, 1.24),
  ];
  const lowerRobeGeo = new THREE.LatheGeometry(robePoints, 28);
  const pos = lowerRobeGeo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const fold = Math.sin(angle * 7 + y * 1.4) * 0.032 * (1.25 - y * 0.65);
    const r = Math.hypot(x, z);
    if (r > 0.001) {
      pos.setX(i, x + (x / r) * fold);
      pos.setZ(i, z + (z / r) * fold);
    }
  }
  lowerRobeGeo.computeVertexNormals();
  const lowerRobe = new THREE.Mesh(lowerRobeGeo, robeMat);
  lowerRobe.castShadow = true;
  lowerRobe.receiveShadow = true;
  root.add(lowerRobe);

  // Barra bordada dourada na base da túnica
  const hemRing = new THREE.Mesh(new THREE.TorusGeometry(0.545, 0.018, 8, 32), goldMat);
  hemRing.rotation.x = Math.PI / 2;
  hemRing.position.y = 0.03;
  root.add(hemRing);

  // 2. Pivô do Tronco Superior (respiração + tracking suave)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 1.18, 0);
  root.add(torsoPivot);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.33, 0.66, 18), innerRobeMat);
  chest.position.y = 0.32;
  chest.castShadow = true;
  chest.receiveShadow = true;
  torsoPivot.add(chest);

  // Cinto e fivela rúnica
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.345, 0.11, 20), woodMat);
  belt.position.y = 0.06;
  torsoPivot.add(belt);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.13, 0.06), goldMat);
  buckle.position.set(0, 0.06, 0.33);
  torsoPivot.add(buckle);

  // Estola frontal com detalhes metálicos
  const stole = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.05), robeMat);
  stole.position.set(0, -0.35, 0.34);
  stole.rotation.x = -0.1;
  torsoPivot.add(stole);

  // Manto sobre os ombros (capelet) + ombreiras forjadas
  const mantle = new THREE.Mesh(new THREE.ConeGeometry(0.49, 0.44, 20, 1, true), robeMat);
  mantle.position.y = 0.56;
  mantle.castShadow = true;
  torsoPivot.add(mantle);

  [-1, 1].forEach((side) => {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), goldMat);
    pauldron.scale.set(1.15, 0.72, 1.0);
    pauldron.position.set(side * 0.36, 0.6, 0.02);
    pauldron.rotation.z = side * -0.45;
    pauldron.castShadow = true;
    torsoPivot.add(pauldron);
  });

  // Capa traseira longa com balanço suave
  const capePivot = new THREE.Group();
  capePivot.position.set(0, 0.62, -0.22);
  torsoPivot.add(capePivot);

  const capeGeo = new THREE.PlaneGeometry(0.86, 1.72, 10, 14);
  const cPos = capeGeo.attributes.position;
  for (let i = 0; i < cPos.count; i += 1) {
    const x = cPos.getX(i);
    const y = cPos.getY(i);
    const t = (0.86 - y) / 1.72; // 0 no topo, 1 na barra
    cPos.setX(i, x * (0.58 + t * 0.62));
    cPos.setZ(i, -t * 0.24 + Math.sin(x * 7) * 0.045 * t);
  }
  capeGeo.computeVertexNormals();
  const capeMesh = new THREE.Mesh(capeGeo, robeMat);
  capeMesh.position.y = -0.86;
  capeMesh.material = robeMat.clone();
  capeMesh.material.side = THREE.DoubleSide;
  capeMesh.castShadow = true;
  capePivot.add(capeMesh);

  // 3. Cabeça, Capuz e Barba (Look-At no cursor)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.74, 0.02);
  torsoPivot.add(headPivot);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.175, 16, 14), skinMat);
  head.scale.set(0.92, 1.08, 0.96);
  head.position.y = 0.12;
  headPivot.add(head);

  // Capuz esculpido cobrindo o topo e laterais
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.72), robeMat);
  hood.scale.set(1.06, 1.18, 1.24);
  hood.position.set(0, 0.14, -0.05);
  hood.rotation.x = -0.22;
  hood.castShadow = true;
  headPivot.add(hood);

  const hoodTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 12), robeMat);
  hoodTip.position.set(0, 0.22, -0.28);
  hoodTip.rotation.x = -1.25;
  headPivot.add(hoodTip);

  // Barba longa em camadas
  const beardPivot = new THREE.Group();
  beardPivot.position.set(0, 0.03, 0.13);
  headPivot.add(beardPivot);

  const beardMain = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.44, 10), beardMat);
  beardMain.rotation.x = Math.PI;
  beardMain.position.set(0, -0.2, 0.02);
  beardPivot.add(beardMain);

  [-0.06, 0.06].forEach((ox) => {
    const strand = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), beardMat);
    strand.rotation.x = Math.PI;
    strand.position.set(ox, -0.14, 0.01);
    beardPivot.add(strand);
  });

  // Olhos arcanos brilhando sob a sombra do capuz
  const eyeMat = new THREE.MeshStandardMaterial({
    color: magicColor,
    emissive: new THREE.Color(magicColor),
    emissiveIntensity: 2.2,
  });
  [-0.058, 0.058].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 8), eyeMat);
    eye.position.set(ex, 0.14, 0.155);
    headPivot.add(eye);
  });

  // 4. Braço Esquerdo (canalizando sigilo arcano)
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.36, 0.56, 0.04);
  torsoPivot.add(leftArmPivot);

  const leftSleeve = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.58, 12), robeMat);
  leftSleeve.position.set(-0.1, -0.22, 0.16);
  leftSleeve.rotation.set(0.75, 0, 0.35);
  leftArmPivot.add(leftSleeve);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMat);
  leftHand.position.set(-0.18, -0.36, 0.38);
  leftArmPivot.add(leftHand);

  const handSigil = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.01, 8, 28), runeMat);
  handSigil.position.set(-0.18, -0.22, 0.52);
  leftArmPivot.add(handSigil);

  // 5. Braço Direito + Cajado Rúnico Retorcido
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.36, 0.56, 0.04);
  torsoPivot.add(rightArmPivot);

  const rightSleeve = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.58, 12), robeMat);
  rightSleeve.position.set(0.12, -0.2, 0.18);
  rightSleeve.rotation.set(0.85, 0, -0.28);
  rightArmPivot.add(rightSleeve);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), skinMat);
  rightHand.position.set(0.2, -0.32, 0.4);
  rightArmPivot.add(rightHand);

  const staffPivot = new THREE.Group();
  staffPivot.position.set(0.22, -0.32, 0.42);
  rightArmPivot.add(staffPivot);

  // Haste curva de madeira antiga
  const staffCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, -1.42, 0.0),
    new THREE.Vector3(0.03, -0.75, 0.02),
    new THREE.Vector3(-0.02, 0.0, -0.01),
    new THREE.Vector3(0.04, 0.62, 0.03),
    new THREE.Vector3(-0.03, 0.98, 0.05),
  ]);
  const staffShaft = new THREE.Mesh(new THREE.TubeGeometry(staffCurve, 26, 0.036, 8, false), woodMat);
  staffShaft.castShadow = true;
  staffPivot.add(staffShaft);

  // Garras metálicas segurando o cristal
  const crownGroup = new THREE.Group();
  crownGroup.position.set(-0.03, 1.08, 0.05);
  staffPivot.add(crownGroup);

  for (let i = 0; i < 3; i += 1) {
    const a = (i / 3) * Math.PI * 2;
    const prong = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.24, 6), goldMat);
    prong.position.set(Math.cos(a) * 0.085, 0.02, Math.sin(a) * 0.085);
    prong.rotation.z = -Math.cos(a) * 0.28;
    prong.rotation.x = Math.sin(a) * 0.28;
    crownGroup.add(prong);
  }

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.115, 0), crystalMat);
  crystal.scale.set(0.75, 1.35, 0.75);
  crystal.position.y = 0.14;
  crownGroup.add(crystal);

  const runeRingA = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.01, 8, 32), runeMat);
  runeRingA.position.y = 0.14;
  crownGroup.add(runeRingA);

  const runeRingB = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 8, 28), goldMat);
  runeRingB.position.y = 0.14;
  runeRingB.rotation.x = Math.PI / 2;
  crownGroup.add(runeRingB);

  const staffLight = new THREE.PointLight(magicColor, 3.2, 6.5, 1.6);
  staffLight.position.set(0, 0.14, 0);
  crownGroup.add(staffLight);

  return {
    root,
    rig: {
      torsoPivot,
      headPivot,
      beardPivot,
      capePivot,
      leftArmPivot,
      rightArmPivot,
      staffPivot,
      crystal,
      runeRingA,
      runeRingB,
      handSigil,
      staffLight,
      crystalMat,
      runeMat,
    },
  };
}
