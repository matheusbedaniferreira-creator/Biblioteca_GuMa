import * as THREE from 'three';

function makeCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d'), size };
}

function toRepeatTexture(canvas, repeatX = 2, repeatY = 2, isColor = false) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Gera mapas PBR procedurais (albedo, bump e roughness) para escamas dracônicas sem emendas.
 */
export function createDragonScaleTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cBump, ctx: bmp } = makeCanvas(256);
  const { canvas: cRough, ctx: rgh } = makeCanvas(256);

  col.fillStyle = '#102922';
  col.fillRect(0, 0, size, size);
  bmp.fillStyle = '#1a1a1a';
  bmp.fillRect(0, 0, size, size);
  rgh.fillStyle = '#d4d4d4';
  rgh.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 10;
  const dx = size / cols;
  const dy = size / rows;

  for (let row = -1; row <= rows + 1; row += 1) {
    const offsetX = (row % 2) * (dx * 0.5);
    for (let c = -1; c <= cols + 1; c += 1) {
      const cx = c * dx + offsetX;
      const cy = row * dy;
      const rx = dx * 0.56;
      const ry = dy * 0.66;
      const tone = ((row * 17 + c * 31) % 19) - 9;

      // Albedo da escama com variação orgânica esmeralda/obsidiana
      const gCol = col.createRadialGradient(cx, cy - ry * 0.25, rx * 0.1, cx, cy, ry);
      gCol.addColorStop(0, `rgb(${44 + tone}, ${102 + tone}, ${84 + tone})`);
      gCol.addColorStop(0.65, `rgb(${23 + tone}, ${62 + tone}, ${51 + tone})`);
      gCol.addColorStop(1, '#091813');
      col.fillStyle = gCol;
      col.beginPath();
      col.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      col.fill();

      // Relevo central da escama (bump)
      const gBmp = bmp.createRadialGradient(cx, cy - ry * 0.18, 1, cx, cy, ry);
      gBmp.addColorStop(0, '#f2f2f2');
      gBmp.addColorStop(0.7, '#7c7c7c');
      gBmp.addColorStop(1, '#101010');
      bmp.fillStyle = gBmp;
      bmp.beginPath();
      bmp.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      bmp.fill();

      // Roughness: topo mais polido, fendas foscas
      const gRgh = rgh.createRadialGradient(cx, cy - ry * 0.2, 1, cx, cy, ry);
      gRgh.addColorStop(0, '#5a5a5a');
      gRgh.addColorStop(0.75, '#a8a8a8');
      gRgh.addColorStop(1, '#ececec');
      rgh.fillStyle = gRgh;
      rgh.beginPath();
      rgh.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      rgh.fill();
    }
  }

  return {
    map: toRepeatTexture(cColor, 3, 3, true),
    bumpMap: toRepeatTexture(cBump, 3, 3, false),
    roughnessMap: toRepeatTexture(cRough, 3, 3, false),
  };
}

/**
 * Membrana de asa com veias orgânicas e textura de couro fino.
 */
export function createWingMembraneTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cBump, ctx: bmp } = makeCanvas(256);

  const grad = col.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#183f35');
  grad.addColorStop(0.55, '#2b5f4f');
  grad.addColorStop(1, '#435847');
  col.fillStyle = grad;
  col.fillRect(0, 0, size, size);

  bmp.fillStyle = '#757575';
  bmp.fillRect(0, 0, size, size);

  // Veias finas e marcas orgânicas
  for (let i = 0; i < 28; i += 1) {
    const startX = (i * 37) % size;
    const startY = (i * 53) % size;
    col.strokeStyle = 'rgba(12, 32, 26, 0.42)';
    col.lineWidth = 1.4;
    bmp.strokeStyle = 'rgba(215, 215, 215, 0.45)';
    bmp.lineWidth = 1.6;

    [col, bmp].forEach((ctx) => {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + 44, startY + 26, startX + 95, startY - 12);
      ctx.stroke();
    });
  }

  return {
    map: toRepeatTexture(cColor, 1, 1, true),
    bumpMap: toRepeatTexture(cBump, 1, 1, false),
  };
}

/**
 * Tecido espesso do manto arcano com micro-trama têxtil e alta rugosidade.
 */
