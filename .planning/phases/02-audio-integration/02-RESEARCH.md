# Phase 2: Audio Integration - Research

**Researched:** 2026-02-23
**Domain:** Web Audio API / Howler.js, CC0 asset sourcing, HTML5 Canvas game audio integration
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUD-01 | Il gioco riproduce effetti sonori per azioni principali (salto, collisione, raccolta arancino, boss hit, boss sconfitto, game over) | AudioManager IIFE with Howler.js; 6 named SFX events mapped to existing code hook points |
| AUD-02 | Il gioco riproduce musica di sottofondo in loop durante il gameplay | Howler.js `loop: true` on a Web Audio BufferSource avoids the HTML5 Audio gap; seamless loop via properly trimmed OGG/MP3 |
| AUD-03 | Il giocatore puo' attivare/disattivare l'audio tramite pulsante mute nel HUD; preferenza ricordata al riavvio | `Howler.mute(true/false)` global mute; `localStorage` key `cavalloMuted`; mute button drawn on canvas next to btnHome |
| AUD-04 | La musica cambia o si aggiunge un effetto sonoro quando appare il boss U Liotru | Boss spawn at score/10000 threshold already detected; crossfade or music swap at the `boss = { ... }` creation site |
</phase_requirements>

---

## Summary

Phase 2 adds complete audio to U Cavaddu Runner: six SFX events, looping background music, a mute toggle saved to localStorage, and a perceptible audio shift when U Liotru spawns. The game already uses Howler.js via CDN as a locked decision (see STATE.md), so all audio goes through a single `AudioManager` IIFE placed before the main game script — exactly following the subsystem pattern established in Phase 1.

The key constraint is the browser autoplay policy: the AudioContext (managed internally by Howler) must not produce sound before the first user gesture. Howler 2.2.x handles this correctly with its `autoUnlock` feature, but the game must call Howler's init path during the first user interaction (JUCA! button / first canvas click) rather than at script load time. Music must begin only when `gameState` transitions to `'playing'`, which happens after the user has already interacted.

The most practically complex requirement is AUD-02 (seamless music loop). Howler.js via Web Audio API achieves zero-gap looping if the audio file has clean loop points (no silence at head/tail). Files from OpenGameArt with OGG format are the safest choice; MP3 adds encoder silence (~26ms) which creates an audible gap. The solution is either a correctly trimmed OGG, or using an audio sprite where the loop segment is defined with exact millisecond boundaries.

**Primary recommendation:** Use Howler.js 2.2.3 via CDN with OGG-format music for seamless looping. Implement a single `AudioManager` IIFE that wraps Howler. Add a mute button to the canvas HUD at a fixed position left of `btnHome`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Howler.js | 2.2.3 | Audio playback, sprites, looping, global mute | Locked decision from project init; defaults to Web Audio API, falls back to HTML5 Audio; handles autoplay unlock automatically |

### No Additional Libraries Needed

This phase requires no other libraries. Web Audio API is handled through Howler internally. localStorage is native.

### CDN Reference

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
```

Alternatively via jsDelivr:
```html
<script src="https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js"></script>
```

**Place this `<script>` tag in `<head>` or before the AudioManager IIFE script block.**

---

## Architecture Patterns

### Recommended Structure for AudioManager IIFE

The AudioManager follows the established subsystem pattern (IIFE object namespace, placed before the main game script). The architecture research already provides a skeleton; this section provides the audio-specific production-ready version.

```
index.html
  <head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
  </head>
  <body>
    ...
    <script>
    // ==================== PARALLAX BACKGROUND ====================
    // (already exists from Phase 1)
    </script>

    <script>
    // ==================== SCREEN FADE ====================
    // (already exists from Phase 1)
    </script>

    <script>
    // ==================== AUDIO MANAGER ====================
    // New in Phase 2
    const AudioManager = (function() { ... })();
    </script>

    <script>
    // ==================== MAIN GAME CODE ====================
    // Existing code — minimal hook-in changes
    </script>
