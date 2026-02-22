# Pitfalls Research

**Domain:** HTML5 Canvas game polish — audio, sprites, particles, animations for an existing endless runner
**Researched:** 2026-02-22
**Confidence:** MEDIUM — Core pitfalls verified via MDN official docs and web.dev; game-feel and performance patterns corroborated by multiple sources. Single-file vanilla JS context adds specificity from code inspection.

---

## Critical Pitfalls

### Pitfall 1: Audio Blocked by Browser Autoplay Policy

**What goes wrong:**
You wire up background music and sound effects, then test in the browser — silence. All audio is blocked because no user gesture has occurred before `AudioContext` creation or `audio.play()` is called. On mobile (iOS Safari, Android Chrome) this is enforced even more strictly than on desktop.

**Why it happens:**
Developers create the `AudioContext` at script initialization time (e.g., as a module-level constant), before any click or tap event. Browsers have blocked autoplay with sound since Chrome 66 (2018) and the policy now covers desktop and all mobile browsers. The audio context is placed in `suspended` state and any `.play()` calls are silently rejected.

**How to avoid:**
- Create `AudioContext` inside the first user-initiated event handler (the "JUCA!" button or canvas click that starts the game).
- If the context must be created early, check and resume it: `if (ctx.state === 'suspended') ctx.resume()` on every user interaction until it is `running`.
- Wire the game's existing "Play" button click to prime all audio: call `.play()` then immediately `.pause()` on every audio element to unlock them on iOS.
- Never call audio from the game loop before the context is confirmed running.

**Warning signs:**
- Music plays fine in DevTools (where autoplay is permitted) but not in normal browser tab.
- `AudioContext.state` is `'suspended'` after page load.
- iOS Safari produces no sound at all.

**Phase to address:** Audio integration phase (first audio task). Unlock must be implemented before any sound is wired.

---

### Pitfall 2: Sprite Animation Tied to Frame Count, Not Delta Time

**What goes wrong:**
Animation frame index advances by `frameCount % N`, so sprites animate at 60fps on a 60Hz monitor but at half speed on a 30fps mobile device — or double-speed on a 120Hz display. Already present: the game uses `frameCount` for `shadowBlur` pulsing and likely for future sprite frame cycling.

**Why it happens:**
Frame-counter animation is the natural "obvious" solution when drawing in a game loop. The existing codebase already has delta-time for physics (`dt = elapsed / 16.667`) but this pattern is not yet extended to sprite animation timing.

**How to avoid:**
- Track `animationTimer` in accumulated milliseconds: `animationTimer += dt * 16.667`.
- Advance sprite frame index only when `animationTimer >= frameDuration` (e.g., 120ms per frame = ~8fps for pixel art).
- The existing `animFrame` variable is a good candidate — replace `frameCount`-based increment with timer-based increment.
- Particle lifetimes must also use `dt` not raw frame count.

**Warning signs:**
- Animation looks "choppy" on mobile devices.
- Particles die too quickly on high-refresh-rate displays.
- `animFrame` advances inside a `frameCount % X === 0` check.

**Phase to address:** Sprite animation phase. Must be corrected before adding particle systems, or every particle lifetime will also be framerate-dependent.

---

### Pitfall 3: Sub-Pixel Rendering Destroying Pixel Art Crispness

**What goes wrong:**
Sprites drawn at floating-point positions get anti-aliased by Canvas, producing blurry intermediate pixels that ruin the pixel art aesthetic. The `image-rendering: pixelated` CSS already on the canvas prevents CSS scaling blur, but Canvas 2D `drawImage` at fractional x/y coordinates still anti-aliases.

**Why it happens:**
Physics uses `dt`-scaled velocities that produce fractional positions. Drawing functions receive `horse.x`, `obstacle.x` etc. directly without flooring. The `px()` helper already uses `Math.floor()` for programmatic pixel drawing — but `drawImage()` calls for sprites or backgrounds do not.

**How to avoid:**
- Always pass `Math.floor(x)` and `Math.floor(y)` to every `drawImage()` call.
- Set `ctx.imageSmoothingEnabled = false` before any `drawImage()` for sprite sheets.
- Verify by zooming to 200% in browser — blurry = anti-aliased, sharp = correct.

**Warning signs:**
- Sprite edges look fuzzy despite `image-rendering: pixelated` on the canvas element.
- Background `bg.webp` shows diagonal staircase anti-aliasing artifacts.

**Phase to address:** Sprite/asset import phase. Set `imageSmoothingEnabled` globally once during canvas setup.

---

### Pitfall 4: Particle System Creating Garbage Collection Stutter

**What goes wrong:**
Particles are implemented as objects allocated each frame (`particles.push({ x, y, vx, vy, life, ... })`). At high particle counts (impact explosions, dust clouds), continuous `new Object` allocation and array splicing triggers JavaScript garbage collection pauses — visible as periodic frame drops exactly when effects fire.

**Why it happens:**
It is the natural implementation: create particle on event, push to array, splice when dead. Splicing an array mid-loop also shifts all subsequent elements, compounding the cost.

