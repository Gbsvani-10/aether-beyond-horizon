/**
 * Procedural Web Audio ambient soundscape, scroll-reactive wind layer & chimes for AETHER.
 * Zero external audio files required — purely synthesized via Web Audio API.
 * Muted by default until explicitly enabled by user interaction.
 */

interface WindProfile {
  baseGain: number;
  speedLift: number;
  baseFreq: number;
  freqSweep: number;
  q: number;
  shelfFreq: number;
}

const WIND_STOPS: Array<{ at: number; profile: WindProfile }> = [
  {
    // Chapter I: Mountain dawn valley breeze
    at: 0.0,
    profile: { baseGain: 0.16, speedLift: 0.28, baseFreq: 330, freqSweep: 320, q: 1.05, shelfFreq: 1150 },
  },
  {
    // Chapter II: High-altitude Floating Kingdom thermal air
    at: 0.24,
    profile: { baseGain: 0.18, speedLift: 0.26, baseFreq: 430, freqSweep: 360, q: 0.9, shelfFreq: 1350 },
  },
  {
    // Chapter III: Lost Forest canopy rustle
    at: 0.48,
    profile: { baseGain: 0.20, speedLift: 0.32, baseFreq: 285, freqSweep: 290, q: 1.45, shelfFreq: 1080 },
  },
  {
    // Chapter IV: Celestial Gate hushed cosmic drift
    at: 0.72,
    profile: { baseGain: 0.07, speedLift: 0.12, baseFreq: 210, freqSweep: 180, q: 1.15, shelfFreq: 740 },
  },
  {
    // Chapter V & VI: Final Horizon mountain summit wind
    at: 1.0,
    profile: { baseGain: 0.18, speedLift: 0.32, baseFreq: 365, freqSweep: 340, q: 1.0, shelfFreq: 1250 },
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function sampleWindProfile(progress: number): WindProfile {
  const p = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < WIND_STOPS.length - 1; i++) {
    const start = WIND_STOPS[i];
    const end = WIND_STOPS[i + 1];
    if (p >= start.at && p <= end.at) {
      const span = Math.max(0.0001, end.at - start.at);
      const t = (p - start.at) / span;
      return {
        baseGain: lerp(start.profile.baseGain, end.profile.baseGain, t),
        speedLift: lerp(start.profile.speedLift, end.profile.speedLift, t),
        baseFreq: lerp(start.profile.baseFreq, end.profile.baseFreq, t),
        freqSweep: lerp(start.profile.freqSweep, end.profile.freqSweep, t),
        q: lerp(start.profile.q, end.profile.q, t),
        shelfFreq: lerp(start.profile.shelfFreq, end.profile.shelfFreq, t),
      };
    }
  }
  return WIND_STOPS[WIND_STOPS.length - 1].profile;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];

  // Procedural ambient wind nodes
  private windSource: AudioBufferSourceNode | null = null;
  private windBandpass: BiquadFilterNode | null = null;
  private windShelf: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;

  private isEnabled = false;
  private isInitialized = false;
  private lastProgress = 0;
  private lastScrollY: number | null = null;
  private lastScrollTime = 0;
  private smoothedSpeed = 0;
  private windDecayTimer = 0;

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
    const length = Math.max(ctx.sampleRate, Math.floor(ctx.sampleRate * seconds));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet refined pink-noise filter for warm, non-harsh wind texture
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.065;
      b6 = white * 0.115926;
      data[i] = Math.max(-1, Math.min(1, pink));
    }

    // Seamless crossfade at loop boundary to avoid clicks
    const fadeSamples = Math.min(2048, Math.floor(length * 0.05));
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      const tailIdx = length - fadeSamples + i;
      data[i] = data[i] * t + data[tailIdx] * (1 - t);
    }

    return buffer;
  }

  private ensureContext(): boolean {
    if (typeof window === 'undefined') return false;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (!this.isInitialized && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, now);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(340, now);
      this.filter.Q.setValueAtTime(1.4, now);

      // Warm ambient harmonic chord (D2, A2, E3, F#3)
      const freqs = [73.42, 110.0, 164.81, 185.0];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.filter) return;
        const osc = this.ctx.createOscillator();
        const voiceGain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 1.5) * 4, now);

        voiceGain.gain.setValueAtTime(idx === 0 ? 0.28 : 0.12, now);
        osc.connect(voiceGain);
        voiceGain.connect(this.filter);
        osc.start();
        this.oscillators.push(osc);
      });

      this.filter.connect(this.masterGain);

      // Procedural ambient wind layer (filtered pink noise + slow organic LFO breathing)
      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = this.createPinkNoiseBuffer(this.ctx, 4);
      this.windSource.loop = true;

      this.windBandpass = this.ctx.createBiquadFilter();
      this.windBandpass.type = 'bandpass';
      this.windBandpass.frequency.setValueAtTime(330, now);
      this.windBandpass.Q.setValueAtTime(1.05, now);

      this.windShelf = this.ctx.createBiquadFilter();
      this.windShelf.type = 'lowpass';
      this.windShelf.frequency.setValueAtTime(1150, now);
      this.windShelf.Q.setValueAtTime(0.7, now);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.16, now);

      this.windLfo = this.ctx.createOscillator();
      this.windLfo.type = 'sine';
      this.windLfo.frequency.setValueAtTime(0.13, now);

      this.windLfoGain = this.ctx.createGain();
      this.windLfoGain.gain.setValueAtTime(55, now);

      this.windLfo.connect(this.windLfoGain);
      this.windLfoGain.connect(this.windBandpass.frequency);

      this.windSource.connect(this.windBandpass);
      this.windBandpass.connect(this.windShelf);
      this.windShelf.connect(this.windGain);
      this.windGain.connect(this.masterGain);

      this.windSource.start();
      this.windLfo.start();

      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    }

    return true;
  }

  private applyWindState(speedNorm: number, timeConstant = 0.22): void {
    if (!this.isEnabled || !this.ctx || !this.windBandpass || !this.windShelf || !this.windGain) {
      return;
    }

    const now = this.ctx.currentTime;
    const clampedSpeed = Math.max(0, Math.min(1, speedNorm));
    const profile = sampleWindProfile(this.lastProgress);

    const targetGain = profile.baseGain + clampedSpeed * profile.speedLift;
    const targetFreq = profile.baseFreq + clampedSpeed * profile.freqSweep;
    const targetQ = Math.max(0.75, profile.q - clampedSpeed * 0.32);
    const targetShelf = profile.shelfFreq + clampedSpeed * 480;

    this.windGain.gain.setTargetAtTime(targetGain, now, timeConstant);
    this.windBandpass.frequency.setTargetAtTime(targetFreq, now, timeConstant);
    this.windBandpass.Q.setTargetAtTime(targetQ, now, timeConstant);
    this.windShelf.frequency.setTargetAtTime(targetShelf, now, timeConstant);
  }

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      const ok = this.ensureContext();
      if (!ok || !this.ctx || !this.masterGain) {
        this.isEnabled = false;
        return false;
      }
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.18, now, 0.45);
      this.applyWindState(this.smoothedSpeed, 0.35);
      this.playChime(440, 0.08);
    } else if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0, now, 0.25);
    }
    return this.isEnabled;
  }

  public setScrollProgress(progress: number, scrollY?: number): void {
    const clamped = Math.max(0, Math.min(1, progress));
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const currentY = typeof scrollY === 'number' ? scrollY : clamped * 4500;

    if (this.lastScrollY !== null && this.lastScrollTime > 0) {
      const dtSec = (nowMs - this.lastScrollTime) / 1000;
      if (dtSec >= 0.008 && dtSec < 0.6) {
        const pxPerSec = Math.abs(currentY - this.lastScrollY) / dtSec;
        const instantNorm = Math.min(1, pxPerSec / 1800);
        this.smoothedSpeed = this.smoothedSpeed * 0.6 + instantNorm * 0.4;
      } else if (dtSec >= 0.6) {
        this.smoothedSpeed *= 0.25;
      }
    }

    this.lastProgress = clamped;
    this.lastScrollY = currentY;
    this.lastScrollTime = nowMs;

    if (!this.isEnabled || !this.ctx || !this.filter) return;

    // Shift harmonic pad warmth across realms: open in Floating Kingdom & Final Horizon, deeper in Forest/Gate
    const curve =
      clamped < 0.45
        ? 300 + clamped * 520
        : clamped < 0.78
          ? 534 - (clamped - 0.45) * 480
          : 375 + (clamped - 0.78) * 900;
    this.filter.frequency.setTargetAtTime(curve, this.ctx.currentTime, 0.25);

    this.applyWindState(this.smoothedSpeed, 0.16);

    if (typeof window !== 'undefined') {
      window.clearTimeout(this.windDecayTimer);
      this.windDecayTimer = window.setTimeout(() => {
        this.smoothedSpeed = 0;
        this.applyWindState(0, 0.55);
      }, 140);
    }
  }

  public playChime(freq = 587.33, volume = 0.09): void {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.005, now + 1.4);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.7);
  }

  public dispose(): void {
    if (typeof window !== 'undefined') {
      window.clearTimeout(this.windDecayTimer);
    }
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already stopped oscillators
      }
    });
    this.oscillators = [];

    [this.windSource, this.windLfo].forEach((node) => {
      if (!node) return;
      try {
        node.stop();
        node.disconnect();
      } catch {
        // Ignore already stopped nodes
      }
    });
    this.windSource = null;
    this.windLfo = null;
    this.windBandpass = null;
    this.windShelf = null;
    this.windGain = null;
    this.windLfoGain = null;

    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
    this.isEnabled = false;
    this.smoothedSpeed = 0;
    this.lastScrollY = null;
    this.lastScrollTime = 0;
  }
}

export const soundEngine = new SoundEngine();
