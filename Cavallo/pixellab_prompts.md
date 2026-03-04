# PixelLab Sprite Generation - U Cavaddu Runner

## Impostazioni globali
- **Dimensione:** 64x64 px per ogni sprite
- **Sfondo:** Trasparente (PNG)
- **Stile:** Pixel art pulito, no anti-aliasing, bordi netti
- **Palette:** Limitata (8-12 colori per sprite)
- **Orientamento:** Tutti rivolti verso DESTRA (side view)
- **Posizione:** Soggetto centrato orizzontalmente, appoggiato al bordo inferiore del canvas (piedi/base toccano il fondo)

---

## SPRITE 1 — Cavallo (frame 1: corsa, zampe estese)

```
Pixel art, side view facing right, 64x64, transparent background.
A cream-white cartoon horse running with legs extended outward (front legs forward, back legs backward).
The horse has a dark brown/black mane flowing behind, cream-white body with warm highlights, dark hooves.
It carries a golden beer mug on its back/side with yellow beer and white foam on top.
The tail is dark brown, flowing behind.
Small dark eyes, pink muzzle area, pointed ears.
Style: cute, chunky proportions, 2D game character.
Feet touching the bottom edge of the canvas.
Color palette: #f0e8dd body, #e0d4c4 shadow, #1a1410 mane, #333 hooves, #daa520 beer mug, #e8a020 beer, #fffff0 foam, #f8ddd0 muzzle.
```

## SPRITE 2 — Cavallo (frame 2: corsa, zampe incrociate)

```
Pixel art, side view facing right, 64x64, transparent background.
Same cream-white cartoon horse but in an alternate running pose: front and back legs are closer together/crossing mid-stride.
Same dark mane (slightly shifted position to show movement), same beer mug, same body colors.
Tail slightly wagging in opposite direction from frame 1.
Everything else identical to frame 1 but with this alternate leg position.
Feet touching the bottom edge of the canvas.
Color palette: #f0e8dd body, #e0d4c4 shadow, #1a1410 mane, #333 hooves, #daa520 beer mug, #e8a020 beer, #fffff0 foam.
```

## SPRITE 3 — Cavallo (salto)

```
Pixel art, side view facing right, 64x64, transparent background.
Same cream-white cartoon horse in a jumping pose: all four legs tucked under the body, body slightly arched upward.
The mane flows upward/back from the jump motion.
The beer mug has small yellow splash drops flying out of it (beer splashing from the jump).
Tail raised/flowing upward.
Body positioned in the center of the canvas (not touching bottom since it's airborne).
Color palette: #f0e8dd body, #e0d4c4 shadow, #1a1410 mane, #333 hooves, #daa520 beer mug, #f0c040 splash drops, #fffff0 foam.
```

---

## SPRITE 4 — Fornacella piccola (ostacolo)

```
Pixel art, side view, 64x64, transparent background.
A small Sicilian street brazier (fornacella): a metal bowl on three short legs.
The bowl is dark gray iron with a rim at the top. Inside: red-orange glowing coals.
Small flame tongues in orange and yellow flickering above the coals.
Compact and short proportions, sits on the ground.
Base touching the bottom edge of the canvas.
Color palette: #555 legs, #666 base, #777 bowl, #888 inner, #999 rim, #cc3300 coals, #ff6600 flames, #ffcc00 flame tips.
```

## SPRITE 5 — Fornacella media (ostacolo)

```
Pixel art, side view, 64x64, transparent background.
A medium-sized Sicilian street brazier: taller than the small one, wider bowl, two sturdy legs.
Dark gray iron construction, deeper bowl with more visible coals inside.
Bigger flames: orange and yellow tongues rising above, some red at the base of flames.
A grill grate pattern visible at the top rim.
Base touching the bottom edge of the canvas.
Color palette: #555 legs, #666 base, #777 bowl, #888 grate, #999 rim, #8a3020 coals, #ff5500 flames, #ffcc00 tips, #ffdd00 bright tips.
```

