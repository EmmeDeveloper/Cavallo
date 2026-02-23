# Phase 4: Fix Graphics Issue - Research

**Researched:** 2026-02-23
**Domain:** HTML5 Canvas 2D game graphics — static background, image-based sprites, dev UI hiding
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Parallax Removal
- Remove all 3 parallax layers (far sky gradient, mid city silhouette, near scrolling bg.webp)
- Restore bg.webp as a STATIC background (no scrolling) — drawn once, fixed in place
- Keep ParallaxBg code COMMENTED OUT (not deleted) in case of future revisit
- The drawBackground() fallback or direct bg.webp draw replaces the parallax call in render()

#### Sprite Replacement (PixelLab)
- Replace ALL code-drawn sprites with PixelLab-generated images: horse, obstacles, arancini, boss (U Liotru)
- Use PixelLab MCP tools (already connected) to generate sprite assets
- Horse should have ANIMATION FRAMES: walk cycle + jump pose (multiple frames)
- Other sprites (obstacles, arancini, boss) can be static single images
- All sprites saved as PNG/WebP files in a sprites/ directory, loaded as Image objects

#### Dev Reset Button
- Remove visible reset button from gameplay/HUD
- Hide behind SECRET GESTURE: long-press 3 seconds on menu screen to reveal reset option
- Reset functionality preserved, just hidden from normal players

#### Canvas Maximization
- Keep internal resolution at 960x590 (no change to canvas.width/height)
- Improve CSS scaling to fill the ENTIRE browser window edge to edge (no margins/padding)
- Use Math.min (contain strategy) — aspect ratio preserved, black bars where needed
- Background of the page (behind letterbox bars) — Claude's discretion

### Claude's Discretion
- Art style for PixelLab sprites (match bg.webp Catania aesthetic — likely 16-bit style)
- How to draw static bg.webp (stretch to fill canvas vs tile — pick what looks best)
- Letterbox bar appearance (black bars vs blurred bg.webp or other treatment)
- Specific PixelLab prompts and sprite dimensions

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 4 is a pure visual quality pass on a vanilla JS single-file HTML5 Canvas 2D game (no build tools, no framework). The game is `index.html` at ~2600 lines. The codebase has three separate visual problems to fix: (1) the parallax background system must be disabled and replaced with a static bg.webp draw, (2) all code-drawn sprites must be replaced by PixelLab PNG images already partially generated in `sprites/`, and (3) the dev reset button must be hidden behind a secret long-press gesture.

The sprite situation is more complex than it looks. Of the 14 sprites expected in `sprites/`, only 3 are real PNGs: `horse_run1.png`, `horse_jump.png`, and `boss_idle.png`. The other 11 files are 94-byte JSON 404 error responses (PixelLab API returned "not_found" for those calls). Additionally, `horse_run2.png` and `boss_charge.png` don't exist at all. The planner must account for (re-)generating all missing/corrupt sprites via PixelLab MCP before swapping render code.

The canvas currently uses `Math.min` (contain/letterbox) scaling — which is correct per the locked decision. The CSS already has the right structure from Phase 3. The only remaining task is verifying the `body` background color fills the letterbox bars attractively, and optionally using a blurred bg.webp treatment.

**Primary recommendation:** Generate all missing sprites first (PixelLab MCP), then swap render code: comment out ParallaxBg calls, add static bg.webp draw, replace each code-drawn sprite function call with `ctx.drawImage(spriteImg, ...)`, and hide the reset button behind a 3-second long-press gesture.

---

## Current State Audit

### Sprite Files Status

