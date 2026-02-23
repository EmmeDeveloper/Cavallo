---
phase: 01-screen-effects-and-visual-polish
plan: 02
subsystem: ui
tags: [canvas, animation, game-state-transitions, visual-feedback, vanilla-js]

# Dependency graph
requires:
  - phase: 01-screen-effects-and-visual-polish (plan 01)
    provides: ParallaxBg system and modified render/update pipeline structure
provides:
  - ScreenFade IIFE namespace with start/update/draw API for game-state fade transitions
  - Score pulse animation (size + color change on point gains)
  - Rank-up celebration banner with slide-in animation and burst particles
affects:
  - 01-screen-effects-and-visual-polish (plan 03 and later)
  - Any future plan that modifies game state transitions or HUD rendering

# Tech tracking
tech-stack:
  added: []
  patterns:
    - IIFE namespace pattern for isolated subsystems (ScreenFade, consistent with ParallaxBg)
    - Fade type system: 'out' | 'in' | 'out-in' with midpoint callback for state switches
    - ScreenFade.active guard in input handlers to block input during transitions
    - Score pulse via scorePulseTimer countdown with lerped font-size and color
    - Rank celebration via rankCelebrationTimer with slide-in banner + 6 pre-allocated burst particles

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Used separate <script> block for ScreenFade (before main game script), consistent with ParallaxBg pattern"
  - "out-in fade uses midpoint callback to switch game state — menu stays visible during fade-out, new game appears during fade-in"
  - "Gameover collision adds 'in' fade (black->clear impact flash) without changing transition back to gameover state"
  - "Score pulse triggers every 100-point milestone (not per-frame) plus on each arancino pickup (discrete events only)"
  - "Rank-up particles are pre-allocated array of 6 objects (no pool needed, only 6, only during rank-up)"
  - "Particle movement happens inside drawRankCelebration() draw call — acceptable for 6 particles, avoids extra update plumbing"
  - "ScreenFade.draw() added to all three early-return paths in render() (menu/leaderboard/recipes) so fades work everywhere"

patterns-established:
  - "Input blocking during fade: if (ScreenFade.active) return; at top of onJump()"
  - "Last draw call in render() is always ScreenFade.draw() — overlays everything including game-over screen"
  - "Delta-time used throughout: scorePulseTimer -= dt, rankCelebrationTimer -= dt"

requirements-completed:
  - VIS-02
  - VIS-03

# Metrics
duration: 6min
completed: 2026-02-22
---

# Phase 01 Plan 02: Screen Fades and Score Visual Feedback Summary

**ScreenFade IIFE with out/in/out-in transitions, score text pulse on point gains, and rank-up banner with slide-in animation and 6 burst particles**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-22T23:52:29Z
- **Completed:** 2026-02-22T23:58:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- ScreenFade system wired into all four menu-to-playing paths (JUCA click, Space key, nickname confirm, intro video end)
- Impact flash (fade-in from black) on all three gameover collision sites (obstacle, lava, boss lateral)
- Score text pulses from 16px to 20px and turns gold (#ffee44) for 8 delta-time units on every 100-point milestone and arancino pickup
- Rank-up banner slides in from top over 15 frames, displays "RANK UP!" in cyan and rank title in gold (#ffdd33), fades out over 1 second
- 6 burst particles scatter from banner area during first 20 frames of rank-up celebration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ScreenFade system and wire into game state transitions** - `9628d95` (feat)
2. **Task 2: Add score pulse effect and enhanced rank-up celebration** - `ffb2da4` (feat)

**Plan metadata:** (to be added after final docs commit)

## Files Created/Modified
- `index.html` - ScreenFade IIFE block added before main script, score pulse + rank celebration logic in update/draw, all state transitions wired

## Decisions Made
- Used separate `<script>` block for ScreenFade, placed between ParallaxBg block and main game script, consistent with established subsystem pattern
- Score pulse fires only on discrete events (100-pt milestones and arancino pickup), NOT on every frame increment — prevents constant visual noise
- Impact flash on gameover uses 'in' fade type (starts black, fades clear) to create brief darkening moment at death
- Particle movement co-located in draw function rather than update loop — acceptable for 6 particles with 1-second lifetime

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ScreenFade is available for plan 03 if further state transitions need fade treatment
- Score and rank visual systems complete for VIS-02 and VIS-03 requirements
- No blockers for subsequent plans

---
*Phase: 01-screen-effects-and-visual-polish*
*Completed: 2026-02-22*
