# Technology Stack

**Project:** U Cavaddu Runner - Catania Edition (Polish Milestone)
**Researched:** 2026-02-22
**Scope:** Adding audio, sprite animations, particle effects, and screen transitions to an existing single-file vanilla JS Canvas game. No framework migration. No bundler.

---

## Constraints That Drive All Decisions

The game is a single `index.html` file (~1000+ lines). All sprites are drawn programmatically in Canvas 2D. The project has no build pipeline, no npm, no bundler. Every tool and library chosen must work via CDN script tag or as pure implementation code embedded directly. No dependency that requires a build step is acceptable.

---

## Recommended Stack

### Audio

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Howler.js | 2.2.4 | Background music + all SFX playback | Only battle-tested audio library that handles iOS autoplay restrictions, mobile Web Audio unlock, and audio sprites in ~10KB. Alternatives require more manual boilerplate for the same cross-platform coverage. |
| audiosprite (build tool) | 0.7.2 | Pack all SFX into one file | Reduces HTTP requests from ~8 separate files to 1. Generates Howler-compatible JSON. Run once at build time, output is static assets. |

**Confidence: HIGH** — Howler.js v2.2.4 released September 2024, actively maintained. 623 packages depend on it. Sources: [howler.js releases](https://github.com/goldfire/howler.js/releases), [npm](https://www.npmjs.com/package/howler).

**CDN include:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
```

**Why not raw Web Audio API:** The Web Audio API requires 40-60 lines of boilerplate for iOS unlock, suspend/resume handling, and audio sprite timing that Howler already provides. For a game with 6-8 distinct sounds, Howler saves significant manual work with zero tradeoffs.

**Why not HTML5 `<audio>` elements:** Mobile Safari blocks programmatic play without user gesture. Multiple `<audio>` tags have timing issues for rapid SFX (hit, coin, game over in quick succession). Howler solves both.

---

### Sprite Animation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Aseprite | 1.x ($19.99 Steam) | Author pixel art spritesheets | Industry-standard pixel art tool. Exports PNG spritesheet + JSON descriptor. The JSON maps frame names to pixel coordinates, eliminating manual frame calculation. |
| Canvas `drawImage()` | native | Render spritesheet frames | Already in use. With `imageSmoothingEnabled = false` and `image-rendering: pixelated` (already set), crisp pixel art scales correctly. No library needed. |

**Confidence: HIGH** — `drawImage(sx, sy, sw, sh, dx, dy, dw, dh)` is the canonical 8-argument form for spritesheet rendering. MDN, every canvas game tutorial, and the existing codebase all use this approach. Sources: [MDN sprite animation](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations), [MDN crisp pixel art](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look).

**Free alternative to Aseprite:** LibreSprite (open source Aseprite fork) or Pixelorama (free, Godot-based). Both export spritesheets. Use either if $19.99 is a constraint.

**Implementation pattern:**
```javascript
// Load once
const sheet = new Image();
sheet.src = 'horse.png';

// Per-frame render (use integer positions for performance)
function drawFrame(ctx, sheet, frameIndex, cols, fw, fh, dx, dy) {
  const sx = (frameIndex % cols) * fw;
  const sy = Math.floor(frameIndex / cols) * fh;
  ctx.drawImage(sheet, sx, sy, fw, fh, Math.round(dx), Math.round(dy), fw * SCALE, fh * SCALE);
}
```

**Why not PixiJS:** PixiJS requires a WebGL context and ~200KB. The game already uses Canvas 2D. Migrating rendering to PixiJS for sprite animation would mean rewriting the entire draw loop. The benefit (batched WebGL rendering) is irrelevant for ~10 sprites on screen. Native `drawImage` is sufficient.

**Why not Phaser/LittleJS:** Same reason — both are full game engines that replace the existing loop. The scope is polish, not re-architecture.

---

### Particle Effects

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Custom particle pool (vanilla JS) | n/a | Dust, coin sparkles, fire, impact | No library adds value here. The game needs 4-5 distinct particle types all using canvas primitives (small squares for pixel art feel). A custom 50-100 line pool is smaller, faster, and style-consistent with the pixel aesthetic. |

**Confidence: HIGH** — Every vanilla JS canvas game tutorial uses custom particle pools. Third-party particle libraries (tsParticles, Sparticles) assume DOM/CSS targets or add bloat for effects achievable in ~60 lines. Sources: [CSS Script particle libs 2026](https://www.cssscript.com/best-particles-animation/), MDN canvas docs.

**Implementation pattern:**
```javascript
const particles = [];

function spawnParticle(x, y, color, vx, vy, life) {
  particles.push({ x, y, color, vx, vy, life, maxLife: life });
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += GRAVITY * 0.3 * dt; // partial gravity
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles(ctx) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3); // pixel squares
  }
  ctx.globalAlpha = 1;
}
```

**Why not a library:** tsParticles is 100KB+ and targets DOM canvas injection. Sparticles requires initialization with a DOM element, not a shared Canvas context. The game draws everything to one canvas via `ctx` — plugging in an external particle lib would require either a second canvas overlay or wrapping the existing context.

---

### Screen Effects (Shake, Flash, Transitions)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Canvas `ctx.save() / ctx.translate() / ctx.restore()` | native | Screen shake | Standard canvas camera shake pattern. Translate the origin by a small random offset for N frames, decay linearly. No library needed. |
| `ctx.fillRect()` with rgba + globalAlpha | native | Flash on hit/collect, fade transitions | Draw a full-screen colored rectangle at low alpha. Incrementally reduce alpha over frames. Handles game-over fade, boss hit flash, collect sparkle. |

**Confidence: HIGH** — This is the canonical pattern across all vanilla canvas game tutorials and forum answers. Sources: [Screen shake gamedev](https://jonny.morrill.me/en/blog/gamedev-how-to-implement-a-camera-shake-effect/), CSS-Tricks canvas easing.

**Implementation pattern:**
```javascript
// Screen shake state
let shakeIntensity = 0;
let shakeDuration = 0;

