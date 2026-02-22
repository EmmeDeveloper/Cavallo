# Feature Research

**Domain:** HTML5 pixel art endless runner — visual/audio polish milestone
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH (cross-verified across multiple sources; some HTML5-specific claims from single sources)

---

## Context: What Already Exists

Before categorizing polish features, these are already implemented and NOT in scope:

- Core gameplay loop (jump, dodge, collect)
- 2-frame sprite animations (run/jump state switching)
- Floating text popups for score events
- Boss flash timer (white flash when boss is hit)
- Record flash timer
- Procedurally drawn sprites via Canvas 2D (pixel-by-pixel)
- HUD with score, high score, rank
- Menu with 4 buttons
- Background static image (bg.webp)
- Online leaderboard
- Touch + desktop input

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that signal "this is a finished game." Missing any of these and players describe the game as "rough," "unfinished," or "a prototype."

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Sound effects for key actions | Every published runner has SFX; silence feels broken | MEDIUM | Jump, collision/death, arancino collect, boss hit, boss death, game over. Minimum ~6 sounds. Use Web Audio API or HTMLAudioElement with free assets from OpenGameArt/Freesound |
| Background music loop | Players expect ambient music; complete silence makes the game feel like a demo | MEDIUM | One looping track covering gameplay; optionally a different track for boss fight. CC0 chiptune/Mediterranean themed from OpenGameArt |
| Death / game-over animation | Players need visual closure when they die; abrupt cut-to-screen feels jarring | MEDIUM | Horse stumble + fall frames, or a "dead" pose held for ~0.5s before game over screen. Currently the game cuts instantly |
| Parallax scrolling background | Standard in every quality 2D runner; flat bg reads as "unfinished" to players | MEDIUM | Minimum 2-3 layers at different scroll speeds (far mountains, mid buildings, near ground details). The existing bg.webp can become the far layer; new mid/near layers needed |
| Landing dust particles | Dust on landing is the single cheapest "game feel" signal in a runner; its absence is noticed | LOW | 3-5 pixel dust particles spawned on horse.y touchdown, fanning out sideways, 20-30 frame lifetime |
| Screen shake on collision/death | Standard runner feedback; its absence makes hits feel weightless | LOW | Translate canvas draw origin by ±3-5px for 8-12 frames on collision, boss hit, death. Pure canvas offset — no DOM needed |
| Arancino collect visual burst | Collecting items should feel rewarding; currently only a floating text appears | LOW | 4-8 pixel particles in arancino orange/gold, burst outward from collection point, 15-20 frame lifetime |
| Responsive HUD animations | Score counter incrementing smoothly / flashing on new high score; rank-up celebration | LOW | Scale punch on score increase (lerp scale 1.0 → 1.3 → 1.0 over ~10 frames). Rank-up already has text popup but needs more visual weight |
| Smooth screen transitions | Cut-to-black between menu → game → game-over feels like a bug to modern players | LOW | 15-20 frame fade-out / fade-in using canvas fillRect at decreasing/increasing alpha |
| Audio mute toggle | Players on mobile in public, or streamers, need a mute option; its absence generates complaints | LOW | Single icon button on HUD toggling a global `audioEnabled` flag; persist to localStorage |

---

### Differentiators (Competitive Advantage)

