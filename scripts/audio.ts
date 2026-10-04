/**
 * The film's sound, synthesised. Deterministic: the same code always writes
 * the same bytes.
 *
 *   public/audio/temp-bed.wav  a 120 BPM TEMP music bed in the brief's shape
 *                              (§6). It exists so the film can be built and
 *                              timed before the licensed track arrives. It is
 *                              NOT for publication.
 *   public/audio/sfx.wav       every sound effect, mixed from src/system/cues.ts.
 *
 * The bed plays the pocket synth's own pattern (`SYNTH_STEPS`) and the drum
 * machine remix's grid (`DRUM_ROWS`), so what the pages light up is what you
 * hear. Drop a licensed track at public/audio/music.wav and the film uses it
 * instead of the bed (src/Film.tsx); the SFX stay.
 */
import fs from "node:fs";
import path from "node:path";
import { rng } from "../src/system/anim";
import { CUES, type Cue } from "../src/system/cues";
import { DRUM_ROWS, SYNTH_STEPS } from "../src/system/music";
import { BPM, DOWNBEAT_OFFSET, DURATION_IN_FRAMES, FPS } from "../src/system/timeline";

const SR = 48000;
const DUR = DURATION_IN_FRAMES / FPS;
const LEN = Math.ceil(DUR * SR) + SR; // a second of tail room, trimmed on write
const TAU = Math.PI * 2;
const BEAT = 60 / BPM;
const T0 = DOWNBEAT_OFFSET / FPS;

/** Seconds at the start of a (1-indexed) bar, plus sixteenths. */
const barT = (bar: number, sixteenth = 0) => T0 + ((bar - 1) * 4 + sixteenth / 4) * BEAT;
const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

class Bus {
  L = new Float32Array(LEN);
  R = new Float32Array(LEN);
  add(i: number, v: number, pan = 0) {
    if (i < 0 || i >= LEN) return;
    this.L[i]! += v * Math.min(1, 1 - pan);
    this.R[i]! += v * Math.min(1, 1 + pan);
  }
}

const noise = (() => {
  const r = rng(1234);
  const n = new Float32Array(SR * 4);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  return (i: number) => n[((i % n.length) + n.length) % n.length]!;
})();

const lpCoef = (fc: number) => 1 - Math.exp((-TAU * Math.min(fc, SR * 0.45)) / SR);

/* ─────────────────────────────── instruments ─────────────────────────────── */

function kick(bus: Bus, t: number, g: number) {
  const s0 = Math.round(t * SR);
  let ph = 0;
  for (let i = 0; i < SR * 0.45; i++) {
    const tt = i / SR;
    ph += (TAU * (44 + 80 * Math.exp(-tt / 0.034))) / SR;
    const click = i < 48 ? noise(s0 + i) * 0.4 * (1 - i / 48) : 0;
    bus.add(s0 + i, (Math.sin(ph) * Math.exp(-tt / 0.16) + click) * g);
  }
}

function snare(bus: Bus, t: number, g: number) {
  const s0 = Math.round(t * SR);
  let prev = 0;
  for (let i = 0; i < SR * 0.3; i++) {
    const tt = i / SR;
    const n = noise(s0 * 3 + i);
    const hp = n - prev;
    prev = n;
    const v = Math.sin(TAU * 185 * tt) * Math.exp(-tt / 0.05) * 0.45 + hp * Math.exp(-tt / 0.11) * 0.55;
    bus.add(s0 + i, v * g, 0.05);
  }
}

function clap(bus: Bus, t: number, g: number) {
  const s0 = Math.round(t * SR);
  let lp = 0;
  let prev = 0;
  for (let i = 0; i < SR * 0.25; i++) {
    const tt = i / SR;
    const burst = tt < 0.03 ? Math.exp(-((tt * 1000) % 10) / 2.2) : Math.exp(-(tt - 0.03) / 0.09);
    const n = noise(s0 * 5 + i);
    lp += lpCoef(2600) * (n - lp);
    const bp = lp - prev;
    prev = lp;
    bus.add(s0 + i, bp * burst * g * 2.2, -0.1);
  }
}