| File | Exists | Valid PNG | Notes |
|------|--------|-----------|-------|
| `sprites/horse_run1.png` | YES | YES (1511 bytes) | Real PixelLab PNG — 64x64 RGBA |
| `sprites/horse_jump.png` | YES | YES (1106 bytes) | Real PixelLab PNG — 64x64 RGBA |
| `sprites/horse_run2.png` | NO | — | Missing entirely — needs generation |
| `sprites/boss_idle.png` | YES | YES (1663 bytes) | Real PixelLab PNG — 64x64 RGBA |
| `sprites/boss_charge.png` | NO | — | Missing entirely — needs generation |
| `sprites/boss_flash.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/arancino.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/fornacella1.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/fornacella2.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/fornacella_grill.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/maf_coltello.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/maf_lupara.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/maf_fornacella.png` | YES | INVALID | 94-byte JSON 404 response |
| `sprites/lava.png` | YES | INVALID | 94-byte JSON 404 response |

**Summary:** 3 valid PNGs exist. 9 invalid (404 JSON). 2 completely missing. All 11 invalid/missing must be (re-)generated before render code can be swapped.

### Code-Drawn Sprite Functions to Replace

| Function | Sprite File | Game Object |
|----------|------------|-------------|
| `drawHorseOutline()` / `drawHorseBody()` | horse_run1.png, horse_run2.png, horse_jump.png | `horse` — animated 2-frame walk + jump |
| `drawFornacella1()` | fornacella1.png | obstacle type 'fornacella1' |
| `drawFornacella2()` | fornacella2.png | obstacle type 'fornacella2' |
| `drawFornacellaConArrostitori()` | fornacella_grill.png | obstacle type 'fornacellaGrill' |
| `drawMafiosoColtello()` | maf_coltello.png | obstacle type 'mafColtello' |
| `drawMafiosoLupara()` | maf_lupara.png | obstacle type 'mafLupara' |
| `drawMafiosoFornacella()` | maf_fornacella.png | obstacle type 'mafFornacella' |
| `drawLiotru()` | boss_idle.png, boss_charge.png, boss_flash.png | `boss` — animated 2-frame + flash |
| `drawArancino()` | arancino.png | collectible arancini |
| `drawLava()` | lava.png | boss projectile bossLavas |

### Parallax Code Entry Points to Comment Out

| Location (line ~) | Code | Replace With |
|-------------------|------|-------------|
| Line 2299 in `drawMenu()` | `ParallaxBg.draw(ctx, canvas.width, bgH);` | Static bg.webp draw |
| Line 2562 in `render()` | `ParallaxBg.draw(ctx, canvas.width, bgH);` | Static bg.webp draw |
| Line 1682 in `update()` menu branch | `ParallaxBg.update(dt, 1.5);` | Remove/comment |
| Line 1722 in `update()` playing branch | `ParallaxBg.update(dt, speed);` | Remove/comment |
| Line 543 global init | `ParallaxBg.init(canvas.width, 540);` | Comment out |
| Line 535 in bgImage.onload | `ParallaxBg.init(canvas.width, bgH);` | Comment out |

### Reset Button Entry Points

| Location | Code |
|----------|------|
| HTML (line 208) | `<button id="resetBtn">DEV: Reset</button>` — visible DOM element |
| CSS (lines 70–85) | `#resetBtn` styles including media query |
| JS (lines 1094–1101) | `document.getElementById('resetBtn').addEventListener('click', ...)` |

The reset button is a fixed-position DOM element overlaid on the canvas, not drawn in Canvas 2D.

---

## Standard Stack

This is a no-dependency vanilla JS game. No npm packages needed.

### Core (project-established)
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 Canvas 2D | Native | All rendering |
| Vanilla JS | ES2020+ | Game logic, no build step |
| Howler.js | 2.2.3 (CDN) | Audio only — not relevant to this phase |
| PixelLab MCP | Connected | `mcp__pixellab__create_character`, `mcp__pixellab__animate_character` |

### No New Dependencies
This phase requires zero new libraries. All changes are:
1. PixelLab MCP tool calls (already authorized in `.claude/settings.local.json`)
2. Standard Canvas 2D `ctx.drawImage()` calls
3. DOM manipulation for the reset button
4. Touch event listeners for long-press gesture

---

## Architecture Patterns

### Pattern 1: Sprite Preloading (Image Object Pool)

