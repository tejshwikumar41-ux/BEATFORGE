// ============================================
//   BEATFORGE PRO - MIXER
// ============================================

const Mixer = {
    init() {
        this.render();
    },

    render() {
        const consoleEl = document.getElementById('mixerConsole');
        if (!consoleEl) return;
        consoleEl.innerHTML = '';

        // Add Master Channel
        this.addStrip(consoleEl, 'Master', 80, true);

        // Add Sequencer Track Channels
        Sequencer.tracks.forEach((track, index) => {
            this.addStrip(consoleEl, track.name, 80, false, index);
        });
    },

    addStrip(parent, name, value, isMaster, index = 0) {
        const strip = document.createElement('div');
        strip.className = 'mixer-strip';

        const title = document.createElement('div');
        title.className = 'strip-name';
        title.textContent = name;
        strip.appendChild(title);

        const fader = document.createElement('div');
        fader.className = 'strip-fader';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = value;
        slider.oninput = (e) => {
            const display = strip.querySelector('.strip-vol-display');
            if (display) display.textContent = e.target.value + '%';
            if (isMaster) {
                AudioEngine.setMasterVolume(e.target.value);
            }
        };

        const volDisplay = document.createElement('div');
        volDisplay.className = 'strip-vol-display';
        volDisplay.textContent = value + '%';

        fader.appendChild(slider);
        fader.appendChild(volDisplay);
        strip.appendChild(fader);

        if (!isMaster) {
            const mute = document.createElement('button');
            mute.className = 'strip-mute';
            mute.textContent = 'Mute';
            mute.onclick = () => {
                mute.classList.toggle('muted');
                Sequencer.toggleMute(index);
            };
            strip.appendChild(mute);
        }

        parent.appendChild(strip);
    }
};