function triggerShake(intensity, duration) {
  shakeIntensity = intensity;
  shakeDuration = duration;
}

function applyShake(ctx, dt) {
  if (shakeDuration <= 0) return;
  shakeDuration -= dt;
  const decay = Math.max(0, shakeDuration / 20); // 0→1
  const ox = (Math.random() - 0.5) * shakeIntensity * decay;
  const oy = (Math.random() - 0.5) * shakeIntensity * decay;
  ctx.translate(Math.round(ox), Math.round(oy));
}

// Usage in draw loop
ctx.save();
applyShake(ctx, dt);
drawScene(ctx);
ctx.restore();
```

**Why not CSS animation on the canvas element:** Applying CSS `animation: shake` to the `<canvas>` element works but conflicts with the touch/pointer event coordinates (they become offset from the visual position during shake). Translating inside the canvas context avoids this entirely.

---

### Parallax Background

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Multiple `drawImage()` layers | native | 3-layer parallax scroll | Already one `bg.webp` layer exists. Add 2 more layers (midground buildings, foreground road details) as separate images. Each scrolls at a different speed multiplier. Native canvas, no library. |

**Confidence: HIGH** — Standard pattern documented in every endless runner tutorial.

**Implementation pattern:**
```javascript
const layers = [
  { img: bgFar,  speed: 0.2, x: 0 },   // distant sky/buildings
  { img: bgMid,  speed: 0.5, x: 0 },   // mid-distance
  { img: bgNear, speed: 1.0, x: 0 },   // near (same as current bg.webp)
];

function updateParallax(dt, gameSpeed) {
  for (const layer of layers) {
    layer.x -= gameSpeed * layer.speed * dt;
    if (layer.x <= -CANVAS_W) layer.x += CANVAS_W;
  }
}

function drawParallax(ctx) {
  for (const layer of layers) {
    ctx.drawImage(layer.img, Math.round(layer.x), 0, CANVAS_W, CANVAS_H);
    ctx.drawImage(layer.img, Math.round(layer.x + CANVAS_W), 0, CANVAS_W, CANVAS_H);
  }
}
```

---

### Audio Assets (Free Sources)

| Source | License | What to Get |
|--------|---------|-------------|
| [OpenGameArt.org](https://opengameart.org) | CC0 / CC-BY | Background music loops (chiptune/Mediterranean) |
| [Freesound.org](https://freesound.org) | CC0 / CC-BY | Jump, coin collect, impact, game over SFX |
| [itch.io free audio](https://itch.io/game-assets/free/tag-sound-effects) | varies | Curated game SFX packs |

**Confidence: MEDIUM** — These are the standard free audio sources for indie game dev. Verify licenses for each individual asset before use.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Audio | Howler.js 2.2.4 | Raw Web Audio API | 40-60 lines of manual iOS unlock/suspend/resume boilerplate for same result |
| Audio | Howler.js 2.2.4 | Buzz.js | Unmaintained since 2014 |
| Sprite authoring | Aseprite | Piskel (free, online) | Piskel works but exports are less flexible; no JSON frame data |
| Sprite rendering | Native `drawImage()` | PixiJS | 200KB WebGL engine to replace a working Canvas 2D loop |
| Particles | Custom pool | tsParticles | 100KB+, targets DOM not a shared canvas context |
| Screen effects | Native canvas translate | CSS canvas shake | Breaks pointer event coordinate math during shake |
| Game engine | Stay vanilla | LittleJS / Phaser | Full engine rewrites; scope is polish, not re-architecture |

---

## Installation

No npm/bundler. All additions are:

1. One `<script>` tag for Howler.js (CDN)
2. Static audio files (`sounds/effects.mp3`, `sounds/effects.json`, `sounds/music.mp3`)
3. Static spritesheet images (`sprites/horse.png`, `sprites/enemies.png`, etc.)
4. Code additions inline in `index.html`

```html
<!-- Add to <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
```

```bash
# Build-time only (not needed at runtime)
# Install audiosprite to generate the sprite file once
npm install -g audiosprite ffmpeg
audiosprite --output sounds/effects -f howler sounds/src/*.wav
```

---

## Sources

- [Howler.js v2.2.4 release (Sep 2024)](https://github.com/goldfire/howler.js/releases) — HIGH confidence
- [MDN: Audio for Web Games](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games) — HIGH confidence
- [MDN: Crisp pixel art look](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) — HIGH confidence
- [Howler.js npm package](https://www.npmjs.com/package/howler) — HIGH confidence
- [Spicy Yoghurt: Sprite Animations](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations) — MEDIUM confidence
- [Screen shake implementation](https://jonny.morrill.me/en/blog/gamedev-how-to-implement-a-camera-shake-effect/) — MEDIUM confidence
- [audiosprite tool](https://github.com/tonistiigi/audiosprite) — MEDIUM confidence
- [CSS Script particle libs 2026 update](https://www.cssscript.com/best-particles-animation/) — MEDIUM confidence (ecosystem survey)
- [PixiJS vs Canvas comparison](https://aircada.com/blog/pixijs-vs-canvas) — MEDIUM confidence
- [Aseprite on Steam](https://store.steampowered.com/app/431730/Aseprite/) — HIGH confidence ($19.99)
