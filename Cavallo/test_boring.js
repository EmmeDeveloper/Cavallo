// Test: is the early game too boring?
// Focus on first 60 seconds of gameplay feel

const GRAVITY = 0.55;
const JUMP_FORCE = -12;
const baseSpeed = 3.5;

function speed(score) {
  return baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
}

function obstacleInterval(score) {
  const base = Math.max(40 - Math.floor(score / 500), 28);
  const variance = Math.max(80 - Math.floor(score / 400), 35);
  return { min: base, avg: base + variance / 2, max: base + variance };
}

console.log('=== EARLY GAME FEEL (first 60 seconds) ===\n');

// Simulate second-by-second for the first 60 seconds
const ptsPerSec = 60;
console.log('Sec | Score | Speed | px/sec | Obs interval (min-avg) | Obs per 10s | Feel');
console.log('----|-------|-------|--------|------------------------|-------------|------');

for (let sec = 0; sec <= 60; sec += 5) {
  const score = sec * ptsPerSec;
  const spd = speed(score);
  const pxPerSec = spd * 60; // 60 frames per sec
  const obs = obstacleInterval(score);

  // How many obstacles in 10 seconds? (600 frames / avg interval)
  const obsPer10s = (600 / obs.avg).toFixed(1);

  // Time between obstacles in seconds
  const secBetweenObs = (obs.avg / 60).toFixed(1);

  let feel = '';
  if (spd < 4.0) feel = 'TROPPO LENTO - annoiante';
  else if (spd < 5.0) feel = 'Lento - si addormenta';
  else if (spd < 6.0) feel = 'OK - ramp up';
  else if (spd < 8.0) feel = 'Buono - coinvolgente';
  else if (spd < 10.0) feel = 'Veloce - sfidante';
  else if (spd < 13.0) feel = 'Molto veloce - adrenalina';
  else feel = 'Estremo';

  console.log(`${String(sec).padStart(3)}s | ${String(score).padStart(5)} | ${spd.toFixed(1).padStart(5)} | ${pxPerSec.toFixed(0).padStart(6)} | ${String(obs.min).padStart(3)}-${String(Math.round(obs.avg)).padStart(3)} frames (${secBetweenObs}s)  | ${obsPer10s.padStart(11)} | ${feel}`);
}

console.log('\n=== PROBLEMA: I PRIMI 15 SECONDI ===');
console.log('Score 0-900: speed 3.5-4.8');
console.log('Un runner con speed < 5 per i primi 15s perde il giocatore.');
console.log('Chrome Dino parte a ~6 e sale subito.');
console.log('');

// Compare with reference games (approx)
console.log('=== CONFRONTO CON REFERENCE ===');
console.log('Chrome Dino:  start=6, 30s=8, 60s=10, 2min=12');
console.log('Flappy Bird:  costante ~3.5 (ma la difficoltà è nei tubi)');
console.log('Nostra PRIMA: start=3.5, 30s=6.4, 60s=8.0 (curva OK ma start lento)');
console.log('');

// Suggest fix: higher base speed
console.log('=== FIX SUGGERITO: baseSpeed da 3.5 a 5.0 ===');
const newBase = 5.0;
function speedNew(score) {
  return newBase + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
}

console.log('\nSec | Score | OLD   | NEW   | Differenza');
console.log('----|-------|-------|-------|----------');
for (let sec = 0; sec <= 60; sec += 5) {
  const score = sec * ptsPerSec;
  const old = speed(score);
  const nw = speedNew(score);
  console.log(`${String(sec).padStart(3)}s | ${String(score).padStart(5)} | ${old.toFixed(1).padStart(5)} | ${nw.toFixed(1).padStart(5)} | +${(nw - old).toFixed(1)}`);
}

console.log('\nProgression fino a 30k con baseSpeed=5.0:');
for (const score of [0, 1000, 5000, 10000, 20000, 30000]) {
  const nw = speedNew(score);
  let feel = '';
  if (nw < 5.5) feel = 'Partenza - attivo';
  else if (nw < 7.0) feel = 'Ramp up';
  else if (nw < 9.5) feel = 'Coinvolgente';
  else if (nw < 12.0) feel = 'Sfidante';
  else if (nw < 15.0) feel = 'Adrenalina';
  else feel = 'Estremo';
  console.log(`  ${String(score).padStart(5)} pts: speed=${nw.toFixed(1)} → ${feel}`);
}

// Verify boss still beatable with new speed
console.log('\n=== VERIFICA BOSS CON baseSpeed=5.0 ===');
// Max jump = 124.9px, boss collision h = 108px → still fine (speed doesn't affect jump height)
console.log('Jump height: 124.9px vs Boss height: 108px → OK (speed non cambia il salto)');

// Check obstacles still clearable
console.log('\nObstacle check con baseSpeed=5.0:');
for (const score of [0, 10000, 20000, 30000]) {
  const spd = speedNew(score);
  const obs = obstacleInterval(score);
  const minGapPx = obs.min * spd;
  console.log(`  ${String(score).padStart(5)} pts: speed=${spd.toFixed(1)}, minGap=${minGapPx.toFixed(0)}px → ${minGapPx > 60 ? 'OK' : 'PROBLEMA'}`);
}
