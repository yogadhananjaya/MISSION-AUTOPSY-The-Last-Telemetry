/* antislop: Zero-asset procedural Web Audio music generator; lightweight synth loops without bulky external MP3 files */

type MusicTheme = 'menu' | 'story' | 'coop';

class ProceduralMusicEngine {
  private ctx: AudioContext | null = null;
  private currentTheme: MusicTheme | null = null;
  private volume: number = 0.25;
  private masterGain: GainNode | null = null;
  private intervalTimer: ReturnType<typeof setInterval> | null = null;
  private currentPhase: number = 1;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedVol = localStorage.getItem('orbita:music_vol');
      if (savedVol !== null) this.volume = parseFloat(savedVol);
      const savedMute = localStorage.getItem('orbita:music_mute');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public play(theme: MusicTheme) {
    if (typeof window === 'undefined') return;
    this.initCtx();
    if (this.currentTheme === theme && this.intervalTimer) return;
    this.stop();
    this.currentTheme = theme;

    let step = 0;
    const getBpm = () => {
      if (theme === 'menu') return 70;
      if (theme === 'story') return 84;
      return 104 + 6 * Math.max(0, this.currentPhase - 1);
    };

    const notes = {
      menu: [146.83, 174.61, 220.00, 261.63, 220.00, 174.61], // D minor arpeggio (D3, F3, A3, C4)
      story: [220.00, 261.63, 329.63, 392.00, 329.63, 261.63], // A minor tense (A3, C4, E4, G4)
      coop: [164.81, 196.00, 246.94, 293.66, 329.63, 246.94], // E minor pulse (E3, G3, B3, D4, E4)
    }[theme];

    const tickMs = () => (60000 / getBpm()) / 2; // 8th note

    const scheduleNote = () => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const freq = notes[step % notes.length];
      step++;

      try {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = theme === 'menu' ? 'sine' : theme === 'story' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(theme === 'coop' ? 1200 : 700, this.ctx.currentTime);

        const duration = 0.22;
        noteGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch {}
    };

    this.intervalTimer = setInterval(scheduleNote, tickMs());
  }

  public stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    this.currentTheme = null;
  }

  public setPhase(phase: number) {
    this.currentPhase = phase;
    if (this.currentTheme === 'coop') {
      // Re-trigger loop with updated BPM
      this.play('coop');
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbita:music_vol', String(this.volume));
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbita:music_mute', String(this.isMuted));
    }
    return this.isMuted;
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }
}

export const musicEngine = new ProceduralMusicEngine();
