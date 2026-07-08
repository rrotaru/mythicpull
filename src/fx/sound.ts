/**
 * Synthesized UI sound — no audio assets required. Everything is generated
 * with WebAudio at trigger time: paper-tear crackle, card whooshes, and a
 * shimmer arpeggio for rare pulls. All calls originate from user gestures so
 * autoplay policies are satisfied.
 */

let ac: AudioContext | null = null;
let muted = false;

function ctx(): AudioContext | null {
  if (muted) return null;
  try {
    ac ??= new AudioContext();
    if (ac.state === 'suspended') void ac.resume();
    return ac;
  } catch {
    return null;
  }
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

function noiseBuffer(a: AudioContext, seconds: number): AudioBuffer {
  const buf = a.createBuffer(1, a.sampleRate * seconds, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Short filtered-noise crackle; intensity 0..1 scales pitch + volume. */
export function tearCrackle(intensity: number) {
  const a = ctx();
  if (!a) return;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a, 0.08);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 900 + intensity * 2400 + Math.random() * 500;
  bp.Q.value = 1.2;
  const g = a.createGain();
  g.gain.setValueAtTime(0.12 + intensity * 0.15, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.09);
  src.connect(bp).connect(g).connect(a.destination);
  src.start();
}

/** The big rip when the strip comes off. */
export function ripOpen() {
  const a = ctx();
  if (!a) return;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a, 0.4);
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(600, a.currentTime);
  bp.frequency.exponentialRampToValueAtTime(3800, a.currentTime + 0.28);
  bp.Q.value = 0.9;
  const g = a.createGain();
  g.gain.setValueAtTime(0.35, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.4);
  src.connect(bp).connect(g).connect(a.destination);
  src.start();
}

function tone(freq: number, at: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  const a = ctx();
  if (!a) return;
  const o = a.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, a.currentTime + at);
  g.gain.exponentialRampToValueAtTime(vol, a.currentTime + at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + dur);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + at);
  o.stop(a.currentTime + at + dur + 0.05);
}

/** Soft whoosh as a card flies off the stack. */
export function cardWhoosh() {
  const a = ctx();
  if (!a) return;
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a, 0.22);
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(400, a.currentTime);
  lp.frequency.exponentialRampToValueAtTime(2200, a.currentTime + 0.12);
  lp.frequency.exponentialRampToValueAtTime(300, a.currentTime + 0.22);
  const g = a.createGain();
  g.gain.setValueAtTime(0.16, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.22);
  src.connect(lp).connect(g).connect(a.destination);
  src.start();
}

/** Card flip snap. */
export function flipSnap() {
  tone(1300, 0, 0.07, 0.08, 'triangle');
  tone(1950, 0.03, 0.06, 0.05, 'triangle');
}

/** Ascending shimmer for rare/mythic reveals. */
export function rareShimmer() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((f, i) => tone(f, i * 0.07, 0.5, 0.09, 'sine'));
  notes.forEach((f, i) => tone(f * 2, 0.1 + i * 0.07, 0.35, 0.03, 'sine'));
}

/** Menu/confirm blip. */
export function uiBlip() {
  tone(880, 0, 0.08, 0.06, 'triangle');
}
