# U Cavaddu Runner - Piano di Refactoring Progressione

## Executive Summary

Questo documento contiene le modifiche raccomandate per bilanciare la curva di difficoltà del gioco, basate su analisi psicologica (Flow Theory, Legge di Weber) e dati di gameplay.

**Problemi principali identificati:**
- Incrementi di velocità inconsistenti (k di Weber varia da 0.04 a 0.14)
- Tempo di reazione minimo < 0.5s già a 6000 punti (sotto soglia umana)
- Plateau artificiale di difficoltà a 6000+ punti (cluster e spawn cappati)
- Ostacoli scelti casualmente senza progressione contestuale
- Nessun respiro dopo boss fight

**Obiettivo:** Mantenere il giocatore in stato di Flow fino a 10000+ punti, con progressione smooth e prevedibile.

---

## 1. FORMULA VELOCITÀ - Modifiche al `gameSpeed`

### Attuale (da sostituire)
```javascript
speed = 5.0 + 2.0 * Math.log(1 + score/800) + 0.3 * Math.sqrt(score/1500);
```

### PROPOSTA A - Formula Ibrida (CONSIGLIATA)
```javascript
function calculateSpeed(score) {
  const BASE_SPEED = 5.0;

  // Componente logaritmica: boost early-game percepibile
  const logComponent = 1.8 * Math.log(1 + score / 600);

  // Componente power: controllo crescita late-game
  const powerComponent = 0.4 * Math.pow(score / 2000, 0.65);

  return BASE_SPEED + logComponent + powerComponent;
}
```

**Velocità risultanti:**
| Score | Speed | Incremento vs 0 | Note |
|-------|-------|-----------------|------|
| 0     | 5.00  | +0%   | Tutorial implicito |
| 500   | 6.25  | +25%  | Fine fase cognitiva |
| 1000  | 7.02  | +40%  | Inizio fase associativa |
| 3000  | 8.75  | +75%  | Transizione a fase autonoma |
| 5000  | 9.75  | +95%  | Pre-primo boss |
| 10000 | 11.31 | +126% | Post-primo boss |
| 20000 | 13.15 | +163% | Mastery zone |

**Vantaggi:**
- Incremento smooth e continuo (no discontinuità)
- Crescita iniziale percepibile ma non frustrante
- Late-game controllato (evita explosion esponenziale)
- Compatibile con spawn dinamico

### PROPOSTA B - Logaritmica a Fasi (alternativa)
```javascript
function calculateSpeed(score) {
  const BASE_SPEED = 5.0;

  if (score < 1000) {
    // Early game: crescita moderata
    return BASE_SPEED + 1.5 * Math.log(1 + score / 300);
  } else {
    // Mid-late game: rallenta crescita
    const speed1000 = BASE_SPEED + 1.5 * Math.log(1 + 1000 / 300); // ~7.2
    return speed1000 + 1.2 * Math.log(1 + (score - 1000) / 800);
  }
}
```

**Vantaggi:**
- Mantiene continuità con formula attuale (logaritmica)
- Transizione soft a 1000 punti
- Più semplice da tweakare

**Scegli:** Proposta A per bilanciamento ottimale, Proposta B per continuità con design attuale.

---

## 2. SPAWN OSTACOLI - Modifiche dinamiche

### Attuale
```javascript
// Intervalli fissi che raggiungono minimo a 6000 punti
const baseInterval = Math.max(40 - Math.floor(score / 500), 28);
const variance = Math.max(80 - Math.floor(score / 400), 35);
```

**Problema:** Spawn minimo raggiunge 28 frames troppo presto, poi non scala più.

### MODIFICA 1 - Spawn Adattivo alla Velocità
```javascript
function calculateSpawnInterval(score, currentSpeed) {
  // Adatta spawn alla velocità per mantenere distanza percettiva costante
  const speedFactor = currentSpeed / 5.0; // ratio vs velocità base

  // Base interval scala inversamente con velocità
  const baseInterval = Math.max(
    Math.floor(45 / speedFactor),  // da 45 (slow) a 30 (fast)
    30  // nuovo minimo aumentato
  );

  // Variance diminuisce gradualmente
  const variance = Math.max(
    90 - Math.floor(score / 500),
    40  // nuovo minimo aumentato
  );

  return {
    min: baseInterval,
    max: baseInterval + variance
  };
}
```

