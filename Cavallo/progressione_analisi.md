# U Cavaddu Runner - Dati di Progressione per Analisi UX

## Panoramica del Gioco
Endless runner 2D in canvas HTML5, tema catanese/siciliano. Il giocatore controlla un cavallo che deve saltare ostacoli (fornacelle, coltelli, lupare) e raccogliere arancini. Include boss fight ricorrenti e un sistema di ricette sbloccabili.

**Controlli:** singolo input (spazio / tap) per saltare. Jump buffering attivo (se premi prima di atterrare, salta subito all'atterraggio).

**Canvas:** 960x540 + road area. Delta-time normalizzato a 60fps (dt=1.0 a 60fps, capped a 3.0).

---

## 1. Velocità di Scorrimento

### Formula attuale
```
speed = 5.0 + 2.0 * ln(1 + score/800) + 0.3 * sqrt(score/1500)
```

### Tabella velocità per punteggio
| Score | Speed | Incremento |
|-------|-------|------------|
| 0     | 5.00  | +0%        |
| 100   | 5.25  | +5%        |
| 200   | 5.47  | +9%        |
| 500   | 6.07  | +21%       |
| 1000  | 6.85  | +37%       |
| 2000  | 7.72  | +54%       |
| 3000  | 8.25  | +65%       |
| 5000  | 9.14  | +83%       |
| 10000 | 10.41 | +108%      |
| 20000 | 11.73 | +135%      |

### Caratteristiche
- **Base speed:** 5.0 px/frame
- Due componenti: logaritmica (dominante all'inizio) + radice quadrata (crescita lenta costante)
- Nessun cap massimo, ma la curva si appiattisce naturalmente
- Reset completo a 5.0 ad ogni nuova partita

---

## 2. Spawn degli Ostacoli

### Intervallo tra spawn
```javascript
base = max(40 - floor(score / 500), 28)       // shrinks: 40 → 28 frames
variance = max(80 - floor(score / 400), 35)    // shrinks: 80 → 35 frames
```

| Score | Base (frames) | Variance (frames) | Intervallo effettivo |
|-------|---------------|--------------------|----------------------|
| 0     | 40            | 80                 | 40-120 frames        |
| 2000  | 36            | 75                 | 36-111 frames        |
| 5000  | 30            | 67                 | 30-97 frames         |
| 6000  | 28 (min)      | 65                 | 28-93 frames         |
| 10000 | 28 (min)      | 55                 | 28-83 frames         |
| 18000 | 28 (min)      | 35 (min)           | 28-63 frames         |

### Respiro
- **15% di probabilità** di spawn con gap allungato: `base + variance + random(0-50)` frames

### Cluster (gruppi di ostacoli)
```
clusterChance = min(0.5, 0.1 + score / 15000)
```
- Score 0: 10% chance di cluster
- Score 6000: 50% chance (cap raggiunto)
- Cluster = 2 ostacoli (70% iniziale) o 3 ostacoli (30% + score/30000)
- Gap tra ostacoli nel cluster: 4-14 px

### Tipi di ostacoli
| Tipo              | Larghezza | Altezza | Note                  |
|-------------------|-----------|---------|-----------------------|
| fornacella1       | 27px      | 36px    | Basso                 |
| fornacella2       | 30px      | 40px    | Medio-basso           |
| fornacellaGrill   | 36px      | 60px    | Medio-alto            |
| mafColtello       | 33px      | 63px    | Alto                  |
| mafLupara         | 36px      | 72px    | Molto alto            |
| mafFornacella     | 33px      | 84px    | Il più alto           |

- Selezione **casuale uniforme** tra tutti i tipi (nessuna progressione di difficoltà sui tipi)

---

## 3. Fisica del Cavallo
- **Gravità:** 0.55 per frame (dt-scaled)
- **Forza salto:** -12 (impulso verticale)
- **Hitbox cavallo:** 55x78 px (con margini collision: 41x60 px effettivi)
- **Posizione:** fisso a sinistra dello schermo, ostacoli vengono verso di lui
- **Jump buffering:** se il tasto è premuto durante il volo, salta istantaneamente all'atterraggio

---

## 4. Sistema di Punteggio

### Score passivo
- **+1 punto per frame** (dt-scaled, ~60 punti/secondo a 60fps)

### Streak e Moltiplicatore
- Ogni ostacolo schivato incrementa la streak di +1
- **Moltiplicatore:** `min(1 + floor(streak / 3), 4)` → max x4
  - Streak 0-2: x1
  - Streak 3-5: x2
  - Streak 6-8: x3
  - Streak 9+: x4
- Collisione o lava del boss resetta streak e moltiplicatore a 0/x1
- Ogni 5 streak: popup visivo "STREAK x5/x10/x15..."

### Near Miss ("Minchia che culo!")
- Se il cavallo passa un ostacolo con clearance < 22px: **+50 * moltiplicatore** punti
- Popup visivo dedicato

### Arancini (collectible)
- Spawn: ogni 150 frames OPPURE 0.5% chance per frame (max 3 su schermo)
- Posizione Y: tra GROUND_Y-50 e GROUND_Y-110 (random)
- Valore: **+30 * moltiplicatore** punti

---

## 5. Boss Fight - U Liotru

### Trigger
- Ogni **10.000 punti**: `floor(score / 10000) > bossDefeated`
- Boss 1 a ~10k, Boss 2 a ~20k, Boss 3 a ~30k, ecc.

### Stats del boss
- **HP:** 3 (fisso per tutti i boss)
- **Hitbox:** 132x108 px
- **Posizione target:** 65% della larghezza canvas

### Fasi
1. **Entering:** entra da destra a 2.5 px/frame
2. **Idle:** lancia lava e aspetta
3. **Charging:** carica verso sinistra → il giocatore deve saltargli sopra
4. **Returning:** torna alla posizione target a 3.5 px/frame

### Scaling per boss sconfitti
| Boss # | Charge Speed | Lava Interval | Charge Delay         |
|--------|-------------|---------------|----------------------|
| 1      | 5.0         | 120 frames    | 250 frames           |
| 2      | 6.5         | 90 frames     | 210 frames           |
| 3      | 8.0         | 65 frames     | 170 frames           |
| 4+     | +1.5/boss   | 65 frames     | max(250-40*n, 140)   |

### Meccanica danno
- **Saltare sulla testa del boss:** -1 HP + rimbalzo (jump_force * 0.7)
- **Tocco laterale:** game over
- **Lava:** game over (resetta streak)
- Boss sconfitto: **+1000 punti**, ostacoli normali riprendono

### Durante il boss
- **Nessun ostacolo** viene spawnato
- **Nessun arancino** viene spawnato
- La velocità del gioco continua a scalare normalmente

---

## 6. Sistema Rank (titoli catanesi)

| Punteggio minimo | Titolo          |
|------------------|-----------------|
| 0                | PICCIRIDDU      |
| 200              | PICCIOTTO       |
| 500              | GUAPPO          |
| 1000             | UOMO D'ONORE    |
| 2000             | PADRINO         |
| 4000             | RE DI CATANIA   |

- Popup visivo "RANK UP" al cambio di titolo

---

## 7. Ricette Sbloccabili (10 totali)

Ogni run genera un target score random tra `minScore` e `maxScore` per ogni ricetta ancora bloccata. Al raggiungimento dello score target, la ricetta si sblocca permanentemente (localStorage).

| # | Ricetta                   | Range Score      |
|---|---------------------------|------------------|
| 1 | Arancino al Ragù          | 10 - 1.000       |
| 2 | Pasta alla Norma           | 1.000 - 2.000    |
| 3 | Granita con Brioche        | 2.000 - 3.500    |
| 4 | Cannolo Siciliano          | 3.500 - 5.000    |
| 5 | Caponata                   | 5.000 - 7.000    |
| 6 | Cartocciata                | 7.000 - 9.500    |
| 7 | Cipollina Catanese         | 9.500 - 12.000   |
| 8 | Crispelle di Riso          | 12.000 - 15.000  |
| 9 | Involtini di Pesce Spada   | 15.000 - 18.000  |
| 10| Pasta con le Sarde         | 20.000 - 21.000  |

---

## 8. Metriche chiave per l'analisi

### Punti di svolta nella difficoltà
- **Score 0-500:** Fase tutorial implicita. Velocità bassa, pochi cluster, intervalli larghi.
- **Score 500-2000:** Ramp-up principale. Velocità +20-50%, cluster al 13-23%.
- **Score 2000-6000:** Difficoltà media. Cluster raggiunge il cap (50%) a 6000. Primo boss a 10k.
- **Score 6000-10000:** Plateau della densità ostacoli. La velocità continua a salire ma più lentamente.
- **Score 10000+:** Boss fight ricorrenti. Velocità >2x base. Intervalli al minimo. Cluster al 50%.

### Fonti di punteggio stimate (per run media ~2000 punti)
- Score passivo (tempo): ~70%
- Near miss bonus: ~10%
- Arancini: ~15%
- Streak bonus: ~5%

### Fonti di punteggio stimate (per run esperta ~15000 punti)
- Score passivo (tempo): ~55%
- Boss kill bonus (+1000): ~7%
- Near miss con moltiplicatore x4: ~15%
- Arancini con moltiplicatore: ~10%
- Streak bonus accumulato: ~13%

### Possibili criticità per la progressione
1. **Nessuna differenziazione sui tipi di ostacolo** — tutti hanno la stessa probabilità indipendentemente dal punteggio. Ostacoli alti (84px) possono apparire a score 0.
2. **Cluster chance raggiunge il cap a score 6000** — dopo questo punto la densità non aumenta più, solo la velocità.
3. **Gap tra boss 1 (10k) e sblocco ricette successive** — le ultime ricette (15k-21k) richiedono partite molto lunghe.
4. **Moltiplicatore cap a x4** — i giocatori esperti con streak lunghe non vengono più premiati dopo streak 9.
5. **Score passivo domina** — il tempo di sopravvivenza conta più delle azioni del giocatore (near miss, arancini).
6. **Nessun respiro garantito dopo boss fight** — gli ostacoli riprendono immediatamente.
7. **Intervallo minimo ostacoli (28 frames) raggiunto a score 6000** — metà delle curve di difficoltà si esauriscono relativamente presto.
