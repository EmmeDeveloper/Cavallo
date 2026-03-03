// Generate synthesized WAV music files for U Cavaddu Runner
// Creates: music_game.ogg, music_game.mp3, music_boss.ogg, music_boss.mp3

function writeUint32LE(buf, offset, val) {
  buf[offset]   = val & 0xFF;
  buf[offset+1] = (val >> 8) & 0xFF;
  buf[offset+2] = (val >> 16) & 0xFF;
  buf[offset+3] = (val >> 24) & 0xFF;
}
function writeUint16LE(buf, offset, val) {
  buf[offset]   = val & 0xFF;
  buf[offset+1] = (val >> 8) & 0xFF;
}

function noteToFreq(semitone) {
  // A4 = 440Hz at semitone 69
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

function generateGameMusic() {
  const sampleRate = 22050;
  // 8 bars at 120 BPM = 2s/bar => 16s total loop
  const bpm = 120;
  const beatDur = 60 / bpm;
  const numBars = 8;
  const totalDur = beatDur * 4 * numBars;
  const totalSamples = Math.floor(totalDur * sampleRate);

  const data = new Int16Array(totalSamples);

  // Upbeat chiptune melody in C major
  const melody = [
    // Bar 1
    [72,1],[74,1],[76,0.5],[77,0.5],[76,1],
    // Bar 2
    [74,1],[72,1],[69,1],[72,1],
    // Bar 3
    [76,1],[77,1],[79,0.5],[81,0.5],[79,1],
    // Bar 4
    [77,1],[76,1],[74,1],[76,1],
    // Bar 5
    [72,1],[74,1],[76,0.5],[79,0.5],[77,1],
    // Bar 6
    [76,1],[74,1],[72,1.5],[71,0.5],
    // Bar 7
    [72,1],[76,1],[79,1],[81,1],
    // Bar 8
    [79,1],[76,1],[72,2],
  ];

  // Bass line (8 bars, 4 beats each)
  const bass = [
    [48,4],[48,4],[52,4],[52,4],
    [48,4],[50,4],[48,4],[50,4],
  ];

  // Render melody (square wave 50% duty)
  let off = 0;
  for (const [semitone, beats] of melody) {
    const freq = noteToFreq(semitone);
    const dur = beats * beatDur;
    const n = Math.floor(dur * sampleRate);
    const period = sampleRate / freq;
    const amp = 0.3;
    for (let i = 0; i < n && off + i < totalSamples; i++) {
      const phase = (i % period) / period;
      const wave = phase < 0.5 ? 1 : -1;
      const atk = Math.min(i / (sampleRate * 0.01), 1);
      const rel = Math.min((n - i) / (sampleRate * 0.02), 1);
      data[off + i] += Math.round(wave * amp * Math.min(atk, rel) * 32767);
    }
    off += n;
  }

  // Render bass (triangle wave)
  let boff = 0;
  for (const [semitone, beats] of bass) {
    const freq = noteToFreq(semitone);
    const dur = beats * beatDur;
    const n = Math.floor(dur * sampleRate);
    const period = sampleRate / freq;
    const amp = 0.15;
    for (let i = 0; i < n && boff + i < totalSamples; i++) {
      const phase = (i % period) / period;
      const wave = phase < 0.5 ? (4 * phase - 1) : (3 - 4 * phase);
      data[boff + i] += Math.round(wave * amp * 32767);
    }
    boff += n;
  }

  // Clamp
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(-32768, Math.min(32767, data[i]));
  }

  return { data, sampleRate };
}