**Risultato:**
- A speed 5.0 (score 0): spawn 45-135 frames → ~1.5-2.25s
- A speed 7.0 (score ~1000): spawn 32-122 frames → ~1.2-2.0s
- A speed 10.0 (score ~5000): spawn 30-110 frames → ~1.0-1.8s
- A speed 13.0 (score ~20000): spawn 30-105 frames → ~0.9-1.75s

### MODIFICA 2 - Respiro Garantito Post-Boss
```javascript
// Aggiungi questa variabile di stato
let postBossGracePeriod = 0;

// Quando sconfiggi il boss
function onBossDefeated() {
  score += 1000;
  bossDefeated++;
  postBossGracePeriod = 500; // 500 punti di respiro (~8 secondi)
  // ... resto logica
}

// Nel calcolo spawn
function getObstacleSpawnDelay(score, speed) {
  let { min, max } = calculateSpawnInterval(score, speed);

  // Durante grace period: aumenta intervalli
  if (postBossGracePeriod > 0) {
    min += 20; // +0.33s minimo
    max += 40; // +0.67s massimo
  }

  // Logica respiro 15%
  const breatherChance = 0.15;
  if (Math.random() < breatherChance) {
    return min + max + Math.random() * 50;
  }

  return min + Math.random() * (max - min);
}

// Decrementa grace period ogni frame
function updateGame(dt) {
  // ... altra logica
  if (postBossGracePeriod > 0) {
    postBossGracePeriod -= dt * 60; // assume 60 punti/sec
  }
}
```

---

## 3. CLUSTER OSTACOLI - Rimozione Cap + Breather

### Attuale
```javascript
const clusterChance = Math.min(0.5, 0.1 + score / 15000); // cap a 50%
```

**Problema:** Plateau a 6000 punti - nessuna progressione dopo.

### MODIFICA - Crescita Continua con Breather Integrati
```javascript
function shouldSpawnCluster(score, obstaclesSinceLastBreather) {
  // Rimuovi cap, rallenta crescita
  const baseClusterChance = 0.08 + (score / 25000); // raggiunge 50% a 10500

  // Breather forzato ogni N ostacoli
  const BREATHER_INTERVAL = 12;
  if (obstaclesSinceLastBreather >= BREATHER_INTERVAL) {
    return false; // forza ostacolo singolo
  }

  // Riduce chance se troppi cluster recenti
  const recentClusterPenalty = Math.min(obstaclesSinceLastBreather / BREATHER_INTERVAL, 1.0);
  const adjustedChance = baseClusterChance * recentClusterPenalty;

  return Math.random() < adjustedChance;
}

// Aggiungi tracking nel game state
let obstaclesSinceLastBreather = 0;

function spawnObstacle() {
  const isCluster = shouldSpawnCluster(score, obstaclesSinceLastBreather);

  if (isCluster) {
    // spawn cluster
    obstaclesSinceLastBreather = 0; // reset
  } else {
    obstaclesSinceLastBreather++;
  }

  // ... resto logica spawn
}
```

**Risultato:**
- Progressione continua cluster fino a 50%+ in late game
- Respiro garantito ogni ~12 ostacoli (evita "cluster storm")
- Più prevedibile e meno RNG punitivo

---

## 4. TIPOLOGIA OSTACOLI - Progressione Contestuale

### Attuale
```javascript
// Selezione casuale uniforme tra tutti i tipi
const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
```

**Problema:** Ostacoli alti (84px) possono apparire a score 0 → frustrazione early-game.

### MODIFICA - Pool Dinamico per Score
```javascript
function getObstaclePool(score) {
  const pools = {
    // Early game: solo ostacoli bassi
    early: [
      { type: 'fornacella1', weight: 3 },    // 27x36
      { type: 'fornacella2', weight: 2 }     // 30x40
    ],

    // Mid game: aggiungi medi
    mid: [
      { type: 'fornacella1', weight: 2 },
      { type: 'fornacella2', weight: 2 },
      { type: 'fornacellaGrill', weight: 2 }, // 36x60
      { type: 'mafColtello', weight: 1 }      // 33x63
    ],

    // Late game: tutti i tipi
    late: [
      { type: 'fornacella1', weight: 1 },
      { type: 'fornacella2', weight: 1 },
      { type: 'fornacellaGrill', weight: 2 },
      { type: 'mafColtello', weight: 2 },
      { type: 'mafLupara', weight: 1 },       // 36x72
      { type: 'mafFornacella', weight: 1 }    // 33x84
    ]
  };

  // Selezione pool
  if (score < 1000) return pools.early;
  if (score < 5000) return pools.mid;
  return pools.late;
}

function selectObstacleType(score) {
  const pool = getObstaclePool(score);

  // Weighted random selection
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }

  return pool[0].type; // fallback
}
```

