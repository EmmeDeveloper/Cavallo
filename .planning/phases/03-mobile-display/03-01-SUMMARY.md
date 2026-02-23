---
phase: 03-mobile-display
plan: 01
subsystem: ui
tags: [canvas, responsive, mobile, viewport, css]

# Dependency graph
requires:
  - phase: 02-audio-integration
    provides: "Complete game with audio — index.html with full game logic"
provides:
  - "resizeCanvas() function with cover scaling strategy (Math.max)"
  - "CSS dvh fix for iOS Safari toolbar"
  - "canvas display:block and overflow:hidden body for fullscreen cover"
  - "resize + screen.orientation change listeners for automatic rescaling"
affects: [04-and-beyond]

# Tech tracking
tech-stack:
  added: []
  patterns: [canvas-cover-scaling, dvh-viewport-fix]

key-files:
  created: []
  modified: [index.html]

key-decisions:
  - "Cover strategy (Math.max) instead of contain (Math.min) — canvas fills full viewport, background may be cropped on one axis, no black bars visible"
  - "body overflow:hidden clips overflowing canvas; flex centering (justify-content+align-items center) keeps crop symmetric on both sides"
  - "canvas.width/height unchanged — only canvas.style.width/height scaled so game coordinate system remains intact"
  - "screen.orientation.addEventListener with if-guard instead of deprecated window.orientationchange"

patterns-established:
  - "Cover scaling: Math.max(scaleX, scaleY) for fullscreen fill — use when black bars are unacceptable"
  - "Contain scaling: Math.min(scaleX, scaleY) for letterbox — use when full frame must always be visible"

requirements-completed: [MOB-01, MOB-02]

# Metrics
duration: 10min
completed: 2026-02-23
---

# Phase 03 Plan 01: Mobile Display Summary

**Fullscreen cover canvas scaling via Math.max — canvas fills entire viewport on any device/orientation with no letterboxing, using CSS dvh fix for iOS Safari**

## Performance

- **Duration:** ~10 min (including checkpoint feedback cycle)
- **Started:** 2026-02-23
- **Completed:** 2026-02-23
- **Tasks:** 2 (Task 1 fixed + re-committed after user feedback; Task 2 checkpoint approved)
- **Files modified:** 1

## Accomplishments
- Canvas scales to cover the full viewport on every device (phone portrait, phone landscape, tablet, desktop) — no black bars
- iOS Safari toolbar overflow fixed via `height: 100dvh` (was `100vh`)
- Automatic rescaling on both `window resize` and `screen.orientation change` events without page reload
- Game coordinate system (canvas.width/height) unchanged — all touch/click input mapping via getBoundingClientRect remains correct

## Task Commits

Each task was committed atomically:

1. **Task 1 (initial): CSS dvh fix + resizeCanvas() with contain strategy** - `2990a6b` (feat)
2. **Task 1 (fix): Switch to cover strategy (Math.max) per user feedback** - `9c55795` (fix)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `index.html` — resizeCanvas() uses Math.max for cover scaling; body height 100dvh; canvas display:block

## Decisions Made
- **Cover vs contain:** Original plan specified `Math.min` (contain/letterbox). User explicitly requested `Math.max` (cover/fullscreen) — canvas may crop background edges but always fills the full viewport. This is the correct approach for a mobile game.
- **No changes to canvas.width/height:** Only CSS style dimensions are scaled. The internal 960x590 coordinate space is untouched so all game logic, HUD positioning, and input coordinates remain correct.
- **Centering strategy:** `body { display:flex; justify-content:center; align-items:center; overflow:hidden }` — centering ensures symmetric cropping; overflow:hidden prevents scrollbars from appearing when canvas overflows.

## Deviations from Plan

### User-directed change (not an auto-fix)

**Scale strategy changed from contain (Math.min) to cover (Math.max) per explicit user feedback**
- **Found during:** Task 2 checkpoint review
- **Issue:** Original plan specified letterbox/contain strategy — user rejected this in favor of fullscreen cover with no black bars
- **Fix:** Changed `Math.min` to `Math.max` in resizeCanvas() scale calculation
- **Files modified:** index.html (line 549)
- **Verification:** Confirmed via code review — scale factor now always >= both scaleX and scaleY, canvas CSS dimensions always >= viewport dimensions
- **Committed in:** `9c55795` (dedicated fix commit)

---

**Total deviations:** 1 user-directed (scale strategy change from contain to cover)
**Impact on plan:** Direction change was correct for the stated goal (fullscreen mobile game). No scope creep — single line change with clear intent.

## Issues Encountered
- None beyond the planned checkpoint feedback that triggered the strategy change.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Canvas is fully responsive, ready for any future visual/gameplay phases
- getCanvasPos() already uses getBoundingClientRect so all input handling works correctly at any scale
- No blockers

---
*Phase: 03-mobile-display*
*Completed: 2026-02-23*
