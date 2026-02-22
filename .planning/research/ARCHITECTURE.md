# Architecture Research

**Domain:** Vanilla JS HTML5 Canvas endless runner — polish system (audio, sprites, particles, visual FX)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Current State (Baseline)

The game is a single `index.html` of ~2158 lines. Everything is global: state variables, draw functions, update logic, the game loop, and event handlers are mixed together with no module boundaries. The game already works well — this research is about how to add audio, sprite animation, particle effects, and visual polish without breaking the existing code and without adopting an external engine.

Key observations from reading the code:
- **Game loop:** `requestAnimationFrame` → `gameLoop(timestamp)` → `update(dt)` → `render()`
- **Render pipeline:** `render()` calls draw functions in a fixed order: background, ground, arancini, horse, obstacles, boss, HUD, floating texts, game-over overlay
- **Drawing:** All sprites are drawn procedurally pixel-by-pixel via `px()` helper (no spritesheet images yet)
- **State machine:** `gameState` string (`'menu'`, `'playing'`, `'gameover'`, `'leaderboard'`, `'recipes'`) drives what gets updated/rendered
- **Floating texts:** Already exist as a lightweight particle-like system (array of `{x, y, life, color}` objects updated each frame)
- **No audio system exists yet**
- **No particle system beyond floating texts exists yet**
- **Parallax:** Background uses a single `bg.webp` with no layering

---

## Standard Architecture for Canvas Game Polish Systems

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME LOOP (existing)                      │
│              requestAnimationFrame → update(dt) → render()       │
├───────────────────┬─────────────────┬───────────────────────────┤
│   AUDIO MANAGER   │  PARTICLE SYSTEM │   ANIMATION SYSTEM        │
│  (new subsystem)  │  (new subsystem) │   (new subsystem)         │
│                   │                  │                           │
│  Web Audio API    │  Pool of Particle│  SpriteAnimator per       │
│  + Howler.js      │  objects updated │  entity type; frame       │
│  sound sprites    │  each frame      │  index driven by timer    │
├───────────────────┴──────────────────┴───────────────────────────┤
│                   CAMERA / FX LAYER (new)                        │
│         Screen shake offset applied to ctx.translate()           │
│         Flash overlay drawn after all world objects              │
├─────────────────────────────────────────────────────────────────┤
│                   BACKGROUND SYSTEM (upgrade)                    │
│         Multiple layers at different scroll speeds (parallax)    │
├─────────────────────────────────────────────────────────────────┤
│                   STATE / GAME DATA (existing, unchanged)        │
│      horse, obstacles, arancini, boss, score, gameState, etc.    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **AudioManager** | Load, decode, play all game sounds and music. Owns the Web Audio API context. | Game loop calls `AudioManager.play(event)` on game events; nothing calls back into game |
| **ParticleSystem** | Maintain a pool of particle objects. Spawn, update, and draw dust puffs, impact sparks, arancino pickup bursts, fire/smoke for boss | `update(dt)` called from main `update()`. `draw()` called from main `render()` at the correct z-layer |
| **SpriteAnimator** | Track which animation frame an entity is on. Advance frame based on elapsed time. Return frame index or draw the frame | Called from entity draw functions (horse, mafioso, boss). Does not own draw calls — it just provides the frame number |
| **ParallaxBackground** | Multiple background layers (far city, mid buildings, near ground details) scrolled at different speeds | `update(dt, speed)` called from main `update()`. `draw()` replaces the current `drawBackground()` call |
| **CameraFX** | Manages screen-shake (offset x/y), flash overlay (color + alpha), and canvas translate wrapping | Applied at the start of `render()` via `ctx.save()` / `ctx.translate(shakeX, shakeY)` / `ctx.restore()`. Triggered by collision, boss hit, arancino collect |
| **Game Loop** | Main coordinator. Calls all subsystem update and render in order. Already exists, just extended. | Orchestrates everything — the only place that calls into all other systems |

---

## Recommended Project Structure

The game stays in a single HTML file due to the constraint of no build tools. The new systems are added as `<script>` sections or as JavaScript objects declared before the main game code. Keeping single-file is correct for this project.

