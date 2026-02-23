# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Il gioco deve sembrare un prodotto professionale da store — grafica pixel art curata, animazioni fluide, effetti visivi ed audio coinvolgenti.
**Current focus:** Phase 4 — Fix Graphics Issue

## Current Position

Phase: 4 of 4 (Fix Graphics Issue)
Plan: 1 of 1 in current phase
Status: Phase 04 Plan 01 complete — static bg.webp restored, dev reset hidden, letterbox polished
Last activity: 2026-02-23 — Completed plan 04-01: parallax disabled, long-press dev reset, blurred letterbox bars

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 4
- Average duration: 6min
- Total execution time: ~0.44 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-screen-effects-and-visual-polish | 2 | 8min | 4min |
| 02-audio-integration | 1 | 8min | 8min |
| 03-mobile-display | 1 | 10min | 10min |

**Recent Trend:**
- Last 5 plans: 01-01 (2min), 01-02 (6min), 02-01 (8min), 03-01 (10min)
- Trend: -

*Updated after each plan completion*
| Phase 02-audio-integration P02 | 4 | 1 tasks | 5 files |
| Phase 03-mobile-display P01 | 10 | 2 tasks | 1 file |
| Phase 04-fix-graphics-issue P01 | 15 | 3 tasks | 1 files |

## Accumulated Context

### Decisions

- [Init]: Mantenere vanilla JS senza engine — nessuna dipendenza esterna tranne Howler.js via CDN per audio
- [Init]: Audio da risorse gratuite CC0 (OpenGameArt, Freesound) — nessun costo
- [Init]: Pixel art migliorato in stile esistente, palette Catania rispettata
- [Init]: Focus solo polish visivo/audio, nessuna nuova meccanica di gameplay
- [01-01]: Sky far-layer usa gradiente statico senza scroll orizzontale — offscreen canvas evita ri-creazione del gradiente ogni frame
- [01-01]: Mid-layer usa seeded LCG random (seed=42) per layout edifici deterministico e riproducibile
- [01-01]: Near-layer bg.webp usa double-draw pattern (x e x+canvasWidth) per scroll seamless infinito
- [01-01]: Parallax procedurale confermato (nessun nuovo asset) — livelli far/mid sono canvas gradient e rettangoli
- [01-01]: Subsystem pattern stabilito: IIFE namespace in <script> separato prima del codice principale di gioco
- [01-02]: ScreenFade usa midpoint callback per 'out-in' — menu visibile durante fade-out, nuova scena appare durante fade-in
- [01-02]: Score pulse solo su eventi discreti (ogni 100 pt e pickup arancino), non ogni frame — evita rumore visivo costante
- [01-02]: Particelle rank-up movimentate dentro drawRankCelebration() non in update() — OK per 6 particelle a vita breve
- [02-01]: SFX files generati come WAV PCM sintetizzato (ffmpeg non disponibile) — etichettati .ogg/.mp3; Howler carica i byte WAV via Web Audio API
- [02-01]: AudioManager.init() chiamato una volta in fondo allo script principale prima di requestAnimationFrame — guard initialized previene re-entry
- [02-01]: playMusic/stopMusic stub presenti in AudioManager ma non connessi — rimandati a plan 02-02 (musica)
- [02-01]: 3 chiamate AudioManager.play('gameOver'): collisione ostacolo, collisione lava, collisione laterale boss — ognuna all'interno del proprio blocco condizionale
- [Phase 02-02]: Music WAV files generated as synthesized PCM labeled .ogg/.mp3 — Howler loads WAV bytes via Web Audio API; real CC0 files can replace without code changes
- [Phase 02-02]: btnMute 32x32px at hx-42 in drawScore(); uses S/M text labels (not emoji) per RESEARCH.md recommendation
- [Phase 02-02]: Music state machine: playMusic(game) at 5 game-start paths, playMusic(boss) on boss spawn, playMusic(game) on boss defeat, stopMusic on 3 gameover paths + Escape + home button
- [Phase 03-01]: Cover scaling (Math.max) chosen over contain (Math.min) — canvas fills full viewport, background may crop on one axis, no black bars visible. User-directed decision.
- [Phase 03-01]: canvas.width/height unchanged in resizeCanvas — only canvas.style dimensions scaled; game coordinate system and getBoundingClientRect input mapping remain intact
- [Phase 03-01]: body overflow:hidden + flex centering ensures symmetric cropping when canvas overflows viewport
- [Phase 04-fix-graphics-issue]: ParallaxBg code commented out (not deleted) — static bg.webp replaces scrolling layers
- [Phase 04-fix-graphics-issue]: Dev reset hidden via CSS; devReset() accessible only via 3-second long-press on menu canvas
- [Phase 04-fix-graphics-issue]: Letterbox bars styled with blurred darkened bg.webp via body::before (blur 24px, brightness 0.35)

### Roadmap Evolution

- Phase 4 added: Fix graphics issue

### Pending Todos

None yet.

### Blockers/Concerns

- SFX files sono WAV sintetizzati labellati .ogg/.mp3 — possono essere sostituiti con file CC0 reali senza modifiche al codice
- Music files (music_game.ogg, music_boss.ogg) — WAV sintetizzati, verificati e approvati dall'utente
- Mobile testing: i pitfall iOS (autoplay audio, screen shake viewport) vanno verificati su dispositivo fisico dopo Phase 2

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 04-01-PLAN.md — Phase 04 graphics fix complete. ParallaxBg disabled, dev reset hidden, letterbox polished.
Resume file: None
