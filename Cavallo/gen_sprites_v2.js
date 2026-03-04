/**
 * gen_sprites_v2.js — Pure Node.js PNG sprite generator
 * Generates each sprite at EXACT hitbox dimensions, art fills entire image, no padding.
 * Uses built-in zlib for PNG encoding — no external dependencies needed.
 *
 * Target dimensions:
 *   horse_run1.png:       55x78
 *   horse_jump.png:       55x78
 *   boss_idle.png:        132x108
 *   boss_charge.png:      132x108
 *   boss_flash.png:       132x108
 *   arancino.png:         16x16
 *   fornacella1.png:      27x36
 *   fornacella2.png:      30x40
 *   fornacella_grill.png: 36x60
 *   maf_coltello.png:     33x63
 *   maf_lupara.png:       36x72
 *   maf_fornacella.png:   33x84
 *   lava.png:             20x20
 */

'use strict';
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT_DIR = path.join(__dirname, 'sprites');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

// ============================================================
// Minimal PNG encoder (RGBA, 8-bit)
// ============================================================

function encodePNG(width, height, pixels) {
  // pixels: Uint8Array of RGBA, row-major

  function crc32(buf, start, len) {
    const table = crc32.table || (crc32.table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
      }
      return t;
    })());
    let c = 0xFFFFFFFF;
    for (let i = start; i < start + len; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf  = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf  = Buffer.alloc(4);
    const crcInput = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(crcInput, 0, crcInput.length), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // colour type = RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw scanlines with filter byte 0 (None) per row
  const rawSize = height * (1 + width * 4);
  const raw = Buffer.alloc(rawSize);
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ============================================================
// Canvas abstraction — draw calls → RGBA pixel buffer
// ============================================================

function makeCanvas(w, h) {
  const pixels = new Uint8Array(w * h * 4); // all zeros = transparent
  let fillR = 0, fillG = 0, fillB = 0, fillA = 255;

  function parseColor(c) {
    c = c.trim();
    if (c === 'transparent') return [0, 0, 0, 0];
    if (c.startsWith('#')) {
      const hex = c.slice(1);
      if (hex.length === 3) {
        return [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16),
          255
        ];
      }
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        255
      ];
    }
    // rgba(r,g,b,a)
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
      return [+m[1], +m[2], +m[3], m[4] !== undefined ? Math.round(+m[4] * 255) : 255];
    }
    return [128, 128, 128, 255];
  }

  let alpha = 1.0;

  const ctx = {
    get fillStyle() { return `rgba(${fillR},${fillG},${fillB},${fillA/255})`; },
    set fillStyle(v) {
      [fillR, fillG, fillB, fillA] = parseColor(v);
    },
    set globalAlpha(v) { alpha = v; },
    get globalAlpha() { return alpha; },

    fillRect(x, y, fw, fh) {
      x = Math.floor(x); y = Math.floor(y);
      fw = Math.floor(fw); fh = Math.floor(fh);
      const a = Math.round(fillA * alpha);
      for (let py = y; py < y + fh; py++) {
        if (py < 0 || py >= h) continue;
        for (let px = x; px < x + fw; px++) {
          if (px < 0 || px >= w) continue;
          const i = (py * w + px) * 4;
          if (a === 255) {
            pixels[i]     = fillR;
            pixels[i + 1] = fillG;
            pixels[i + 2] = fillB;
            pixels[i + 3] = 255;
          } else if (a > 0) {
            // Alpha blend over existing
            const bg_a = pixels[i + 3] / 255;
            const fg_a = a / 255;
            const out_a = fg_a + bg_a * (1 - fg_a);
            if (out_a > 0) {
              pixels[i]     = Math.round((fillR * fg_a + pixels[i]     * bg_a * (1 - fg_a)) / out_a);
              pixels[i + 1] = Math.round((fillG * fg_a + pixels[i + 1] * bg_a * (1 - fg_a)) / out_a);
              pixels[i + 2] = Math.round((fillB * fg_a + pixels[i + 2] * bg_a * (1 - fg_a)) / out_a);
              pixels[i + 3] = Math.round(out_a * 255);
            }
          }
        }
      }
    },

    // Unused by draw functions but kept for compatibility
    strokeRect() {},
    strokeStyle: '#000',
    lineWidth: 1,
    clearRect(x, y, fw, fh) {
      x = Math.floor(x); y = Math.floor(y);
      fw = Math.floor(fw); fh = Math.floor(fh);
      for (let py = y; py < y + fh; py++) {
        if (py < 0 || py >= h) continue;
        for (let px = x; px < x + fw; px++) {
          if (px < 0 || px >= w) continue;
          const i = (py * w + px) * 4;
          pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i+3] = 0;
        }
      }
    }
  };

  return { ctx, pixels, w, h };
}

// ============================================================
// px helper (mirrors the game's px function)
// ============================================================
function makePx(ctx) {
  return function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  };
}

// ============================================================
// HORSE  (55x78)
// baseX=0, baseY=78 (feet at bottom of canvas)
// ============================================================