```
index.html
  <style>  ... (existing, unchanged) </style>

  <script>
  // ==================== AUDIO MANAGER ====================
  // Self-contained. Exposes AudioManager.play(), .playMusic(), .stopMusic()
  </script>

  <script>
  // ==================== PARTICLE SYSTEM ====================
  // Self-contained. Exposes Particles.spawn(), .update(dt), .draw(ctx)
  </script>

  <script>
  // ==================== SPRITE ANIMATOR ====================
  // Self-contained. Exposes SpriteAnimator class or animState objects
  </script>

  <script>
  // ==================== PARALLAX BACKGROUND ====================
  // Self-contained. Replaces drawBackground(). Exposes ParallaxBg.update(dt), .draw(ctx)
  </script>

  <script>
  // ==================== CAMERA FX ====================
  // Self-contained. Exposes CameraFX.shake(intensity), .flash(color), .apply(ctx), .restore(ctx)
  </script>

  <script>
  // ==================== MAIN GAME CODE ====================
  // Existing code. Modified only where subsystems hook in.
  // Minimal changes: hook audio calls on game events, call particle spawns, use CameraFX
  </script>
```

### Structure Rationale

- **Multiple `<script>` blocks instead of ES modules:** No build step, no server requirement, works as a file opened directly in a browser. Each block is a self-contained namespace (object literal or IIFE).
- **Subsystems before main game code:** Subsystems are declared first so the main game code can reference them immediately.
- **Zero modification to existing game logic:** Physics, collision, score, boss, leaderboard — untouched. New systems only add calls at well-defined hook points.

---

## Architectural Patterns

### Pattern 1: Object Namespace (Module Substitute)

**What:** Each subsystem is a plain object with `init()`, `update(dt)`, and `draw(ctx)` methods. No classes, no ES modules.

**When to use:** Single-file vanilla JS without build tools. Prevents global namespace pollution while maintaining simplicity.

**Trade-offs:** No encapsulation enforcement (methods are still callable from anywhere), but sufficient for a project of this size.

**Example:**
```javascript
const AudioManager = (function() {
  let ctx = null;
  const sounds = {};

  return {
    init() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    async load(name, url) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      sounds[name] = await ctx.decodeAudioData(buffer);
    },
    play(name, volume = 1.0) {
      if (!ctx || !sounds[name]) return;
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      source.buffer = sounds[name];
      source.connect(gainNode).connect(ctx.destination);
      source.start(0);
    }
  };
})();
```

### Pattern 2: Object Pool for Particles

**What:** A fixed-size array of particle objects is pre-allocated. Particles are "activated" by setting a live flag and "deactivated" by clearing it. The update loop only processes live particles. No allocation during gameplay.

**When to use:** Any system that spawns many short-lived objects at game events (collision, pickup, landing). Prevents garbage collection spikes.

**Trade-offs:** Slightly more complex initial setup; prevents all per-frame allocation overhead.

**Example:**
```javascript
const Particles = (function() {
  const POOL_SIZE = 200;
  const pool = Array.from({ length: POOL_SIZE }, () => ({ live: false }));

  function spawn(x, y, color, count = 8) {
    let spawned = 0;
    for (let i = 0; i < POOL_SIZE && spawned < count; i++) {
      if (!pool[i].live) {
        const p = pool[i];
        p.live = true;
        p.x = x; p.y = y;
        p.vx = (Math.random() - 0.5) * 4;
        p.vy = -Math.random() * 3 - 1;
        p.life = 1.0;
        p.decay = 0.04 + Math.random() * 0.03;
        p.color = color;
        p.size = 2 + Math.random() * 3;
        spawned++;
      }
    }
  }

  function update(dt) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.live) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.15 * dt; // gravity
      p.life -= p.decay * dt;
      if (p.life <= 0) p.live = false;
    }
  }

  function draw(ctx) {
    for (let i = 0; i < POOL_SIZE; i++) {
      const p = pool[i];
      if (!p.live) continue;
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  return { spawn, update, draw };
})();
```

### Pattern 3: Screen Shake via ctx.translate()

