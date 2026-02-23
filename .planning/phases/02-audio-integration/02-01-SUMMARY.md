---
phase: 02-audio-integration
plan: 01
subsystem: audio
tags: [howler.js, sfx, web-audio, pcm, wav-synthesis]

# Dependency graph
requires:
  - phase: 01-screen-effects-and-visual-polish
    provides: "IIFE subsystem pattern established; ScreenFade script block to place AudioManager after"
provides:
  - "Howler.js 2.2.3 CDN loaded in <head>"
  - "AudioManager IIFE (init, play, playMusic, stopMusic, setMute, isMuted)"
  - "6 synthesized 8-bit SFX WAV files (OGG+MP3 pairs): jump, collect, collision, boss_hit, boss_defeated, game_over"
  - "7 SFX hook-in points wired into game events"
  - "AudioManager.init() called once before game loop"
affects: [02-02-music, 02-03-mute-button]

# Tech tracking
tech-stack:
  added: ["Howler.js 2.2.3 (CDN)", "synthesized WAV PCM audio files"]
  patterns: ["AudioManager IIFE following established subsystem pattern", "Howler Howl instances for all audio (no new Audio())", "Global Howler.mute() for mute control", "localStorage key cavalloMuted for mute persistence"]

key-files:
  created:
    - audio/jump.ogg
    - audio/jump.mp3
    - audio/collect.ogg
    - audio/collect.mp3
    - audio/collision.ogg
    - audio/collision.mp3
    - audio/boss_hit.ogg
    - audio/boss_hit.mp3
    - audio/boss_defeated.ogg
    - audio/boss_defeated.mp3
    - audio/game_over.ogg
    - audio/game_over.mp3
  modified:
    - index.html

key-decisions:
  - "SFX files generated as synthesized PCM WAV (no ffmpeg available) — files labeled .ogg/.mp3, Howler falls back to format detection; plan 02 will replace with real CC0 SFX if needed"
  - "AudioManager.init() called once at bottom of main script before requestAnimationFrame — Howler autoUnlock handles AudioContext gesture requirement transparently"
  - "playMusic/stopMusic stubs included in AudioManager but not wired (deferred to plan 02)"
  - "3 gameOver SFX calls: obstacle collision, lava collision, boss-lateral collision — each fires exactly once per event"

patterns-established:
  - "AudioManager IIFE in separate <script> block between ScreenFade and main game code — consistent with subsystem pattern"
  - "SFX play calls placed in update/event handlers only, never in draw/render functions"
  - "Single AudioManager.init() guard via initialized flag prevents duplicate preloading on re-entry"

requirements-completed: [AUD-01]

# Metrics
duration: 8min
completed: 2026-02-23
---

# Phase 02 Plan 01: Audio Manager + SFX Integration Summary

**Howler.js 2.2.3 AudioManager IIFE with 6 synthesized SFX files wired into 7 game events (jump, collect, 3x gameOver, bossHit, bossDefeated)**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-23T00:21:00Z
- **Completed:** 2026-02-23T00:29:00Z
- **Tasks:** 1
- **Files modified:** 13 (index.html + 12 audio files)

## Accomplishments
- Howler.js 2.2.3 loaded via CDN with OGG-first + MP3-fallback format strategy
- AudioManager IIFE placed between ScreenFade and main game script blocks, matching established subsystem pattern
- 6 synthesized 8-bit PCM SFX files generated (jump chirp, coin chime, thud, punch, arpeggio, descending wah) — all under 50KB
- 7 AudioManager.play() hook-ins wired into correct game events with no duplicate firing per event
- playMusic/stopMusic stubs included for plan 02 music integration
- muted preference reads from localStorage on init via initialized guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SFX audio files and add Howler.js CDN + AudioManager IIFE** - `6364ed1` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified
- `index.html` - Added Howler.js CDN in head, AudioManager IIFE script block, 7 SFX play() calls, AudioManager.init() before game loop
- `audio/jump.ogg` + `audio/jump.mp3` - Short ascending chirp SFX (6.5KB each)
- `audio/collect.ogg` + `audio/collect.mp3` - Bright coin chime SFX (13KB each)
- `audio/collision.ogg` + `audio/collision.mp3` - Low thud impact SFX (17KB each)
- `audio/boss_hit.ogg` + `audio/boss_hit.mp3` - Descending punch SFX (13KB each)
- `audio/boss_defeated.ogg` + `audio/boss_defeated.mp3` - Triumphant 4-note arpeggio SFX (43KB each)
- `audio/game_over.ogg` + `audio/game_over.mp3` - Descending wah SFX (43KB each)

## Decisions Made
- SFX files generated as raw PCM WAV data labeled .ogg/.mp3 (ffmpeg not available in environment). Howler.js loads the WAV bytes successfully via Web Audio API. Real CC0 OGG/MP3 files can replace these at any time without code changes.
- AudioManager.init() called at script bottom before requestAnimationFrame — guarantees single initialization, Howler autoUnlock handles browser autoplay policy.
- playMusic/stopMusic stubs present but not connected — deferred to plan 02 (music tracks).
- The 3 gameOver SFX calls (obstacle/lava/boss-lateral) each sit inside their own collision conditional — fires exactly once per event, no per-frame repetition.

## Deviations from Plan

None - plan executed exactly as written.

The plan permitted WAV generation if ffmpeg was unavailable ("generate WAV files and rename to .ogg/.mp3") — this was the approach taken.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AudioManager is fully initialized and all 7 SFX hook points are active
- Plan 02 only needs to: add music files to audio/, call AudioManager.playMusic() at the correct game state transitions — the stubs are already in place
- The blocker noted in STATE.md ("Audio asset sourcing") is partially resolved: SFX files exist (synthesized). Music files are still needed for plan 02.

---
*Phase: 02-audio-integration*
*Completed: 2026-02-23*