function hat(bus: Bus, t: number, g: number, open = false) {
  const s0 = Math.round(t * SR);
  let p1 = 0;
  let p2 = 0;
  const len = open ? 0.32 : 0.06;
  for (let i = 0; i < SR * len; i++) {
    const tt = i / SR;
    const n = noise(s0 * 7 + i);
    const hp = n - 2 * p1 + p2;
    p2 = p1;
    p1 = n;
    bus.add(s0 + i, hp * Math.exp(-tt / (open ? 0.12 : 0.022)) * g * 0.35, 0.25);
  }
}

function bass(bus: Bus, t: number, midi: number, len: number, g: number, bright = 1) {
  const s0 = Math.round(t * SR);
  const f = hz(midi);
  let ph = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < SR * (len + 0.08); i++) {
    const tt = i / SR;
    ph = (ph + f / SR) % 1;
    const saw = ph * 2 - 1;
    const sq = ph < 0.5 ? 1 : -1;
    const x = saw * 0.6 + sq * 0.4;
    const fc = (220 + 900 * Math.exp(-tt / 0.09)) * bright;
    const a = lpCoef(fc);
    y1 += a * (x - y1);
    y2 += a * (y1 - y2);
    const env = Math.min(1, tt / 0.004) * (tt > len ? Math.exp(-(tt - len) / 0.02) : 1);
    const sub = Math.sin(TAU * f * tt) * 0.5;
    bus.add(s0 + i, (y2 + sub) * env * g);
  }
}

function pluck(bus: Bus, t: number, f: number, g: number, cutoff: number, pan = 0, decay = 0.22) {
  const s0 = Math.round(t * SR);
  let ph = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < SR * (decay * 3.5); i++) {
    const tt = i / SR;
    ph = (ph + f / SR) % 1;
    const x = ph * 2 - 1;
    const a = lpCoef(260 + cutoff * Math.exp(-tt / 0.12));
    y1 += a * (x - y1);
    y2 += a * (y1 - y2);
    bus.add(s0 + i, y2 * Math.exp(-tt / decay) * Math.min(1, tt / 0.002) * g, pan);
  }
}

function tri(bus: Bus, t: number, f: number, g: number, pan: number) {
  const s0 = Math.round(t * SR);
  for (let i = 0; i < SR * 0.4; i++) {
    const tt = i / SR;
    const ph = (f * tt) % 1;
    const v = 1 - 4 * Math.abs(ph - 0.5);
    bus.add(s0 + i, v * Math.exp(-tt / 0.09) * Math.min(1, tt / 0.003) * g, pan);
  }
}

function pad(bus: Bus, t: number, len: number, notes: number[], g: number, cutoff = 1300) {
  const s0 = Math.round(t * SR);
  const voices = notes.flatMap((m) => [-7, 0, 7].map((cents, k) => ({ f: hz(m) * Math.pow(2, cents / 1200), pan: (k - 1) * 0.5, ph: (m * 0.37 + k * 0.21) % 1 })));
  let yL = 0;
  let yR = 0;
  const a = lpCoef(cutoff);
  const rel = 0.9;
  for (let i = 0; i < SR * (len + rel); i++) {
    const tt = i / SR;
    let l = 0;
    let r = 0;
    for (const v of voices) {
      const s = ((v.ph + v.f * tt) % 1) * 2 - 1;
      l += s * (1 - v.pan);
      r += s * (1 + v.pan);
    }
    yL += a * (l - yL);
    yR += a * (r - yR);
    const env = Math.min(1, tt / 0.5) * (tt > len ? Math.exp(-(tt - len) / (rel / 3)) : 1);
    const k = (env * g) / voices.length;
    const idx = s0 + i;
    if (idx < 0 || idx >= LEN) continue;
    bus.L[idx]! += yL * k;
    bus.R[idx]! += yR * k;
  }
}

