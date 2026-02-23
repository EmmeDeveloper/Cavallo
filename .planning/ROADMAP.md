# Roadmap: U Cavaddu Runner — Polish Milestone

## Overview

Il gioco funziona ed e' completo. Questo milestone porta la qualita' visiva e audio al livello di un prodotto pubblicabile su itch.io: effetti schermo, parallasse, audio completo e layout responsive. Tre fasi, dalla piu' impattante alla piu' strutturale, ognuna lascia il gioco in stato giocabile e migliorato.

## Phases

- [x] **Phase 1: Screen Effects and Visual Polish** - Parallasse, transizioni fade, feedback punteggio
- [x] **Phase 2: Audio Integration** - SFX, musica in loop, mute toggle, effetto sonoro boss (completed 2026-02-23)
- [x] **Phase 3: Mobile Display** - Canvas responsive, fullscreen portrait e landscape (completed 2026-02-23)
- [ ] **Phase 4: Fix Graphics Issue** - Rimuovi parallax, sprite PixelLab, nascondi reset, canvas letterbox

## Phase Details

### Phase 1: Screen Effects and Visual Polish
**Goal**: Il gioco si presenta come un prodotto curato — sfondo vivo, transizioni fluide, feedback visivo sulle azioni del giocatore
**Depends on**: Nothing (first phase)
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. Lo sfondo scorre con 2-3 livelli a velocita' diverse — cielo, edifici e terreno si muovono indipendentemente
  2. Passare da menu a gameplay e da gameplay a game over usa un fade-in/fade-out senza taglio brusco
  3. Il punteggio pulsa visivamente ogni volta che aumenta e il rank-up mostra un effetto celebrativo piu' vistoso rispetto all'attuale
**Plans:** 2/2 plans executed

Plans:
- [x] 01-01-PLAN.md — Parallax background con 3 livelli procedurali (VIS-01)
- [x] 01-02-PLAN.md — Fade transitions tra stati di gioco + score pulse e rank-up celebration (VIS-02, VIS-03)

### Phase 2: Audio Integration
**Goal**: Il gioco ha audio completo — effetti sonori per ogni azione, musica di sottofondo e controllo del volume accessibile al giocatore
**Depends on**: Phase 1
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04
**Success Criteria** (what must be TRUE):
  1. Il giocatore sente un suono diverso per ciascuna azione principale: salto, collisione, raccolta arancino, boss hit, boss sconfitto, game over
  2. La musica di sottofondo suona in loop durante il gameplay e non si sente silenzio tra i loop
  3. Il pulsante mute nel HUD attiva e disattiva tutto l'audio e la preferenza viene ricordata al riavvio
  4. Quando appare U Liotru, la musica o il sound design cambia in modo percettibile per segnalare l'intensita' del momento
**Plans:** 2/2 plans complete

Plans:
- [x] 02-01-PLAN.md — AudioManager IIFE + Howler.js CDN + 6 SFX files + hook-in a 7 eventi di gioco (AUD-01)
- [x] 02-02-PLAN.md — Musica di sottofondo in loop + boss music swap + mute button HUD con localStorage (AUD-02, AUD-03, AUD-04)

### Phase 3: Mobile Display
**Goal**: Il gioco riempie lo schermo su qualsiasi dispositivo, in portrait e landscape, senza bande nere o elementi tagliati
**Depends on**: Phase 2
**Requirements**: MOB-01, MOB-02
**Success Criteria** (what must be TRUE):
  1. Su un telefono in portrait il canvas occupa tutta la larghezza dello schermo e il gioco e' giocabile
  2. Ruotando il telefono in landscape il canvas si ridimensiona automaticamente senza ricaricare la pagina
  3. Su qualsiasi dimensione di schermo nessun elemento dell'HUD (punteggio, mute) viene tagliato o sovrapposto
**Plans:** 1 plan

Plans:
- [x] 03-01-PLAN.md — CSS dvh fix + resizeCanvas() cover scaling (Math.max) + mobile verification (MOB-01, MOB-02)

### Phase 4: Fix Graphics Issue
**Goal:** Il gioco usa sprite pixel art PixelLab al posto dei disegni code-drawn, sfondo statico bg.webp senza parallax, pulsante reset nascosto, canvas letterboxed con barre sfocate
**Depends on:** Phase 3
**Requirements:** GFX-01, GFX-02, GFX-03, GFX-04
**Success Criteria** (what must be TRUE):
  1. Lo sfondo Catania bg.webp e' visibile come immagine statica senza livelli parallax sovrapposti
  2. Tutti gli sprite di gioco (cavallo, ostacoli, arancini, boss, lava) sono immagini pixel art PixelLab, non forme disegnate via codice
  3. Il pulsante "DEV: Reset" non e' visibile ai giocatori — accessibile solo con long-press 3 secondi nel menu
  4. Il canvas usa scaling contain (Math.min) con barre letterbox che mostrano bg.webp sfocato
**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Rimuovi parallax, nascondi reset button con long-press gesture, CSS letterbox polish (GFX-01, GFX-03, GFX-04)
- [ ] 04-02-PLAN.md — Genera sprite PixelLab + preloader + sostituisci tutte le funzioni di disegno sprite (GFX-02)

## Progress

**Execution Order:** 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Screen Effects and Visual Polish | 2/2 | Complete | 2026-02-23 |
| 2. Audio Integration | 2/2 | Complete   | 2026-02-23 |
| 3. Mobile Display | 1/1 | Complete | 2026-02-23 |
| 4. Fix Graphics Issue | 0/2 | Planning | — |
