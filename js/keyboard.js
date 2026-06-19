// ============================================
//   BEATFORGE PRO - KEYBOARD
// ============================================

const Keyboard = {
    octaves: 3,
    startOctave: 3,
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('keyboard');
        if (!container) return;
        container.innerHTML = '';

        const octaveRange = parseInt(document.getElementById('keyboardOctaves')?.value || '3');
        this.octaves = octaveRange;

        let whiteKeyIndex = 0;

        for (let oct = 0; oct < this.octaves; oct++) {
            const currentOctave = this.startOctave + oct;

            this.notes.forEach((note) => {
                const isSharp = note.includes('#');
                const key = document.createElement('div');
                key.className = `kbd-key ${isSharp ? 'black' : 'white'}`;
                key.setAttribute('data-note', note);
                key.setAttribute('data-octave', currentOctave);

                key.onmousedown = (e) => {
                    e.preventDefault();
                    this.triggerKey(note, currentOctave, key);
                };

                if (isSharp) {
                    const leftOffset = (whiteKeyIndex * 45) - 13;
                    key.style.left = `${leftOffset}px`;
                    container.appendChild(key);
                } else {
                    key.style.left = `${whiteKeyIndex * 45}px`;
                    whiteKeyIndex++;
                    container.appendChild(key);
                }
            });
        }
    },

    triggerKey(note, octave, element) {
        if (element) {
            element.classList.add('pressed');
            setTimeout(() => element.classList.remove('pressed'), 150);
        }
        AudioEngine.playNote(note, octave);
        const status = document.getElementById('statusText');
        if (status) {
            status.textContent = `🎹 Playing Note: ${note}${octave} on ${AudioEngine.activeInstrument}`;
        }
    }
};
