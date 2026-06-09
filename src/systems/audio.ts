/** Procedural WebAudio SFX. Lazily initialized on first user gesture; no asset files. */
export class Audio {
  private ctx: AudioContext | null = null;
  enabled = true;

  /** Call from a user gesture (e.g. menu click) to satisfy autoplay policy. */
  init(): void {
    if (this.ctx || !this.enabled) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctor) this.ctx = new Ctor();
  }

  private blip(freq: number, duration: number, type: OscillatorType, gain = 0.08): void {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(env).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  hit(power: boolean): void {
    this.blip(power ? 220 : 440, power ? 0.18 : 0.08, 'square', power ? 0.12 : 0.08);
  }
  wall(): void {
    this.blip(330, 0.05, 'sine', 0.05);
  }
  goal(): void {
    this.blip(660, 0.25, 'sawtooth', 0.12);
    this.blip(990, 0.25, 'sawtooth', 0.06);
  }
  supersonic(): void {
    this.blip(880, 0.12, 'triangle', 0.07);
  }
}