**Vantaggi:**
- Tutorial naturale (ostacoli semplici all'inizio)
- Progressione percepibile di challenge
- Mantiene varietà senza RNG punitivo

---

## 5. SISTEMA PUNTEGGIO - Bilanciamento Agency

### Problema Attuale
- **Score passivo domina** (70% del punteggio totale)
- **Moltiplicatore cappato** a x4 (streak 9+)
- **Near miss poco incentivato** (+50 * mult)

### MODIFICA 1 - Riduzione Score Passivo
```javascript
// Attuale: +1 punto per frame (~60/sec)
// Nuovo: +0.7 punti per frame (~42/sec)
score += 0.7 * dt;
```

### MODIFICA 2 - Moltiplicatore Esteso
```javascript
function getScoreMultiplier(streak) {
  // Vecchio: min(1 + floor(streak / 3), 4) → max x4
  // Nuovo: crescita logaritmica senza cap

  if (streak < 3) return 1;
  if (streak < 10) return 1 + Math.floor(streak / 3); // x2, x3, x4

  // Oltre 10 streak: crescita logaritmica
  return 4 + Math.floor(Math.log2((streak - 9) / 3)); // x5, x6, x7...

  // Esempi:
  // streak 0-2: x1
  // streak 3-5: x2
  // streak 6-8: x3
  // streak 9-11: x4
  // streak 12-17: x5
  // streak 18-29: x6
  // streak 30+: x7+
}
```

### MODIFICA 3 - Near Miss Buff
```javascript
// Vecchio: +50 * multiplier
// Nuovo: scaling con velocità

function getNearMissBonus(currentSpeed, multiplier) {
  const baseBonus = 50;
  const speedBonus = Math.floor((currentSpeed - 5.0) * 8); // +8 per punto velocità
  return (baseBonus + speedBonus) * multiplier;
}

// A speed 5.0: +50 * mult
// A speed 8.0: +74 * mult
// A speed 11.0: +98 * mult
```

**Risultato atteso:**
- Score passivo: ~50% (invece di 70%)
- Near miss + arancini: ~30%
- Streak bonus: ~20%

---

## 6. BOSS FIGHT - Scaling Rivisto

### Attuale
```javascript
// Scaling lineare aggressivo
const chargeSpeed = 5.0 + (bossDefeated * 1.5);
const lavaInterval = Math.max(120 - (bossDefeated * 30), 65);
```

**Problema:** Boss diventa impossibile troppo presto (Boss 3+ ha charge 8.0+).

### MODIFICA - Scaling Logaritmico
```javascript
function getBossStats(bossNumber) {
  // bossNumber = 1, 2, 3, ...

  return {
    hp: 3, // fisso - modificare HP è frustrante

    // Charge speed: crescita logaritmica
    chargeSpeed: 5.0 + 2.0 * Math.log(1 + bossNumber * 0.8),
    // Boss 1: 6.17, Boss 2: 6.97, Boss 3: 7.52, Boss 4: 7.95

    // Lava interval: diminuisce ma con floor più alto
    lavaInterval: Math.max(130 - (bossNumber * 15), 80),
    // Boss 1: 115, Boss 2: 100, Boss 3: 85, Boss 4: 80 (cap)

    // Charge delay: safe zone
    chargeDelay: Math.max(280 - (bossNumber * 25), 180)
    // Boss 1: 255, Boss 2: 230, Boss 3: 205, Boss 4: 180 (cap)
  };
}
```

### MODIFICA - Respiro Post-Sconfitta (già incluso in sezione 2)
Vedi "postBossGracePeriod" sopra.

---

## 7. ARANCINI - Spawn Integrato con Difficoltà

### Attuale
```javascript
// Spawn ogni 150 frames O 0.5% chance random
// Posizione Y random tra GROUND_Y-50 e GROUND_Y-110
```

**Problema:** Spawn scollegato da progressione, altezza può essere troppo facile/difficile randomicamente.

### MODIFICA - Spawn Contestuale
```javascript
function shouldSpawnArancino(framesSinceLastArancino, currentSpeed, score) {
  const MAX_ARANCINI = 3;

  // Frequenza scala inversamente con velocità (più lento = più arancini)
  const baseInterval = 120 + (currentSpeed - 5.0) * 15; // 120 → 240 frames

  if (framesSinceLastArancino >= baseInterval) {
    return activeArancini.length < MAX_ARANCINI;
  }

  return false;
}

function getArancinoHeight(currentSpeed, score) {
  const GROUND_Y = 450; // esempio

  // Altezza aumenta con velocità (richiede timing migliore)
  const minHeight = 50 + Math.floor((currentSpeed - 5.0) * 5);  // 50 → 90+
  const maxHeight = 110 + Math.floor((currentSpeed - 5.0) * 8); // 110 → 160+

  const heightRange = maxHeight - minHeight;
  return GROUND_Y - (minHeight + Math.random() * heightRange);
}
```

**Vantaggi:**
- Arancini più rari in late game (quando schermo è caotico)
- Altezza correlata a difficoltà (più alto = più precisione richiesta)
- Bilanciato con rischio near-miss

---

## 8. RICETTE - Unlock Progressivo Garantito

### Attuale
```javascript
// Target score random tra minScore e maxScore ogni run
// Può essere frustrante se RNG è sfavorevole
```

### MODIFICA - Milestone Garantite + Bonus Random
```javascript
function initRecipes() {
  const recipes = [
    { id: 1, name: 'Arancino al Ragù', guaranteedAt: 500, bonusRange: [10, 1000] },
    { id: 2, name: 'Pasta alla Norma', guaranteedAt: 1500, bonusRange: [1000, 2000] },
    { id: 3, name: 'Granita con Brioche', guaranteedAt: 2500, bonusRange: [2000, 3500] },
    { id: 4, name: 'Cannolo Siciliano', guaranteedAt: 4000, bonusRange: [3500, 5000] },
    { id: 5, name: 'Caponata', guaranteedAt: 6000, bonusRange: [5000, 7000] },
    { id: 6, name: 'Cartocciata', guaranteedAt: 8000, bonusRange: [7000, 9500] },
    { id: 7, name: 'Cipollina Catanese', guaranteedAt: 10500, bonusRange: [9500, 12000] },
    { id: 8, name: 'Crispelle di Riso', guaranteedAt: 13000, bonusRange: [12000, 15000] },
    { id: 9, name: 'Involtini di Pesce Spada', guaranteedAt: 16000, bonusRange: [15000, 18000] },
    { id: 10, name: 'Pasta con le Sarde', guaranteedAt: 20000, bonusRange: [20000, 21000] }
  ];

  return recipes.map(r => {
    // Se già sbloccata, skip
    if (isRecipeUnlocked(r.id)) return null;

    // 50% chance di unlock garantito, 50% range bonus
    const useGuaranteed = Math.random() < 0.5;
    const targetScore = useGuaranteed 
      ? r.guaranteedAt
      : randomBetween(r.bonusRange[0], r.bonusRange[1]);

    return { ...r, targetScore };
  }).filter(r => r !== null);
}
```

**Vantaggi:**
- Almeno 50% delle ricette unlock a score prevedibile
- Mantiene elemento sorpresa con bonus range
- Evita frustrazione da RNG sfavorevole multiplo

---

## 9. METRICHE TELEMETRIA (da implementare)

Per validare le modifiche, traccia questi eventi:

```javascript
// Analitycs events da loggare
const metricsToTrack = {
  // Performance giocatore
  'run_ended': { score, cause: 'obstacle|boss|lava', duration_sec },
  'boss_encountered': { bossNumber, playerScore },
  'boss_defeated': { bossNumber, hitsToKill, duration },
  'boss_failed': { bossNumber, playerScore },

  // Progressione
  'rank_up': { newRank, score },
  'recipe_unlocked': { recipeId, score },
  'streak_milestone': { streak, multiplier, score },

  // Engagement
  'near_miss': { clearance_px, bonus_points, speed },
  'arancino_collected': { height, speed, multiplier },
  'session_start': { recipes_unlocked, best_score },
  'session_end': { runs_played, total_duration }
};
```

---

## 10. PIANO DI ROLLOUT

### Fase 1 - Quick Wins (1-2 giorni)
- [ ] Implementa formula velocità ibrida
- [ ] Aggiungi postBossGracePeriod
- [ ] Modifica pool ostacoli per score
- [ ] Test interno: 10 run fino a 5000 punti

### Fase 2 - Core Balance (3-4 giorni)
- [ ] Spawn dinamico adattivo
- [ ] Cluster con breather forzato
- [ ] Sistema punteggio ribilanciato
- [ ] Boss scaling logaritmico
- [ ] Test interno: 20 run fino a 15000 punti

### Fase 3 - Polish (2-3 giorni)
- [ ] Arancini contestuali
- [ ] Ricette con unlock garantito
- [ ] Metriche telemetria
- [ ] Playtesting esterno: 5+ tester, 50+ run totali

### Fase 4 - Tuning (ongoing)
- [ ] Analizza metriche: score mediano, % oltre 10k, cause morte
- [ ] Tweaka costanti (k velocity, spawn intervals, cluster chance)
- [ ] A/B test su modifiche controverse

---

## 11. VALORI DI RIFERIMENTO RAPIDI

Per debugging e tweaking veloce:

```javascript
// VELOCITÀ TARGET
const SPEED_BENCHMARKS = {
  tutorial: 5.0,      // score 0
  learning: 6.5,      // score 500-1000
  challenge: 8.5,     // score 3000
  mastery: 11.0,      // score 10000
  expert: 13.0        // score 20000+
};

// REACTION TIME MINIMO TARGET
const RT_TARGETS = {
  tutorial: 1.0,      // 1 secondo
  learning: 0.8,      // 0.8 secondi
  challenge: 0.6,     // 0.6 secondi
  mastery: 0.5,       // 0.5 secondi (limite umano)
  expert: 0.45        // 0.45 secondi (pro players)
};

// CLUSTER CHANCE TARGET
const CLUSTER_TARGETS = {
  tutorial: 0.10,     // 10%
  learning: 0.20,     // 20%
  challenge: 0.35,    // 35%
  mastery: 0.50,      // 50%
  expert: 0.65        // 65% (ma con breather ogni 12)
};
```

---

## 12. FAQ IMPLEMENTAZIONE

**Q: La formula ibrida è troppo complessa?**
A: No, è computazionalmente identica all'attuale (log + sqrt). Puoi pre-calcolare una lookup table per ottimizzazione.

**Q: Il grace period post-boss può essere exploitato?**
A: No, dura solo ~8 secondi (~500 punti). Impedisce morte immediata ma non permette AFK.

**Q: Il pool ostacoli dinamico riduce varietà early-game?**
A: Sì, intenzionalmente. La varietà visual c'è ancora (2-3 tipi), ma ostacoli "unfair" sono posticipati.

**Q: Perché rimuovere cap cluster?**
A: Il cap crea plateau artificiale. Con breather forzato ogni 12 ostacoli, il 65% cluster è gestibile.

**Q: Il moltiplicatore senza cap è bilanciato?**
A: Sì, la crescita logaritmica è lentissima. Per x7 servono 30+ streak (impossibile per 99% giocatori).

---

## 13. MODIFICHE OPZIONALI (Nice-to-Have)

### Adaptive Difficulty
```javascript
// Se vuoi sistema che si adatta al giocatore
let playerSkillRating = 1.0; // 0.5 = casual, 1.0 = normal, 1.5 = hardcore

function updateSkillRating(runScore, runDuration) {
  const expectedScore = runDuration * 50; // ~50 punti/sec
  const performance = runScore / expectedScore;

  // Smooth adjustment
  playerSkillRating = playerSkillRating * 0.9 + performance * 0.1;
  playerSkillRating = Math.max(0.5, Math.min(1.5, playerSkillRating));
}

// Usa nel calcolo velocità
const adjustedSpeed = calculateSpeed(score) * playerSkillRating;
```

### Visual Feedback Progression
```javascript
// Cambi visual per indicare fase di gioco
function getGamePhaseEffects(score) {
  if (score < 1000) return { bgSpeed: 1.0, intensity: 'low' };
  if (score < 5000) return { bgSpeed: 1.3, intensity: 'medium' };
  return { bgSpeed: 1.6, intensity: 'high' };
}
```

### Power-up System
```javascript
// Per dare respiro strategico
const powerups = [
  { type: 'slowmo', duration: 180, effect: 'speed * 0.5' },
  { type: 'shield', duration: 120, effect: 'invincible once' },
  { type: 'magnet', duration: 240, effect: 'auto-collect arancini' }
];
// Spawn rarità: 1% chance, max 1 attivo
```

---

## Checklist Finale

Prima di committare le modifiche:

- [ ] Backup codice attuale
- [ ] Implementa modifiche in branch separato
- [ ] Test unitari per formule (velocity, spawn, cluster)
- [ ] Playtest: almeno 5 run complete (0 → morte)
- [ ] Verifica metriche: avg score 2500+, % oltre 5k >20%
- [ ] Deploy graduale: 10% users → 50% → 100%
- [ ] Monitor crash reports e feedback

---

**Fine documento. Buon refactoring! 🏃‍♂️🐴**
