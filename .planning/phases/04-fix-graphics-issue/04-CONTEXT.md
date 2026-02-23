# Phase 4: Fix Graphics Issue - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix visual/graphics issues in the game: remove parallax effect (restore static Catania background), replace all code-drawn sprites with PixelLab-generated pixel art images (animated horse), move dev reset button behind a secret gesture, and maximize the playable canvas to fill the browser window edge-to-edge.

</domain>

<decisions>
## Implementation Decisions

### Parallax Removal
- Remove all 3 parallax layers (far sky gradient, mid city silhouette, near scrolling bg.webp)
- Restore bg.webp as a STATIC background (no scrolling) — drawn once, fixed in place
- Keep ParallaxBg code COMMENTED OUT (not deleted) in case of future revisit
- The drawBackground() fallback or direct bg.webp draw replaces the parallax call in render()

### Sprite Replacement (PixelLab)
- Replace ALL code-drawn sprites with PixelLab-generated images: horse, obstacles, arancini, boss (U Liotru)
- Use PixelLab MCP tools (already connected) to generate sprite assets
- Horse should have ANIMATION FRAMES: walk cycle + jump pose (multiple frames)
- Other sprites (obstacles, arancini, boss) can be static single images
- All sprites saved as PNG/WebP files in a sprites/ directory, loaded as Image objects

### Dev Reset Button
- Remove visible reset button from gameplay/HUD
- Hide behind SECRET GESTURE: long-press 3 seconds on menu screen to reveal reset option
- Reset functionality preserved, just hidden from normal players

### Canvas Maximization
- Keep internal resolution at 960x590 (no change to canvas.width/height)
- Improve CSS scaling to fill the ENTIRE browser window edge to edge (no margins/padding)
- Use Math.min (contain strategy) — aspect ratio preserved, black bars where needed
- Background of the page (behind letterbox bars) — Claude's discretion

### Claude's Discretion
- Art style for PixelLab sprites (match bg.webp Catania aesthetic — likely 16-bit style)
- How to draw static bg.webp (stretch to fill canvas vs tile — pick what looks best)
- Letterbox bar appearance (black bars vs blurred bg.webp or other treatment)
- Specific PixelLab prompts and sprite dimensions

</decisions>

<specifics>
## Specific Ideas

- The Catania pixel art background (bg.webp) is the identity of the game — it should be clearly visible, not obscured by parallax layers
- Sprites should look like they belong in the same world as the bg.webp background
- The game should feel like a polished product when viewed fullscreen, not a small canvas in a big browser window

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-fix-graphics-issue*
*Context gathered: 2026-02-23*