All sprites must be loaded as `Image` objects before the game loop uses them. The existing `bgImage` pattern is the established standard in this codebase.

**What:** Create Image objects at global scope, set `.src`, track `.onload` with a counter or individual flags.
**When to use:** All PixelLab PNG sprites.

```javascript
// Source: existing pattern in index.html (bgImage, ~line 519)
const sprites = {};
let spritesLoaded = 0;
const SPRITE_TOTAL = 14; // total sprites to load

function loadSprite(key, src) {
  sprites[key] = new Image();
  sprites[key].onload = () => { spritesLoaded++; };
  sprites[key].onerror = () => { console.warn('Sprite failed:', src); spritesLoaded++; };
  sprites[key].src = src;
}

// Called at script init
loadSprite('horse_run1',       'sprites/horse_run1.png');
loadSprite('horse_run2',       'sprites/horse_run2.png');
loadSprite('horse_jump',       'sprites/horse_jump.png');
loadSprite('boss_idle',        'sprites/boss_idle.png');
loadSprite('boss_charge',      'sprites/boss_charge.png');
loadSprite('boss_flash',       'sprites/boss_flash.png');
loadSprite('arancino',         'sprites/arancino.png');
loadSprite('fornacella1',      'sprites/fornacella1.png');
loadSprite('fornacella2',      'sprites/fornacella2.png');
loadSprite('fornacella_grill', 'sprites/fornacella_grill.png');
loadSprite('maf_coltello',     'sprites/maf_coltello.png');
loadSprite('maf_lupara',       'sprites/maf_lupara.png');
loadSprite('maf_fornacella',   'sprites/maf_fornacella.png');
loadSprite('lava',             'sprites/lava.png');
```

### Pattern 2: drawImage with Sprite Anchor at Bottom

All code-drawn sprites use pixel coordinates where `(x, y)` is the **bottom-left** of the sprite (feet on ground). `ctx.drawImage()` uses **top-left** origin. Offset = `y - spriteHeight`.

```javascript
// Source: standard Canvas 2D drawImage pattern
// Sprites are 64x64. To draw with feet at groundY:
const SW = 64, SH = 64; // sprite width/height (can scale up)
const SCALE = 2; // draw at 2x for crisp pixel art on 960px canvas

function drawSpriteAtFeet(img, x, y, scale) {
  const w = img.width  * scale;
  const h = img.height * scale;
  ctx.imageSmoothingEnabled = false; // preserve pixel art crispness
  ctx.drawImage(img, x - w/2, y - h, w, h); // centered horizontally, feet at y
}
```

**Critical:** `image-rendering: pixelated` is already set in CSS on the `<canvas>` element, but `ctx.imageSmoothingEnabled = false` must also be set in JS before each drawImage call on scaled sprites.

### Pattern 3: Static Background Draw

Replace `ParallaxBg.draw()` calls with a single `ctx.drawImage(bgImage, 0, 0, canvas.width, bgH)`.

```javascript
// Source: existing drawBackground() function in index.html (~line 2056)
// The existing drawBackground() already does exactly this:
function drawBackground() {
  if (bgLoaded) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, bgH);
    // ... road area drawn below
  }
}
// Just call drawBackground() instead of ParallaxBg.draw()
```

The existing `drawBackground()` function is the correct replacement — it's already in the codebase and does exactly what is needed. No new code required for static background.

### Pattern 4: Long-Press Gesture (3-Second Hold)

Standard touch/mouse long-press detection using `setTimeout` and `clearTimeout`.

```javascript
// Source: standard DOM pattern — no library needed
let resetLongPressTimer = null;

function startResetLongPress() {
  resetLongPressTimer = setTimeout(() => {
    // Show dev reset confirmation or execute reset
    if (confirm('DEV: Reset all data?')) {
      // existing reset logic from resetBtn click handler
      localStorage.removeItem('cavalloHighScore');
      localStorage.removeItem('cavalloIntroWatched');
      localStorage.removeItem('cavalloRecipes');
      location.reload();
    }
    resetLongPressTimer = null;
  }, 3000);
}

function cancelResetLongPress() {
  if (resetLongPressTimer) {
    clearTimeout(resetLongPressTimer);
    resetLongPressTimer = null;
  }
}

// Attach to canvas (menu screen only) or to a specific invisible hit area
// Use mousedown/touchstart to start, mouseup/touchend/touchmove to cancel
```

