---
phase: 04-fix-graphics-issue
plan: 01
subsystem: ui
tags: [canvas, parallax, background, letterbox, devtools, touch-gesture]

# Dependency graph
requires:
  - phase: 03-mobile-display
    provides: resizeCanvas() with Math.min contain scaling + CSS dvh fix
provides:
  - Static bg.webp background rendering (no parallax) in drawMenu() and render()
  - Hidden dev reset via 3-second long-press on menu canvas
  - Blurred letterbox bars (body::before blur 24px) for polished off-ratio viewports
affects: [future-ui-phases, mobile-display, gameplay-rendering]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ParallaxBg IIFE disabled by block-comment (not deleted) — preserved for possible re-enable
    - Long-press gesture pattern: setTimeout + mousedown/touchstart with gameState guard
    - body::before pseudo-element for blurred ambient background behind letterbox bars

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "ParallaxBg code commented out (not deleted) per Phase 04 decision — static bg.webp replaces all scrolling layers"
  - "Dev reset button (#resetBtn) hidden via CSS display:none; devReset() exposed only via 3-second long-press on canvas in menu state"
  - "Letterbox bars styled with blurred darkened bg.webp via body::before (blur 24px, brightness 0.35) instead of solid black"
  - "Tasks 1 and 2 were committed together in a single commit (6448468) — both were in-progress before the prior agent committed"

patterns-established:
  - "Gesture-gated dev tools: wrap devReset() in long-press event listener with gameState guard — no visible UI required"
  - "Ambient letterbox: body::before pseudo-element with blurred cover background + scale(1.05) to hide blur edges"

requirements-completed: [GFX-01, GFX-03, GFX-04]

# Metrics
duration: ~15min
completed: 2026-02-23
---

# Phase 04 Plan 01: Fix Graphics Issue Summary

**Static bg.webp restored by disabling ParallaxBg IIFE, dev reset hidden behind 3-second canvas long-press, and letterbox bars given blurred ambient bg.webp treatment**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-23
- **Completed:** 2026-02-23
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint, approved by user)
- **Files modified:** 1 (index.html)

## Accomplishments
- Disabled all ParallaxBg calls (init, update, draw) by block-commenting the entire IIFE — drawBackground() now serves both drawMenu() and render()
- Hidden #resetBtn from player view; devReset() accessible only via 3-second long-press on the menu canvas (mouse and touch)
- Added blurred darkened bg.webp letterbox treatment via body::before pseudo-element — polished visual instead of solid black bars
- User visually verified static background, hidden reset button, gesture trigger, and letterbox bars — all approved

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove parallax and restore static background** - `6448468` (feat) — note: Tasks 1 and 2 were combined in this single commit
2. **Task 2: Hide reset button behind secret long-press gesture and polish letterbox CSS** - `6448468` (feat) — same commit as Task 1
3. **Task 3: Visual verification** - human-verify checkpoint, approved by user (no code commit)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `index.html` - ParallaxBg disabled, devReset() + long-press gesture, body::before letterbox CSS

## Decisions Made
- ParallaxBg code commented out rather than deleted — reversible if parallax is re-evaluated later
- devReset() is guarded by `gameState === 'menu'` inside the timeout callback for extra safety
- Long-press fires confirm() dialog — intentionally simple UX for a dev-only tool
- body::before uses `transform: scale(1.05)` to prevent blur edge artifacts from showing

## Deviations from Plan

None — plan executed exactly as specified. Tasks 1 and 2 were committed together in a single commit rather than separately, but all planned changes were implemented and verified.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 04 graphics fix complete — bg.webp is the hero visual, no scrolling layers
- All gameplay functionality preserved (verified by user)
- ParallaxBg code retained (commented) if future phase wants to re-enable
- No blockers for next phase

---
*Phase: 04-fix-graphics-issue*
*Completed: 2026-02-23*
