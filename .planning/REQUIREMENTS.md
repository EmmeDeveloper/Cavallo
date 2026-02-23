# Requirements: U Cavaddu Runner - Polish Milestone

**Defined:** 2026-02-22
**Core Value:** Il gioco deve sembrare un prodotto professionale da store — grafica pixel art curata, animazioni fluide, effetti visivi ed audio coinvolgenti.

## v1 Requirements

Requirements for polish release. Each maps to roadmap phases.

### Audio

- [ ] **AUD-01**: Il gioco riproduce effetti sonori per azioni principali (salto, collisione, raccolta arancino, boss hit, boss sconfitto, game over)
- [ ] **AUD-02**: Il gioco riproduce musica di sottofondo in loop durante il gameplay
- [ ] **AUD-03**: Il giocatore puo' attivare/disattivare l'audio tramite pulsante mute nel HUD
- [ ] **AUD-04**: La musica cambia o si aggiunge un effetto sonoro quando appare il boss U Liotru

### Visual

- [x] **VIS-01**: Lo sfondo ha 2-3 livelli parallasse che scorrono a velocita' diverse
- [x] **VIS-02**: Le transizioni tra menu, gameplay e game over usano fade-in/fade-out
- [x] **VIS-03**: Il punteggio pulsa visivamente quando aumenta e il rank-up ha un effetto celebrativo piu' vistoso

### Mobile

- [ ] **MOB-01**: Il gioco si adatta a schermo intero sia in orientamento verticale che orizzontale
- [ ] **MOB-02**: Il canvas si ridimensiona dinamicamente per riempire lo schermo su qualsiasi dispositivo mobile

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Game Feel

- **FEEL-01**: Screen shake su collisione, morte e boss hit
- **FEEL-02**: Particelle polvere all'atterraggio del cavallo
- **FEEL-03**: Esplosione particelle quando si raccoglie un arancino
- **FEEL-04**: Animazione morte del cavallo (barcolla ~0.5s prima del game over)

### Visual Advanced

- **VADV-01**: Squash & stretch sul cavallo (salto/atterraggio)
- **VADV-02**: Effetto schermo rosso + rumble durante boss fight
- **VADV-03**: Silhouette landmark Catania nello sfondo parallasse (Etna, Duomo)
- **VADV-04**: Linee velocita' e feedback visivo quando la speed aumenta
- **VADV-05**: Flash combo multiplier quando si raccolgono arancini in sequenza

## Out of Scope

| Feature | Reason |
|---------|--------|
| Migrazione a sprite sheet PNG | Il disegno programmatico funziona e permette flash/palette swap facilmente |
| WebGL renderer | Il gioco gira a 60fps con Canvas 2D, nessun beneficio visibile |
| Musica procedurale via Web Audio API | Troppo complesso, risultati robotici; meglio file audio CC0 |
| Haptic feedback (vibration API) | Bloccato su iOS, inconsistente su Android |
| Loading screen | Gioco single-file <50KB, caricamento <100ms |
| Cutscene animate tra rank-up | Troppo effort per il beneficio; popup + suono bastano |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUD-01 | Phase 2 | Pending |
| AUD-02 | Phase 2 | Pending |
| AUD-03 | Phase 2 | Pending |
| AUD-04 | Phase 2 | Pending |
| VIS-01 | Phase 1 | Complete |
| VIS-02 | Phase 1 | Complete |
| VIS-03 | Phase 1 | Complete |
| MOB-01 | Phase 3 | Pending |
| MOB-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 — traceability mapped after roadmap creation*