export function createFabricTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cBump, ctx: bmp } = makeCanvas(256);

  col.fillStyle = '#1d2d3a';
  col.fillRect(0, 0, size, size);
  bmp.fillStyle = '#808080';
  bmp.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 3) {
    col.fillStyle = y % 6 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.07)';
    col.fillRect(0, y, size, 1);
    bmp.fillStyle = y % 6 === 0 ? '#a4a4a4' : '#585858';
    bmp.fillRect(0, y, size, 1);
  }
  for (let x = 0; x < size; x += 3) {
    col.fillStyle = x % 6 === 0 ? 'rgba(220,235,255,0.03)' : 'rgba(0,0,0,0.05)';
    col.fillRect(x, 0, 1, size);
    bmp.fillStyle = x % 6 === 0 ? '#9c9c9c' : '#646464';
    bmp.fillRect(x, 0, 1, size);
  }

  return {
    map: toRepeatTexture(cColor, 4, 4, true),
    bumpMap: toRepeatTexture(cBump, 4, 4, false),
  };
}

/**
 * Metal envelhecido (ouro/bronze antigo) com riscos e pátina.
 */
export function createAgedMetalTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cRough, ctx: rgh } = makeCanvas(256);

  col.fillStyle = '#b99257';
  col.fillRect(0, 0, size, size);
  rgh.fillStyle = '#707070';
  rgh.fillRect(0, 0, size, size);

  for (let i = 0; i < 180; i += 1) {
    const x = (i * 41) % size;
    const y = (i * 67) % size;
    const w = 12 + (i % 28);
    col.fillStyle = i % 3 === 0 ? 'rgba(54, 42, 24, 0.28)' : 'rgba(250, 232, 185, 0.16)';
    col.fillRect(x, y, w, 2);
    rgh.fillStyle = i % 3 === 0 ? '#b8b8b8' : '#4a4a4a';
    rgh.fillRect(x, y, w, 2);
  }

  return {
    map: toRepeatTexture(cColor, 2, 2, true),
    roughnessMap: toRepeatTexture(cRough, 2, 2, false),
  };
}

/**
 * Madeira retorcida e antiga para o cajado do mago.
 */
export function createWoodTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cBump, ctx: bmp } = makeCanvas(256);

  col.fillStyle = '#3c281c';
  col.fillRect(0, 0, size, size);
  bmp.fillStyle = '#787878';
  bmp.fillRect(0, 0, size, size);

  for (let i = 0; i < 90; i += 1) {
    const x = (i * 29) % size;
    col.strokeStyle = i % 2 === 0 ? 'rgba(22, 13, 8, 0.45)' : 'rgba(110, 76, 52, 0.25)';
    col.lineWidth = 1.5 + (i % 3);
    bmp.strokeStyle = i % 2 === 0 ? '#363636' : '#c0c0c0';
    bmp.lineWidth = 1.8;
    [col, bmp].forEach((ctx) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 8, size * 0.35, x - 8, size * 0.7, x + 2, size);
      ctx.stroke();
    });
  }

  return {
    map: toRepeatTexture(cColor, 1, 3, true),
    bumpMap: toRepeatTexture(cBump, 1, 3, false),
  };
}

/**
 * Pedra basáltica desgastada para penhascos e ruínas.
 */
export function createStoneTextures() {
  const { canvas: cColor, ctx: col, size } = makeCanvas(256);
  const { canvas: cBump, ctx: bmp } = makeCanvas(256);

  col.fillStyle = '#25312d';
  col.fillRect(0, 0, size, size);
  bmp.fillStyle = '#707070';
  bmp.fillRect(0, 0, size, size);

  for (let i = 0; i < 320; i += 1) {
    const x = (i * 73) % size;
    const y = (i * 47) % size;
    const r = 3 + (i % 14);
    col.fillStyle = i % 4 === 0 ? 'rgba(65, 86, 76, 0.32)' : 'rgba(14, 21, 19, 0.36)';
    col.beginPath();
    col.arc(x, y, r, 0, Math.PI * 2);
    col.fill();

    bmp.fillStyle = i % 2 === 0 ? 'rgba(200,200,200,0.22)' : 'rgba(35,35,35,0.28)';
    bmp.beginPath();
    bmp.arc(x, y, r, 0, Math.PI * 2);
    bmp.fill();
  }

  return {
    map: toRepeatTexture(cColor, 2, 2, true),
    bumpMap: toRepeatTexture(cBump, 2, 2, false),
  };
}

/**
 * Textura radial suave para partículas mágicas, brasas e camadas de névoa.
 */
export function createSoftGlowTexture() {
  const { canvas, ctx, size } = makeCanvas(128);
  const g = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.32, 'rgba(255,244,214,0.68)');
  g.addColorStop(0.7, 'rgba(255,210,160,0.16)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