function riser(bus: Bus, t: number, len: number, g: number) {
  const s0 = Math.round(t * SR);
  let y = 0;
  let ph = 0;
  for (let i = 0; i < SR * len; i++) {
    const u = i / (SR * len);
    y += lpCoef(300 * Math.pow(30, u)) * (noise(s0 + i * 3) - y);
    ph += (TAU * (180 + 900 * u * u)) / SR;
    bus.add(s0 + i, (y * 0.8 + Math.sin(ph) * 0.12) * u * u * g, Math.sin(u * 9) * 0.3);
  }
}

function impact(bus: Bus, t: number, g: number) {
  const s0 = Math.round(t * SR);
  let y = 0;
  for (let i = 0; i < SR * 1.6; i++) {
    const tt = i / SR;
    y += lpCoef(1800 * Math.exp(-tt / 0.15) + 80) * (noise(s0 + i) - y);
    const boom = Math.sin(TAU * (38 + 30 * Math.exp(-tt / 0.08)) * tt) * Math.exp(-tt / 0.55);
    bus.add(s0 + i, (boom * 0.9 + y * Math.exp(-tt / 0.35) * 0.6) * g);
  }
}

/** A bell: inharmonic partials, long decay. */
function bell(bus: Bus, t: number, f: number, g: number, pan = 0, decay = 1.1) {
  const s0 = Math.round(t * SR);
  const partials = [
    [1, 1],
    [2.0, 0.45],
    [2.76, 0.3],
    [5.4, 0.12],
  ] as const;
  for (let i = 0; i < SR * decay * 3; i++) {
    const tt = i / SR;
    let v = 0;
    for (const [m, a] of partials) v += Math.sin(TAU * f * m * tt) * a * Math.exp((-tt * (1 + m * 0.6)) / decay);
    bus.add(s0 + i, v * Math.min(1, tt / 0.002) * g * 0.4, pan);
  }
}

/* ───────────────────────────── the temp bed ───────────────────────────── */

const CHORDS = [
  { root: 33, notes: [57, 60, 64] }, // Am
  { root: 29, notes: [57, 60, 65] }, // F
  { root: 36, notes: [55, 60, 64] }, // C
  { root: 31, notes: [55, 59, 62] }, // G
];
const chordAt = (bar: number) => CHORDS[Math.floor((bar - 1) / 2) % 4]!;

type Section = "intro" | "build" | "drop" | "groove" | "peak" | "breakdown" | "final" | "resolve" | "tail";
const section = (bar: number): Section =>
  bar <= 6 ? "intro" : bar <= 11 ? "build" : bar <= 22 ? "drop" : bar <= 43 ? "groove" : bar <= 54 ? "peak" : bar <= 66 ? "breakdown" : bar <= 71 ? "final" : bar <= 73 ? "resolve" : "tail";

/** The pocket synth's level and filter cutoff through the film. */
function synthVoice(sec: Section, bar: number): [number, number] {
  switch (sec) {
    case "intro":
      return [0.16, 500 + (bar - 5) * 250];
    case "build":
      return [0.22, 900 + (bar - 7) * 450];
    case "drop":
    case "groove":
      return [0.3, 2400];
    case "peak":
    case "final":
      return [0.3, 3200];
    case "breakdown":
      return [0.15, bar < 63 ? 520 : 600 + (bar - 63) * 600];
    case "resolve":
      return [0.2, 1400];
    case "tail":
      return [0, 0];
  }
}