**How to avoid:**
- Use an object pool: pre-allocate a fixed array of N particle objects at startup, reuse them by resetting fields rather than allocating new objects.
- Mark dead particles with `alive = false` and filter with index tracking rather than `splice()`.
- Keep particle counts reasonable for a pixel art game: 8-16 particles per impact is visually sufficient; 100+ is never needed.
- Avoid `shadowBlur` on particles entirely — it is the single most expensive Canvas 2D operation per the web.dev canvas-performance article.

**Warning signs:**
- Frame rate drops specifically when many particles fire simultaneously.
- Chrome Performance profiler shows GC pauses correlating with particle events.
- `particles.length` grows unbounded in long sessions.

**Phase to address:** Particle system implementation phase. Design the pool before writing any particle logic.

---

### Pitfall 5: Mobile Volume Control Cannot Be Set Programmatically

**What goes wrong:**
A volume slider or mute button in the game sets `audioElement.volume = 0.3` — this works perfectly on desktop but has no effect on iOS Safari and some Android browsers, where volume is locked to the OS-level hardware control.

**Why it happens:**
Mobile browsers intentionally disable programmatic volume to prevent web pages from overriding the user's hardware volume setting. This is documented MDN behavior, not a bug.

**How to avoid:**
- Use a GainNode in the Web Audio API graph instead of `HTMLMediaElement.volume` for effects that need volume control.
- For simple mute/unmute (the minimum needed), toggling `audioElement.muted` works on all platforms.
- Do not promise a volume slider in the UI unless you are routing everything through Web Audio API GainNodes.
- Accept that mobile users control volume with hardware buttons — design around this.

**Warning signs:**
- `audioElement.volume = x` has no audible effect on iPhone.
- Volume setting "works" in desktop testing but user reports on mobile say audio is always full volume.

**Phase to address:** Audio integration phase. Decide early: Web Audio API gain control vs. simple mute toggle.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| All code in single `index.html` | Zero build tooling, immediate edit-refresh | Adding 500+ lines for audio/particles/sprites makes the file ~3000 lines; navigation becomes painful | Acceptable for this project — scope is fixed, not a growing product |
| Programmatic pixel drawing instead of spritesheets | No asset pipeline needed | Each drawn entity is dozens of `fillRect` calls; sprite improvements require code changes not image edits | Accept for horse/obstacles; replace with spritesheet for new animated sprites if added |
| `Audio` elements over Web Audio API | Simpler code | No precise timing, no gain nodes, iOS volume bug, no pooling | Accept for music playback; use Web Audio API for SFX that need precise timing |
| `shadowBlur` for glow effects | Easy visual polish | One of the most expensive Canvas operations; avoid in per-frame hot paths | Never use in game loop at 60fps; only in UI screens rendered rarely |
| `Array.splice()` for particle removal | Simple implementation | O(n) shift on every removal; GC pressure at scale | Only if particle count stays below 20 total simultaneously |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Audio file formats | Serving only MP3 for music | Provide OGG fallback; check `audio.canPlayType('audio/ogg')` — Safari on older iOS needs MP3, Firefox prefers OGG |
| `bg.webp` parallax | Drawing `bg.webp` twice per frame (normal + wrapped seamless scroll) without clipping | Use `ctx.drawImage` with 9-argument form to specify source rect; only draw visible portion |
| Audio sprites (all SFX in one file) | Relying on `timeupdate` event for sprite stop timing | `timeupdate` fires every ~250ms — too slow for short SFX; use `setTimeout` calculated from `audioCtx.currentTime` instead |
| Web Audio API context lifecycle | Creating multiple `AudioContext` objects across game state resets | Create one `AudioContext` singleton; reuse it for the lifetime of the page |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `ctx.shadowBlur` in game loop | Permanent 30-40% frame time overhead even when no glow is visible | Only use shadowBlur in menu/UI rendering; simulate glow with layered semi-transparent fills for in-game use | Immediately on all devices |
| Full canvas `clearRect` + full background redraw every frame | Fine at 960x590 resolution; wasteful if canvas grows | Already acceptable at current resolution — do not expand canvas size without profiling | Breaks on large 4K displays or if canvas resolution doubles |
| Particle `drawImage` with rotation (`ctx.rotate()`) | Each rotated particle requires `save()`/`restore()` matrix transforms — costly at scale | Draw particles as simple squares/circles without rotation; use pixel offsets to fake direction | Breaks at ~30+ rotating particles simultaneously |
| Audio file loading at game start (no preload) | First sound effect plays late or not at all | Preload all SFX into `AudioBuffer` during loading screen; confirm `buffer.duration > 0` before play | First collision or jump in first 2 seconds of play |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Screen shake applied to entire canvas transform | On mobile, canvas shifts outside its container causing visual clipping at edges | Apply shake offset capped to ±4px; verify at smallest mobile viewport that content stays visible |
| Particle effects obscuring obstacle hitboxes | Players feel collision detection is unfair — "I jumped but the fireball hit me anyway" | Keep particles purely cosmetic; never overlap particle alpha with the critical jump-or-die decision zone |
| Sound effects playing on every obstacle spawn (continuous gameplay) | Audio fatigue; background music drowned out by repetitive SFX within 30 seconds | Layer SFX volume at 60-70% of music volume; use randomized pitch variation (+/- 10%) to reduce repetition perception |
| Transitions that block input (fade-in/out animations) | Mobile players who tap during transition trigger double-input on the next screen | Block input during transition only; emit buffered input after transition completes; use short transitions (200-300ms max) |
| Adding too many simultaneous polish effects at once | Cannot isolate which effect causes frame drops or feels wrong | Add one effect category at a time (first particles, then shake, then audio) and verify 60fps before proceeding |