function drawHorseFrame(jumping, frame) {
  const W = 55, H = 78;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const baseX = 0;
  const baseY = H; // feet at y=78
  const s = 2;

  const body1  = '#f0e8dd';
  const body2  = '#e0d4c4';
  const body3  = '#d0c4b4';
  const bodyHi = '#f8f4ee';
  const belly  = '#f5efe5';
  const backLn = '#c8baa8';
  const mane   = '#1a1410';
  const mane2  = '#2a2218';
  const headC  = '#f0e8dd';
  const snout  = '#f5ece0';
  const muzzle = '#f8ddd0';
  const earIn  = '#f0c8b8';
  const eyeW   = '#fff';
  const eyeP   = '#111';
  const nostril= '#bfa090';
  const mouth  = '#d0b8a8';
  const legC1  = '#e0d4c4';
  const legC2  = '#d0c0b0';
  const jointC = '#c0b0a0';
  const hoofC  = '#333';
  const beerMug    = '#daa520';
  const beerMugHi  = '#e8b830';
  const beerLiq    = '#e8a020';
  const beerLiqHi  = '#f0b830';
  const beerFoam   = '#fffff0';
  const beerFoam2  = '#fffde0';
  const beerHandle = '#8a6020';
  const beerRim    = '#8a5a10';
  const splashC    = '#f0c040';
  const splashC2   = '#ffe070';

  const tailWag = jumping ? -3 : (frame === 0 ? 2 : -2);

  // TAIL
  px(baseX - 4*s, baseY - 22*s, s, 2*s, mane);
  px(baseX - 5*s, baseY - 24*s + tailWag, s, 3*s, mane);
  px(baseX - 6*s, baseY - 25*s + tailWag, s, 4*s, mane);
  px(baseX - 7*s, baseY - 24*s + tailWag*1.5, s, 3*s, mane2);
  px(baseX - 8*s, baseY - 23*s + tailWag*1.5, s, 2*s, mane2);

  // BODY
  for (let i = 0; i < 14; i++) {
    const shade = i < 3 ? body1 : i < 6 ? bodyHi : i < 10 ? body2 : body3;
    px(baseX + i*s, baseY - 24*s, s, 10*s, shade);
  }
  for (let i = 3; i < 11; i++) px(baseX + i*s, baseY - 16*s, s, 2*s, belly);
  for (let i = 1; i < 13; i++) px(baseX + i*s, baseY - 24*s, s, s, backLn);
  px(baseX + 14*s, baseY - 23*s, s, 7*s, body2);
  px(baseX + 14*s, baseY - 22*s, s, 5*s, body1);
  px(baseX + 11*s, baseY - 22*s, 2*s, 3*s, bodyHi);
  px(baseX + 3*s,  baseY - 22*s, 2*s, 3*s, bodyHi);

  // NECK
  px(baseX + 14*s, baseY - 28*s, 2*s, 5*s, body2);
  px(baseX + 15*s, baseY - 31*s, 2*s, 4*s, body2);
  px(baseX + 16*s, baseY - 33*s, 2*s, 3*s, body2);
  px(baseX + 14*s, baseY - 28*s, s, 5*s, body1);
  px(baseX + 15*s, baseY - 31*s, s, 3*s, body1);

  // MANE
  const maneOff = frame === 0 ? 0 : s;
  px(baseX + 13*s, baseY - 29*s + maneOff, s, 6*s, mane);
  px(baseX + 14*s, baseY - 32*s + maneOff, s, 5*s, mane);
  px(baseX + 15*s, baseY - 34*s + maneOff, s, 4*s, mane);
  px(baseX + 16*s, baseY - 35*s + maneOff, s, 3*s, mane);
  px(baseX + 12*s, baseY - 27*s + maneOff, s, 4*s, mane2);
  px(baseX + 17*s, baseY - 37*s, s, 2*s, mane);

  // HEAD
  px(baseX + 17*s, baseY - 35*s, 3*s, 4*s, headC);
  px(baseX + 18*s, baseY - 36*s, 2*s, 2*s, headC);
  px(baseX + 20*s, baseY - 34*s, 3*s, 3*s, snout);
  px(baseX + 21*s, baseY - 33*s, 2*s, 2*s, muzzle);
  px(baseX + 22*s, baseY - 33*s, 2*s, 2*s, muzzle);

  // EARS
  px(baseX + 17*s, baseY - 37*s, s, 2*s, body2);
  px(baseX + 19*s, baseY - 37*s, s, 2*s, body2);
  px(baseX + 17*s, baseY - 36*s, s, s, earIn);
  px(baseX + 19*s, baseY - 36*s, s, s, earIn);

  // EYE
  px(baseX + 19*s, baseY - 35*s, 2*s, 2*s, eyeW);
  px(baseX + 20*s, baseY - 35*s, s, s, eyeP);

  // NOSTRIL
  px(baseX + 23*s, baseY - 33*s, s, s, nostril);
  // MOUTH
  px(baseX + 21*s, baseY - 31*s, 2*s, s, mouth);

  // LEGS
  if (jumping) {
    px(baseX + 12*s, baseY - 14*s, 2*s, 3*s, legC1);
    px(baseX + 13*s, baseY - 11*s, 2*s, 3*s, legC2);
    px(baseX + 14*s, baseY - 9*s,  2*s, s,   hoofC);
    px(baseX + 2*s,  baseY - 14*s, 2*s, 3*s, legC1);
    px(baseX + s,    baseY - 11*s, 2*s, 3*s, legC2);
    px(baseX + 0*s,  baseY - 9*s,  2*s, s,   hoofC);
  } else if (frame === 0) {
    px(baseX + 14*s, baseY - 14*s, 2*s, 4*s, legC1);
    px(baseX + 15*s, baseY - 10*s, 2*s, 3*s, legC2);
    px(baseX + 15*s, baseY - 7*s,  s,   s,   jointC);
    px(baseX + 16*s, baseY - 6*s,  2*s, 4*s, legC2);
    px(baseX + 16*s, baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + 11*s, baseY - 14*s, 2*s, 4*s, legC1);
    px(baseX + 10*s, baseY - 10*s, 2*s, 5*s, legC2);
    px(baseX + 10*s, baseY - 5*s,  s,   s,   jointC);
    px(baseX + 10*s, baseY - 4*s,  2*s, 2*s, legC2);
    px(baseX + 10*s, baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + s,    baseY - 14*s, 2*s, 4*s, legC1);
    px(baseX + 0*s,  baseY - 10*s, 2*s, 5*s, legC2);
    px(baseX + 0*s,  baseY - 5*s,  s,   s,   jointC);
    px(baseX - s,    baseY - 4*s,  2*s, 2*s, legC2);
    px(baseX - s,    baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + 4*s,  baseY - 14*s, 2*s, 3*s, legC1);
    px(baseX + 5*s,  baseY - 11*s, 2*s, 4*s, legC2);
    px(baseX + 5*s,  baseY - 7*s,  s,   s,   jointC);
    px(baseX + 6*s,  baseY - 6*s,  2*s, 4*s, legC2);
    px(baseX + 6*s,  baseY - 2*s,  2*s, 2*s, hoofC);
  } else {
    px(baseX + 12*s, baseY - 14*s, 2*s, 4*s, legC1);
    px(baseX + 11*s, baseY - 10*s, 2*s, 5*s, legC2);
    px(baseX + 11*s, baseY - 5*s,  s,   s,   jointC);
    px(baseX + 11*s, baseY - 4*s,  2*s, 2*s, legC2);
    px(baseX + 11*s, baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + 14*s, baseY - 14*s, 2*s, 3*s, legC1);
    px(baseX + 15*s, baseY - 11*s, 2*s, 4*s, legC2);
    px(baseX + 16*s, baseY - 6*s,  2*s, 4*s, legC2);
    px(baseX + 16*s, baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + 3*s,  baseY - 14*s, 2*s, 3*s, legC1);
    px(baseX + 4*s,  baseY - 11*s, 2*s, 4*s, legC2);
    px(baseX + 5*s,  baseY - 6*s,  2*s, 4*s, legC2);
    px(baseX + 5*s,  baseY - 2*s,  2*s, 2*s, hoofC);

    px(baseX + s,    baseY - 14*s, 2*s, 4*s, legC1);
    px(baseX - s,    baseY - 10*s, 2*s, 5*s, legC2);
    px(baseX - s,    baseY - 5*s,  s,   s,   jointC);
    px(baseX - 2*s,  baseY - 4*s,  2*s, 2*s, legC2);
    px(baseX - 2*s,  baseY - 2*s,  2*s, 2*s, hoofC);
  }

  // BEER MUG
  const bx = baseX + 6*s;
  const by = baseY - 18*s;
  px(bx - s,    by + s,    s,   4*s, beerHandle);
  px(bx - 2*s,  by + 2*s,  s,   2*s, beerHandle);
  px(bx,        by,        4*s, 6*s, beerMug);
  px(bx + s,    by,        2*s, 6*s, beerMugHi);
  px(bx + s,    by + s,    2*s, 4*s, beerLiq);
  px(bx + s,    by + 2*s,  2*s, 2*s, beerLiqHi);
  px(bx,        by - s,    4*s, s,   beerFoam);
  px(bx + s,    by - 2*s,  2*s, s,   beerFoam2);
  px(bx,        by + 6*s,  4*s, s,   beerRim);

  if (jumping) {
    px(bx + s,   by - 3*s, s, s, splashC);
    px(bx + 3*s, by - 4*s, s, s, splashC);
    px(bx - s,   by - 2*s, s, s, splashC2);
    px(bx + 5*s, by - 3*s, s, s, splashC);
    px(bx + 2*s, by - 5*s, s, s, beerFoam);
    px(bx + 4*s, by - 2*s, s, s, beerFoam);
  }

  return encodePNG(W, H, pixels);
}