**Constraint:** The gesture should only be active on the menu screen (`gameState === 'menu'`), not during gameplay. Check `gameState` inside the handler.

### Pattern 5: Letterbox Bar Treatment (Claude's Discretion)

Current CSS: `body { background: #1a0a0a; }` — deep dark red, shows as letterbox bars.

**Option A (simplest):** Keep `#1a0a0a` — matches the game's dark mood.
**Option B (polished):** Blur the bg.webp as a CSS background behind the canvas, creating a "zoomed blurred background" effect common in modern games.

```css
/* Option B: blurred bg fill for letterbox bars */
body {
  background: url('bg.webp') center/cover no-repeat;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: inherit;
  filter: blur(20px) brightness(0.4);
  z-index: -1;
}
```

Recommendation: Use Option B (blurred bg.webp) — it makes the letterbox bars visually rich and on-brand rather than empty black bars. The canvas sits on top as a crisp letterboxed window.

### Anti-Patterns to Avoid

- **Drawing sprites before `spritesLoaded === SPRITE_TOTAL`:** If sprites are not loaded, `ctx.drawImage()` silently draws nothing. Add a guard in the render loop or show a loading state.
- **Forgetting `imageSmoothingEnabled = false`:** On a scaled Canvas, browsers smooth pixel art by default. Always disable before drawing sprites.
- **Using `Math.max` for contain scaling:** The CONTEXT.md explicitly locks `Math.min` (contain/letterbox) for this phase. Phase 3 used `Math.max` (cover) — this phase reverses to `Math.min`.
- **Deleting the ParallaxBg code:** Locked decision is COMMENT OUT, not delete.
- **Long-press on wrong gameState:** The 3-second hold must only trigger when `gameState === 'menu'`. The canvas touch handler is global — guard the state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sprite loading | Custom loader with promises | Native `Image.onload` counter | Already established pattern in codebase |
| Pixel art scaling | Manual pixel doubling | `ctx.drawImage()` with integer scale | Canvas handles it natively |
| Long-press timer | Complex gesture library | `setTimeout` + `clearTimeout` | 10 lines, zero dependencies |
| Background blur | Canvas-drawn blur | CSS `filter: blur()` on body::before | GPU-accelerated, no Canvas cost |

---

## Common Pitfalls

### Pitfall 1: Sprite Coordinate Mismatch (Bottom vs Top Anchor)

**What goes wrong:** Sprites appear floating above the ground or sunk into it.
**Why it happens:** `drawImage(img, x, y)` uses top-left corner. Code-drawn sprites used bottom-left (feet at `y`). Direct replacement without offset puts the sprite 64px too high.
**How to avoid:** Always subtract sprite height: `ctx.drawImage(img, x - w/2, y - h, w, h)` where `y` is the ground position.
**Warning signs:** Horse or obstacles appear offset from the ground line during testing.

### Pitfall 2: Image Smoothing on Pixel Art

**What goes wrong:** Sprites look blurry/smooth instead of crisp pixel art.
**Why it happens:** Canvas 2D enables bilinear filtering by default when scaling images.
**How to avoid:** Set `ctx.imageSmoothingEnabled = false` immediately before every `ctx.drawImage()` call for sprite images.
**Warning signs:** Sprites look soft/blurred when scaled to game size (sprites are 64x64, game is 960px wide).

### Pitfall 3: Race Condition — Drawing Before Load