---

## "Looks Done But Isn't" Checklist

- [ ] **Audio on iOS:** Music plays on actual iPhone Safari, not just desktop Chrome DevTools mobile emulation — verify by testing on device or BrowserStack.
- [ ] **Screen shake on mobile:** Shake offset does not push canvas edge off-screen on 375px wide viewport — verify at smallest target screen size.
- [ ] **Particle cleanup:** No memory leak — `particles.length` stays bounded after 10 minutes of continuous play; test by logging in console.
- [ ] **Sprite animation framerate independence:** Sprite frame advances at same visual speed at 30fps and 60fps — test by throttling CPU to 4x slowdown in DevTools Performance tab.
- [ ] **Audio context running state:** `audioCtx.state === 'running'` confirmed after first user interaction — log it in the click handler during development.
- [ ] **Parallax layers at canvas boundary:** Parallax does not show a visible seam/gap at the loop-around point — test by letting the game run for 60+ seconds.
- [ ] **Game over SFX does not overlap:** Dying while boss SFX plays does not stack two game-over sounds — test by colliding during active boss audio.
- [ ] **Touch events during transitions:** Tapping during screen fade does not skip to wrong game state — test rapid tapping on mobile during transition.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio blocked (autoplay policy) | LOW | Add `audioCtx.resume()` call to existing user interaction handlers; 1-2 lines of code |
| Sprite animation at wrong speed | LOW | Replace `frameCount % N` with `animTimer += dt; if (animTimer > threshold) { animFrame++; animTimer = 0; }` |
| GC stutter from particles | MEDIUM | Refactor particle array to object pool; requires rewriting particle spawn/update/draw but logic stays the same |
| `shadowBlur` performance | LOW | Remove `shadowBlur` from game loop render calls; replace with layered fill approximation |
| Screen shake clips canvas | LOW | Add `Math.abs(shakeX) <= maxShake` clamp; test at 375px viewport width |
| Audio sprite timing inaccurate | MEDIUM | Switch from `timeupdate` (250ms resolution) to `setTimeout` with `audioCtx.currentTime` delta for stop timing |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Audio autoplay blocked | Audio integration — first task | Test on actual mobile device: music plays after tapping Play button |
| Sprite animation framerate-dependent | Sprite/animation phase — before particle work | Test at CPU 4x throttle in DevTools; confirm same visual animation speed |
| Sub-pixel blur on pixel art sprites | Sprite import setup — set `imageSmoothingEnabled = false` once | Zoom to 200% in browser; all sprite edges must be sharp |
| Particle GC stutter | Particle system phase — design pool upfront | Profile with Chrome DevTools Performance; no GC pauses > 5ms during impact effects |
| Mobile volume control broken | Audio integration phase | Test mute toggle on physical iOS Safari device |
| `shadowBlur` in game loop | Any phase where glow is added | Chrome DevTools Performance tab: frame time must stay below 16ms during gameplay |
| Screen shake viewport clipping | Screen shake implementation | Test at 375px viewport; no canvas edge visible during max shake |
| Audio file format compatibility | Audio asset preparation phase | Verify `canPlayType` for OGG and MP3; provide both formats |

---

## Sources

- [Audio for Web games — MDN](https://developer.mozilla.org/en-US/docs/Games/Techniques/Audio_for_Web_Games) — MEDIUM confidence (official MDN, authoritative)
- [Web Audio API Best Practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — HIGH confidence (official MDN)
- [Improving HTML5 Canvas Performance — web.dev](https://web.dev/articles/canvas-performance) — HIGH confidence (official Google web.dev article)
- [Web Audio Autoplay Policy and Games — Chrome Developers Blog](https://developer.chrome.com/blog/web-audio-autoplay) — HIGH confidence (official Chrome team)
- [HTML5 Canvas Performance Optimization Gist — jaredwilli](https://gist.github.com/jaredwilli/5469626) — LOW confidence (community resource, widely referenced)
- [The Seductive Squeeze: When Juice Becomes a Crutch — Wayline](https://www.wayline.io/blog/the-seductive-squeeze-when-juice-in-game-development-becomes-a-crutch) — LOW confidence (game design blog, single source)
- [Optimising HTML5 Canvas Games — Nicola Hibbert](https://nicolahibbert.com/optimising-html5-canvas-games/) — LOW confidence (community blog)
- Code inspection of `C:/Developer/Emmedeveloper/Cavallo/index.html` — HIGH confidence for project-specific pitfalls

---

*Pitfalls research for: HTML5 Canvas endless runner — visual/audio polish milestone*
*Researched: 2026-02-22*
