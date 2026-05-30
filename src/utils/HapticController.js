class HapticController {
  constructor() {
    this.ctx = null;
    this.ambientHumOsc = null;
    this.ambientHumGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.startAmbientHum();
    } catch (e) {
      console.warn("Web Audio API not supported on this browser.", e);
    }
  }

  playClick(pitch = 1800, duration = 0.015) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playChime() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Ascending high-fidelity dual synth tone
    const playNote = (freq, startTime, duration) => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.5, startTime); // Fifth harmonic

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    // Quick tech arpeggio: C5 -> E5 -> G5 -> C6
    playNote(523.25, now, 0.25);
    playNote(659.25, now + 0.06, 0.25);
    playNote(783.99, now + 0.12, 0.25);
    playNote(1046.50, now + 0.18, 0.40);
  }

  playWarning() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.15);

    // Apply lowpass filter to make it sound muffled/retro
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.2);
  }

  startAmbientHum() {
    if (!this.ctx || this.ambientHumOsc) return;

    const now = this.ctx.currentTime;
    this.ambientHumOsc = this.ctx.createOscillator();
    this.ambientHumGain = this.ctx.createGain();

    this.ambientHumOsc.type = 'sine';
    this.ambientHumOsc.frequency.setValueAtTime(55, now); // Low A hum (55Hz)

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);

    this.ambientHumGain.gain.setValueAtTime(0.015, now); // Very quiet

    this.ambientHumOsc.connect(filter);
    filter.connect(this.ambientHumGain);
    this.ambientHumGain.connect(this.ctx.destination);

    this.ambientHumOsc.start();
  }

  setHumIntensity(active = false) {
    this.init();
    if (!this.ctx || !this.ambientHumGain) return;

    const targetGain = active ? 0.03 : 0.015;
    const targetFreq = active ? 60 : 55; // Pitch shift slightly when active
    const now = this.ctx.currentTime;

    this.ambientHumGain.gain.linearRampToValueAtTime(targetGain, now + 0.5);
    if (this.ambientHumOsc) {
      this.ambientHumOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.5);
    }
  }
}

export const haptic = new HapticController();