function generateBossMusic() {
  const sampleRate = 22050;
  // 6 bars at 140 BPM => ~10.3s loop
  const bpm = 140;
  const beatDur = 60 / bpm;
  const numBars = 6;
  const totalDur = beatDur * 4 * numBars;
  const totalSamples = Math.floor(totalDur * sampleRate);

  const data = new Int16Array(totalSamples);

  // Intense minor-scale melody (A minor)
  const melody = [
    // Bar 1
    [69,0.5],[72,0.5],[69,0.5],[68,0.5],[69,1],[67,1],
    // Bar 2
    [65,1],[64,1],[65,1],[67,0.5],[65,0.5],
    // Bar 3
    [69,1],[71,0.5],[72,0.5],[74,1],[72,1],
    // Bar 4
    [71,1],[69,1.5],[67,0.5],[65,1],
    // Bar 5
    [69,0.5],[72,0.5],[76,0.5],[79,0.5],[78,2],
    // Bar 6
    [76,1],[74,1],[72,2],
  ];

  // Driving bass
  const bass = [
    [45,0.5],[45,0.5],[48,0.5],[45,0.5],
    [43,0.5],[43,0.5],[45,0.5],[43,0.5],
    [45,0.5],[45,0.5],[48,0.5],[45,0.5],
    [43,0.5],[43,0.5],[40,0.5],[38,0.5],
    [45,0.5],[45,0.5],[48,0.5],[45,0.5],
    [43,0.5],[43,0.5],[45,1],
  ];

  // Render melody (narrow duty square = tense)
  let off = 0;
  for (const [semitone, beats] of melody) {
    const freq = noteToFreq(semitone);
    const dur = beats * beatDur;
    const n = Math.floor(dur * sampleRate);
    const period = sampleRate / freq;
    const amp = 0.28;
    for (let i = 0; i < n && off + i < totalSamples; i++) {
      const phase = (i % period) / period;
      const wave = phase < 0.3 ? 1 : -1; // 30% duty cycle = tense
      const atk = Math.min(i / (sampleRate * 0.005), 1);
      const rel = Math.min((n - i) / (sampleRate * 0.015), 1);
      data[off + i] += Math.round(wave * amp * Math.min(atk, rel) * 32767);
    }
    off += n;
  }

  // Render bass (sawtooth)
  let boff = 0;
  for (const [semitone, beats] of bass) {
    const freq = noteToFreq(semitone);
    const dur = beats * beatDur;
    const n = Math.floor(dur * sampleRate);
    const period = sampleRate / freq;
    const amp = 0.18;
    for (let i = 0; i < n && boff + i < totalSamples; i++) {
      const phase = (i % period) / period;
      const wave = 2 * phase - 1; // sawtooth
      data[boff + i] += Math.round(wave * amp * 32767);
    }
    boff += n;
  }

  // Clamp
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(-32768, Math.min(32767, data[i]));
  }

  return { data, sampleRate };
}

function makeWav(audioData, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataBytes = audioData.length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataBytes;

  const buf = Buffer.alloc(totalSize);

  buf.write('RIFF', 0);
  writeUint32LE(buf, 4, totalSize - 8);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  writeUint32LE(buf, 16, 16);
  writeUint16LE(buf, 20, 1);
  writeUint16LE(buf, 22, numChannels);
  writeUint32LE(buf, 24, sampleRate);
  writeUint32LE(buf, 28, byteRate);
  writeUint16LE(buf, 32, blockAlign);
  writeUint16LE(buf, 34, bitsPerSample);
  buf.write('data', 36);
  writeUint32LE(buf, 40, dataBytes);

  for (let i = 0; i < audioData.length; i++) {
    const sample = audioData[i];
    buf[44 + i * 2] = sample & 0xFF;
    buf[44 + i * 2 + 1] = (sample >> 8) & 0xFF;
  }

  return buf;
}

const fs = require('fs');
const path = require('path');
const audioDir = 'C:/Developer/Emmedeveloper/Cavallo/audio';

const gameMusic = generateGameMusic();
const gameMusicWav = makeWav(gameMusic.data, gameMusic.sampleRate);
fs.writeFileSync(path.join(audioDir, 'music_game.ogg'), gameMusicWav);
fs.writeFileSync(path.join(audioDir, 'music_game.mp3'), gameMusicWav);
console.log('Game music:', gameMusicWav.length, 'bytes,', (gameMusic.data.length / gameMusic.sampleRate).toFixed(1) + 's');

const bossMusic = generateBossMusic();
const bossMusicWav = makeWav(bossMusic.data, bossMusic.sampleRate);
fs.writeFileSync(path.join(audioDir, 'music_boss.ogg'), bossMusicWav);
fs.writeFileSync(path.join(audioDir, 'music_boss.mp3'), bossMusicWav);
console.log('Boss music:', bossMusicWav.length, 'bytes,', (bossMusic.data.length / bossMusic.sampleRate).toFixed(1) + 's');

console.log('Done!');