**What:** At the start of `render()`, translate the canvas context by a random offset proportional to shake intensity. Restore after all world drawing. HUD is drawn after restore so it stays stable.

**When to use:** Collision, boss hit, boss defeat. Maximally impactful polish technique for a runner game.

**Trade-offs:** Must be careful to draw HUD (score, floating texts) after `ctx.restore()` so it does not shake.

**Example:**
```javascript
const CameraFX = (function() {
  let shakeIntensity = 0;
  let flashColor = null;
  let flashAlpha = 0;

  return {
    shake(intensity) { shakeIntensity = Math.max(shakeIntensity, intensity); },
    flash(color, alpha = 0.5) { flashColor = color; flashAlpha = alpha; },

    begin(ctx) {
      ctx.save();
      if (shakeIntensity > 0.5) {
        const dx = (Math.random() - 0.5) * shakeIntensity;
        const dy = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(Math.round(dx), Math.round(dy));
      }
    },

    end(ctx) {
      // Draw flash overlay before restoring
      if (flashAlpha > 0.01) {
        ctx.fillStyle = flashColor;
        ctx.globalAlpha = flashAlpha;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      }
      ctx.restore();
    },

    update(dt) {
      shakeIntensity *= Math.pow(0.85, dt);
      flashAlpha *= Math.pow(0.80, dt);
      if (shakeIntensity < 0.1) shakeIntensity = 0;
      if (flashAlpha < 0.01) flashAlpha = 0;
    }
  };
})();
```

### Pattern 4: Sprite Animation via Frame Timer

**What:** An animation state object tracks elapsed time and advances a frame index at a fixed rate. The frame index is passed to draw functions which already accept a `frame` parameter (existing code uses `animFrame` globally).

**When to use:** Multiple entity types each needing independent animation state (horse run cycle, horse jump, mafioso walk, boss idle/attack).

**Trade-offs:** Minimal complexity. The existing `animFrame` global already does this for the horse — the pattern just formalizes it per-entity.

**Example:**
```javascript
function createAnimState(fps, frameCount, loop = true) {
  return {
    frame: 0,
    timer: 0,
    frameDuration: 1000 / fps,
    frameCount,
    loop,
    update(dt) {
      // dt is in 60fps units; convert to ms
      this.timer += dt * 16.667;
      while (this.timer >= this.frameDuration) {
        this.timer -= this.frameDuration;
        this.frame++;
        if (this.frame >= this.frameCount) {
          this.frame = this.loop ? 0 : this.frameCount - 1;
        }
      }
    }
  };
}

// Usage per entity:
const horseRunAnim = createAnimState(8, 4);   // 8fps, 4 frames
const horseJumpAnim = createAnimState(12, 2); // 12fps, 2 frames
```

---

## Data Flow

### Game Event to Audio

```
Game Event (collision, jump, pickup, boss hit)
    ↓  (direct call at event site)
AudioManager.play('jump')  /  AudioManager.play('hit')
    ↓
Web Audio API: create BufferSource → connect to GainNode → connect to Destination → start()
    (no return, fire-and-forget)
```

### Game Event to Particle Spawn

```
Game Event (horse lands, arancino collected, obstacle collision)
    ↓  (direct call at event site in update())
Particles.spawn(x, y, color, count)
    ↓
Particle pool: activate N particles with randomized velocity / life
    ↓
Particles.update(dt)  called each frame in update()
    ↓
Particles.draw(ctx)   called each frame in render(), between ground and HUD layers
```

### Render Pipeline (updated order)

```
render()
  ├─ CameraFX.begin(ctx)           ← save + translate (shake)
  ├─ ParallaxBg.draw(ctx)          ← replaces drawBackground()
  ├─ drawGround()
  ├─ Particles.draw(ctx)           ← ground-level dust (under entities)
  ├─ drawAranciniSprites()
  ├─ drawHorseSprite()
  ├─ drawObstacles()
  ├─ Boss + lava rendering
  ├─ Particles.draw(ctx) [pass 2]  ← OR single pass with z-sort; simpler: two calls
  ├─ CameraFX.end(ctx)             ← draw flash, then ctx.restore()
  ├─ drawScore()                   ← HUD: never shakes
  ├─ drawFloatingTexts()           ← HUD: never shakes
  └─ drawGameOverScreen()          ← overlay: never shakes
```