```

### Pattern 1: AudioManager IIFE with Howler.js

**What:** A self-contained IIFE that wraps Howler.js. Exposes `play(name)`, `playMusic(track)`, `stopMusic()`, `setMute(bool)`, `isMuted()`. Internally manages a single Howl instance for music and individual Howl instances for SFX.

**When to use:** This project's single-file, no-build-tools constraint. One object, zero global pollution.

**Example:**

```javascript
// Source: Howler.js docs (howlerjs.com) + project architecture pattern
const AudioManager = (function() {
  let musicHowl = null;
  let muted = false;
  const sfx = {};

  // SFX definitions: name -> file path
  const SFX_FILES = {
    jump:        'audio/jump.ogg',
    collect:     'audio/collect.ogg',
    collision:   'audio/collision.ogg',
    bossHit:     'audio/boss_hit.ogg',
    bossDefeated:'audio/boss_defeated.ogg',
    gameOver:    'audio/game_over.ogg',
  };

  const MUSIC_FILES = {
    game:  'audio/music_game.ogg',
    boss:  'audio/music_boss.ogg',
  };

  function init() {
    // Restore mute preference from localStorage
    muted = localStorage.getItem('cavalloMuted') === '1';
    Howler.mute(muted);

    // Pre-load all SFX
    for (const [name, src] of Object.entries(SFX_FILES)) {
      sfx[name] = new Howl({
        src: [src, src.replace('.ogg', '.mp3')], // OGG primary, MP3 fallback
        volume: 0.6,
        preload: true,
      });
    }
  }

  function play(name) {
    if (sfx[name]) sfx[name].play();
  }

  function playMusic(track) {
    if (musicHowl) { musicHowl.stop(); musicHowl.unload(); }
    musicHowl = new Howl({
      src: [MUSIC_FILES[track], MUSIC_FILES[track].replace('.ogg', '.mp3')],
      loop: true,
      volume: 0.4,
      html5: false, // Web Audio API for seamless looping
    });
    musicHowl.play();
  }

  function stopMusic() {
    if (musicHowl) { musicHowl.stop(); }
  }

  function setMute(val) {
    muted = val;
    Howler.mute(muted);
    localStorage.setItem('cavalloMuted', muted ? '1' : '0');
  }

  function isMuted() { return muted; }

  return { init, play, playMusic, stopMusic, setMute, isMuted };
})();
```

**Note:** `Howler.mute()` is a global mute that silences everything (SFX + music) simultaneously. This is simpler and more reliable than per-Howl muting.

### Pattern 2: Mute Button on Canvas HUD

**What:** A rectangular hit area drawn on canvas in `drawScore()`, positioned to the left of the existing `btnHome` button. Stores its rect in `let btnMute = { x, y, w, h }` and is tested in the canvas `pointerdown` handler.

**When to use:** This game draws all HUD on canvas (no HTML overlay for gameplay), so the mute button must be canvas-drawn too.

**Position:** Left of `btnHome`. Current `btnHome` is at `x = canvas.width - 210`, so mute can sit at `x = canvas.width - 250` (40px wide, same height as btnHome).

```javascript
// In drawScore(), after btnHome draw:
let btnMute = { x: 0, y: 0, w: 0, h: 0 };  // declare at top of game globals

// Inside drawScore():
const mx = canvas.width - 252, my = 8, mw = 32, mh = 32;
btnMute = { x: mx, y: my, w: mw, h: mh };
ctx.fillStyle = 'rgba(0,0,0,0.5)';
ctx.fillRect(mx, my, mw, mh);
ctx.strokeStyle = '#ff6633';
ctx.lineWidth = 1;
ctx.strokeRect(mx, my, mw, mh);
// Icon: speaker or muted speaker using simple pixel art lines
const mcx = mx + mw / 2, mcy = my + mh / 2;
ctx.fillStyle = AudioManager.isMuted() ? '#888' : '#ddd';
// ... draw simple speaker icon or 'M'/'U' text
outText(AudioManager.isMuted() ? 'M' : 'U', mcx, mcy + 5, AudioManager.isMuted() ? '#888' : '#ddd',
  'bold 14px "Courier New", monospace', 'center');