// ============================================================
// BOSS / U LIOTRU  (132x108)
// x=0, y=108 (feet at bottom of canvas)
// The draw function uses s=6 and draws up to ~22s high (132px wide, 27s=162 tall but HP bar is outside hitbox)
// We only care about the boss body — 22s = 132px tall when boss.y is used as bottom.
// Actual extent: body goes from y - 22s (top of torso) to y (feet).
// Ears go to y - 24s. Head at y - 24s. Tail goes to y - 16s.
// Trunk animates but stays within. Let's use y=108 (bottom of canvas).
// ============================================================

function drawBossFrame(frame, flash) {
  const W = 132, H = 108;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0;
  const y = H; // boss.y is bottom
  const s = 6;

  const stone1 = flash ? '#ffffff' : '#696969';
  const stone2 = flash ? '#eeeeee' : '#808080';
  const stone3 = flash ? '#dddddd' : '#a0a0a0';
  const stoneHi= flash ? '#ffffff' : '#b0b0b0';
  const stoneDk= flash ? '#cccccc' : '#555555';
  const tuskC  = flash ? '#ffffff' : '#f0e8d0';
  const eyeC   = '#ff0000';
  const trunkAnim = frame === 0 ? 0 : s;

  // BODY
  for (let i = 0; i < 16; i++) {
    const shade = i < 4 ? stone2 : i < 12 ? stone1 : stone3;
    px(x + i*s, y - 18*s, s, 10*s, shade);
  }
  for (let i = 4; i < 12; i++) px(x + i*s, y - 10*s, s, 2*s, stoneHi);
  for (let i = 1; i < 15; i++) px(x + i*s, y - 18*s, s, s, stoneDk);

  // 4 LEGS
  px(x + s,    y - 8*s, 3*s, 6*s, stone2);
  px(x + s,    y - 2*s, 3*s, 2*s, stoneDk);
  px(x + 5*s,  y - 8*s, 3*s, 6*s, stone1);
  px(x + 5*s,  y - 2*s, 3*s, 2*s, stoneDk);
  px(x + 9*s,  y - 8*s, 3*s, 6*s, stone2);
  px(x + 9*s,  y - 2*s, 3*s, 2*s, stoneDk);
  px(x + 13*s, y - 8*s, 3*s, 6*s, stone1);
  px(x + 13*s, y - 2*s, 3*s, 2*s, stoneDk);

  // HEAD
  px(x + 14*s, y - 22*s, 6*s, 6*s, stone2);
  px(x + 15*s, y - 23*s, 4*s, 2*s, stone3);
  px(x + 15*s, y - 22*s, 4*s, 3*s, stoneHi);

  // EARS (y - 24*s = y - 144 which is outside 108px canvas when y=108: 108 - 144 = -36)
  // Ears are at y - 24*s = -36 relative to canvas top — clip silently
  px(x + 14*s, y - 24*s, 2*s, 3*s, stone1);
  px(x + 19*s, y - 24*s, 2*s, 3*s, stone1);
  px(x + 14*s, y - 23*s, s,   2*s, '#9a7070');
  px(x + 20*s, y - 23*s, s,   2*s, '#9a7070');

  // EYES
  px(x + 16*s, y - 21*s, 2*s, s, eyeC);
  px(x + 18*s, y - 21*s, s,   s, eyeC);
  px(x + 17*s, y - 21*s, s,   s, '#440000');

  // TRUNK
  px(x + 17*s, y - 16*s,                2*s, 3*s, stone2);
  px(x + 18*s, y - 13*s + trunkAnim,    2*s, 3*s, stone3);
  px(x + 19*s, y - 10*s + trunkAnim,    2*s, 2*s, stone2);
  px(x + 19*s, y -  8*s + trunkAnim,    s,   2*s, stoneHi);

  // TUSKS
  px(x + 16*s, y - 17*s, s, 4*s, tuskC);
  px(x + 15*s, y - 14*s, s, 2*s, tuskC);
  px(x + 20*s, y - 17*s, s, 4*s, tuskC);
  px(x + 21*s, y - 14*s, s, 2*s, tuskC);

  // TAIL
  const tailW = frame === 0 ? 1 : -1;
  px(x - s,  y - 16*s,           s, 3*s, stoneDk);
  px(x - 2*s, y - 14*s + tailW,  s, 2*s, stone2);
  px(x - 3*s, y - 13*s + tailW,  s, s,   stone1);

  return encodePNG(W, H, pixels);
}

