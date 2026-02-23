---
phase: 02-audio-integration
plan: 02
subsystem: audio
tags: [howler.js, music, web-audio, pcm, wav-synthesis, mute-button, hud]

# Dependency graph
requires:
  - phase: 02-audio-integration
    plan: 01
    provides: "AudioManager IIFE with playMusic/stopMusic stubs + Howler.js CDN loaded"
provides:
  - "music_game.ogg + music_game.mp3: 16s seamless C-major chiptune loop at 120 BPM"
  - "music_boss.ogg + music_boss.mp3: 10s intense A-minor loop at 140 BPM (30% duty square wave)"
  - "AudioManager.playMusic('game') wired at 5 game-start entry points"
  - "AudioManager.playMusic('boss') wired on boss spawn trigger"
  - "AudioManager.playMusic('game') wired on boss defeated"
  - "AudioManager.stopMusic() wired on 3 gameover paths + Escape + home button"
  - "btnMute canvas HUD button (left of btnHome) with S/M text and orange/grey border"
  - "Mute hit-test in handleGameClick + setMute toggle + localStorage persistence (inherited from plan 01)"
affects: [03-screen-effects-visual-polish]

# Tech tracking
tech-stack:
  added: ["Synthesized WAV PCM music files labeled .ogg/.mp3 (same approach as SFX from plan 01)"]
  patterns: ["Music state machine: playMusic on game-start/boss-spawn/boss-defeat, stopMusic on gameover/menu-return", "HUD buttons declared at file scope, updated each drawScore() frame, hit-tested in handleGameClick"]

key-files:
  created:
    - audio/music_game.ogg
    - audio/music_game.mp3
    - audio/music_boss.ogg
    - audio/music_boss.mp3
  modified:
    - index.html

key-decisions:
  - "Music files generated as raw PCM WAV labeled .ogg/.mp3 (same approach as SFX — Howler loads WAV bytes via Web Audio API successfully)"
  - "btnMute positioned at hx-42 (left of home button) with 32x32px hitbox matching btnHome size"
  - "Mute icon uses text S/M (not emoji) per RESEARCH.md recommendation to avoid cross-platform rendering issues"
  - "AudioManager.stopMusic() added to home button click in handleGameClick (in addition to Escape key) to ensure music stops on all return-to-menu paths"
  - "playMusic calls placed inside ScreenFade out-in callbacks (after resetGame) so music starts when new game is visible, not during fade"

patterns-established:
  - "Music transitions mirror game state machine: game-start->playMusic(game), boss-spawn->playMusic(boss), boss-defeat->playMusic(game), gameover->stopMusic"
  - "Canvas HUD buttons (btnHome, btnMute) declared at file scope, rect updated each drawScore() call, single handleGameClick dispatch"

requirements-completed: [AUD-02, AUD-03, AUD-04]

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 02 Plan 02: Background Music + Mute Button HUD Summary

**Seamless background music with boss-fight swap via synthesized PCM loops (16s game / 10s boss), music state machine wired to all 5 game-start paths + boss/gameover events, and canvas mute button in HUD with localStorage persistence**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-23T00:25:37Z
- **Completed:** 2026-02-23T00:29:00Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint, approved 2026-02-23)
- **Files modified:** 5 (index.html + 4 audio files)

## Accomplishments
- 2 synthesized music tracks created: music_game (C-major upbeat 120BPM, 16s loop) and music_boss (A-minor tense 140BPM narrow duty, ~10s loop) — both under 710KB
- Music state machine fully wired: 5 game-start entry points, boss spawn, boss defeat, 3 gameover paths, Escape key, home button click
- Mute button drawn on canvas HUD (32x32px at hx-42, shows 'S'/'M', orange/grey border) with hit-test in handleGameClick
- No duplicate AudioManager.init() calls added; no html5:true on Howl instances (preserves seamless loop behavior)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create music files and wire music state transitions + mute button HUD** - `d89ff79` (feat)
2. **Task 2: Verify complete audio experience (human-verify checkpoint)** - Approved by user 2026-02-23

**Plan metadata:** `eff9564` (docs: complete background music + mute button HUD plan)

## Files Created/Modified
- `audio/music_game.ogg` + `audio/music_game.mp3` - 16s PCM WAV loop, C-major chiptune, square wave melody + triangle bass at 120 BPM
- `audio/music_boss.ogg` + `audio/music_boss.mp3` - 10s PCM WAV loop, A-minor intense, 30% duty square melody + sawtooth bass at 140 BPM
- `index.html` - btnMute declaration, mute button draw in drawScore(), mute hit-test in handleGameClick, stopMusic in home button, Escape key, all 3 gameover paths; playMusic calls at all 5 game-start entry points + boss spawn + boss defeat

## Decisions Made
- Music WAV files generated as synthesized PCM labeled .ogg/.mp3 (same pattern as plan 01 SFX — Howler.js loads WAV bytes via Web Audio API). Real CC0 OGG/MP3 files can replace at any time without code changes.
- Boss track uses 30% duty cycle square wave (vs 50% for game track) to create audible tension difference.
- Mute button at `hx - 42` (10px gap from home button at `canvas.width - 210`).
- stopMusic added to handleGameClick home-button handler (in addition to Escape) — plan specified both paths.

## Deviations from Plan

None - plan executed exactly as written.

The plan permitted WAV generation if real CC0 files were unavailable ("generate simple synthesized loops using a Node.js script") — this approach was taken, consistent with plan 01.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete audio system is now in place: SFX (6 events from plan 01) + background music (game/boss tracks) + mute toggle with persistence
- Human verification checkpoint (Task 2) approved — audio experience confirmed working across all game states
- Phase 03 (screen effects / visual polish) can proceed immediately

---
*Phase: 02-audio-integration*
*Completed: 2026-02-23*
