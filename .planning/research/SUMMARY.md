# Project Research Summary

**Project:** U Cavaddu Runner — Catania Edition (Polish Milestone)
**Domain:** HTML5 Canvas pixel art endless runner — visual/audio polish for an existing single-file vanilla JS game
**Researched:** 2026-02-22
**Confidence:** HIGH

## Executive Summary

U Cavaddu Runner is a complete, working endless runner implemented as a single `index.html` (~2158 lines) with no build pipeline, no npm, and all sprites drawn programmatically via Canvas 2D. The polish milestone does not involve re-architecting this foundation — it layers audio, particles, screen effects, and visual feedback on top of the existing game loop using vanilla JS patterns and one external dependency (Howler.js via CDN). Every tool and technique chosen is constrained to what works with direct file-open in a browser and CDN script tags.

The recommended approach is additive layering: build 5 isolated subsystems (AudioManager, CameraFX, ParticleSystem, SpriteAnimator, ParallaxBackground) as self-contained IIFE/object namespaces declared before the existing main script, then wire them into the existing game loop at well-defined hook points. This preserves everything that already works, produces immediately testable increments after each subsystem, and avoids the single biggest pitfall in this codebase: rewriting working code to "clean it up" before adding features. The highest impact-to-effort features — screen shake and landing dust particles — require zero new assets and can be implemented first to validate the approach.

The key risks are all implementation-level rather than architectural. Audio autoplay policy on mobile (especially iOS Safari) must be addressed before any sound is wired; Howler.js handles this automatically and is the primary reason it is preferred over raw Web Audio API. Particle systems must use an object pool from day one to avoid GC stutter on mobile. Sprite animation timing must use delta-time, not frame count, to stay framerate-independent. None of these risks are novel — all have well-documented solutions confirmed by official sources.

---

## Key Findings

### Recommended Stack

The constraint of zero build tooling drives all stack decisions. The only external dependency is Howler.js 2.2.4 (via CDN), which is the sole library where the manual alternative requires substantially more code for the same cross-platform result. Everything else — particles, screen shake, sprite animation, parallax — is implemented as vanilla JS using canvas primitives already in use. This is not a compromise; it is the correct choice for this project's scope and constraints.

**Core technologies:**
- **Howler.js 2.2.4 (CDN):** Audio playback (SFX + music) — handles iOS autoplay unlock, mobile Web Audio, and audio sprites automatically. Replaces 40-60 lines of manual boilerplate.
- **Canvas `drawImage()` (native):** Spritesheet frame rendering — already in use; with `imageSmoothingEnabled = false` produces crisp pixel art at any scale.
- **Custom particle pool (vanilla JS):** All particle effects — ~80 lines, no external dependency, zero GC pressure when implemented as object pool.
- **Canvas `ctx.save/translate/restore` (native):** Screen shake and flash overlay — canonical pattern, no library needed.
- **Multi-layer `drawImage()` (native):** Parallax background — replaces existing single `drawBackground()` call with 2-3 speed-layered draws.
- **Aseprite / LibreSprite (authoring tool, optional):** Spritesheet creation if PNG sprites are introduced — exports PNG + JSON frame descriptor. LibreSprite is free if cost is a constraint.

See `.planning/research/STACK.md` for full rationale and CDN include snippets.

### Expected Features

