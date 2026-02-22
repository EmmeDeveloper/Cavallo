---
phase: 01-screen-effects-and-visual-polish
plan: 01
subsystem: ui
tags: [canvas, parallax, background, procedural, animation]

# Dependency graph
requires: []
provides:
  - ParallaxBg IIFE namespace with init/update/draw API in index.html
  - Procedural far-layer sky gradient rendered to offscreen canvas once for performance
  - Procedural mid-layer city silhouette (seeded-random buildings, seamless wrap)
  - Near layer: bg.webp drawn twice side-by-side for seamless infinite scroll
  - Parallax integrated into menu (slow crawl) and gameplay (speed-synced) states
affects:
  - 01-screen-effects-and-visual-polish
  - future CameraFX phases (render pipeline order established)
  - future ParticleSystem phases (render pipeline draw order is after ParallaxBg.draw)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - IIFE namespace pattern for subsystems (self-contained, before main game script)
    - Offscreen canvas for static background layers (render once, reuse via drawImage)
    - Seeded LCG random for deterministic procedural content generation
    - Double-draw seamless wrap: drawImage at x and x+canvasWidth with modulo offset

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Sky far-layer is a static vertical gradient (no horizontal scroll) — uniform gradient scrolling is invisible; offscreen canvas avoids per-frame gradient recreation"
  - "Mid-layer uses seeded random (seed=42) for deterministic building layout — same layout every session, no random stutters on init"
  - "Near-layer bg.webp drawn twice side-by-side (double-draw pattern) for seamless infinite scroll without clipping complexity"
  - "ParallaxBg placed in separate <script> before main game <script> — subsystem-before-main architecture established per ARCHITECTURE.md"
  - "Menu screen receives slow crawl speed (1.5) for atmospheric parallax motion, not static background"

patterns-established:
  - "Subsystem pattern: IIFE namespace with init/update/draw API, declared in separate <script> block before main game code"
  - "Offscreen canvas pattern: pre-render static layers once to OffscreenCanvas at init, reuse with drawImage each frame"
  - "Seeded deterministic random: LCG seededRand(seed) for reproducible procedural content without Math.random() non-determinism"
  - "Double-draw wrap: draw bg.webp at offset x and x+canvasWidth, use modulo on offset for seamless infinite scroll"

requirements-completed: [VIS-01]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 1 Plan 01: Parallax Background Summary

**3-layer procedural parallax background using offscreen-canvas sky gradient, seeded building silhouettes, and double-draw bg.webp seamless scroll**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-22T23:52:06Z
- **Completed:** 2026-02-22T23:54:08Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Created `ParallaxBg` IIFE namespace with full init/update/draw API, placed in a dedicated `<script>` block before the main game script following the established subsystem architecture
- Far layer (speed 0.15): sky gradient drawn to offscreen canvas at `init()` time — zero per-frame gradient allocation; retrieved via `drawImage` each frame
- Mid layer (speed 0.4): procedural dark city silhouette using seeded LCG random — 30-40 buildings with varying widths (20-60px) and heights (40-120px), seamless strip wrap via modulo on strip total width
- Near layer (speed 1.0): existing `bg.webp` drawn twice side-by-side (double-draw wrap) with `Math.floor()` on all coordinates and `imageSmoothingEnabled = false` for pixel-crisp rendering; fallback gradient on load failure
- Wired into `bgImage.onload` (and fallback default-canvas init), `update()` for both menu crawl and gameplay speed-synced scroll, and `render()` / `drawMenu()` replacing `drawBackground()` calls

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ParallaxBg subsystem with procedural layers** — `a8c31ff` (feat)
2. **Task 2: Wire ParallaxBg into existing game loop** — `a8c31ff` (feat, combined with Task 1 in same file edit session)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `index.html` — Added ParallaxBg IIFE `<script>` block (lines 209-335); modified `bgImage.onload`, `update()`, `render()`, `drawMenu()` to wire the subsystem

## Decisions Made
- Sky far-layer is a static vertical gradient with no horizontal scroll — a uniform gradient has no visible features to reveal scrolling motion; offscreen canvas avoids recreating the gradient object every frame (performance gain per PITFALLS.md)
- Mid-layer uses seeded deterministic random (LCG seed=42) — same building layout on every session; reproducible debugging and no stutter-on-init
- Near-layer bg.webp uses double-draw pattern rather than 9-argument `drawImage` source-rect clipping — simpler implementation, same correctness, matches existing single-file architecture
- Menu screen gets slow crawl speed (1.5) rather than static background — consistent with "menu should have subtle background motion" requirement from the plan
- Both tasks committed together in one commit since both operate on the same file in a single edit session

## Deviations from Plan

None - plan executed exactly as written. All constraints from PITFALLS.md applied: `Math.floor()` on coordinates, no `shadowBlur`, offscreen canvas for far layer, double-draw for near layer.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Open `index.html` in any browser.

## Next Phase Readiness
- ParallaxBg subsystem is complete and integrated; render pipeline order is established (ParallaxBg → Ground → Entities → HUD)
- Pattern precedent set for future subsystems: IIFE namespace in separate `<script>` block before main game code
- Next plans in this phase can build on this foundation: CameraFX screen shake, particle system, sprite animation improvements

## Self-Check: PASSED

- index.html: FOUND
- 01-01-SUMMARY.md: FOUND
- Commit a8c31ff: FOUND

---
*Phase: 01-screen-effects-and-visual-polish*
*Completed: 2026-02-23*