```

**In the pointerdown/click handler:**

```javascript
// In handleCanvasPointerDown or the touch handler, add:
if (hitTest(pos, btnMute)) {
  AudioManager.setMute(!AudioManager.isMuted());
  return;
}
```

### Pattern 3: Music State Transitions

**What:** Music changes are tied to `gameState` transitions and the boss spawn event. The existing state machine already has clear transition points.

**Hook-in map:**

| Game Event | Code Location | Audio Action |
|------------|--------------|--------------|
| Game starts (first play or restart) | `resetGame()` call site after ScreenFade completes | `AudioManager.playMusic('game')` |
| Boss spawns (score/10000 threshold) | `boss = { ... }` creation block (~line 1813) | `AudioManager.playMusic('boss')` |
| Boss defeated | `boss = null; bossDefeated++` block (~line 1927) | `AudioManager.playMusic('game')` |
| Game over (collision) | `gameState = 'gameover'` (~line 1691) | `AudioManager.stopMusic(); AudioManager.play('gameOver')` |
| Menu state | `gameState = 'menu'` in multiple places | `AudioManager.stopMusic()` |

**Note on restart:** When game over occurs and user taps to restart, `resetGame()` is called inside the ScreenFade `out-in` callback. Music restart should happen at the same point as resetGame(), not on the gameover tap itself.

### Pattern 4: Audio Initialization on First Gesture

**What:** `AudioManager.init()` is called inside the first user interaction that can start audio. Howler handles AudioContext unlock internally, but `init()` must be called before any `play()` to register SFX Howl instances.

**When:** Call `AudioManager.init()` once at game startup — in the `DOMContentLoaded` or the first time `gameLoop` is called. Howler's `autoUnlock: true` (default) will handle the suspended AudioContext on first user gesture.

**Safer approach:** Call `AudioManager.init()` in the `requestAnimationFrame(gameLoop)` startup block at the bottom of the main script:

```javascript
AudioManager.init();
fetchLeaderboard();
requestAnimationFrame(gameLoop);
```

This runs before any game interaction and preloads files. Howler's autoUnlock handles the browser gesture requirement transparently.

### Anti-Patterns to Avoid

- **Using `new Audio()` elements for SFX:** Creates multiple HTMLAudioElement instances. Mobile limits concurrent elements. Use Howler Howl instances (backed by Web Audio API) exclusively.
- **Setting music `html5: true` for looping music:** HTML5 Audio mode adds encoder silence (~26ms gap on MP3). Use `html5: false` (Web Audio API mode) for music that loops.
- **Setting `Howler.volume()` instead of per-category volumes:** Global Howler volume affects everything including SFX. Set volume per Howl instance — music at 0.4, SFX at 0.6.
- **Muting individual Howl instances:** Use `Howler.mute(true)` which is platform-safe and toggles everything. Per-instance `.mute()` works but `Howler.mute()` is simpler and affects future sounds too.
- **Loading audio files without OGG fallback:** Safari does not support OGG. Always provide `src: ['file.ogg', 'file.mp3']` — Howler picks the first supported format.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio format fallback | Custom `canPlayType` logic | Howler `src: ['.ogg', '.mp3']` | Howler's multi-src tries formats in order, picks first supported |
| AudioContext lifecycle (suspend/resume) | Manual `ctx.state === 'suspended'` polling | Howler `autoUnlock: true` (default) | Howler already handles this on all major browsers including iOS |
| Seamless loop implementation | Web Audio API `BufferSource.onended` + manual restart | Howler `loop: true` with `html5: false` | Web Audio API looping via Howler has zero gap; hand-rolled onended has ~10ms scheduling jitter |
| Global mute toggle | Per-Howl `.mute()` on every instance | `Howler.mute(true/false)` | Single call affects all current and future sounds |
| SFX volume vs. music volume | Separate gain node graph | Per-Howl `volume` property (0.0-1.0) | Sufficient for this project; two tiers (music=0.4, sfx=0.6) set at Howl creation |

**Key insight:** The single-biggest custom code risk in game audio is trying to manage the Web Audio API directly. Howler abstracts away AudioContext lifecycle, format support detection, AudioContext unlocking, and Buffer management. The game should only call `AudioManager.play()` and `AudioManager.playMusic()` — never touch `Howler.ctx` directly.

---

## Common Pitfalls

### Pitfall 1: Autoplay Policy Silences First Sound

**What goes wrong:** The game loads and AudioManager.init() runs — Howler creates Howl instances. User clicks JUCA! and music starts playing... but on some mobile browsers and Chrome with strict autoplay, the first sound is blocked.

**Why it happens:** Howler creates an AudioContext during init. If this happens before any user gesture on certain browser configurations, the context is suspended. Howler's `autoUnlock` fires on the next gesture (the click that starts gameplay), but if a sound was already requested before that gesture, it was silently dropped.

**How to avoid:** Howler 2.2.x `autoUnlock` is on by default and queues sounds until the context is running. Verify by checking `Howler.ctx.state === 'running'` after the first click in a `console.log` during development. The game's flow (JUCA! → game starts → music plays) is safe because music only starts after user interaction.

**Warning signs:** Music plays fine on desktop, silent on first load on iOS Safari. Console shows `The AudioContext was not allowed to start`.

### Pitfall 2: MP3 Loop Gap

**What goes wrong:** Background music loops but there is a ~26ms silence between each loop iteration. This is clearly audible in a quiet section and breaks immersion.

**Why it happens:** MP3 encoding adds silent frames at the start of a file (LAME encoder header = 576 samples = ~26ms at 44.1kHz). When Howler Web Audio API mode reaches the end and restarts the buffer, those silent frames play.

**How to avoid:** Use OGG Vorbis format for all looping music. OGG does not add encoder silence. Howler with `html5: false` + OGG = truly seamless loop. Provide MP3 as fallback only for Safari (which has full OGG support as of Safari 15.4 on desktop, but iOS Safari still recommends MP3 as primary).

**Warning signs:** Audible "tick" or "gap" on every loop. Noticeable in a quiet passage of the music.

**Mitigation if only MP3 is available:** Use an audio sprite where the loop segment starts at offset 0 with exact millisecond duration measured in Audacity/audio editor to skip the silent frame.

### Pitfall 3: Music Restarts on Game Over → Restart Flow

**What goes wrong:** Player dies, then taps to restart. Music restarts but there is a brief double-play or a gap because `stopMusic()` and `playMusic()` are called in the wrong order relative to the ScreenFade animation.

**Why it happens:** The gameover handler calls `stopMusic()` immediately, but `playMusic('game')` is called inside the ScreenFade `out-in` callback (inside `resetGame()`). If the callback fires before Howler has fully stopped the previous track, two music instances overlap briefly.

**How to avoid:** `playMusic()` always calls `musicHowl.stop(); musicHowl.unload()` before creating a new Howl. This guarantees no overlap. The sequence is: gameover → `stopMusic()` → [ScreenFade plays] → `resetGame()` → `playMusic('game')`. The stop+unload pattern in `playMusic()` is the safeguard.

### Pitfall 4: Mute State Not Persisting Correctly

**What goes wrong:** Player mutes the game, closes the tab, reopens — game is unmuted. Or worse, the mute state flickers during game state transitions.

**Why it happens:** `AudioManager.init()` is called once, reads localStorage, applies `Howler.mute()`. But if `init()` is called multiple times (e.g., from resetGame), the localStorage read runs again and overwrites the in-memory `muted` state.

**How to avoid:** `AudioManager.init()` should be called once and only once. Use a guard: `let initialized = false; if (initialized) return; initialized = true;`. The mute button directly calls `setMute(!isMuted())` which writes localStorage and calls `Howler.mute()` in one step.

### Pitfall 5: Boss Music Triggers Multiple Times

**What goes wrong:** Boss spawn condition `Math.floor(score / 10000) > bossDefeated && !boss` can theoretically be checked many times per second in the update loop. If the music-swap call fires multiple times, Howler creates multiple Howl instances.

**Why it happens:** The boss trigger block runs every frame in `update()`. Without a guard, `AudioManager.playMusic('boss')` would fire on every frame while `boss === null` but `score > 10000 * bossDefeated`.

**How to avoid:** The boss spawn block creates `boss = { ... }` (sets `boss` to non-null) in the same conditional check. After the first execution, `!boss` is false, so the block never fires again. `playMusic('boss')` should be called inside the same `if` block as the boss creation — it fires exactly once per boss spawn. This is already correct as long as the call is placed inside the existing boss creation conditional.

---

## Code Examples

### AudioManager Complete Implementation

```javascript
// Source: Howler.js 2.2.3 docs (howlerjs.com) adapted for this project
const AudioManager = (function() {
  let musicHowl = null;
  let muted = false;
  let initialized = false;

  const SFX = {
    jump:         null,
    collect:      null,
    collision:    null,
    bossHit:      null,
    bossDefeated: null,
    gameOver:     null,
  };

  function init() {
    if (initialized) return;
    initialized = true;

    muted = localStorage.getItem('cavalloMuted') === '1';
    Howler.mute(muted);

    const files = {
      jump:         ['audio/jump.ogg',         'audio/jump.mp3'],
      collect:      ['audio/collect.ogg',       'audio/collect.mp3'],
      collision:    ['audio/collision.ogg',     'audio/collision.mp3'],
      bossHit:      ['audio/boss_hit.ogg',      'audio/boss_hit.mp3'],
      bossDefeated: ['audio/boss_defeated.ogg', 'audio/boss_defeated.mp3'],
      gameOver:     ['audio/game_over.ogg',     'audio/game_over.mp3'],
    };

    for (const [name, src] of Object.entries(files)) {
      SFX[name] = new Howl({ src, volume: 0.6, preload: true });
    }
  }

  function play(name) {
    if (SFX[name]) SFX[name].play();
  }

  function playMusic(track) {
    if (musicHowl) { musicHowl.stop(); musicHowl.unload(); musicHowl = null; }
    const src = track === 'boss'
      ? ['audio/music_boss.ogg', 'audio/music_boss.mp3']
      : ['audio/music_game.ogg', 'audio/music_game.mp3'];
    musicHowl = new Howl({ src, loop: true, volume: 0.4, html5: false });
    musicHowl.play();
  }

  function stopMusic() {
    if (musicHowl) { musicHowl.stop(); }
  }

  function setMute(val) {
    muted = !!val;
    Howler.mute(muted);
    localStorage.setItem('cavalloMuted', muted ? '1' : '0');
  }

  function isMuted() { return muted; }

  return { init, play, playMusic, stopMusic, setMute, isMuted };
})();
```

### Hook-In Points in Existing Code

```javascript
// 1. Jump SFX — inside onJump(), after horse.vy = JUMP_FORCE (line ~1444)
AudioManager.play('jump');