### Music State Flow

```
gameState changes  →  AudioManager.onStateChange(newState)
  'menu'           →  playMusic('menuTheme', loop=true)
  'playing'        →  playMusic('gameTheme', loop=true)
  'gameover'       →  stopMusic(), play('gameOver')
  boss spawns      →  crossfadeTo('bossTheme')
  boss defeated    →  crossfadeTo('gameTheme')
```

---

## Build Order for Implementation

This is the order in which subsystems should be built, from fewest dependencies to most:

| Order | System | Depends On | Why This Order |
|-------|---------|-----------|----------------|
| 1 | **AudioManager** | Nothing | Zero dependencies, immediately testable. Unblocks all audio SFX and music in later phases |
| 2 | **CameraFX** | Nothing | Zero dependencies, pure math. Highest perceived polish return for effort |
| 3 | **ParticleSystem** | Nothing | Zero dependencies. Can be tested with placeholder spawn calls |
| 4 | **SpriteAnimator** | Nothing | Formalizes existing `animFrame` logic. Needed before sprite improvement |
| 5 | **ParallaxBackground** | None (replaces drawBackground) | Can be done independently once other systems exist |
| 6 | **Hook into game events** | All above | Connect spawn/play/shake calls to collision, jump, pickup, boss events in existing code |

---

## Anti-Patterns

### Anti-Pattern 1: Global Audio Context Created Eagerly

**What people do:** Create `new AudioContext()` at script load time.
**Why it's wrong:** Chrome and Safari block AudioContext until a user gesture. Game launches silently or throws a warning, and music never starts.
**Do this instead:** Create the AudioContext in a `resume()` call inside the first user interaction handler (first click, first keypress). Howler.js handles this automatically.

### Anti-Pattern 2: Spawning Particle Objects with `new` Each Frame

**What people do:** `particles.push({ x, y, vx, vy, life })` inside the collision or pickup handler every frame.
**Why it's wrong:** Continuous allocation causes GC pauses. On mobile, these pauses are visible as stutter — exactly where the game needs to feel smooth.
**Do this instead:** Pre-allocate a pool of objects at init. Activate/deactivate via a `live` flag. Zero allocations during gameplay.

### Anti-Pattern 3: HUD Drawn Inside the Camera Shake Transform

**What people do:** Apply `ctx.translate(shakeX, shakeY)` then draw everything including score, rank, floating texts.
**Why it's wrong:** Score display shakes — it looks wrong and is hard to read during collision.
**Do this instead:** `ctx.save()` before shake, `ctx.restore()` after world objects, then draw HUD on the clean transform.

### Anti-Pattern 4: One Audio File Per Sound Effect

**What people do:** `new Audio('jump.mp3').play()` at each event.
**Why it's wrong:** Multiple overlapping sounds create multiple HTMLAudioElement instances. Mobile browsers limit concurrent audio elements. Creates allocation pressure and potential silence on mobile.
**Do this instead:** Use the Web Audio API's `BufferSource` pattern — each call creates a source node connected to a pre-decoded buffer. Cheap, concurrent, no element limit.

### Anti-Pattern 5: Parallax via Multiple Drawn Images Naively Scaled

**What people do:** Load 3 separate PNG files and draw all three every frame at full canvas size.
**Why it's wrong:** Three large `drawImage` calls on mobile is expensive, and managing separate image load callbacks adds complexity.
**Do this instead:** Draw far and mid background layers procedurally (sky gradient, silhouette rectangles) to match the pixel-art aesthetic. Only the one existing `bg.webp` needs to be an image asset.

### Anti-Pattern 6: Rewriting Existing Working Code to "Clean It Up" First

**What people do:** Refactor the entire monolith into ES modules before adding polish features.
**Why it's wrong:** Breaks existing game, introduces regressions, delays visible progress. The game already works.
**Do this instead:** Add new subsystems as isolated blocks before the existing main script. Hook in at minimal touch points. The monolith continues to function; new systems layer on top.

---

## Integration Points

### Where New Systems Hook Into Existing Code