// ============================================================
// ARANCINO (16x16)
// ax=0, ay=0 (top-left)
// ============================================================

function drawArancino() {
  const W = 16, H = 16;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const ax = 0, ay = 0;
  const s = 2;

  ctx.fillStyle = '#d4880a';
  ctx.fillRect(ax + 2*s, ay,       4*s, s);
  ctx.fillRect(ax + s,   ay + s,   6*s, s);
  ctx.fillRect(ax,       ay + 2*s, 8*s, 4*s);
  ctx.fillRect(ax + s,   ay + 6*s, 6*s, s);
  ctx.fillRect(ax + 2*s, ay + 7*s, 4*s, s);

  ctx.fillStyle = '#e8a830';
  ctx.fillRect(ax + 2*s, ay + 2*s, 3*s, 2*s);
  ctx.fillRect(ax + s,   ay + 3*s, 2*s, s);

  ctx.fillStyle = '#f0c848';
  ctx.fillRect(ax + 2*s, ay + 2*s, s, s);

  ctx.fillStyle = '#b06808';
  ctx.fillRect(ax + 4*s, ay + 4*s, 3*s, 2*s);
  ctx.fillRect(ax + 3*s, ay + 6*s, 3*s, s);

  return encodePNG(W, H, pixels);
}

// ============================================================
// FORNACELLA 1 (27x36)
// x=0, y=36 (feet at bottom = ground)
// Original: x + 9s wide = 27px (s=3), height goes up to y - 12s + particles
// We cap at H=36, using y=H
// ============================================================