**What goes wrong:** First few frames show blank sprites or errors.
**Why it happens:** `Image.onload` is asynchronous. The game loop may start before sprites finish loading.
**How to avoid:** Either (a) show a brief "Loading..." message while `spritesLoaded < SPRITE_TOTAL`, or (b) fall back to the existing code-drawn functions during load and switch to sprites once loaded. Option (b) is graceful but more complex. Given fast loading on localhost, option (a) is sufficient.
**Warning signs:** Blank areas where sprites should be during first second of gameplay.

### Pitfall 4: Sprite Scale vs Game Coordinate Scale

**What goes wrong:** Sprites are tiny (64x64) relative to the 960px-wide game canvas.
**Why it happens:** Code-drawn sprites used `s = 2` or `s = 3` multiplier (effective size 128–192px). A raw 64x64 sprite at the same position will look much smaller.
**How to avoid:** Draw sprites at 2x–3x scale: `ctx.drawImage(img, x, y, img.width * 3, img.height * 3)`. Check against the existing obstacle hitbox dimensions (`obs.width`, `obs.height` in OBSTACLE_DEFS) to match visual size to collision area.
**Warning signs:** Sprites look tiny; collision boxes don't match sprite visuals.

### Pitfall 5: Long-Press Fires During Gameplay Scroll/Jump