function renderBed(): Bus {
  const dry = new Bus();
  const wet = new Bus(); // feeds the delay
  for (let bar = 1; bar <= 75; bar++) {
    const sec = section(bar);
    const ch = chordAt(bar);
    const full = sec === "drop" || sec === "groove" || sec === "peak" || sec === "final";

    // pad, every two bars
    if (bar % 2 === 1 && sec !== "tail") {
      const g = { intro: 0.3, build: 0.24, drop: 0.13, groove: 0.13, peak: 0.15, breakdown: 0.3, final: 0.15, resolve: 0.32, tail: 0 }[sec];
      const len = sec === "resolve" ? 7.5 : 2 * 4 * BEAT;
      pad(dry, barT(bar), len, sec === "resolve" ? CHORDS[0]!.notes : ch.notes, g, sec === "breakdown" ? 900 : 1400);
      pad(wet, barT(bar), len, sec === "resolve" ? CHORDS[0]!.notes : ch.notes, g * 0.4, 900);
    }

    for (let s = 0; s < 16; s++) {
      const t = barT(bar, s);
      // drums: the drum-machine remix's grid
      if (full) {
        if (DRUM_ROWS[0]![s]) kick(dry, t, 0.95);
        if (DRUM_ROWS[1]![s]) snare(dry, t, 0.5);
        if (DRUM_ROWS[2]![s]) hat(dry, t, 0.6);
        if (DRUM_ROWS[3]![s]) clap(dry, t, 0.42);
        if (sec === "peak" || sec === "final") {
          hat(dry, t, s % 2 ? 0.28 : 0.16);
          if (s % 4 === 2) hat(dry, t, 0.3, true);
        } else if (s % 2 === 1) hat(dry, t, 0.18);
      } else if (sec === "build") {
        if (s % 4 === 0) kick(dry, t, bar < 10 ? 0.55 : 0.8);
        if (s % 2 === 0) hat(dry, t, 0.25);
        if (bar === 10 && s % 4 === 0) snare(dry, t, 0.25);
        if (bar === 11 && s % (s < 8 ? 2 : 1) === 0) snare(dry, t, 0.18 + (s / 16) * 0.35);
      } else if (sec === "intro" && bar >= 3) {
        if (s % 4 === 2) hat(dry, t, 0.16);
      } else if (sec === "breakdown" && bar >= 63) {
        if (s % 4 === 0) kick(dry, t, 0.45 + (bar - 63) * 0.12);
        if (bar === 66 && s >= 8) snare(dry, t, 0.15 + ((s - 8) / 8) * 0.3);
      }

      // bass
      if (full && s % 2 === 0) bass(dry, t, ch.root + (s === 14 ? 12 : 0), BEAT / 2 - 0.02, 0.32);
      if (sec === "breakdown" && s === 0) bass(dry, t, ch.root, 4 * BEAT - 0.1, 0.16, 0.5);

      // the pocket synth — the page plays this
      const note = SYNTH_STEPS[s];
      if (note !== null && note !== undefined && bar >= 5 && sec !== "tail" && !(sec === "resolve" && bar > 72)) {
        const f = 110 * Math.pow(2, note / 12);
        const [g, cut] = synthVoice(sec, bar);
        if (g > 0) {
          pluck(dry, t, f, g, cut, (s % 4) * 0.08 - 0.12);
          pluck(wet, t, f, g * 0.5, cut, 0);
          if (sec === "peak" || sec === "final") pluck(dry, t, f * 2, g * 0.35, cut, 0.2, 0.14);
        }
      }

      // the peak's arp
      if (sec === "peak" || sec === "final") {
        const m = ch.notes[(s + bar) % 3]! + 12;
        tri(dry, t, hz(m), 0.09, (s % 2 ? 1 : -1) * 0.4);
        tri(wet, t, hz(m), 0.05, 0);
      }
    }
  }
  // risers into the drop, the peak and the final lift; impacts on arrival
  riser(dry, barT(10), 2 * 4 * BEAT, 0.42);
  riser(dry, barT(43), 4 * BEAT, 0.35);
  riser(dry, barT(65), 2 * 4 * BEAT, 0.42);
  impact(dry, barT(12), 0.75);
  impact(dry, barT(44), 0.55);
  impact(dry, barT(67), 0.75);
  kick(dry, barT(72), 0.9);
  impact(dry, barT(72), 0.4);

  // a ping-pong delay (3/16) for space
  const d = Math.round(((3 * BEAT) / 4) * SR);
  let lpL = 0;
  let lpR = 0;
  const a = lpCoef(2400);
  for (let i = 0; i < LEN; i++) {
    const inL = wet.L[i]! + (i >= d ? wet.R[i - d]! * 0.38 : 0);
    const inR = wet.R[i]! + (i >= d ? wet.L[i - d]! * 0.38 : 0);
    lpL += a * (inL - lpL);
    lpR += a * (inR - lpR);
    wet.L[i] = lpL;
    wet.R[i] = lpR;
  }
  for (let i = 0; i < LEN; i++) {
    dry.L[i]! += wet.L[i]! * 0.5;
    dry.R[i]! += wet.R[i]! * 0.5;
  }
  return dry;
}