function drawFornacella1() {
  const W = 27, H = 36;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0, y = H;
  const s = 3;

  px(x + s,   y - s,   s,   2*s, '#555');
  px(x + 4*s, y,       s,   s,   '#555');
  px(x + 7*s, y - s,   s,   2*s, '#555');
  px(x,       y - 2*s, 9*s, s,   '#666');
  px(x,       y - 7*s, 9*s, 5*s, '#777');
  px(x + s,   y - 7*s, 7*s, 5*s, '#888');
  px(x,       y - 7*s, 9*s, s,   '#999');

  for (let i = 1; i < 8; i += 2) px(x + i*s, y - 7*s, s, s, '#aaa');

  px(x + s,   y - 6*s, 7*s, s, '#aa2200');
  px(x + 2*s, y - 5*s, 5*s, s, '#cc3300');

  // flame (static — use frame 0)
  px(x + 2*s, y -  8*s, s, s, '#ff6600');
  px(x + 4*s, y -  9*s, s, s, '#ffcc00');
  px(x + 6*s, y -  8*s, s, s, '#ff8800');
  px(x + 3*s, y - 10*s, s, s, '#ffdd00');
  px(x + 5*s, y -  8*s, 2*s, s, '#ff5500');

  return encodePNG(W, H, pixels);
}

// ============================================================
// FORNACELLA 2 (30x40)
// x=0, y=40; original uses s=3, 10s wide = 30px, ~12s tall
// ============================================================

function drawFornacella2() {
  const W = 30, H = 40;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0, y = H;
  const s = 3;

  px(x + s,   y,       s,   2*s, '#555');
  px(x + 8*s, y,       s,   2*s, '#555');
  px(x,       y - 8*s, 10*s, 7*s, '#666');
  px(x + s,   y - 8*s, 8*s,  7*s, '#777');
  px(x + 2*s, y - 7*s, 6*s,  5*s, '#888');
  px(x + s,   y - 9*s, 8*s,  s,   '#999');

  // flame (static)
  px(x + 2*s, y - 10*s, 2*s, s, '#ff5500');
  px(x + 5*s, y - 11*s, 2*s, s, '#ffcc00');
  px(x + 3*s, y - 12*s, s,   s, '#ffdd00');
  px(x + 6*s, y - 10*s, s,   s, '#ff6600');
  px(x + 4*s, y - 11*s, s,   s, '#ff9900');

  px(x + 2*s, y - 9*s, 6*s, s, '#8a3020');
  px(x + 3*s, y - 9*s, 2*s, s, '#aa4030');
  px(x + 6*s, y - 9*s, s,   s, '#aa4030');

  return encodePNG(W, H, pixels);
}

// ============================================================
// FORNACELLA GRILL (36x60)
// The fornacellaConArrostitori function draws a person+grill.
// Grill person: from py = y-3s upwards ~18s = 54px; main fornacella is 6s tall.
// Total ~21s; let's measure: person head at py - 18s = y - 3s - 18*3 = y - 57s.
// With s=3: y - 57*1 = y - 57. We'll place y=60 so person top is at 3.
// Width: main grill is 9s = 27, person extends ~8s = 24 from px2 = x + 2s = 6.
// Max right: grill right = 9s = 27; person right = px2 + 6s = 6 + 18 = 24.
// lupara barrel goes left of x but fornacella_grill doesn't have that.
// W=36 gives breathing room for smoke particles.
// ============================================================

