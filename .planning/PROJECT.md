# U Cavaddu Runner - Catania Edition

## What This Is

Un endless runner pixel art ambientato a Catania, dove il giocatore controlla un cavallo bianco con un boccale di birra che corre schivando mafiosi, fornacelle e affrontando il boss U Liotru. Il gioco include raccolta arancini, sistema di ricette siciliane sbloccabili, classifica online e ranghi catanesi. Destinato a un pubblico catanese/siciliano che apprezza l'umorismo locale.

## Core Value

Il gioco deve sembrare un prodotto professionale da store — grafica pixel art curata, animazioni fluide, effetti visivi ed audio coinvolgenti che rendano l'esperienza di gioco immersiva e divertente.

## Requirements

### Validated

- ✓ Cavallo giocabile con salto e gravità — existing
- ✓ 3 tipi di mafiosi come ostacoli (coltello, lupara, fornacella) — existing
- ✓ 3 varianti fornacella come ostacoli statici — existing
- ✓ Boss U Liotru con attacco lava e 3 HP — existing
- ✓ Arancini collezionabili con bonus punteggio — existing
- ✓ Sistema ranghi catanesi (Picciriddu → Re di Catania) — existing
- ✓ 10 ricette siciliane sbloccabili in base al punteggio — existing
- ✓ Classifica online via Google Apps Script — existing
- ✓ Nickname, video intro, crediti — existing
- ✓ Menu principale con pulsanti Play/Intro/Ricette/Classifica — existing
- ✓ Jump buffering e delta-time per gameplay fluido — existing
- ✓ Supporto touch e desktop — existing

### Active

- [ ] Sprite pixel art migliorati per cavallo, mafiosi, boss e oggetti
- [ ] Animazioni fluide (corsa, salto, atterraggio, morte, transizioni)
- [ ] Effetti particellari (polvere, impatto, raccolta arancini, fuoco)
- [ ] Sfondo parallasse con più livelli di profondità
- [ ] Musica di sottofondo a tema (da risorse gratuite)
- [ ] Effetti sonori per azioni principali (salto, collisione, raccolta, game over, boss)
- [ ] Feedback visivo migliorato (screen shake, flash, popup più elaborati)
- [ ] Transizioni di schermata più curate (fade, slide)
- [ ] UI/HUD più rifinito e professionale

### Out of Scope

- Nuove meccaniche di gameplay — focus solo su polish visivo/audio
- Multiplayer real-time — troppo complesso, non nel scope
- Porting mobile nativo — resta web-based
- Nuovi livelli o mappe — il gameplay resta come ora
- Monetizzazione — progetto personale/divertimento

## Context

- Gioco single-file HTML (~1000+ righe) con tutto il codice in `index.html`
- Sprite disegnati programmaticamente pixel per pixel via Canvas 2D (nessuna spritesheet)
- Background da file `bg.webp`, video intro da `intro.mp4`
- Leaderboard collegata a Google Apps Script esterno
- Tema Catania: colori caldi (#ff6633, #ffcc00), font Courier New monospace
- Creato durante la festa di Sant'Agata da @m.molica e @bardimito
- Target: qualità da pubblicazione su itch.io o simili

## Constraints

- **Tech stack**: HTML5 Canvas + vanilla JavaScript — nessun framework/engine
- **File audio**: risorse gratuite (OpenGameArt, Freesound, simili) — no costi
- **Compatibilità**: deve funzionare su desktop e mobile touch
- **Stile**: pixel art mantenuto e migliorato, non cambiato
- **Palette**: palette Catania esistente (neri, arancioni, gialli, rossi) da rispettare

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mantenere vanilla JS senza engine | Il gioco funziona bene così, non serve Three.js/Phaser | — Pending |
| Audio da risorse gratuite | Nessun budget per musica/suoni custom | — Pending |
| Pixel art migliorato, non cambiato | Lo stile attuale piace, serve solo più qualità | — Pending |
| Focus solo polish, no gameplay nuovo | Priorità è portare la qualità a livello store | — Pending |

---
*Last updated: 2026-02-22 after initialization*