Features that set this game apart. Not expected by default, but create memorable moments and drive word-of-mouth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Thematic Catania audio palette | A chiptune / lo-fi Mediterranean sound (mandolin, tambourine rhythms, tarantella-inspired) makes the game instantly distinct from generic pixel runners | HIGH | Requires finding/commissioning the right free tracks; could use CC0 Mediterranean folk loops from Freesound. Most effort is curation not code |
| Boss fight screen effect | A dramatic visual shift when U Liotru appears (red tint overlay, rumble shake, dramatic music sting) reinforces the boss as a special threat | MEDIUM | Screen shake loop during boss presence, canvas color overlay at low alpha (rgba(180,20,0,0.15)), different music track or music filter |
| Lava projectile impact particles | Boss lava balls hitting the ground should explode in fire pixels — this is a differentiating moment in every boss-focused runner | MEDIUM | Spawn 8-12 fire/ember particles (orange/red/yellow) on lava landing, fan outward and upward with gravity, 25-40 frame lifetime |
| Run speed visual feedback | As speed increases, add visual cues: more aggressive camera wobble, wind-streak lines near the horse, faster background parallax | MEDIUM | Draw 2-4 horizontal speed lines (1px tall white-alpha rectangles) at random y positions, length proportional to current speed. Cheap and very effective |
| Squash and stretch on jump/land | Disney animation principle: horse squashes slightly on landing, stretches on jump peak. Makes the character feel alive vs mechanical | HIGH | Requires canvas scale transform around horse center (scaleX 1.2/scaleY 0.8 on land, reverse on jump apex). Works best with ~4-frame easing |
| Arancino combo multiplier flash | Visual "COMBO x2" burst when collecting multiple arancini in sequence — reinforces the streak system already in the game | LOW | Already has multiplier logic; add a large flash text + brief canvas-wide gold overlay pulse (1-3 frames at low alpha) |
| Background parallax with Catania landmarks | Etna in the far background, Duomo silhouette in mid-ground — these make the Catania theming visceral rather than text-only | HIGH | Requires new pixel art assets; this is the hardest item on the list. High reward for target audience (Catanese players) |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full sprite sheet migration (PNG files) | "Real games use sprite sheets" | The current programmatic drawing approach is already working and allows palette changes/flash effects trivially. Migrating to PNG sprites is a rewrite of all drawing code with no gameplay benefit | Keep programmatic drawing; add canvas transform (scale/rotate) for squash/stretch effects instead |
| Procedural music generation via Web Audio API | No need for audio files | Web Audio synthesis for melodic music is extremely complex; results sound robotic for anything beyond beeps. Development time is disproportionate | Use CC0 pre-made audio files (MP3/OGG); load with HTMLAudioElement or Howler.js |
| Per-frame hitbox visualization / debug overlay | Collision feels off sometimes | This is a dev tool, not a player feature. Shipping it or spending polish time on it pulls from visible improvements | Use it during development only; remove or hide behind a DEV flag |
| Loading screen with progress bar | "Games should have loading screens" | This is a single-file HTML game under 50KB of JS. Load time is <100ms. A loading screen adds complexity for zero user benefit | Keep instant load; only add if asset loading (audio files) causes a noticeable delay |
| Animated cutscenes between rank-ups | Rank system needs cinematic moments | Each rank-up cutscene is significant art/animation work. The rank system works fine with large text popups and sound | Enhance rank-up popup with larger text, particle burst, and a sound sting instead |
| WebGL renderer migration | "Canvas 2D is slow" | The game runs at 60fps with simple 2D drawing. WebGL adds shader complexity, debugging burden, and browser compat risk for no visible benefit at this art scale | Stay on Canvas 2D; optimize draw order if needed |
| Haptic feedback (vibration API) | Mobile polish | `navigator.vibrate()` is blocked on iOS entirely, inconsistent on Android, and can feel intrusive. Development time for negligible cross-platform benefit | Screen shake is the visual equivalent and works everywhere |

---

## Feature Dependencies

```
[Parallax Background]
    └──requires──> [Multi-layer background assets (new pixel art)]
                       └──requires──> [Layer scroll speed system in game loop]

[Screen Shake]
    └──enhances──> [Collision feedback]
    └──enhances──> [Boss hit feedback]
    └──enhances──> [Death animation]
    └──enhances──> [Lava impact particles]

[Death Animation]
    └──requires──> [Dedicated horse "dead" pose drawing]
    └──requires──> [Game state: 'dying' before 'gameover']

[Audio SFX]
    └──requires──> [Audio mute toggle] (ship together; SFX without mute = complaints)
    └──enhances──> [Death animation] (death sound synced to animation)
    └──enhances──> [Arancino collect burst]
    └──enhances──> [Boss fight screen effect]

[Background Music]
    └──requires──> [Audio mute toggle]
    └──enhances──> [Boss fight screen effect] (boss music variant)

[Arancino collect burst]
    └──enhances──> [Arancino combo multiplier flash] (visual + text together)

[Squash and Stretch]
    └──requires──> [canvas save/restore around horse draw calls]
    └──conflicts──> [Full sprite sheet migration] (transform-based approach works with procedural drawing; breaks with pre-rendered PNG frames)
```

### Dependency Notes

- **Screen Shake requires nothing** — it's a canvas translate offset applied at the top of the draw loop. Implement first, cheapest win.
- **Audio SFX and Mute Toggle are coupled** — shipping sounds without a mute button is a player experience failure, especially on mobile. Always implement together.
- **Death Animation requires a new game state** — currently the game goes directly from 'playing' to 'gameover'. Adding a 'dying' state (0.4-0.6s) is required to show the animation. This is structural work, not just drawing.
- **Parallax requires new art assets** — the background image (bg.webp) is currently a flat photo-like render. True parallax needs 2-3 separately drawn layer strips. This is the highest art effort item.
- **Squash and stretch conflicts with sprite sheet migration** — the transform-based approach only works cleanly with the existing programmatic drawing. Do not start sprite sheet migration in the same phase.

---

## MVP Definition (Polish Milestone)

### Launch With — Store-Ready Threshold

The following features bring the game from "playable prototype" to "itch.io publishable":

- [ ] **Screen shake** — on death, collision, boss hit. Zero assets needed. Highest impact-to-effort ratio of any item.
- [ ] **Landing dust particles** — spawned on horse touchdown. 10-15 lines of code, no assets.
- [ ] **Sound effects (6 minimum)** — jump, die, collect arancino, boss hit, boss death, game over. Source from OpenGameArt CC0 chiptune packs.
- [ ] **Background music loop** — one looping track for gameplay, loop off on game over. Source CC0.
- [ ] **Audio mute toggle** — required alongside any audio. One button, localStorage persistence.
- [ ] **Arancino collect burst** — pixel particle burst on collection. Pairs with existing floating text.
- [ ] **Screen fade transitions** — menu → game and game → game over. 15-frame canvas fade. No assets.
- [ ] **Death animation** — horse stumble pose held for 0.4s before game over screen. Requires new 'dying' state.