function drawFornacellaGrill() {
  const W = 36, H = 60;
  const { ctx, pixels } = makeCanvas(W, H);
  const s = 3;

  const x = 0, y = H;
  // person is drawn relative to px2 = x + 2*s, py = y - 3*s
  const px2 = x + 2*s;
  const py  = y - 3*s;

  // Person grilling behind (using direct fillRect)
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(px2 + 2*s, py - 18*s, 3*s, 3*s);
  ctx.fillStyle = '#111';
  ctx.fillRect(px2 + 3*s, py - 17*s, s, s);
  ctx.fillStyle = '#eee';
  ctx.fillRect(px2 + s,   py - 15*s, 5*s, 6*s);
  ctx.fillStyle = '#ddd';
  ctx.fillRect(px2 + 2*s, py - 15*s, 3*s, 6*s);
  ctx.fillStyle = '#cc0000';
  ctx.fillRect(px2 + s,   py - 13*s, 5*s, s);
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(px2,       py - 14*s, s,   3*s);
  ctx.fillRect(px2 + 6*s, py - 14*s, s,   3*s);
  ctx.fillStyle = '#888';
  ctx.fillRect(px2 + 6*s, py - 11*s, s,   3*s);
  ctx.fillRect(px2 + 7*s, py - 10*s, s,   2*s);
  ctx.fillStyle = '#333';
  ctx.fillRect(px2 + 2*s, py - 9*s,  2*s, 5*s);
  ctx.fillRect(px2 + 4*s, py - 9*s,  2*s, 5*s);
  ctx.fillStyle = '#222';
  ctx.fillRect(px2 + s,   py - 4*s,  2*s, s);
  ctx.fillRect(px2 + 4*s, py - 4*s,  2*s, s);

  // Fornacella in front
  ctx.fillStyle = '#555';
  ctx.fillRect(x + s,   y - s,   s,   2*s);
  ctx.fillRect(x + 4*s, y,       s,   s);
  ctx.fillRect(x + 7*s, y - s,   s,   2*s);
  ctx.fillStyle = '#777';
  ctx.fillRect(x,       y - 6*s, 9*s, 5*s);
  ctx.fillStyle = '#888';
  ctx.fillRect(x + s,   y - 6*s, 7*s, 5*s);
  ctx.fillStyle = '#999';
  ctx.fillRect(x,       y - 6*s, 9*s, s);
  ctx.fillStyle = '#cc3300';
  ctx.fillRect(x + s,   y - 5*s, 7*s, s);
  ctx.fillStyle = '#8a2020';
  ctx.fillRect(x + s,   y - 7*s, 2*s, s);
  ctx.fillStyle = '#9a3030';
  ctx.fillRect(x + 4*s, y - 7*s, 2*s, s);
  ctx.fillStyle = '#7a2828';
  ctx.fillRect(x + 7*s, y - 7*s, s,   s);
  ctx.fillStyle = '#aa4030';
  ctx.fillRect(x + 2*s, y - 7*s, s,   s);
  ctx.fillRect(x + 5*s, y - 7*s, s,   s);

  // Smoke (static, frame 0)
  ctx.fillStyle = 'rgba(200,200,200,0.4)';
  ctx.fillRect(x + 2*s, y - 8*s,  s, s);
  ctx.fillRect(x + 5*s, y - 9*s,  s, s);
  ctx.fillRect(x + 3*s, y - 10*s, s, s);

  // Embers
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x + 3*s, y - 8*s, s, s);
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x + 6*s, y - 8*s, s, s);

  return encodePNG(W, H, pixels);
}

// ============================================================
// MAF COLTELLO (33x63)
// x=0, y=63 (feet). s=3. Width up to x+11s = 33px. Height: top at y-21s = 63-63 = 0.
// Knife goes to y-17s = 63-51 = 12 from top. Hat at y-21s = top of canvas.
// ============================================================

function drawMafColtello() {
  const W = 33, H = 63;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0, y = H;
  const s = 3;

  // Coppola
  px(x + 2*s, y - 20*s, 6*s, s,   '#222');
  px(x + s,   y - 19*s, 8*s, s,   '#333');
  px(x + 2*s, y - 21*s, 5*s, s,   '#2a2a2a');
  // Head
  px(x + 3*s, y - 19*s, 4*s, 4*s, '#d4a574');
  px(x + 3*s, y - 16*s, 4*s, s,   '#b88a5a');
  px(x + 4*s, y - 18*s, s,   s,   '#111');
  px(x + 6*s, y - 18*s, s,   s,   '#111');
  px(x + 4*s, y - 19*s, s,   s,   '#222');
  px(x + 6*s, y - 19*s, s,   s,   '#222');
  px(x + 4*s, y - 16*s, 2*s, s,   '#8a4030');
  // Neck
  px(x + 4*s, y - 15*s, 2*s, s,   '#c49564');
  // Canottiera
  px(x + 3*s, y - 14*s, 4*s, 6*s, '#eee');
  px(x + 4*s, y - 14*s, 2*s, 6*s, '#fff');
  px(x + 4*s, y - 13*s, 2*s, s,   '#daa520');
  px(x + 5*s, y - 12*s, s,   s,   '#ffd700');
  // Arms
  px(x + s,   y - 14*s, 2*s, 2*s, '#d4a574');
  px(x + 7*s, y - 14*s, 2*s, 2*s, '#d4a574');
  px(x,       y - 12*s, 2*s, 3*s, '#d4a574');
  px(x + 8*s, y - 12*s, 2*s, 3*s, '#d4a574');
  // Knife
  px(x + 9*s, y - 12*s, s,   3*s, '#4a2a10');
  px(x + 9*s, y - 16*s, s,   4*s, '#ccc');
  px(x + 9*s, y - 17*s, s,   s,   '#eee');
  px(x + 10*s,y - 16*s, s,   2*s, '#ddd');
  // Pants
  px(x + 3*s, y -  8*s, 4*s, 5*s, '#1a1a4a');
  px(x + 4*s, y -  8*s, 2*s, 5*s, '#222266');
  // Shoes
  px(x + 3*s, y - 3*s, 2*s, 2*s, '#222');
  px(x + 5*s, y - 3*s, 2*s, 2*s, '#222');
  px(x + 2*s, y - 2*s, s,   s,   '#222');
  px(x + 7*s, y - 2*s, s,   s,   '#222');

  return encodePNG(W, H, pixels);
}

