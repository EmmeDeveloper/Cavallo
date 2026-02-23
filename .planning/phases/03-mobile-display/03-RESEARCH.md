# Phase 3: Mobile Display - Research

**Researched:** 2026-02-23
**Domain:** HTML5 Canvas responsive scaling — mobile fullscreen, portrait/landscape, HUD safety
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MOB-01 | Il gioco si adatta a schermo intero sia in orientamento verticale che orizzontale | CSS `aspect-ratio` + JS resize function handles both portrait and landscape via single `resizeCanvas()` called on `resize` and `screen.orientation change` events |
| MOB-02 | Il canvas si ridimensiona dinamicamente per riempire lo schermo su qualsiasi dispositivo mobile | `resizeCanvas()` with `Math.min(window.innerWidth / NATIVE_W, window.innerHeight / NATIVE_H)` sets CSS dimensions; canvas drawing resolution stays fixed — zero game logic changes |
</phase_requirements>

---

## Summary

The game's canvas is currently fixed at 960×590 (960px wide, 540px background + 50px road). On desktop the CSS `max-width: 100vw; max-height: 100vh` already prevents overflow, but there is no JS resize handler, no orientation change listener, and no logic to fill the screen on mobile portrait. A phone in portrait mode sees a letterboxed canvas at its natural size — the CSS `max-width` shrinks it but centering via flexbox on body leaves large empty areas rather than filling the screen.

The recommended approach for this project — a fixed-resolution pixel art game with no build tools — is **CSS-based scaling via JS-driven style properties**: keep the canvas drawing resolution fixed at 960×590, calculate a single scale factor from `window.innerWidth / NATIVE_W` vs `window.innerHeight / NATIVE_H`, and set `canvas.style.width` and `canvas.style.height` accordingly. This is the lightest possible change: no game logic is touched, no re-init of parallax or physics, no coordinate system changes. The click/touch coordinate mapping already accounts for this because it uses `canvas.getBoundingClientRect()` + scale (lines 1459–1464 in index.html).

The single `resizeCanvas()` function needs to be called: at page load, on `window` `resize`, and on `screen.orientation` `change`. `orientationchange` on `window` is deprecated; `screen.orientation.addEventListener('change', ...)` is the modern standard and is supported on iOS Safari 16.4+.

**Primary recommendation:** Add a `resizeCanvas()` function that sets `canvas.style.width/height` (not `canvas.width/height`) to fill the viewport while preserving the 960:590 aspect ratio, called on page load, `window resize`, and `screen.orientation change`. Total new code: ~20 lines.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS + CSS | — | Resize logic and viewport units | No framework needed; matches project constraint (no dependencies) |
| `screen.orientation.addEventListener` | Web API (Browser) | Modern orientation change event | Not deprecated; iOS Safari 16.4+ support (95.3% global coverage) |
| `window.addEventListener('resize')` | Web API | Desktop resize and soft-keyboard events | Covers all platforms; fires on orientation change too on desktop |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dvh` viewport unit | CSS (modern) | Avoids iOS Safari 100vh toolbar bug | Use `100dvh` in CSS instead of `100vh` for the body height |
| `canvas.getBoundingClientRect()` | Web API | Coordinate mapping after CSS scaling | Already used in the game at lines 1459–1464; continues to work correctly |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS style scaling (fixed resolution) | Change `canvas.width/height` to actual screen size | Requires re-initing ParallaxBg, recalculating GROUND_Y, repositioning all HUD elements — high risk of regression |
| CSS style scaling | `ctx.scale()` transform at start of each render | Fragile — every draw call uses pre-scale coordinates but mouse coordinates are post-scale; already handled by the existing `getBoundingClientRect()` approach |
| `screen.orientation change` | `window.orientationchange` (deprecated) | `window.orientationchange` is deprecated per MDN; avoid on new code |

**Installation:** No new packages. Pure web platform APIs.

---

## Architecture Patterns

### Recommended Project Structure

No new files. All changes go into `index.html` at two points:

1. CSS: change `height: 100vh` on `body` to `height: 100dvh` (1 line)
2. JS: add `resizeCanvas()` function + event listeners before the game loop starts

```
index.html
  <style>
    body { height: 100dvh; }          ← change 100vh → 100dvh (iOS fix)
    canvas { ... }                     ← remove max-width/max-height; keep image-rendering
  </style>
  <script> ... ParallaxBg ... </script>
  <script> ... AudioManager ... </script>
  <script>
    // ==================== MAIN GAME CODE ====================
    // ADD: resizeCanvas() + event listeners (after canvas element is grabbed)
    // Everything else unchanged
  </script>
