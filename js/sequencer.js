// ============================================
//   BEATFORGE PRO - SEQUENCER
// ============================================

const Sequencer = {
    bpm: 120,
    steps: 16,
    isPlaying: false,
    currentStep: 0,
    intervalId: null,
    tracks: [],

    drumSounds: {
        'Kick': { freq: 55, decay: 0.3, pitchDrop: true },
        'Snare': { freq: 180, decay: 0.15, noise: true },
        'HiHat': { freq: 900, decay: 0.05, noise: true }
    },

    init() {
        this.addTrack('Kick');
        this.addTrack('Snare');
        this.addTrack('HiHat');
        this.render();
    },

    addTrack(sound = 'Kick') {
        this.tracks.push({
            name: sound,
            steps: new Array(this.steps).fill(false),
            muted: false
        });
        this.render();
    },

    toggleStep(trackIdx, stepIdx) {
        if (this.tracks[trackIdx]) {
            this.tracks[trackIdx].steps[stepIdx] = !this.tracks[trackIdx].steps[stepIdx];
            this.render();
        }
    },

    toggleMute(trackIdx) {
        if (this.tracks[trackIdx]) {
            this.tracks[trackIdx].muted = !this.tracks[trackIdx].muted;
            this.render();
        }
    },

    start() {
        if (!AudioEngine.audioCtx) AudioEngine.init();
        this.isPlaying = true;
        this.currentStep = 0;
        this.tick();
    },

    stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
        this.currentStep = 0;
        document.querySelectorAll('.seq-step').forEach(s => s.classList.remove('playing'));
    },

    tick() {
        if (!this.isPlaying) return;

        // Play current step
        this.playStep(this.currentStep);

        const stepTime = (60 / this.bpm) / 4;
        this.currentStep = (this.currentStep + 1) % this.steps;

        this.intervalId = setTimeout(() => this.tick(), stepTime * 1000);
    },

    playStep(step) {
        document.querySelectorAll('.seq-step').forEach(s => s.classList.remove('playing'));
        document.querySelectorAll(`[data-step="${step}"]`).forEach(el => {
            el.classList.add('playing');
        });

        // Trigger metronome if active
        if (window.metronomeActive && step % 4 === 0) {
            AudioEngine.playMetronomeTick();
        }

        this.tracks.forEach((track) => {
            if (!track.muted && track.steps[step]) {
                this.playDrum(track.name);
            }
        });
    },

    playDrum(soundName) {
        const ctx = AudioEngine.audioCtx;
        if (!ctx) return;

        const config = this.drumSounds[soundName];
        if (!config) return;

        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + config.decay);

        if (config.noise) {
            const bufferSize = ctx.sampleRate * config.decay;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.connect(gainNode);
            noise.start(now);
        } else {
            const osc = ctx.createOscillator();
            osc.frequency.setValueAtTime(config.freq, now);
            if (config.pitchDrop) {
                osc.frequency.exponentialRampToValueAtTime(config.freq * 0.1, now + config.decay);
            }
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + config.decay);
        }

        gainNode.connect(AudioEngine.masterGain);
    },

    render() {
        const grid = document.getElementById('sequencerGrid');
        if (!grid) return;
        grid.innerHTML = '';

        this.tracks.forEach((track, ti) => {
            const row = document.createElement('div');
            row.className = 'seq-track';

            const label = document.createElement('span');
            label.className = 'seq-label';
            label.textContent = track.name;
            row.appendChild(label);

            const muteBtn = document.createElement('button');
            muteBtn.className = 'seq-mute' + (track.muted ? ' muted' : '');
            muteBtn.textContent = 'M';
            muteBtn.onclick = () => this.toggleMute(ti);
            row.appendChild(muteBtn);

            const stepsContainer = document.createElement('div');
            stepsContainer.className = 'seq-steps';

            for (let s = 0; s < this.steps; s++) {
                const step = document.createElement('div');
                step.className = 'seq-step' + (track.steps[s] ? ' active' : '');
                step.setAttribute('data-step', s);
                step.onclick = () => this.toggleStep(ti, s);
                stepsContainer.appendChild(step);
            }
            row.appendChild(stepsContainer);
            grid.appendChild(row);
        });
    }
};