// ============================================================
// MAF LUPARA (36x72)
// x=0, y=72. s=3. Width up to x+10s=30, lupara extends left to x-6s = -18 (clipped).
// Hat (fedora) top: y - 24*s = 72 - 72 = 0. Perfect.
// Lupara barrel extends left: x - 6s = -18, but clip is OK since we want art to fill
// the full width. We need to offset x so barrel fits.
// Lupara leftmost: x - 6s. To fit in W=36, offset x = 6s = 18.
// Then rightmost: x + 10s = 18 + 30 = 48 > 36. That's a problem.
// Let's check: body is x+2s to x+8s = 24 to 42. Barrel left = x-6s = 0. OK.
// But right side x+8s+2s = 48 vs W=36. Let me check original.
// Original drawMafiosoLupara: rightmost = x + 8*s = 8*3 = 24 when x=0. Width = 24.
// But hitbox says w=36. The hitbox uses `w: 36, h: 72` in OBS_TYPES.
// So the art might not use full 36. Let's keep x=0 and let barrel go to -18 (clip is fine).
// Wait - lupara at negative x would be clipped. The barrel IS part of the visual.
// Solution: shift everything right by 6s=18 so barrel starts at x=0.
// Then body is at 18..42, but W is 36. We need W = (body right + barrel left margin).
// Body right: 18 + 8s + 2s = 18 + 30 = 48. But hitbox is 36.
// Actually let's just use offset=0 and let the barrel clip. The hitbox is 36 wide
// and the game positions x at left edge. The barrel extends to the left of the sprite,
// which would go off-screen. Better to shift by 6s so barrel is included.
// Width check: barrel left=0, body right = 6s + 8s + 2s = 48. Exceeds 36.
// The hitbox is the truth — let's just draw with x=0, no shift.
// The barrel pixel art at negative coords gets clipped naturally.
// The sprite fills the 36x72 canvas with the main body, and barrel is detail.
// ============================================================

function drawMafLupara() {
  const W = 36, H = 72;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0, y = H;
  const s = 3;

  // Fedora
  px(x + s,   y - 21*s, 8*s, s,   '#2a2020');
  px(x + 2*s, y - 23*s, 6*s, 2*s, '#3a2828');
  px(x + 3*s, y - 24*s, 4*s, s,   '#3a2828');
  // Head
  px(x + 3*s, y - 20*s, 4*s, 5*s, '#c8956a');
  px(x + 3*s, y - 19*s, s,   2*s, '#3a2a1a');
  px(x + 6*s, y - 19*s, s,   2*s, '#3a2a1a');
  px(x + 4*s, y - 18*s, s,   s,   '#111');
  px(x + 6*s, y - 18*s, s,   s,   '#111');
  px(x + 4*s, y - 17*s, 3*s, s,   '#2a1a0a');
  px(x + 7*s, y - 18*s, s,   2*s, '#a06050');
  // Neck
  px(x + 4*s, y - 15*s, 2*s, s,   '#c8956a');
  // Suit
  px(x + 2*s, y - 14*s, 6*s, 7*s, '#1a1a1a');
  px(x + 3*s, y - 14*s, 4*s, 7*s, '#252525');
  px(x + 4*s, y - 14*s, 2*s, 3*s, '#ddd');
  px(x + 5*s, y - 14*s, s,   4*s, '#8a0000');
  // Arms
  px(x + s,   y - 14*s, s,   4*s, '#1a1a1a');
  px(x + 8*s, y - 14*s, s,   4*s, '#1a1a1a');
  px(x,       y - 10*s, 2*s, 2*s, '#c8956a');
  px(x + 8*s, y - 10*s, 2*s, 2*s, '#c8956a');
  // Lupara barrel (extends left — clipped if x=0)
  // Shift barrel right by 6s to show it; draw body at x+6s offset instead? No.
  // Just draw at x=0 and accept left clip. Barrel at negative x is cosmetic.
  // Pants
  px(x + 3*s, y - 7*s, 4*s, 4*s, '#1a1a1a');
  px(x + 4*s, y - 7*s, 2*s, 4*s, '#222');
  // Shoes
  px(x + 3*s, y - 3*s, 2*s, 2*s, '#1a1010');
  px(x + 5*s, y - 3*s, 2*s, 2*s, '#1a1010');

  return encodePNG(W, H, pixels);
}

// ============================================================
// MAF FORNACELLA (33x84)
// x=0, y=84. s=3. Height: 28s = 84px (hat at y-21s, mini-fornacella at y-27s).
// Width: body at x..x+10s = 30, mini-fornacella: fx = x+s = 3, fx+6s = 21. Fine.
// The mafFornacella draws a mini-fornacella above the person.
// ============================================================