```

### Pattern 1: CSS Style Scaling (Fixed-Resolution Game)

**What:** Keep `canvas.width` and `canvas.height` at fixed 960×590 (the game's native resolution). Use JavaScript to set `canvas.style.width` and `canvas.style.height` to fill the viewport while preserving the aspect ratio. The browser scales the canvas bitmap via CSS — the same mechanism used by `image-rendering: pixelated` (already on the canvas).

**When to use:** Any fixed-resolution game that does not need to change its game logic or coordinate system when the screen changes size. Matches this project perfectly — all game coordinates, HUD positions, and physics remain at the native 960×590 space.

**Why this is right for this project:** The game already handles coordinate mapping via `getBoundingClientRect()` scale at lines 1459–1464. CSS style scaling does not break this — it is exactly what `getBoundingClientRect()` was designed to handle.

**Example:**
```javascript
// Source: web.dev canvas scaling case study + MDN canvas docs
const NATIVE_W = 960;
const NATIVE_H = 590; // bgH (540) + ROAD_HEIGHT (50)

function resizeCanvas() {
  const scaleX = window.innerWidth  / NATIVE_W;
  const scaleY = window.innerHeight / NATIVE_H;
  const scale  = Math.min(scaleX, scaleY); // letterbox: fit without crop

  const displayW = Math.floor(NATIVE_W * scale);
  const displayH = Math.floor(NATIVE_H * scale);

  canvas.style.width  = displayW + 'px';
  canvas.style.height = displayH + 'px';
  // canvas.width and canvas.height are NOT changed — game logic is untouched
}

// Call once on load
resizeCanvas();

// Call on window resize (covers desktop, landscape↔portrait on some browsers)
window.addEventListener('resize', resizeCanvas);

// Call on orientation change (modern API, iOS 16.4+)
if (screen.orientation) {
  screen.orientation.addEventListener('change', resizeCanvas);
}
```

**NATIVE_H value:** The canvas height is set by `bgImage.onload` to `scaledH + ROAD_HEIGHT`. With `bg.webp` at its natural size capped at 960px wide, `bgH` = 540 and `ROAD_HEIGHT` = 50, so `canvas.height` = 590. Confirm by reading `canvas.height` after `bgImage.onload` fires. Hardcode 590 as the fallback since that is what the default `canvas.height = 540 + ROAD_HEIGHT` sets.

### Pattern 2: body Height Fix for iOS Safari

**What:** Change `body { height: 100vh }` to `body { height: 100dvh }`. The `dvh` unit (dynamic viewport height) accounts for the Safari toolbar shrinking/expanding, so the body correctly fills the visible screen on iOS without overflow or cut-off.

**Browser support:** `dvh` is supported in all modern browsers including iOS Safari 15.4+. No polyfill needed.

**Example:**
```css
/* Before */
body {
  height: 100vh;   /* iOS Safari bug: toolbar height not excluded */
}

/* After */
body {
  height: 100dvh;  /* Dynamic — adjusts when iOS toolbar appears/disappears */
}
```

### Pattern 3: Canvas CSS — Remove max-width/max-height, Use display block

**What:** The current canvas CSS uses `max-width: 100vw; max-height: 100vh`. After JS sets explicit `canvas.style.width` and `canvas.style.height`, these constraints are no longer needed and may interfere. Remove them. Also set `canvas { display: block; }` to prevent the default inline baseline gap.

**Example:**
```css
/* Before */
canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
  max-width: 100vw;
  max-height: 100vh;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* After */
canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
  display: block;            /* remove baseline gap */
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* max-width / max-height removed — JS controls size */
}
```

### Pattern 4: #wrap Container Alignment

**What:** The `#wrap` div centers the canvas via flexbox on `body`. After JS sets `canvas.style.width/height`, the canvas may not fill the whole screen — it letterboxes with empty space. The background color `#1a0a0a` on `body` shows as the letterbox color, which is fine (matches game palette). No change needed to `#wrap`.