| Integration Point | Location in Existing Code | What Changes |
|-------------------|--------------------------|--------------|
| Audio context init | First user gesture (existing click/space handler) | Add `AudioManager.init()` call |
| Jump SFX | `horse.vy = jumpForce` site in `update()` | Add `AudioManager.play('jump')` |
| Collision SFX + shake | `gameState = 'gameover'` site | Add `AudioManager.play('hit')`, `CameraFX.shake(12)`, `Particles.spawn(horse.x, horse.y, '#ff4400', 20)` |
| Arancino pickup SFX + particles | `aranciniCollected++` site | Add `AudioManager.play('pickup')`, `Particles.spawn(a.x, a.y, '#ffaa00', 10)` |
| Boss appear | `boss = { ... }` site | Add `AudioManager.playMusic('bossTheme')`, `CameraFX.shake(8)` |
| Boss hit | Boss HP reduction site | Add `AudioManager.play('bossHit')`, `CameraFX.shake(6)`, `CameraFX.flash('#ff4400')` |
| Landing dust | `horse.onGround = true` site | Add `Particles.spawn(horse.x, horse.y, '#c8a87a', 6)` |
| Background replacement | `drawBackground()` in `render()` | Replace with `ParallaxBg.draw(ctx)` |
| Render pipeline | `render()` function | Wrap world section with `CameraFX.begin/end`, add `Particles.draw()` |
| Update pipeline | `update(dt)` function | Add `Particles.update(dt)`, `CameraFX.update(dt)` calls |

### External Services (Unchanged)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Apps Script (leaderboard) | Existing fetch pattern, unchanged | No changes needed |
| Audio files (OpenGameArt, Freesound) | Fetch + Web Audio API decode | Load at game init, before first frame |

---

## Scaling Considerations

This is a single-session browser game. The relevant "scaling" concerns are frame-rate stability across devices, not user concurrency.

| Concern | Low-end mobile | Mid desktop | High-end desktop |
|---------|---------------|-------------|-----------------|
| Particle count | Pool cap at 80 particles | Pool cap at 200 particles | Pool cap at 300+ |
| Audio channels | Limit concurrent sounds to 4 | 8+ concurrent fine | Unlimited |
| Parallax layers | 2 layers (far + near) | 3 layers | 3+ layers |
| Particle draw cost | Use `fillRect` only (no canvas paths) | fillRect fine | Can add glow via shadow |

### Optimization Priorities

1. **First concern:** Particle GC pressure — solved by pool pattern above
2. **Second concern:** Audio context unlock on mobile — solved by deferred init on first gesture
3. **Third concern:** Parallax layer cost — solved by procedural/solid-color far layers, not extra image assets

---

## Sources

- MDN Web Docs — [Audio for Web Games](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) (MEDIUM confidence — verified via MDN official docs)
- Howler.js documentation — [howlerjs.com](https://howlerjs.com/) (HIGH confidence — official source)
- MDN — Audio Sprites pattern: audio for web games guide (HIGH confidence — official source)
- Screen shake implementation pattern — [jonny.morrill.me](https://jonny.morrill.me/en/blog/gamedev-how-to-implement-a-camera-shake-effect/) (MEDIUM confidence — single verified source)
- Object pool pattern — well-established game programming pattern, corroborated by multiple game dev references (HIGH confidence)
- Module pattern in HTML5 games — [blog.sklambert.com](https://blog.sklambert.com/html5-game-tutorial-module-pattern/) (MEDIUM confidence)
- Game state management — [idiallo.com](https://idiallo.com/blog/javascript-game-state-stack-engine) (MEDIUM confidence)
- Game loop with requestAnimationFrame — [spicyyoghurt.com](https://spicyyoghurt.com/tutorials/html5-javascript-game-development/create-a-proper-game-loop-with-requestanimationframe) (MEDIUM confidence)
- Modular monolith for indie games — [wayline.io](https://www.wayline.io/blog/modular-monolith-indie-game-dev) (MEDIUM confidence)

---

*Architecture research for: U Cavaddu Runner — polish systems (audio, particles, sprites, visual FX)*
*Researched: 2026-02-22*