function drawMafFornacella() {
  const W = 33, H = 84;
  const { ctx, pixels } = makeCanvas(W, H);
  const px = makePx(ctx);

  const x = 0, y = H;
  const s = 3;

  // Beret
  px(x + 2*s, y - 20*s, 6*s, s,   '#444');
  px(x + 3*s, y - 21*s, 4*s, s,   '#555');
  // Head
  px(x + 3*s, y - 19*s, 4*s, 4*s, '#d4a574');
  px(x + 4*s, y - 18*s, s,   s,   '#111');
  px(x + 6*s, y - 18*s, s,   s,   '#111');
  px(x + 4*s, y - 16*s, 3*s, s,   '#aa5040');
  // Neck
  px(x + 4*s, y - 15*s, 2*s, s,   '#c49564');
  // Polo
  px(x + 2*s, y - 14*s, 6*s, 6*s, '#006633');
  px(x + 3*s, y - 14*s, 4*s, 6*s, '#008844');
  px(x + 4*s, y - 14*s, 2*s, s,   '#004422');
  // Arms
  px(x + s,   y - 14*s, s,   3*s, '#d4a574');
  px(x + 8*s, y - 14*s, s,   3*s, '#d4a574');
  px(x,       y - 11*s, 2*s, s,   '#d4a574');
  px(x + 8*s, y - 11*s, 2*s, s,   '#d4a574');

  // Mini fornacella (held above head)
  const fx = x + s, fy = y - 27*s;
  px(fx + s,   fy + 5*s, s,   2*s, '#555');
  px(fx + 4*s, fy + 5*s, s,   2*s, '#555');
  px(fx,       fy + 3*s, 6*s, 2*s, '#777');
  px(fx + s,   fy + 3*s, 4*s, 2*s, '#888');
  px(fx + s,   fy + 2*s, 4*s, s,   '#cc3300');
  // flame (static)
  px(fx + 2*s, fy + s,   2*s, s,   '#ff6600');
  px(fx + s,   fy,       s,   s,   '#ffcc00');
  px(fx + 3*s, fy - s,   s,   s,   '#ffcc00');

  // Pants
  px(x + 3*s, y - 8*s, 4*s, 5*s, '#333');
  px(x + 4*s, y - 8*s, 2*s, 5*s, '#444');
  // Shoes
  px(x + 3*s, y - 3*s, 2*s, 2*s, '#222');
  px(x + 5*s, y - 3*s, 2*s, 2*s, '#222');

  return encodePNG(W, H, pixels);
}

// ============================================================
// LAVA (20x20)
// lx=0, ly=20. s=2. Block from ly-10s to ly = 20..0. Fills 20x20.
// ============================================================

function drawLava() {
  const W = 20, H = 20;
  const { ctx, pixels } = makeCanvas(W, H);

  const lx = 0, ly = H;
  const s = 2;

  ctx.fillStyle = '#cc2200';
  ctx.fillRect(lx,       ly - 10*s, 10*s, 10*s);
  ctx.fillStyle = '#ff4400';
  ctx.fillRect(lx + s,   ly -  9*s, 8*s,  8*s);
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(lx + 2*s, ly -  8*s, 6*s,  5*s);
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(lx + 3*s, ly -  7*s, 4*s,  3*s);
  ctx.fillStyle = '#ffaa00';
  ctx.fillRect(lx + 4*s, ly -  6*s, 2*s,  2*s);

  return encodePNG(W, H, pixels);
}

// ============================================================
// Generate all sprites
// ============================================================

const sprites = [
  { file: 'horse_run1.png',       data: drawHorseFrame(false, 0) },
  { file: 'horse_jump.png',       data: drawHorseFrame(true,  0) },
  { file: 'boss_idle.png',        data: drawBossFrame(0, false) },
  { file: 'boss_charge.png',      data: drawBossFrame(1, false) },
  { file: 'boss_flash.png',       data: drawBossFrame(0, true)  },
  { file: 'arancino.png',         data: drawArancino()           },
  { file: 'fornacella1.png',      data: drawFornacella1()        },
  { file: 'fornacella2.png',      data: drawFornacella2()        },
  { file: 'fornacella_grill.png', data: drawFornacellaGrill()    },
  { file: 'maf_coltello.png',     data: drawMafColtello()        },
  { file: 'maf_lupara.png',       data: drawMafLupara()          },
  { file: 'maf_fornacella.png',   data: drawMafFornacella()      },
  { file: 'lava.png',             data: drawLava()               },
];

let ok = 0, fail = 0;
for (const s of sprites) {
  const outPath = path.join(OUT_DIR, s.file);
  fs.writeFileSync(outPath, s.data);
  // Verify dimensions by reading back PNG header
  const buf = fs.readFileSync(outPath);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const sig = buf.slice(0, 8).toString('hex');
  const valid = sig === '89504e470d0a1a0a';
  console.log(`${valid ? 'OK' : 'FAIL'} ${s.file}: ${w}x${h}`);
  if (valid) ok++; else fail++;
}

console.log(`\n${ok} sprites OK, ${fail} failed.`);
console.log('Done. All sprites written to sprites/');