**Anti-Patterns to Avoid**

- **Changing `canvas.width`/`canvas.height` dynamically in response to resize:** This clears the canvas, resets all ctx state, and requires re-running `ParallaxBg.init()`, resetting `GROUND_Y`, repositioning all game objects. High regression risk. Do NOT do this.
- **Using `ctx.scale()` at the top of each render pass:** Breaks the existing coordinate mapping in `getCanvasPos()` (lines 1459–1464). The current `getBoundingClientRect()` approach already handles CSS scaling correctly.
- **Listening only to `orientationchange` on window:** Deprecated API. Also, on some Android devices the `resize` event fires instead of `orientationchange`, so listening to both `resize` and `screen.orientation change` is more robust.
- **Using `window.innerHeight` before the browser repaints after orientation change:** On some iOS versions, `window.innerHeight` returns the pre-rotation value briefly after orientation change. Wrapping the call in `setTimeout(resizeCanvas, 0)` or `requestAnimationFrame` ensures the updated dimensions are read.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Aspect ratio maintenance | Custom math that computes padding/margin | `Math.min(scaleX, scaleY)` + `canvas.style.width/height` | This is literally 3 lines; no library needed |
| Orientation detection | Read `screen.orientation.angle` or `window.innerWidth > window.innerHeight` | Listen to `resize` + `screen.orientation change` — no need to detect; just recalculate dimensions | The resize handler is sufficient; orientation type doesn't matter |
| Fullscreen API | `document.documentElement.requestFullscreen()` | Not required by MOB-01/MOB-02 | Requirements say "fills the screen", not "enters browser fullscreen mode". CSS scaling to fill viewport is sufficient and simpler. Fullscreen API has iOS Safari restrictions. |

**Key insight:** The requirements ask the canvas to fill the screen visually — not for the Fullscreen API. CSS style scaling + letterbox achieves this with less than 20 lines and zero game logic changes.

---

## Common Pitfalls

### Pitfall 1: Changing canvas.width/canvas.height Instead of Style

**What goes wrong:** Developer calls `canvas.width = window.innerWidth` in the resize handler. This resets the entire canvas context, clears all drawn content, resets `ctx.imageSmoothingEnabled`, and invalidates the parallax offscreen canvas. `GROUND_Y` and `horse.y` are still at 540 — now wrong. `ParallaxBg` was inited for 960px wide; now the strip is too narrow. On the next frame, the far parallax shows a gap and the horse floats above the new ground line.

**Why it happens:** Conflating canvas drawing resolution with canvas display size. These are independent: `canvas.width/height` = drawing resolution; `canvas.style.width/height` = CSS display size.

**How to avoid:** Only ever change `canvas.style.width` and `canvas.style.height` in the resize handler. Never touch `canvas.width` or `canvas.height` after `bgImage.onload`.

**Warning signs:** Canvas goes white/blank on resize. `GROUND_Y` visually wrong. Parallax seam appears.

---

### Pitfall 2: iOS Safari 100vh Overflow

**What goes wrong:** `body { height: 100vh }` is taller than the visible viewport on iOS Safari because `100vh` includes the area behind the browser toolbar. On page load the game canvas is slightly taller than the screen, causing a scrollbar or overflow. Rotating the device makes this worse.

**Why it happens:** iOS Safari has calculated `100vh` as maximum viewport height (toolbar hidden) since at least iOS 12. This is documented behavior, not a bug.

**How to avoid:** Use `100dvh` instead of `100vh` for the body height. Support: iOS Safari 15.4+.

**Warning signs:** Thin scrollbar visible on the right side on iPhone. Canvas bottom is slightly cut off. Page scrolls slightly vertically on iOS.

---

### Pitfall 3: orientationchange Fires Before Dimensions Update

**What goes wrong:** The `orientationchange` event (on `window`) fires, the resize handler reads `window.innerWidth` and `window.innerHeight`, but the values are still from the *previous* orientation. The canvas is set to the wrong size. After the browser repaints, the canvas remains the wrong size until the next resize event.