The research identified three tiers of polish features. The "floor for feeling like a real game" per competitor analysis (Canabalt, Alto's Adventure, itch.io indie runners) is screen shake + sound effects + death animation. Everything below that threshold reads as prototype-quality to players.

**Must have (P1 — store-ready threshold):**
- Screen shake on collision, death, boss hit — zero assets, highest impact-to-effort of any item
- Landing dust particles — 10-15 lines of code, no assets
- Arancino collect particle burst — pairs with existing floating text
- Screen fade transitions (menu to game, game to game-over) — 15-frame canvas fade, no assets
- Sound effects (6 minimum: jump, die, collect, boss hit, boss death, game over) — CC0 assets from OpenGameArt
- Background music loop (one looping CC0 track) — silence makes the game feel like a demo
- Audio mute toggle — required alongside any audio; ship together, never separately
- Death animation — horse stumble pose held 0.4s; requires new `'dying'` game state

**Should have (P2 — significantly elevates from publishable to impressive):**
- Boss fight screen effect (red overlay + rumble shake + music change during boss presence)
- Lava projectile impact particles (fire burst on boss lava landing)
- Run speed visual feedback (speed streak lines appearing at high velocity)
- Arancino combo multiplier flash (canvas-wide gold pulse, leverages existing multiplier system)
- Parallax scrolling background (2-3 layers; highest art effort, highest visual impact)

**Defer (v2+):**
- Squash and stretch animation (highest code complexity, defer until core polish is stable)
- Catania landmark parallax layers (Etna, Duomo silhouettes — significant pixel art work)
- Thematic Catania audio (requires music curation/commissioning beyond free SFX packs)

See `.planning/research/FEATURES.md` for full prioritization matrix and competitor analysis.

### Architecture Approach

All new systems are isolated object namespaces (IIFE pattern) declared in `<script>` blocks before the existing main game script. The main game code is modified only at well-defined hook points — never refactored wholesale. The build order runs from systems with zero dependencies (AudioManager, CameraFX, ParticleSystem, SpriteAnimator) through to the background replacement (ParallaxBackground) and finally to event wiring across the existing game loop. This order ensures each system is independently testable before integration.

**Major components:**
1. **AudioManager** — Loads, decodes, and plays all game sounds and music via Howler.js. Exposes `play(event)` and `playMusic(track)`. Zero dependencies on other new systems.
2. **CameraFX** — Manages screen shake offset and flash overlay. Wraps world drawing with `begin(ctx)` / `end(ctx)` using `ctx.save/translate/restore`. HUD is drawn after `restore()` so it never shakes.
3. **ParticleSystem** — Pre-allocated object pool of 200 particles. Exposes `spawn(x, y, color, count)`, `update(dt)`, `draw(ctx)`. Drawn between ground and HUD layers; a second draw pass handles above-entity effects.
4. **SpriteAnimator** — Per-entity animation state object tracking elapsed time and frame index. Formalizes the existing `animFrame` global into a per-entity, framerate-independent pattern.
5. **ParallaxBackground** — Replaces `drawBackground()` with 2-3 layers scrolling at different speed multipliers. Far layer reuses existing `bg.webp`; mid and near layers can be procedural (sky gradient, silhouette rectangles) to keep asset count low.

**Updated render pipeline order:**
`CameraFX.begin()` → parallax → ground → particles (ground pass) → arancini → horse → obstacles → boss → particles (air pass) → `CameraFX.end()` → HUD → floating texts → game-over overlay

See `.planning/research/ARCHITECTURE.md` for full data flow diagrams and integration point table.

### Critical Pitfalls

1. **Audio autoplay blocked on mobile** — Create `AudioContext` only inside a user gesture handler, never at script load. Check `ctx.state === 'suspended'` and call `ctx.resume()` on every interaction until running. Howler.js handles this automatically — use it. Verify on actual iOS Safari, not DevTools mobile emulation.

2. **Particle GC stutter** — Never `push()` new particle objects at runtime. Pre-allocate a fixed-size pool at init, reuse objects via `live` flag. Avoid `Array.splice()` for removal. Keep particle counts at 8-16 per impact — visually sufficient, never 100+. Avoid `shadowBlur` on particles entirely (highest-cost Canvas operation).

3. **Sprite animation framerate-dependent** — Replace any `frameCount % N` animation logic with a delta-time accumulator: `animTimer += dt * 16.667; if (animTimer >= frameDuration) { frame++; animTimer = 0; }`. Must be corrected before adding particle lifetimes, which have the same vulnerability.

4. **Sub-pixel rendering blurring pixel art** — Always pass `Math.floor(x)` and `Math.floor(y)` to every `drawImage()` call. Set `ctx.imageSmoothingEnabled = false` globally during canvas setup. Verify by zooming to 200% in browser — all sprite edges must be sharp.

5. **HUD shaking during screen shake** — Draw score, rank, and floating texts after `ctx.restore()`, not inside the shake transform. This is already the correct place in the existing render order — do not move HUD draws inside the camera transform wrapper.

See `.planning/research/PITFALLS.md` for the full "Looks Done But Isn't" verification checklist.

---

## Implications for Roadmap

Based on the dependency graph in FEATURES.md and the build order in ARCHITECTURE.md, the natural phase structure follows system independence: build systems with zero dependencies first, then integrate. Each phase delivers something immediately playable and testable.

### Phase 1: Foundation Systems (Zero-asset wins)

**Rationale:** Screen shake and landing dust particles require zero new assets and touch zero existing logic. They validate the subsystem architecture pattern (IIFE namespaces, hook points in existing code) before audio or sprites add complexity. Screen shake is the highest impact-to-effort feature in the entire feature list. Building CameraFX and ParticleSystem first also establishes the delta-time particle pattern before it matters at scale.

**Delivers:** Screen shake on collision/death/boss hit, landing dust particles, arancino collect burst, screen fade transitions. Game feels dramatically more alive with no new assets.

**Features addressed:** Screen shake (P1), landing dust particles (P1), arancino collect burst (P1), screen fade transitions (P1).

**Pitfalls to avoid:** HUD-inside-shake anti-pattern; particle GC stutter (pool from day one); framerate-dependent particle lifetimes.

### Phase 2: Audio Integration

**Rationale:** Audio requires asset sourcing (CC0 SFX from OpenGameArt/Freesound) in parallel with code. The audio mute toggle is coupled to audio — they must ship together. Howler.js must be wired to user gesture init before any other audio code is written, or all subsequent audio work will be broken on mobile. This is a standalone system with no dependencies on particles or sprites.

**Delivers:** Jump, die, collect, boss hit, boss death, game over SFX; looping background music; audio mute toggle with localStorage persistence.

**Features addressed:** Sound effects (P1), background music (P1), audio mute toggle (P1).

**Stack used:** Howler.js 2.2.4 via CDN.

**Pitfalls to avoid:** Audio autoplay blocked on mobile (Howler.js deferred init); mobile volume programmatic control (use muted toggle, not volume slider); multiple AudioContext instances (singleton); OGG/MP3 format fallback.

### Phase 3: Death Animation and Game State

**Rationale:** Death animation requires adding a `'dying'` game state between `'playing'` and `'gameover'` — the only structural change to existing game logic in this milestone. It is isolated to one state transition and does not affect physics, scoring, or other states. It is placed after audio so the death sound can be synced to the animation timing. It is placed before parallax because parallax is a standalone visual concern with no state dependencies.

**Delivers:** Horse stumble pose held for 0.4-0.6s before game-over screen; death sound synchronized to animation; smooth flow from collision to game-over.

**Features addressed:** Death animation (P1).

**Pitfalls to avoid:** Game state regression — test all state transitions (menu, playing, dying, gameover, leaderboard) after adding the new state.

### Phase 4: Parallax Background

**Rationale:** Parallax replaces `drawBackground()` — a contained swap with no physics or state dependencies. It is placed after core game-feel work because it requires the most asset decisions (whether to use procedural layers vs. new image assets). Using procedural far/mid layers (canvas gradients, silhouette rectangles) avoids adding new image file dependencies and keeps mobile draw cost low.

**Delivers:** 2-3 layered parallax scroll (far sky/city, mid buildings or procedural, near ground at existing speed). Visually transforms from flat screenshot to living world.

**Features addressed:** Parallax scrolling background (P2).

**Pitfalls to avoid:** Parallax seam at loop-around (test after 60+ seconds); per-frame full-canvas `drawImage` cost on mobile (use procedural solid-color layers for far/mid, not additional image files); canvas clipping region on bg.webp wrapping.

### Phase 5: Boss Polish and High-Speed Feedback

**Rationale:** These features build on Phase 1 systems (CameraFX, ParticleSystem) and Phase 2 audio (boss music change). They are grouped because all relate to mid-to-late-game intensity feedback and share implementation patterns. The combo multiplier flash leverages the existing multiplier system already in the game.

**Delivers:** Red overlay + continuous rumble during boss presence; boss music crossfade; lava impact fire particles; speed streak lines at high velocity; combo multiplier gold pulse.

**Features addressed:** Boss fight screen effect (P2), lava impact particles (P2), run speed visual feedback (P2), arancino combo multiplier flash (P2).

**Pitfalls to avoid:** Audio stacking (boss SFX overlapping game-over SFX); shadowBlur on fire particles (use layered fillRect instead); too many simultaneous effects causing frame drops.

### Phase Ordering Rationale

- **Zero-asset features first:** Phases 1 and 3 require no external files. Starting here validates the subsystem architecture with immediate playable results before asset sourcing becomes a dependency.
- **Audio is isolated:** Howler.js is the only external dependency. It can be added and verified independently of visual work. Asset sourcing (CC0 SFX) can happen in parallel with Phase 1 implementation.
- **State change isolated:** The `'dying'` game state addition is the only structural change to existing logic and is deliberately placed as its own phase to contain regression risk.
- **Parallax last among P1-P2 visual work:** Highest asset decision complexity; placing it after core game-feel features means the game is already significantly improved before tackling the parallax art questions.
- **Boss phase groups P2 intensity features:** All boss-related effects use systems built in Phases 1-2; grouping them prevents context-switching between subsystems.

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase` — well-documented solutions confirmed):
- **Phase 1 (CameraFX + Particles):** Canonical canvas patterns. Code samples in ARCHITECTURE.md are directly implementable.
- **Phase 2 (Audio):** Howler.js documentation is comprehensive. Autoplay policy is fully addressed by Howler's deferred init.
- **Phase 4 (Parallax):** Standard endless runner pattern with implementation in STACK.md.

Phases that may benefit from brief targeted research:
- **Phase 3 (Death Animation):** Game state machine modification. The `'dying'` state transition is simple, but verifying it does not break leaderboard submission timing (which fires on `'gameover'`) may warrant a quick code inspection before implementation.
- **Phase 5 (Audio crossfade):** Boss music crossfade using Howler.js fade API. The crossfade pattern is documented but specific Howler fade behavior (fade out one track while fading in another) should be confirmed against Howler v2.2.4 API before implementation.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Howler.js v2.2.4 verified on npm/GitHub (Sep 2024 release, actively maintained). All other tools are native canvas APIs verified via MDN. No speculation. |
| Features | MEDIUM-HIGH | Feature priorities cross-verified against competitor games and game-feel literature. P1 features are well-established genre expectations. P2/P3 priorities involve judgment calls. |
| Architecture | HIGH | IIFE namespace pattern, object pool, ctx.save/translate shake, and frame-timer animation are all well-documented canvas game patterns confirmed by multiple official sources. Architecture was also informed by direct code inspection of `index.html`. |
| Pitfalls | HIGH | Critical pitfalls (autoplay policy, GC stutter, sub-pixel blur) sourced from official MDN and Chrome Developers documentation. Project-specific pitfalls from direct code inspection. |

**Overall confidence: HIGH**

### Gaps to Address

- **Audio asset sourcing:** CC0 SFX and music tracks must be found/downloaded before Phase 2 implementation. License verification per asset is required (CC0 vs CC-BY attribution requirement). This is a curation task, not a technical risk.
- **Mid/near parallax layer art decision:** Phase 4 requires a decision on whether mid/near parallax layers will be new pixel art assets or procedural canvas drawing. Procedural is recommended (lower risk, lower effort, consistent aesthetic), but this should be confirmed before Phase 4 planning.
- **Howler.js crossfade API verification:** The boss music crossfade (Phase 5) should be tested with Howler's `fade()` method in isolation before being integrated into the boss spawn event. Quick test with two loaded tracks.
- **Mobile testing device:** Several critical pitfalls (iOS audio autoplay, screen shake viewport clipping, mobile volume control) can only be confirmed on a physical device or BrowserStack. Plan one mobile verification pass after Phase 2.

---

## Sources

### Primary (HIGH confidence)
- [Howler.js v2.2.4 — GitHub releases](https://github.com/goldfire/howler.js/releases) — version currency, maintenance status
- [Web Audio API Best Practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — audio context lifecycle, mobile behavior
- [Improving HTML5 Canvas Performance — web.dev](https://web.dev/articles/canvas-performance) — shadowBlur cost, fillRect optimization
- [Web Audio Autoplay Policy — Chrome Developers Blog](https://developer.chrome.com/blog/web-audio-autoplay) — autoplay restrictions, resume() pattern
- [Crisp pixel art look — MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look) — imageSmoothingEnabled, drawImage sub-pixel behavior
- Code inspection of `C:/Developer/Emmedeveloper/Cavallo/index.html` — existing game loop structure, integration points, existing state machine

### Secondary (MEDIUM confidence)
- [Howler.js documentation — howlerjs.com](https://howlerjs.com/) — API reference
- [Spicy Yoghurt: Sprite Animations](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations) — drawImage spritesheet pattern
- [Screen shake implementation — jonny.morrill.me](https://jonny.morrill.me/en/blog/gamedev-how-to-implement-a-camera-shake-effect/) — ctx.translate shake pattern
- [Game Feel / Juice references — GameDev Academy, Blood Moon Interactive, Brad Woods Garden](https://gamedevacademy.org/game-feel-tutorial/) — feature prioritization for game feel
- [What is an Endless Runner — EJAW](https://ejaw.net/what-is-an-endless-runner-game/) — genre player expectations
- [15 Endless Runners Ranked — DualShockers](https://www.dualshockers.com/best-endless-runner-games/) — competitor feature signals

### Tertiary (LOW confidence — used for competitive benchmarking only)
- [How to Create an Endless Runner — Cinetoon Studios](https://cinetoonstudios.netlify.app/pages/articles/how-to-create-endless-runner-unity.html) — Unity-based; concepts transferable
- [HTML5 Canvas Performance Optimization Gist — jaredwilli](https://gist.github.com/jaredwilli/5469626) — community resource, corroborated by web.dev

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