**What goes wrong:** Player accidentally triggers dev reset while trying to jump or drag.
**Why it happens:** `touchstart` listener is attached globally.
**How to avoid:** Guard the long-press handler with `if (gameState !== 'menu') return;`. Also cancel on `touchmove` (if finger moves, it's a scroll, not a press).

### Pitfall 6: Canvas Scaling Change Breaks Touch Input

**What goes wrong:** After switching from `Math.max` (cover) to `Math.min` (contain), touch coordinates may have been adjusted for the cover strategy.
**Why it happens:** Phase 3 used cover (Math.max) but CONTEXT.md requires contain (Math.min). The `getCanvasPos()` function compensates for scaling — it must use the same strategy as the CSS scaling.
**How to avoid:** Verify `getCanvasPos()` uses `Math.min` after the change. Check that click targets (buttons, etc.) still register correctly.

---

## Code Examples

### Static Background (replaces ParallaxBg.draw calls)

```javascript
// Source: existing drawBackground() function in index.html
// Both drawMenu() and render() should call this instead of ParallaxBg.draw()
function drawBackground() {
  if (bgLoaded) {
    ctx.drawImage(bgImage, 0, 0, canvas.width, bgH);
    // Road area below bgH
    ctx.fillStyle = '#3a3228';
    ctx.fillRect(0, bgH, canvas.width, ROAD_HEIGHT);
    // (rest of road drawing unchanged)
  }
}
// Replace: ParallaxBg.draw(ctx, canvas.width, bgH);
// With:    drawBackground();
```

### Sprite Drawing Wrapper

```javascript
// Source: Canvas 2D API standard pattern
function drawSprite(img, feetX, feetY, scale) {
  if (!img || !img.complete || img.naturalWidth === 0) return; // guard for failed loads
  ctx.imageSmoothingEnabled = false;
  const w = img.width  * scale;
  const h = img.height * scale;
  ctx.drawImage(img, Math.floor(feetX - w / 2), Math.floor(feetY - h), w, h);
}

// Usage — horse (running, 2-frame cycle):
function drawHorseSprite() {
  const img = (horse.jumping || !horse.grounded)
    ? sprites.horse_jump
    : (animFrame === 0 ? sprites.horse_run1 : sprites.horse_run2);
  drawSprite(img, horse.x, horse.y, 3); // 64*3 = 192px tall
}

// Usage — obstacle:
function drawObstacles() {
  const spriteMap = {
    'fornacella1':    sprites.fornacella1,
    'fornacella2':    sprites.fornacella2,
    'fornacellaGrill': sprites.fornacella_grill,
    'mafColtello':    sprites.maf_coltello,
    'mafLupara':      sprites.maf_lupara,
    'mafFornacella':  sprites.maf_fornacella,
  };
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    drawSprite(spriteMap[obs.type], obs.x + obs.width / 2, obs.y, 3);
  }
}
```

### Hiding resetBtn and Long-Press

```javascript
// 1. In HTML: remove the <button id="resetBtn"> element entirely (or set display:none in CSS)
// 2. Keep the reset logic in a function:
function devReset() {
  localStorage.removeItem('cavalloHighScore');
  localStorage.removeItem('cavalloIntroWatched');
  localStorage.removeItem('cavalloRecipes');
  location.reload();
}

// 3. Long-press on canvas (menu only):
let _devPressTimer = null;

canvas.addEventListener('mousedown', (e) => {
  if (gameState !== 'menu') return;
  _devPressTimer = setTimeout(() => { if (confirm('DEV Reset?')) devReset(); }, 3000);
});
canvas.addEventListener('mouseup',   () => clearTimeout(_devPressTimer));
canvas.addEventListener('mouseleave',() => clearTimeout(_devPressTimer));

canvas.addEventListener('touchstart', (e) => {
  if (gameState !== 'menu') return;
  _devPressTimer = setTimeout(() => { if (confirm('DEV Reset?')) devReset(); }, 3000);
}, { passive: true });
canvas.addEventListener('touchend',  () => clearTimeout(_devPressTimer));
canvas.addEventListener('touchmove', () => clearTimeout(_devPressTimer));
```

### Contain Scaling (Math.min)

```javascript
// Source: CONTEXT.md locked decision — Math.min (contain/letterbox)
// Phase 3 used Math.max (cover). Phase 4 switches to Math.min.
function resizeCanvas() {
  const nativeW = canvas.width  || 960;
  const nativeH = canvas.height || 590;
  const scale   = Math.min(window.innerWidth / nativeW, window.innerHeight / nativeH);
  canvas.style.width  = Math.floor(nativeW * scale) + 'px';
  canvas.style.height = Math.floor(nativeH * scale) + 'px';
}
// Note: getCanvasPos() in the codebase already uses Math.min — verify consistency.
```

### CSS Letterbox Bar Treatment

```css
/* Option B: blurred bg.webp fill (recommended for polish) */
body {
  background: #1a0a0a url('bg.webp') center/cover no-repeat;
  /* existing flex centering stays */
}
/* Pseudo-element blurred layer */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url('bg.webp') center/cover no-repeat;
  filter: blur(24px) brightness(0.35);
  z-index: -1;
  transform: scale(1.05); /* hide blur edge artifacts */
}
```

---

## PixelLab MCP Guide

### Available Tools (confirmed in `.claude/settings.local.json`)

| Tool | Purpose |
|------|---------|
| `mcp__pixellab__create_character` | Generate a new sprite from a text prompt |
| `mcp__pixellab__animate_character` | Generate animation frames from a character |
| `mcp__pixellab__get_character` | Retrieve a previously generated character by ID |

### Sprites to Generate

Priority order (per `pixellab_prompts.md`):

| Priority | Sprite | File | Status |
|----------|--------|------|--------|
| 1 | horse_run2 (frame 2) | sprites/horse_run2.png | MISSING — generate first |
| 2 | boss_charge (frame 2) | sprites/boss_charge.png | MISSING |
| 3 | boss_flash (hit flash) | sprites/boss_flash.png | INVALID — regenerate |
| 4 | arancino | sprites/arancino.png | INVALID |
| 5 | fornacella1 | sprites/fornacella1.png | INVALID |
| 6 | fornacella2 | sprites/fornacella2.png | INVALID |
| 7 | fornacella_grill | sprites/fornacella_grill.png | INVALID |
| 8 | maf_coltello | sprites/maf_coltello.png | INVALID |
| 9 | maf_lupara | sprites/maf_lupara.png | INVALID |
| 10 | maf_fornacella | sprites/maf_fornacella.png | INVALID |
| 11 | lava | sprites/lava.png | INVALID |

**Already valid (skip regeneration):** `horse_run1.png`, `horse_jump.png`, `boss_idle.png`.

### Prompt Reference

All prompts are documented in `pixellab_prompts.md` at project root. Use those prompts verbatim for `mcp__pixellab__create_character`. Key global settings:
- **Dimensione:** 64x64 px
- **Sfondo:** Trasparente (PNG)
- **Stile:** Pixel art pulito, no anti-aliasing, bordi netti

---

## State of the Art

| Old Approach (current) | New Approach (this phase) | Impact |
|------------------------|--------------------------|--------|
| `ParallaxBg.draw()` — 3-layer scrolling | `drawBackground()` — single static image | Simpler, no update() calls needed |
| Code-drawn sprites (ctx.fillRect pixel art) | `ctx.drawImage(img, ...)` with PixelLab PNGs | Visual quality leap |
| `#resetBtn` fixed DOM button | Hidden long-press gesture on menu canvas | No visible dev artifact to players |
| `Math.max` cover scaling (Phase 3) | `Math.min` contain scaling (letterbox) | Full image always visible |

**Current resizeCanvas uses Math.min already** — confirmed in code review (line 549). Phase 3 plan says it used `Math.max` but the actual committed code reverted to `Math.min` (per commit `f92053a: revert to Math.min (contain) for letterbox scaling`). No change needed to resizeCanvas.

---

## Open Questions

1. **Sprite scale factor for replacement**
   - What we know: Code-drawn sprites use `s=2` (horse, ~128px effective) and `s=3` (obstacles, ~192px effective). Sprites are 64x64px.
   - What's unclear: The exact scale multiplier to use for `ctx.drawImage()` to visually match the collision hitbox dimensions in `OBSTACLE_DEFS`.
   - Recommendation: Test at scale=3 first (64*3=192px). If the hitbox (`obs.width`, `obs.height`) is much smaller, match to hitbox width proportionally.

2. **PixelLab output format**
   - What we know: PixelLab MCP returns character data. The existing valid PNGs in sprites/ are real 64x64 RGBA PNGs.
   - What's unclear: Whether `mcp__pixellab__create_character` returns a URL to download or base64 data to write directly.
   - Recommendation: The planner should include a task to inspect one MCP call result before writing the full batch generation plan.

3. **Boss animation — charge vs idle**
   - What we know: `drawLiotru()` uses `animFrame` (0 or 1) for the 2-frame animation, plus a separate `bossFlashTimer` check for the flash overlay. `boss_charge.png` is intended as the second animation frame.
   - What's unclear: Whether `boss_charge.png` should be drawn when boss.phase === 'charging', or as the second frame in the general animation cycle regardless of phase.
   - Recommendation: Use `boss_charge.png` as animFrame===1 (general cycle), and `boss_flash.png` as the flash override when `bossFlashTimer > 0`. This matches the existing `drawLiotru()` logic.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `index.html` (2600 lines) — parallax, sprite draw functions, render loop, reset button
- `sprites/` directory inspection — file types, sizes, PNG validation via `file` command
- `.claude/settings.local.json` — PixelLab MCP tool permissions confirmed
- `pixellab_prompts.md` — sprite prompts already written and validated

### Secondary (MEDIUM confidence)
- `git log` — commit `f92053a` confirms Math.min (contain) is the currently committed strategy, reverting the cover approach

### Tertiary (LOW confidence)
- PixelLab MCP tool behavior (output format) — inferred from 3 existing valid PNGs but not verified via API docs

---

## Metadata

**Confidence breakdown:**
- Sprite audit: HIGH — direct file inspection confirmed 3 valid, 9 invalid, 2 missing
- Render code entry points: HIGH — all ParallaxBg call sites identified by grep
- Canvas scaling: HIGH — code confirmed Math.min already in use (no change needed)
- PixelLab MCP output format: LOW — needs validation on first call
- Sprite scale factor: MEDIUM — requires visual testing to tune

**Research date:** 2026-02-23
**Valid until:** 2026-03-25 (stable domain, vanilla JS, no external lib changes)
