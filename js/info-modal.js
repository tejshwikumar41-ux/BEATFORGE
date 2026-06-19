// ============================================
//   BEATFORGE PRO - INFO MODAL
// ============================================

const InfoDictionary = {
    bpm: {
        title: "BPM (Beats Per Minute)",
        content: "BPM defines the tempo/speed of your musical project. 120 BPM is a standard house tempo, while trap sits around 140 BPM, and hip hop around 90 BPM."
    },
    timesig: {
        title: "Time Signature",
        content: "Time Signature determines how many beats are in each bar of music. 4/4 time is the most common standard signature, representing four quarter-note beats per bar."
    },
    key: {
        title: "Musical Key & Scale",
        content: "Selecting a musical key sets the global root note and harmonic base. Standardizing a key ensures all notes played on instruments remain perfectly in-tune."
    },
    instruments: {
        title: "Instruments Library",
        content: "Browse and select different synthesizer sounds. Grand Piano offers a rich acoustic tone, Electric Piano simulates Rhodes keys, and Analog Synth plays detuned lead frequencies."
    },
    notes: {
        title: "Notes Pad",
        content: "Quickly play individual note frequencies mapped to your selected root key, octave register, and musical scale template."
    },
    effects: {
        title: "Effects Rack",
        content: "Chain effects to alter sound design textures. Reverb simulates room acoustics, while Delay repeats echoes to add spatial depth to your outputs."
    },
    reverb: {
        title: "Reverb Effect",
        content: "Adds artificial space/ambience simulating natural acoustic halls. Adjust mix levels to balance wet/dry signals."
    },
    delay: {
        title: "Delay Echo Effect",
        content: "Repeats audio signals in a feedback loop. Ideal for creating rhythmic echoes and trailing soundscapes."
    },
    library: {
        title: "Drum Kits & Pads",
        content: "Play and record live percussion beats. Change kits between Trap and Acoustic setups to swap underlying drum synthesizers."
    },
    analyzer: {
        title: "Frequency Spectrum Analyzer",
        content: "Visualizes live frequency spectrum bins. View low bass frequencies on the left, mids in the center, and high frequencies on the right."
    }
};

function showInfo(topic) {
    const data = InfoDictionary[topic];
    if (!data) return;

    const modal = document.getElementById('infoModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (modal && title && body) {
        title.textContent = data.title;
        body.textContent = data.content;
        modal.style.display = 'flex';
    }
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('infoModal');
    if (e.target === modal) {
        closeInfoModal();
    }
});