// 2. Arancino collect SFX — inside update(), at aranciniCollected++ (line ~1730)
AudioManager.play('collect');

// 3. Obstacle collision + game over — at gameState = 'gameover' (line ~1691)
AudioManager.stopMusic();
AudioManager.play('gameOver');

// 4. Boss lateral collision game over (line ~1941)
AudioManager.stopMusic();
AudioManager.play('gameOver');

// 5. Boss spawn (inside boss creation block, line ~1813-1829)
AudioManager.playMusic('boss');

// 6. Boss hit (bossHits++ site, line ~1919)
AudioManager.play('bossHit');

// 7. Boss defeated (bossDefeated++ site, line ~1928)
AudioManager.play('bossDefeated');
AudioManager.playMusic('game');  // back to normal music

// 8. Game restart — inside ScreenFade callback that calls resetGame() (line ~1440)
// resetGame() should call AudioManager.playMusic('game') at its end
// OR playMusic is called right after resetGame() in the callback

// 9. Init — at the bottom of the main script, before requestAnimationFrame
AudioManager.init();
```

### Mute Button Draw and Hit Test

```javascript
// Declare at file scope with other HUD rects:
let btnMute = { x: 0, y: 0, w: 0, h: 0 };

// In drawScore(), after btnHome draw block:
const mx = hx - 42, my = 8, mw = 32, mh = 32;
btnMute = { x: mx, y: my, w: mw, h: mh };
ctx.fillStyle = 'rgba(0,0,0,0.5)';
ctx.fillRect(mx, my, mw, mh);
ctx.strokeStyle = AudioManager.isMuted() ? '#555' : '#ff6633';
ctx.lineWidth = 1;
ctx.strokeRect(mx, my, mw, mh);
outText(AudioManager.isMuted() ? '🔇' : '🔊',
  mx + mw / 2, my + mh / 2 + 6,
  AudioManager.isMuted() ? '#666' : '#ddd',
  '16px "Courier New", monospace', 'center');
