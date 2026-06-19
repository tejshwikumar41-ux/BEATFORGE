// ============================================
//   BEATFORGE PRO - AUDIO ENGINE
// ============================================

const AudioEngine = {
    audioCtx: null,
    masterGain: null,
    analyserNode: null,

    // Instrument settings
    instruments: {
        'grand-piano': { type: 'triangle', attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.8, harmonics: [1, 0.4, 0.2] },
        'electric-piano': { type: 'sine', attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.6, harmonics: [1, 0.2] },
        'analog-synth': { type: 'sawtooth', attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.4, harmonics: [1, 0.5, 0.25] },
        'sub-bass': { type: 'sine', attack: 0.02, decay: 0.5, sustain: 0.8, release: 0.4, harmonics: [1] }
    },

    activeInstrument: 'grand-piano',

    // Effects nodes
    effects: {
        reverb: { node: null, wet: null, active: true },
        delay: { node: null, wet: null, active: false }
    },

    init() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);

        this.setupEffects();
        this.setupAnalyser();

        // Connect master gain to output
        this.masterGain.connect(this.audioCtx.destination);
    },

    setupEffects() {
        const ctx = this.audioCtx;

        // Reverb node setup
        this.effects.reverb.node = ctx.createConvolver();
        this.effects.reverb.wet = ctx.createGain();
        this.effects.reverb.wet.gain.setValueAtTime(0.25, ctx.currentTime);
        this.effects.reverb.node.buffer = this.createReverbBuffer(2, 2.5);

        // Delay node setup
        this.effects.delay.node = ctx.createDelay(1.0);
        this.effects.delay.node.delayTime.setValueAtTime(0.3, ctx.currentTime);
        this.effects.delay.wet = ctx.createGain();
        this.effects.delay.wet.gain.setValueAtTime(0.2, ctx.currentTime);

        // Feedback loop for delay
        const delayFeedback = ctx.createGain();
        delayFeedback.gain.setValueAtTime(0.4, ctx.currentTime);
        this.effects.delay.node.connect(delayFeedback);
        delayFeedback.connect(this.effects.delay.node);

        // Connect nodes
        this.effects.reverb.node.connect(this.effects.reverb.wet);
        this.effects.delay.node.connect(this.effects.delay.wet);
    },

    setupAnalyser() {
        this.analyserNode = this.audioCtx.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.masterGain.connect(this.analyserNode);
    },

    createReverbBuffer(duration, decay) {
        const sampleRate = this.audioCtx.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioCtx.createBuffer(2, length, sampleRate);
        for (let c = 0; c < 2; c++) {
            const data = buffer.getChannelData(c);
            for (let i = 0; i < length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        return buffer;
    },

    playNote(note, octave) {
        if (!this.audioCtx) this.init();
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const config = this.instruments[this.activeInstrument] || this.instruments['grand-piano'];
        const freq = this.noteToFreq(note, octave);
        const voiceGain = this.audioCtx.createGain();

        const oscs = [];
        config.harmonics.forEach((amp, i) => {
            const osc = this.audioCtx.createOscillator();
            osc.type = config.type;
            osc.frequency.setValueAtTime(freq * (i + 1), now);

            const ampGain = this.audioCtx.createGain();
            ampGain.gain.setValueAtTime(amp * 0.25, now);

            osc.connect(ampGain);
            ampGain.connect(voiceGain);
            osc.start(now);
            oscs.push(osc);
        });

        // ADSR Envelope
        voiceGain.gain.setValueAtTime(0, now);
        voiceGain.gain.linearRampToValueAtTime(1.0, now + config.attack);
        voiceGain.gain.linearRampToValueAtTime(config.sustain, now + config.attack + config.decay);

        // Connections
        voiceGain.connect(this.masterGain);

        // FX Routing
        if (this.effects.reverb.active && this.effects.reverb.node) {
            voiceGain.connect(this.effects.reverb.node);
            this.effects.reverb.wet.connect(this.audioCtx.destination);
        }
        if (this.effects.delay.active && this.effects.delay.node) {
            voiceGain.connect(this.effects.delay.node);
            this.effects.delay.wet.connect(this.audioCtx.destination);
        }

        const duration = config.attack + config.decay + 0.4;
        voiceGain.gain.setTargetAtTime(0, now + duration, config.release);

        setTimeout(() => {
            oscs.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
            voiceGain.disconnect();
        }, (duration + config.release + 1) * 1000);
    },

    noteToFreq(note, octave) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const semitone = notes.indexOf(note);
        return 440 * Math.pow(2, (semitone - 9) / 12 + (octave - 4));
    },

    setMasterVolume(val) {
        if (!this.audioCtx) this.init();
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(val / 100, this.audioCtx.currentTime, 0.01);
        }
    },

    playMetronomeTick() {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }
};
