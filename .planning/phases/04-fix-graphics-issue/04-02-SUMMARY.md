---
phase: 04-fix-graphics-issue
plan: 02
subsystem: graphics/sprites
tags: [sprites, pixel-art, png-generation, canvas, rendering]
dependency_graph:
  requires: [04-01]
  provides: [pixel-art-sprites, sprite-render-system]
  affects: [index.html, sprites/]
tech_stack:
  added: [pure-zlib-png-encoder, drawSprite-helper, OBS_SPRITE-map]
  patterns: [exact-hitbox-sprites, top-left-positioning, code-drawn-fallback]
key_files:
  created:
    - gen_sprites_v2.js
    - sprites/horse_run1.png (55x78)
    - sprites/horse_jump.png (55x78)
    - sprites/boss_idle.png (132x108)
    - sprites/boss_charge.png (132x108)
    - sprites/boss_flash.png (132x108)
    - sprites/arancino.png (16x16)
    - sprites/fornacella1.png (27x36)
    - sprites/fornacella2.png (30x40)
    - sprites/fornacella_grill.png (36x60)
    - sprites/maf_coltello.png (33x63)
    - sprites/maf_lupara.png (36x72)
    - sprites/maf_fornacella.png (33x84)
    - sprites/lava.png (20x20)
  modified:
    - index.html
decisions:
  - "Each sprite generated at EXACT hitbox dimensions (not 64x64) — art fills entire image, zero padding"
  - "Pure Node.js zlib PNG encoder used — no external dependencies (canvas/sharp not available)"
  - "drawSprite uses top-left positioning with exact w,h — no centering math needed"
  - "Horse is STATIC (no walk animation) — uses horse_run1 for ground, horse_jump for airborne"
  - "Boss HP bar extracted into drawBossHPBar() — called separately after sprite drawImage"
  - "All original draw functions preserved in OBS_DRAW_FALLBACK — not deleted, used as fallback during sprite load"
metrics:
  duration: 6min
  completed_date: 2026-02-23
  tasks_completed: 2
  tasks_total: 3
  files_changed: 15
---

# Phase 04 Plan 02: Sprite Generation (Revised) Summary

**One-liner:** Pure-Node PNG sprites at exact hitbox dims (55x78 horse, 132x108 boss, etc.) replacing code-drawn canvas functions via drawSprite top-left helper.

## What Was Built

Replaced all code-drawn sprite functions in the game with PNG sprite renders at exact hitbox
dimensions. The previous attempt failed because sprites were 64x64 with unpredictable transparent
padding. This revision generates each sprite at its exact target pixel dimensions so drawImage
renders 1:1 with no compensation needed.

### Sprite Generation (Task 1)

Created `gen_sprites_v2.js` — a pure Node.js PNG encoder using the built-in `zlib` module.
The script:
- Implements a minimal canvas abstraction (fillRect over RGBA pixel buffer)
- Reproduces the exact same pixel patterns from the game's draw functions
- Encodes pixel buffers as valid RGBA PNG with zlib deflation
- Generates all 13 sprites at exact target hitbox dimensions

All 13 sprites verified at correct dimensions: horse 55x78, boss 132x108, arancino 16x16,
fornacella1 27x36, fornacella2 30x40, fornacella_grill 36x60, maf_coltello 33x63,
maf_lupara 36x72, maf_fornacella 33x84, lava 20x20.

### Render Code Update (Task 2)

Updated `index.html`:
- Added `loadSprite` preloader for all 13 sprites at top of game script
- Added `drawSprite(img, x, y, w, h)` helper with `imageSmoothingEnabled=false`
- `drawHorseSprite`: static horse — horse_run1 on ground, horse_jump when airborne, positioned at `(horse.x, horse.y - HORSE_H)` (feet-anchor to top-left conversion)
- `drawBossSprite` + `drawBossHPBar`: boss sprite with flash overlay support; HP bar drawn separately
- `drawObstacles`: OBS_SPRITE map → drawSprite; falls back to code-drawn during load
- Arancino, lava: sprite renders with code-drawn fallback
- Menu horse: 1.5x scale sprite centered at ground

### Visual Verification (Task 3 — Checkpoint)

Paused for human verification. User must confirm:
1. All entities render as pixel art sprites at correct sizes
2. No floating/sinking sprites — feet on ground
3. Horse is static (no walk animation)
4. Hitboxes align with visible sprites
5. Boss HP bar shows correctly
6. Game is fully playable

## Deviations from Plan

### Auto-added: drawBossHPBar() separation

**Found during:** Task 2
**Issue:** The original `drawLiotru` function included the HP bar rendering inline. When replacing with sprite drawImage, the HP bar would be lost since it's drawn relative to boss position.
**Fix:** Extracted HP bar rendering into `drawBossHPBar(x, y)` — called after `drawSprite` for the boss body.
**Files modified:** index.html

### Auto-added: OBS_DRAW_FALLBACK map

**Found during:** Task 2
**Issue:** Plan said "comment out old draw functions" but they are needed as fallback during the first few frames before sprites finish loading. Deleting them would cause visual flicker or errors.
**Fix:** Kept all original draw functions intact, added OBS_DRAW_FALLBACK map for graceful fallback. All sprite renders check `img.complete && img.naturalWidth > 0` before using sprite.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1    | c0ecfef | feat(04-02): generate all sprites at exact hitbox dimensions via pure-Node PNG encoder |
| 2    | 8ff0f41 | feat(04-02): add sprite preloader and replace all draw functions with drawSprite |

## Self-Check

Verified files exist:
- gen_sprites_v2.js: created
- sprites/horse_run1.png at 55x78: confirmed
- sprites/boss_idle.png at 132x108: confirmed
- All 13 sprites at correct dimensions: confirmed

Verified commits exist:
- c0ecfef: confirmed
- 8ff0f41: confirmed

## Self-Check: PASSED