// Note: if emoji rendering is inconsistent, use 'M' and 'SND' text instead

// In the canvas pointerdown handler (handleCanvasPointerDown or equivalent):
// Add BEFORE the gameState checks:
if ((gameState === 'playing' || gameState === 'gameover') && hitTest(pos, btnMute)) {
  AudioManager.setMute(!AudioManager.isMuted());
  return;
}
```

---

## Audio Asset Sourcing

This is flagged as a blocker in STATE.md. Audio files must be found and placed in an `audio/` directory before implementation.

### Required Files

| File | Event | Duration Target | Source |
|------|-------|-----------------|--------|
| `jump.ogg` + `.mp3` | Horse jump | 0.2-0.3s | 8-bit beep/boing |
| `collect.ogg` + `.mp3` | Arancino pickup | 0.3-0.5s | Coin/pickup chime |
| `collision.ogg` + `.mp3` | Obstacle/lava collision | 0.5-1s | Impact/thud |
| `boss_hit.ogg` + `.mp3` | Boss takes damage | 0.3-0.5s | Hit grunt |
| `boss_defeated.ogg` + `.mp3` | Boss defeated | 1-2s | Victory/explosion |
| `game_over.ogg` + `.mp3` | Player dies | 1-2s | Descending tone / wah |
| `music_game.ogg` + `.mp3` | Main gameplay loop | 60-120s seamless | Upbeat chiptune |
| `music_boss.ogg` + `.mp3` | Boss fight loop | 30-60s seamless | Intense chiptune |

### Recommended CC0 Sources

| Source | URL | Best For |
|--------|-----|---------|
| OpenGameArt — 512 SFX (8-bit) | https://opengameart.org/content/512-sound-effects-8-bit-style | All SFX — huge organized pack, 100% CC0 |
| OpenGameArt — CC0 Sounds Library | https://opengameart.org/content/cc0-sounds-library | Additional SFX alternatives |
| OpenGameArt — CC0 Retro Music | https://opengameart.org/content/cc0-retro-music | Background music loops |
| OpenGameArt — Audio CC0 8bit Chiptune | https://opengameart.org/content/audio-cc0-8bit-chiptune | Chiptune music |
| Freesound.org (CC0 filter) | https://freesound.org | Search with CC0 license filter |

### Format Requirements

- **OGG Vorbis primary** for all files (seamless looping, broad desktop support including Safari 15.4+)
- **MP3 fallback** for iOS Safari compatibility (still needs MP3 as of 2025 for reliable playback on older iOS versions)
- Music must be **loopable without audible gap** — verify in Audacity: head and tail of the file should be at zero crossing, no silence

### File Size Budget

The game is currently single-file <50KB. Audio files will be external. Target:
- SFX: <50KB each (8-bit OGG compresses extremely small)
- Music: <500KB per track (OGG at 64kbps stereo, 60s = ~480KB)

---

## Integration Points Summary

| Location | Line (approx.) | Change |
|----------|---------------|--------|
| `<head>` | ~line 3 | Add Howler.js CDN `<script>` tag |
| Before main `<script>` | ~line 209 | Add AudioManager IIFE `<script>` block |
| `drawScore()` function | ~line 2059 | Add mute button draw + update `btnMute` rect |
| Canvas click/touch handler | ~line 1487 | Add `btnMute` hit test |
| `onJump()` | ~line 1444 | `AudioManager.play('jump')` |
| Obstacle collision | ~line 1691 | `AudioManager.stopMusic(); AudioManager.play('gameOver')` |
| Boss-lateral collision | ~line 1941 | same as above |
| Arancino collect | ~line 1730 | `AudioManager.play('collect')` |
| Boss spawn block | ~line 1813 | `AudioManager.playMusic('boss')` |
| Boss hit (`bossHits++`) | ~line 1919 | `AudioManager.play('bossHit')` |
| Boss defeated (`bossDefeated++`) | ~line 1928 | `AudioManager.play('bossDefeated'); AudioManager.playMusic('game')` |
| `resetGame()` end | ~line 1562 | `AudioManager.playMusic('game')` |
| Bottom of main script | ~line 2485 | `AudioManager.init()` before `requestAnimationFrame(gameLoop)` |

---

## Open Questions

1. **OGG support on target iOS version**
   - What we know: Safari 15.4+ (desktop and modern iOS) supports OGG. But iOS 14 and earlier do not.
   - What's unclear: Target audience's iOS version distribution.
   - Recommendation: Provide both `.ogg` and `.mp3` in Howler `src` array with OGG first. Howler picks the first supported format automatically. This covers all browsers at cost of doubled file count.

2. **Boss music: full track swap vs. layered stinger**
   - What we know: AUD-04 requires "perceptible" audio change when boss appears. Two approaches: (a) stop game music, play boss music loop; (b) play a short dramatic stinger SFX on top of existing game music.
   - What's unclear: Whether the project has access to a well-matched boss music loop.
   - Recommendation: Implement track swap (option a) using `playMusic('boss')`. This is maximally impactful and uses the same code path as the normal music. If no suitable boss track is found, fall back to option b (stinger SFX `AudioManager.play('bossAppear')` on top of normal music) — simpler but less dramatic.

3. **Mute button icon: emoji vs. text vs. pixel art**
   - What we know: The canvas uses `outText()` for all text. Emoji rendering on canvas varies by OS/font.
   - Recommendation: Use simple ASCII characters `[S]` (sound) and `[M]` (muted) drawn via `outText()` to ensure consistent pixel-art look across platforms.

---

## Sources

### Primary (HIGH confidence)
- Howler.js official site — https://howlerjs.com/ — version 2.2.3 confirmed, CDN options, `loop`, `html5`, `volume`, `Howler.mute()` API
- Howler.js GitHub — https://github.com/goldfire/howler.js — source code, issue tracker confirming seamless loop behavior with Web Audio API mode
- CDNs confirmed: https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js and https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js
- Project code inspection `index.html` (HIGH — direct read of all hook points, line numbers verified)

### Secondary (MEDIUM confidence)
- OpenGameArt CC0 sound packs — https://opengameart.org/content/512-sound-effects-8-bit-style — confirmed CC0 license, 8-bit SFX pack
- MDN Web Audio API best practices — https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices — autoplay policy behavior
- Existing ARCHITECTURE.md and PITFALLS.md (2026-02-22) — confirm AudioManager pattern, anti-patterns, integration hook map

### Tertiary (LOW confidence — verified via multiple sources)
- MP3 encoder silence gap (~26ms): documented in Howler GitHub issues #39, #360, #421 and corroborated by multiple game dev sources
- OGG seamless looping behavior: corroborated by Howler issue tracker

---

## Metadata

**Confidence breakdown:**
- Standard stack (Howler.js): HIGH — locked decision confirmed, version 2.2.3 verified, CDN URLs confirmed
- Architecture (AudioManager IIFE): HIGH — follows pattern established in Phase 1 and documented in ARCHITECTURE.md
- Hook-in line numbers: MEDIUM — read from current source, but code may shift slightly during Phase 1 completion
- Audio asset sourcing: MEDIUM — CC0 packs confirmed to exist, specific file selection is execution-time decision
- Seamless loop guidance: HIGH — OGG + Web Audio API path well-documented and verified in Howler issue tracker

**Research date:** 2026-02-23
**Valid until:** 2026-04-23 (Howler.js 2.x is stable; MDN autoplay policy stable; CC0 packs are permanent)
