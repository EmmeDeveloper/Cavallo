// Programmatic balance test for U Cavaddu Runner
// Simulates game physics and checks for issues up to 30k score

const GRAVITY = 0.55;
const JUMP_FORCE = -12;
const HORSE_W = 55;
const HORSE_H = 78;
const baseSpeed = 3.5;

// === TEST 1: Speed progression ===
console.log('=== TEST 1: SPEED PROGRESSION ===');
const checkpoints = [0, 500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];
for (const score of checkpoints) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  const pxPerFrame = speed; // at dt=1 (60fps)
  console.log(`  Score ${String(score).padStart(5)}: speed=${speed.toFixed(2)}, px/frame=${pxPerFrame.toFixed(1)}`);
}

// === TEST 2: Jump arc analysis ===
console.log('\n=== TEST 2: JUMP ARC ===');
let vy = JUMP_FORCE;
let y = 0; // relative to ground (0 = ground)
let maxHeight = 0;
let airFrames = 0;
const jumpArc = [];
while (y <= 0 || vy < 0) {
  vy += GRAVITY;
  y += vy;
  airFrames++;
  if (y < maxHeight) maxHeight = y;
  jumpArc.push({ frame: airFrames, y: -y, vy: vy.toFixed(2) });
  if (y >= 0 && vy > 0) break;
}
console.log(`  Max jump height: ${(-maxHeight).toFixed(1)}px`);
console.log(`  Total air frames: ${airFrames}`);
console.log(`  Time in air at 60fps: ${(airFrames / 60).toFixed(2)}s`);

// === TEST 3: Jump height vs Boss height ===
console.log('\n=== TEST 3: JUMP vs BOSS ===');
const bossH_collision = 108; // boss.h (body top for collision)
const bossH_visual = 24 * 6; // 144px (full visual with ears)
const headZone = 45;
const jumpHeight = -maxHeight;
console.log(`  Horse max jump: ${jumpHeight.toFixed(1)}px`);
console.log(`  Boss collision height: ${bossH_collision}px`);
console.log(`  Boss visual height: ${bossH_visual}px`);
console.log(`  Head zone: ${headZone}px (top of boss)`);
console.log(`  Margin to clear boss body: ${(jumpHeight - bossH_collision).toFixed(1)}px`);
console.log(`  Can horse reach head? ${jumpHeight >= bossH_collision - headZone ? 'YES' : 'NO'}`);
console.log(`  Can horse clear boss entirely? ${jumpHeight >= bossH_collision ? 'YES' : 'NO'}`);

// === TEST 4: Horizontal distance during jump at various speeds ===
console.log('\n=== TEST 4: HORIZONTAL TRAVEL DURING JUMP (obstacle dodge window) ===');
const testScores = [0, 500, 2000, 5000, 10000, 15000, 20000, 30000];
for (const score of testScores) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  const hDist = speed * airFrames; // how far obstacles move during one jump
  console.log(`  Score ${String(score).padStart(5)}: speed=${speed.toFixed(1)}, obstacle travel=${hDist.toFixed(0)}px in ${airFrames} frames`);
}

// === TEST 5: Obstacle spacing feasibility ===
console.log('\n=== TEST 5: OBSTACLE SPACING vs JUMP CLEARANCE ===');
for (const score of testScores) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  const base = Math.max(40 - Math.floor(score / 500), 28);
  const variance = Math.max(80 - Math.floor(score / 400), 35);
  const minInterval = base;
  const maxInterval = base + variance;
  const avgInterval = base + variance / 2;

  const minGapPx = minInterval * speed;
  const maxGapPx = maxInterval * speed;
  const avgGapPx = avgInterval * speed;

  // Max obstacle width is ~36px (fornacellaGrill)
  const maxObsW = 36;
  const jumpHorizDist = speed * airFrames;

  // Can the horse jump and clear an obstacle before the next one arrives?
  const clearable = minGapPx > maxObsW + 20; // need at least obstacle width + margin
  const multipleJumps = minGapPx > jumpHorizDist; // is there room to land between obstacles

  console.log(`  Score ${String(score).padStart(5)}: interval=[${minInterval}-${maxInterval}] frames, gap=[${minGapPx.toFixed(0)}-${maxGapPx.toFixed(0)}]px, jumpDist=${jumpHorizDist.toFixed(0)}px, clearable=${clearable}, landBetween=${multipleJumps}`);
}

// === TEST 6: Boss charge speed vs jump timing ===
console.log('\n=== TEST 6: BOSS CHARGE TIMING ===');
for (let bossNum = 0; bossNum < 4; bossNum++) {
  const chargeSpeed = 5 + bossNum * 1.5;
  const chargeDelay = Math.max(250 - bossNum * 40, 140);

  let lavaInterval;
  if (bossNum === 0) lavaInterval = 120;
  else if (bossNum === 1) lavaInterval = 90;
  else lavaInterval = 65;

  const lavasBeforeCharge = Math.floor(chargeDelay / lavaInterval);

  // How many frames for boss to cross screen (from ~65% to horse at x=160)
  const canvasW = 960;
  const bossStartX = canvasW * 0.65;
  const horseX = 160;
  const distToHorse = bossStartX - horseX;
  const framesToReachHorse = distToHorse / chargeSpeed;
  const secondsToReachHorse = framesToReachHorse / 60;

  // Horse needs to be in the air when boss arrives
  // Jump takes airFrames frames. Horse needs to jump before boss arrives.
  const jumpWindow = framesToReachHorse; // frames available to react and jump

  console.log(`  Boss #${bossNum + 1}: chargeSpeed=${chargeSpeed}, delay=${chargeDelay}f, lavaInterval=${lavaInterval}f`);
  console.log(`    Lavas before charge: ${lavasBeforeCharge}`);
  console.log(`    Frames to reach horse: ${framesToReachHorse.toFixed(0)} (${secondsToReachHorse.toFixed(2)}s)`);
  console.log(`    Jump takes: ${airFrames} frames (${(airFrames/60).toFixed(2)}s)`);
  console.log(`    Reaction window: ${(framesToReachHorse - airFrames).toFixed(0)} frames (${((framesToReachHorse - airFrames)/60).toFixed(2)}s)`);
  console.log(`    Feasible: ${framesToReachHorse > airFrames ? 'YES' : 'NO - TOO FAST'}`);
}