**Why it happens:** The `window.orientationchange` event fires before the viewport dimensions have been updated by the browser on some iOS versions.

**How to avoid:** Use `screen.orientation.addEventListener('change', ...)` (the modern API) — it fires after dimensions are settled. Or wrap the resize call in `setTimeout(resizeCanvas, 100)` as a defensive fallback. Best practice: listen to both `window resize` and `screen.orientation change`.

**Warning signs:** Canvas appears the wrong size briefly after rotation, then "jumps" to the correct size when touched or on next frame.

---

### Pitfall 4: Touch Coordinate Mapping Breaks After CSS Scaling

**What goes wrong:** After CSS scaling the canvas to a different display size, touch/click coordinates are in CSS pixels but canvas draw operations use canvas-resolution pixels. Clicking the mute button or home button does not register, or registers at the wrong position.

**Why it happens:** Not using `getBoundingClientRect()` to convert between event coordinates and canvas coordinates.

**How to avoid:** The game *already* handles this correctly at lines 1459–1464 with `getCanvasPos()`:
```javascript
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
```
CSS style scaling does not break this. **No changes needed to input handling.** Do NOT change this function.

**Warning signs:** Buttons not responding, or responding at offset positions on mobile.

---

### Pitfall 5: HUD Elements at Hardcoded Pixel Positions Getting Cut Off on Small Screens

**What goes wrong:** After CSS scaling, the HUD appears inside the canvas at correct positions because all HUD draws use `canvas.width` as the right edge. However, if the canvas is scaled down dramatically (very small phone in landscape), 13-16px font text becomes unreadably small.

**Why it happens:** HUD font sizes are hardcoded in game-pixels (13–22px at 960px native). At a scale factor of 0.33 (e.g., 320px wide phone), these become 4–7px rendered pixels — unreadable.

**How to avoid:** The minimum realistic scale factor on any current smartphone is ~0.35 (320px wide / 960px native), producing 340×207px canvas at 0.35 scale. At that size even 13px game-pixels → 4.5 CSS pixels, which is unreadable. However, success criterion 3 says "no element cut off or overlapping" — not "remains readable at all sizes." The letterbox approach ensures no clipping. For this project scope, the HUD positions using `canvas.width` as anchor are already safe (they cannot overflow the canvas). No HUD changes are required to meet the stated criteria.

**Warning signs:** HUD text overlapping on very narrow landscape views (not relevant to MOB success criteria per the stated goals).

---

## Code Examples

### Complete resizeCanvas Implementation

```javascript
// Source: Derived from web.dev auto-resizing case study + MDN resize event
// Place this immediately after: const canvas = document.getElementById('game');

const NATIVE_W = 960;
const NATIVE_H = 590; // 540 (bgH default) + 50 (ROAD_HEIGHT)

function resizeCanvas() {
  const scaleX = window.innerWidth  / NATIVE_W;
  const scaleY = window.innerHeight / NATIVE_H;
  const scale  = Math.min(scaleX, scaleY);
  canvas.style.width  = Math.floor(NATIVE_W * scale) + 'px';
  canvas.style.height = Math.floor(NATIVE_H * scale) + 'px';
}

resizeCanvas(); // on load

window.addEventListener('resize', resizeCanvas);

// Modern orientation change (iOS Safari 16.4+, Chrome, Firefox)
if (screen.orientation) {
  screen.orientation.addEventListener('change', resizeCanvas);
}
```

### CSS Changes Required

```css
/* 1. body: change 100vh → 100dvh to fix iOS Safari toolbar */
body {
  background: #1a0a0a;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;      /* was: 100vh */
  overflow: hidden;
  font-family: 'Courier New', monospace;
}

/* 2. canvas: remove max-width/max-height; add display: block */
canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
  display: block;             /* NEW: prevents inline baseline gap */
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  /* REMOVED: max-width: 100vw; max-height: 100vh; */
}
```

### NATIVE_H Timing Note

The `bgImage.onload` callback at line 524 may change `canvas.height` to something other than 590 if `bg.webp` has different natural dimensions. The `resizeCanvas()` function must reference the *current* `canvas.height` (not a hardcoded constant) to account for this. Safe implementation:

```javascript
function resizeCanvas() {
  const nativeW = canvas.width  || NATIVE_W; // fallback during load
  const nativeH = canvas.height || NATIVE_H;
  const scale   = Math.min(window.innerWidth / nativeW, window.innerHeight / nativeH);
  canvas.style.width  = Math.floor(nativeW * scale) + 'px';
  canvas.style.height = Math.floor(nativeH * scale) + 'px';
}
```

This way, if `bg.webp` causes `canvas.height` to differ from 590, the scaling is always correct.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `window.orientationchange` event | `screen.orientation.addEventListener('change', ...)` | Deprecated in recent years; modern replacement stable since ~2023 | Use new API; old one still works but shows deprecation warning in DevTools |
| `100vh` for mobile fullscreen height | `100dvh` (dynamic viewport height) | Introduced in Safari 15.4, Chrome 108 (late 2022) | Eliminates iOS toolbar-causes-overflow bug |
| Canvas resize = change `canvas.width/height` | CSS style scaling — keep drawing resolution fixed | Established best practice for fixed-resolution games | No game logic changes needed |

---

## Open Questions

1. **Does `bg.webp` load fast enough before the first `resizeCanvas()` call?**
   - What we know: `resizeCanvas()` is called on load before `bgImage.onload` fires. At that point `canvas.width = 960`, `canvas.height = 590` (the defaults set at lines 540–541). The scaling will be correct for the default size.
   - What's unclear: After `bgImage.onload` fires and potentially changes `canvas.height`, `resizeCanvas()` is not called again. If `bg.webp` natural height produces a different height, the displayed canvas height will be slightly wrong until the next resize event.
   - Recommendation: Call `resizeCanvas()` at the end of `bgImage.onload` after `ParallaxBg.init()`.

2. **`screen.orientation` availability on older Android WebViews?**
   - What we know: Global browser support is 95.3% per caniuse. Fallback `window resize` event covers orientation change on most remaining devices.
   - What's unclear: Specific Android WebView versions below Chrome 79.
   - Recommendation: The `if (screen.orientation)` guard in the implementation handles missing API gracefully. `window resize` still fires on orientation change in those cases.

---

## Sources

### Primary (HIGH confidence)

- [MDN — Window: resize event](https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event) — standard API reference
- [MDN — ScreenOrientation: change event](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/change_event) — modern orientation API
- [MDN — Window: orientationchange event](https://developer.mozilla.org/en-US/docs/Web/API/Window/orientationchange_event) — confirmed deprecated
- [MDN — Crisp pixel art look](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) — `image-rendering` and `imageSmoothingEnabled`
- [caniuse — ScreenOrientation change event](https://caniuse.com/mdn-api_screenorientation_change_event) — 95.3% global support, iOS Safari 16.4+
- Code inspection of `index.html` — current canvas setup, HUD positions, coordinate mapping

### Secondary (MEDIUM confidence)

- [web.dev — Auto-Resizing HTML5 Games](https://web.dev/gopherwoord-studios-resizing-html5-games/) — CSS + JS hybrid approach, aspect ratio logic
- [7tonshark.com — Scaling a pixel art game](https://7tonshark.com/posts/pixel-art-canvas-resize/) — `devicePixelRatio` and fixed-resolution approach
- [frontend.fyi — Fix for 100vh on mobile](https://www.frontend.fyi/tutorials/finally-a-fix-for-100vh-on-mobile) — `dvh` unit explanation

### Tertiary (LOW confidence — single sources)

- [joshondesign.com — Canvas Scaling and Smoothing Tricks](https://joshondesign.com/2023/04/15/canvas_scale_smooth) — CSS `object-fit: contain` as alternative

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — pure web platform APIs, no library choices to make
- Architecture (CSS style scaling approach): HIGH — verified against web.dev case study, MDN canvas docs, existing coordinate mapping in the codebase
- Pitfalls: HIGH — iOS 100vh bug is MDN/caniuse verified; orientationchange deprecation is MDN confirmed; canvas.width reset risk is derived from direct code inspection
- HUD safety: HIGH — confirmed all HUD positions use `canvas.width` as anchor; cannot overflow canvas boundary

**Research date:** 2026-02-23
**Valid until:** 2026-08-23 (stable web APIs; `dvh` and `screen.orientation` support will only improve)