### Add After Validation (v1.x — High Polish)

Features that elevate from "publishable" to "impressive":

- [ ] **Parallax scrolling background** — requires new mid/near layer art. Highest art effort, highest visual impact.
- [ ] **Boss fight screen effect** — red overlay + continuous rumble shake + music change during boss presence.
- [ ] **Lava projectile impact particles** — fire burst on boss lava landing.
- [ ] **Run speed visual feedback** — speed lines appearing at high speed values.
- [ ] **Arancino combo multiplier flash** — canvas-wide gold pulse on combo. Leverages existing multiplier system.

### Future Consideration (v2+)

- [ ] **Squash and stretch** — highest code complexity for animation feel. Defer until core polish is stable.
- [ ] **Catania landmark parallax layers** — requires significant pixel art work (Etna, Duomo silhouettes).
- [ ] **Thematic Catania audio** — requires music curation/commissioning beyond free SFX packs.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Screen shake | HIGH | LOW | P1 |
| Landing dust particles | HIGH | LOW | P1 |
| Arancino collect burst | HIGH | LOW | P1 |
| Screen fade transitions | MEDIUM | LOW | P1 |
| Sound effects (SFX) | HIGH | MEDIUM | P1 |
| Audio mute toggle | HIGH | LOW | P1 (coupled with SFX) |
| Background music loop | HIGH | MEDIUM | P1 |
| Death animation | HIGH | MEDIUM | P1 |
| Boss fight screen effect | HIGH | MEDIUM | P2 |
| Lava impact particles | MEDIUM | MEDIUM | P2 |
| Run speed visual feedback | MEDIUM | LOW | P2 |
| Arancino combo multiplier flash | MEDIUM | LOW | P2 |
| Parallax scrolling background | HIGH | HIGH | P2 |
| Squash and stretch | MEDIUM | HIGH | P3 |
| Catania landmark parallax layers | HIGH (for target audience) | HIGH | P3 |

**Priority key:**
- P1: Must have for store-quality publication
- P2: Should have — significantly elevates the experience
- P3: Nice to have — high effort, defer until P1+P2 complete

---

## Competitor Feature Analysis

Reference games analyzed: Canabalt, Alto's Adventure, Crossy Road, Jetpack Joyride (mobile), Terminal City (itch.io), Too Many Croquetas (itch.io).

| Feature | Canabalt | Alto's Adventure | Terminal City (itch.io indie) | Our Approach |
|---------|----------|------------------|-------------------------------|--------------|
| Screen shake | Yes — on crash, landing | Subtle — on landing | Yes | Implement for collision + death |
| Particles | Dust on landing, debris | Snow particles, trails | Minimal | Dust + collect burst minimum |
| Background music | Yes, iconic single track | Yes, procedurally varied | Optional/minimal | One looping CC0 track |
| SFX | Yes, all key actions | Yes, layered | Minimal | 6 minimum sounds |
| Parallax | Yes, 3+ layers | Yes, subtle depth | Single layer | 2-3 layers (bg.webp + 2 new) |
| Death animation | Character falls | Character tumbles | Instant cut | Stumble pose + 0.4s hold |
| Screen transitions | Fade | Fade | Instant | Canvas fade |
| Audio mute | No (intentional design) | Yes | N/A | Yes — mobile players need it |

**Key observation:** Even bare-bones itch.io pixel runners (Terminal City, Charge!) that score well in community ratings have at minimum screen shake + sound effects + a death animation. These three are the actual floor for "feels like a real game."

---

## Sources

- [How to make your HTML5 Games Awesome — PlayCanvas Blog](https://blog.playcanvas.com/how-to-make-your-html5-games-awesome/) — MEDIUM confidence (verified HTML5 context)
- [Game Feel Tutorial — GameDev Academy](https://gamedevacademy.org/game-feel-tutorial/) — MEDIUM confidence
- [Juice in Game Design — Blood Moon Interactive](https://www.bloodmooninteractive.com/articles/juice.html) — MEDIUM confidence
- [Game Juice / Juice Notes — Brad Woods Garden](https://garden.bradwoods.io/notes/design/juice) — MEDIUM confidence (multiple techniques listed)
- [What is an Endless Runner Game — EJAW](https://ejaw.net/what-is-an-endless-runner-game/) — MEDIUM confidence (genre-specific polish expectations)
- [How to Create an Endless Runner — Cinetoon Studios](https://cinetoonstudios.netlify.app/pages/articles/how-to-create-endless-runner-unity.html) — LOW confidence (Unity-based, concepts transferable)
- [15 Endless Runners Ranked — DualShockers](https://www.dualshockers.com/best-endless-runner-games/) — MEDIUM confidence (player expectation signals)
- [Squeezing more juice — GameAnalytics](https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design) — MEDIUM confidence
- Direct code analysis of `index.html` — HIGH confidence (what already exists vs what is missing)

---
*Feature research for: U Cavaddu Runner — Polish Milestone*
*Researched: 2026-02-22*
