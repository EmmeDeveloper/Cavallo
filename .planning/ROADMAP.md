# Roadmap: U Cavaddu Runner — Polish Milestone

## Overview

Il gioco funziona ed e' completo. Questo milestone porta la qualita' visiva e audio al livello di un prodotto pubblicabile su itch.io: effetti schermo, parallasse, audio completo e layout responsive. Tre fasi, dalla piu' impattante alla piu' strutturale, ognuna lascia il gioco in stato giocabile e migliorato.

## Phases

- [ ] **Phase 1: Screen Effects and Visual Polish** - Parallasse, transizioni fade, feedback punteggio
- [ ] **Phase 2: Audio Integration** - SFX, musica in loop, mute toggle, effetto sonoro boss
- [ ] **Phase 3: Mobile Display** - Canvas responsive, fullscreen portrait e landscape

## Phase Details

### Phase 1: Screen Effects and Visual Polish
**Goal**: Il gioco si presenta come un prodotto curato — sfondo vivo, transizioni fluide, feedback visivo sulle azioni del giocatore
**Depends on**: Nothing (first phase)
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. Lo sfondo scorre con 2-3 livelli a velocita' diverse — cielo, edifici e terreno si muovono indipendentemente
  2. Passare da menu a gameplay e da gameplay a game over usa un fade-in/fade-out senza taglio brusco
  3. Il punteggio pulsa visivamente ogni volta che aumenta e il rank-up mostra un effetto celebrativo piu' vistoso rispetto all'attuale
**Plans:** 1/2 plans executed

Plans:
- [ ] 01-01-PLAN.md — Parallax background con 3 livelli procedurali (VIS-01)
- [ ] 01-02-PLAN.md — Fade transitions tra stati di gioco + score pulse e rank-up celebration (VIS-02, VIS-03)

### Phase 2: Audio Integration
**Goal**: Il gioco ha audio completo — effetti sonori per ogni azione, musica di sottofondo e controllo del volume accessibile al giocatore
**Depends on**: Phase 1
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04
**Success Criteria** (what must be TRUE):
  1. Il giocatore sente un suono diverso per ciascuna azione principale: salto, collisione, raccolta arancino, boss hit, boss sconfitto, game over
  2. La musica di sottofondo suona in loop durante il gameplay e non si sente silenzio tra i loop
  3. Il pulsante mute nel HUD attiva e disattiva tutto l'audio e la preferenza viene ricordata al riavvio
  4. Quando appare U Liotru, la musica o il sound design cambia in modo percettibile per segnalare l'intensita' del momento
**Plans**: TBD

### Phase 3: Mobile Display
**Goal**: Il gioco riempie lo schermo su qualsiasi dispositivo, in portrait e landscape, senza bande nere o elementi tagliati
**Depends on**: Phase 2
**Requirements**: MOB-01, MOB-02
**Success Criteria** (what must be TRUE):
  1. Su un telefono in portrait il canvas occupa tutta la larghezza dello schermo e il gioco e' giocabile
  2. Ruotando il telefono in landscape il canvas si ridimensiona automaticamente senza ricaricare la pagina
  3. Su qualsiasi dimensione di schermo nessun elemento dell'HUD (punteggio, mute) viene tagliato o sovrapposto
**Plans**: TBD

## Progress

**Execution Order:** 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Screen Effects and Visual Polish | 1/2 | In Progress|  |
| 2. Audio Integration | 0/TBD | Not started | - |
| 3. Mobile Display | 0/TBD | Not started | - |