// === TEST 7: Lava speed vs dodge window ===
console.log('\n=== TEST 7: LAVA DODGE WINDOW ===');
const lavaSpeed = 4;
const lavaW = 20;
const horseHitboxW = HORSE_W - 14; // 41px
for (let bossNum = 0; bossNum < 4; bossNum++) {
  // Lava travels from boss (~65% screen) to horse (x=160)
  const canvasW = 960;
  const bossX = canvasW * 0.65;
  const horseX = 160;
  const dist = bossX - horseX;
  const framesToReach = dist / lavaSpeed;
  const reactionTime = framesToReach / 60;

  // Horse needs to jump to clear lava. Lava is ground-level, w=20, h=20.
  // Horse must be above 20px when lava passes
  // How many frames is the horse above 20px during a jump?
  let framesAbove20 = 0;
  let vy2 = JUMP_FORCE;
  let y2 = 0;
  while (true) {
    vy2 += GRAVITY;
    y2 += vy2;
    if (y2 >= 0 && vy2 > 0) break;
    if (-y2 > 20) framesAbove20++;
  }

  console.log(`  Boss #${bossNum + 1}: lava reaches horse in ${framesToReach.toFixed(0)}f (${reactionTime.toFixed(2)}s), horse above lava for ${framesAbove20} frames`);
}

// === TEST 8: Score timeline ===
console.log('\n=== TEST 8: SCORE TIMELINE (estimated) ===');
// score += Math.round(dt) where dt ≈ 1 at 60fps → ~60 pts/sec
const ptsPerSec = 60;
const milestones = [500, 1000, 2000, 5000, 10000, 15000, 20000, 30000];
for (const m of milestones) {
  const secs = m / ptsPerSec;
  const mins = Math.floor(secs / 60);
  const remSecs = Math.floor(secs % 60);
  console.log(`  ${String(m).padStart(5)} pts: ~${mins}m ${String(remSecs).padStart(2)}s`);
}

// === TEST 9: Cluster obstacle feasibility ===
console.log('\n=== TEST 9: CLUSTER FEASIBILITY ===');
for (const score of [0, 5000, 10000, 20000, 30000]) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  const clusterChance = Math.min(0.5, 0.1 + score / 15000);
  const tripleChance = 0.3 + score / 30000;

  // Worst case: 3 obstacles of max width (36px) with min gap (4px)
  const worstClusterW = 3 * 36 + 2 * 4; // 116px
  const jumpCoverDist = speed * airFrames;
  const canJumpOver = jumpCoverDist > worstClusterW;

  console.log(`  Score ${String(score).padStart(5)}: clusterChance=${(clusterChance*100).toFixed(0)}%, tripleChance=${(tripleChance*100).toFixed(0)}%, worstClusterW=${worstClusterW}px, jumpDist=${jumpCoverDist.toFixed(0)}px, clearable=${canJumpOver}`);
}

// === SUMMARY ===
console.log('\n=== SUMMARY: POTENTIAL ISSUES ===');
let issues = 0;

// Check speed doesn't make game unplayable
for (const score of checkpoints) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  if (speed > 25) {
    console.log(`  [WARN] Speed at ${score} is ${speed.toFixed(1)} - may be too fast`);
    issues++;
  }
}

// Check boss is beatable
for (let bossNum = 0; bossNum < 4; bossNum++) {
  const chargeSpeed = 5 + bossNum * 1.5;
  const bossStartX = 960 * 0.65;
  const framesToReach = (bossStartX - 160) / chargeSpeed;
  if (framesToReach <= airFrames) {
    console.log(`  [CRITICAL] Boss #${bossNum + 1} charges too fast! ${framesToReach.toFixed(0)} frames < ${airFrames} airframes`);
    issues++;
  }
}

// Check obstacles are dodgeable
for (const score of [10000, 20000, 30000]) {
  const speed = baseSpeed + 2.0 * Math.log(1 + score / 800) + 0.3 * Math.sqrt(score / 1500);
  const base = Math.max(40 - Math.floor(score / 500), 28);
  const minGapPx = base * speed;
  if (minGapPx < 60) {
    console.log(`  [CRITICAL] Obstacles at ${score} pts: min gap only ${minGapPx.toFixed(0)}px - impossible to dodge`);
    issues++;
  }
}

if (issues === 0) {
  console.log('  No critical issues found! Game should be playable to 30k.');
} else {
  console.log(`  Found ${issues} issue(s) that need fixing.`);
}