/* ─────────────────────────────── the SFX ─────────────────────────────── */

function sfx(bus: Bus, c: Cue) {
  const t = c.f / FPS;
  const g = c.gain ?? 1;
  const pan = c.pan ?? 0;
  const s0 = Math.round(t * SR);
  const len = (c.dur ?? 0) / FPS;
  switch (c.sfx) {
    case "key": {
      for (let i = 0; i < SR * 0.03; i++) {
        const tt = i / SR;
        const v = noise(s0 + i * 13) * Math.exp(-tt / 0.0025) * 0.7 + Math.sin(TAU * 2900 * tt) * Math.exp(-tt / 0.006) * 0.3;
        bus.add(s0 + i, v * g * 0.55, pan);
      }
      return;
    }
    case "click": {
      for (let i = 0; i < SR * 0.05; i++) {
        const tt = i / SR;
        const v = noise(s0 + i * 11) * Math.exp(-tt / 0.0018) + Math.sin(TAU * 1700 * tt) * Math.exp(-tt / 0.012) * 0.5;
        bus.add(s0 + i, v * g * 0.5, pan);
      }
      return;
    }
    case "pop": {
      let ph = 0;
      for (let i = 0; i < SR * 0.12; i++) {
        const tt = i / SR;
        ph += (TAU * (500 + 700 * Math.min(1, tt / 0.03))) / SR;
        bus.add(s0 + i, Math.sin(ph) * Math.exp(-tt / 0.035) * g * 0.45, pan);
      }
      return;
    }
    case "snap": {
      for (let i = 0; i < SR * 0.08; i++) {
        const tt = i / SR;
        const v = noise(s0 + i * 17) * Math.exp(-tt / 0.003) * 0.8 + Math.sin(TAU * 220 * tt) * Math.exp(-tt / 0.03) * 0.6;
        bus.add(s0 + i, v * g * 0.5, pan);
      }
      return;
    }
    case "thock": {
      let ph = 0;
      let y = 0;
      for (let i = 0; i < SR * 0.4; i++) {
        const tt = i / SR;
        ph += (TAU * (62 + 70 * Math.exp(-tt / 0.03))) / SR;
        y += lpCoef(900) * (noise(s0 + i * 19) - y);
        bus.add(s0 + i, (Math.sin(ph) * Math.exp(-tt / 0.12) + y * Math.exp(-tt / 0.04) * 0.8) * g * 0.9, pan);
      }
      return;
    }
    case "pour": {
      // sand: dense, tiny, seeded grains, thinning out as the glyphs settle
      const r = rng(c.f);
      const grains = Math.round(len * 90);
      for (let k = 0; k < grains; k++) {
        const u = r();
        const gt = s0 + Math.round(Math.pow(u, 1.4) * len * SR);
        const f = 2000 + r() * 4000;
        for (let i = 0; i < SR * 0.012; i++) {
          const tt = i / SR;
          bus.add(gt + i, Math.sin(TAU * f * tt) * Math.exp(-tt / 0.002) * g * 0.25 * (1 - u * 0.6), (r() - 0.5) * 0.8);
        }
      }
      return;
    }
    case "chime": {
      // the mint: A5 then E6, a perfect fifth, bright and short
      bell(bus, t, hz(81), g * 0.9, -0.15, 0.9);
      bell(bus, t + 0.12, hz(88), g * 0.7, 0.15, 1.1);
      return;
    }
    case "shutter": {
      for (const off of [0, 0.045]) {
        const st = s0 + Math.round(off * SR);
        for (let i = 0; i < SR * 0.04; i++) {
          const tt = i / SR;
          bus.add(st + i, noise(st + i * 23) * Math.exp(-tt / 0.006) * g * 0.7, pan);
        }
      }
      return;
    }
    case "bump": {
      for (let i = 0; i < SR * 0.25; i++) {
        const tt = i / SR;
        bus.add(s0 + i, Math.sin(TAU * (95 + 40 * Math.exp(-tt / 0.02)) * tt) * Math.exp(-tt / 0.07) * g * 0.8, 0.3);
      }
      return;
    }
    case "keep": {
      // a spring up, then a soft bell: kept
      let ph = 0;
      for (let i = 0; i < SR * 0.22; i++) {
        const tt = i / SR;
        ph += (TAU * (380 + 620 * Math.min(1, tt / 0.12))) / SR;
        bus.add(s0 + i, Math.sin(ph) * Math.exp(-tt / 0.08) * g * 0.35, pan);
      }
      bell(bus, t + 0.09, hz(76), g * 0.6, 0, 1.2);
      return;
    }
    case "whoosh": {
      let y = 0;
      let z = 0;
      const total = Math.max(len, 0.2) + 0.25;
      for (let i = 0; i < SR * total; i++) {
        const u = i / (SR * total);
        const env = Math.sin(Math.PI * Math.pow(u, 0.7));
        const fc = 5000 * Math.pow(0.12, u) + 300;
        y += lpCoef(fc) * (noise(s0 + i * 29) - y);
        z += lpCoef(fc * 0.25) * (y - z);
        bus.add(s0 + i, (y - z) * env * g * 1.4, pan * (u * 2 - 1));
      }
      return;
    }
    case "scramble": {
      const n = Math.max(4, Math.round(len * 60));
      for (let k = 0; k < n; k++) {
        const st = s0 + Math.round((k / n) * len * SR);
        for (let i = 0; i < SR * 0.01; i++) {
          const tt = i / SR;
          bus.add(st + i, Math.sin(TAU * (3200 + (k % 5) * 400) * tt) * Math.exp(-tt / 0.0018) * g * 0.4, ((k % 3) - 1) * 0.3);
        }
      }
      return;
    }
    case "impact": {
      impact(bus, t, g * 0.5);
      return;
    }
  }
}

/* ───────────────────────────────── write ───────────────────────────────── */

/**
 * Soft-clip and write 16-bit stereo. `normalise` lifts or lowers to `peak`;
 * otherwise the levels stand as designed and `peak` is only a ceiling.
 */
function writeWav(file: string, bus: Bus, peak: number, normalise: boolean) {
  const n = Math.ceil(DUR * SR);
  let max = 1e-9;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const fade = Math.min(1, (n - i) / (SR * 1.5));
    L[i] = Math.tanh(bus.L[i]! * 0.9) * fade;
    R[i] = Math.tanh(bus.R[i]! * 0.9) * fade;
    max = Math.max(max, Math.abs(L[i]!), Math.abs(R[i]!));
  }
  const k = normalise || max > peak ? peak / max : 1;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i]! * k)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i]! * k)) * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  console.log(`${path.relative(process.cwd(), file)}  ${(n / SR).toFixed(2)} s`);
}

const bed = renderBed();
writeWav(path.resolve("public/audio/temp-bed.wav"), bed, 0.85, true);

const fx = new Bus();
for (const c of CUES) sfx(fx, c);
writeWav(path.resolve("public/audio/sfx.wav"), fx, 0.8, false);