## SPRITE 6 — Fornacella grande con arrostitori (ostacolo)

```
Pixel art, side view, 64x64, transparent background.
A large Sicilian street grill (fornacella con arrostitori) with a person standing behind it grilling.
The person: light skin, white tank top/apron with red stripe, dark pants, dark shoes, holding tongs.
The fornacella: large rectangular grill in front, with iron legs, grate on top, red coals, orange flames.
Meat skewers visible on the grill.
Person's head above the grill, body partially hidden behind it.
Base touching the bottom edge of the canvas. The whole scene is taller than the small fornacelle.
Color palette: #d4a574 skin, #eee apron, #cc0000 stripe, #555 iron, #777 grill, #cc3300 coals, #ff6600 flames, #333 pants.
```

---

## SPRITE 7 — Mafioso col coltello (ostacolo)

```
Pixel art, side view facing left, 64x64, transparent background.
A comical Sicilian mafioso standing with a large kitchen knife raised in his right hand.
Wearing: dark flat cap (coppola), white sleeveless undershirt (canottiera) with a gold chain/pendant, dark navy pants, dark shoes.
Light skin tone, dark eyebrows, small menacing expression.
The knife: brown wooden handle, large shiny silver blade pointing up.
Stocky/chunky build, slightly cartoonish proportions.
Feet touching the bottom edge of the canvas.
Color palette: #222 cap, #d4a574 skin, #eee undershirt, #daa520 chain, #ffd700 pendant, #1a1a4a pants, #222 shoes, #ccc blade, #4a2a10 handle.
```

## SPRITE 8 — Mafioso con lupara (ostacolo)

```
Pixel art, side view facing left, 64x64, transparent background.
A comical Sicilian mafioso standing with a sawed-off shotgun (lupara) held diagonally across his chest.
Wearing: dark brown fedora hat, black suit with white shirt and red tie underneath, dark shoes.
Thick sideburns, stern expression, light skin.
The lupara: dark gray metal barrels, brown wooden stock, held at an angle pointing up-left.
Slightly taller/thinner than the knife mafioso.
Feet touching the bottom edge of the canvas.
Color palette: #3a2828 fedora, #c8956a skin, #1a1a1a suit, #ddd shirt, #8a0000 tie, #555 gun metal, #5a3a1a wood stock, #1a1010 shoes.
```

## SPRITE 9 — Mafioso con fornacella (ostacolo, il piu' alto)

```
Pixel art, side view facing left, 64x64, transparent background.
A comical Sicilian mafioso holding a lit brazier (fornacella) above his head with both hands.
Wearing: dark gray beret, green polo shirt, dark gray pants, dark shoes.
Light skin, open mouth expression (yelling), arms raised up holding the brazier.
The brazier above his head: small iron bowl with red coals and orange/yellow flickering flames coming out the top.
This is the tallest obstacle in the game, so the character should use most of the vertical space.
Feet touching the bottom edge of the canvas, flames near the top.
Color palette: #444 beret, #d4a574 skin, #006633 polo dark, #008844 polo light, #333 pants, #222 shoes, #777 brazier, #cc3300 coals, #ff6600 flames, #ffcc00 flame tips.
```

---

## SPRITE 10 — Boss "U Liotru" (frame 1: idle)

```
Pixel art, side view facing left, 64x64, transparent background.
The Liotru: Catania's famous stone elephant statue, reimagined as a game boss.
A large, chunky elephant made of gray basalt stone. Rough stone texture with lighter and darker gray patches.
Four thick stumpy legs, wide rectangular body, big round head.
Bright glowing RED eyes (menacing). Two curved cream/ivory tusks pointing forward.
A long trunk hanging down or slightly raised.
Short stubby tail.
Powerful and imposing presence, fills most of the 64x64 canvas.
Feet touching the bottom edge of the canvas.
Color palette: #696969 main stone, #808080 lighter stone, #555555 dark stone, #a0a0a0 highlights, #b0b0b0 bright spots, #ff0000 eyes, #f0e8d0 tusks.
```

## SPRITE 11 — Boss "U Liotru" (frame 2: charging/animated)

```
Pixel art, side view facing left, 64x64, transparent background.
Same stone elephant boss (Liotru) but in an alternate animation pose:
- Trunk swung slightly to the other side (shifted position)
- Tail wagging in opposite direction
- Legs in a slightly different stance suggesting movement/stomping
Everything else identical: same gray stone texture, same red glowing eyes, same tusks.
Feet touching the bottom edge of the canvas.
Color palette: #696969 main stone, #808080 lighter stone, #555555 dark stone, #a0a0a0 highlights, #ff0000 eyes, #f0e8d0 tusks.
```

## SPRITE 12 — Boss "U Liotru" (hit flash, bianco)

```
Pixel art, side view facing left, 64x64, transparent background.
Same stone elephant boss (Liotru) but entirely white/bright as a damage flash effect.
Same exact silhouette and pose as frame 1, but all stone colors replaced with white and light gray.
Eyes still visible as slightly different shade.
This is used as a flash overlay when the boss gets hit.
Color palette: #ffffff main, #eeeeee mid, #dddddd shadow, #cccccc dark.
```

---

## SPRITE 13 — Arancino (collectible)

```
Pixel art, 64x64, transparent background.
A Sicilian arancino (fried rice ball): classic conical/dome shape, golden-orange fried exterior.
Crunchy breadcrumb texture with slight color variation on surface.
A small bright highlight spot on the upper-left area.
Darker orange/brown shadow on the bottom-right.
Cute and appetizing, centered in the canvas, sitting on the bottom edge.
Simple, iconic, easily recognizable even at small sizes.
Color palette: #d4880a main golden, #e8a020 highlight, #b06a08 shadow, #c07808 mid-tone, #f0b830 bright spot.
```

---

## SPRITE 14 — Palla di lava (proiettile boss)

```
Pixel art, 64x64, transparent background.
A molten lava fireball: irregular round shape, glowing hot.
Bright yellow-white core in the center, transitioning to orange, then red at the edges.
Jagged/uneven edges suggesting molten dripping rock.
Small particle sparks around it.
Centered in the canvas.
Color palette: #ff2200 outer red, #ff4400 mid-red, #ff6600 orange, #ff8800 mid-orange, #ffaa00 inner orange, #ffcc00 bright yellow, #ffee00 core.
```

---

## Note per la generazione

### Ordine di priorita'
1. Cavallo (3 frame) — protagonista, deve essere il piu' curato
2. Boss Liotru (3 frame) — secondo personaggio principale
3. Mafiosi (3 tipi) — ostacoli con personalita'
4. Fornacelle (3 tipi) — ostacoli ambientali
5. Arancino + Lava — piccoli ma iconici

### Checklist qualita'
- [ ] Tutti gli sprite hanno sfondo trasparente
- [ ] I piedi/basi toccano il bordo inferiore del canvas
- [ ] Nessun anti-aliasing sui bordi
- [ ] Palette colori coerente tra sprite dello stesso tipo
- [ ] I frame di animazione (cavallo, boss) hanno la stessa silhouette/dimensione
- [ ] I mafiosi sono rivolti a SINISTRA (vengono incontro al cavallo)
- [ ] Il cavallo e' rivolto a DESTRA

### Naming convention per i file
```
horse_run1.png
horse_run2.png
horse_jump.png
fornacella1.png
fornacella2.png
fornacella_grill.png
maf_coltello.png
maf_lupara.png
maf_fornacella.png
boss_idle.png
boss_charge.png
boss_flash.png
arancino.png
lava.png
```

**Totale: 14 sprite da generare**
