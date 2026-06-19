// ============================================
//   BEATFORGE PRO - MAIN APPLICATION ENGINE
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    // Initialise audio on user interaction
    document.addEventListener('click', () => {
        if (!AudioEngine.audioCtx) {
            AudioEngine.init();
            Analyzer.init();
        }
    }, { once: true });

    // Initialise sequencer, keyboard, mixer and dynamic UI pads
    Sequencer.init();
    Keyboard.init();
    Mixer.init();
    renderNotesPad();
    generateDrumPads();
});

// Sidebar panel tabs
function showPanel(panelId) {
    document.querySelectorAll('.panel-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.panel-content').forEach(content => content.classList.remove('active'));

    const activeTab = Array.from(document.querySelectorAll('.panel-tab')).find(button => {
        if (panelId === 'instruments' && button.textContent.includes('🎸')) return true;
        if (panelId === 'sounds' && button.textContent.includes('🎵')) return true;
        if (panelId === 'effects' && button.textContent.includes('🎚')) return true;
        if (panelId === 'library' && button.textContent.includes('📚')) return true;
        if (panelId === 'analyzer' && button.textContent.includes('📊')) return true;
        return false;
    });
    if (activeTab) activeTab.classList.add('active');

    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) panel.classList.add('active');
}

// Main content tabs
function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const activeTab = Array.from(document.querySelectorAll('.tab')).find(button => button.textContent.toLowerCase().includes(tabId));
    if (activeTab) activeTab.classList.add('active');

    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.classList.add('active');
}

// bpm control
function changeBpm(amount) {
    const bpmInput = document.getElementById('bpmInput');
    if (bpmInput) {
        const newVal = Math.max(30, Math.min(300, parseInt(bpmInput.value) + amount));
        bpmInput.value = newVal;
        setBpm(newVal);
    }
}

function setBpm(val) {
    Sequencer.bpm = parseInt(val);
    showToast(`BPM set to ${val}`);
}

// play transport
function togglePlay() {
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    if (Sequencer.isPlaying) {
        Sequencer.stop();
        if (playBtn) playBtn.classList.remove('playing');
        if (playIcon) playIcon.textContent = '▶';
        showToast('Playback stopped');
    } else {
        Sequencer.start();
        if (playBtn) playBtn.classList.add('playing');
        if (playIcon) playIcon.textContent = '⏸';
        showToast('Playback started');
    }
}

function stopAll() {
    Sequencer.stop();
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    if (playBtn) playBtn.classList.remove('playing');
    if (playIcon) playIcon.textContent = '▶';
    showToast('All audio stopped');
}

function rewindAll() {
    stopAll();
    showToast('Rewound to start');
}

// Metronome toggle
window.metronomeActive = false;
function toggleMetronome() {
    window.metronomeActive = !window.metronomeActive;
    const btn = document.getElementById('metronomeBtn');
    if (btn) btn.classList.toggle('active', window.metronomeActive);
    showToast(`Metronome ${window.metronomeActive ? 'enabled' : 'disabled'}`);
}

// Loop toggle
window.loopActive = true;
function toggleLoop() {
    window.loopActive = !window.loopActive;
    const btn = document.getElementById('loopBtn');
    if (btn) btn.classList.toggle('active', window.loopActive);
    showToast(`Loop ${window.loopActive ? 'enabled' : 'disabled'}`);
}

// select instruments
function selectInstrument(inst) {
    AudioEngine.activeInstrument = inst;
    document.querySelectorAll('.inst-item').forEach(item => item.classList.remove('active'));
    const activeEl = document.querySelector(`[data-inst="${inst}"]`);
    if (activeEl) activeEl.classList.add('active');

    const status = document.getElementById('statusText');
    if (status) status.textContent = `🎸 Selected instrument: ${inst.toUpperCase()}`;
}

// Instrument category toggles
function toggleCategory(catId) {
    const cat = document.getElementById(`cat-${catId}`);
    if (cat) {
        cat.classList.toggle('collapsed');
        const items = cat.querySelector('.category-items');
        if (items) {
            items.style.display = items.style.display === 'none' ? 'flex' : 'none';
        }
        const arrow = cat.querySelector('.cat-arrow');
        if (arrow) {
            arrow.textContent = arrow.textContent === '▼' ? '▶' : '▼';
        }
    }
}

function filterInstruments() {
    const query = document.getElementById('instSearch')?.value.toLowerCase() || '';
    document.querySelectorAll('.inst-item').forEach(item => {
        const name = item.querySelector('.inst-name')?.textContent.toLowerCase() || '';
        const desc = item.querySelector('.inst-desc')?.textContent.toLowerCase() || '';
        if (name.includes(query) || desc.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Scales Mapping
const Scales = {
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    blues: [0, 3, 5, 6, 7, 10]
};

function renderNotesPad() {
    const pad = document.getElementById('notesPad');
    if (!pad) return;
    pad.innerHTML = '';

    const rootIdx = document.getElementById('rootNote')?.selectedIndex || 0;
    const notesArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const scaleType = document.getElementById('scaleSelect')?.value || 'chromatic';
    const scaleIntervals = Scales[scaleType] || Scales.chromatic;
    const octave = parseInt(document.getElementById('noteOctave')?.value || '3');

    scaleIntervals.forEach(interval => {
        const idx = (rootIdx + interval) % 12;
        const note = notesArray[idx];
        const btn = document.createElement('button');
        btn.className = 'note-btn';
        if (note.includes('#')) btn.classList.add('sharp');
        btn.textContent = note + octave;
        btn.onclick = () => {
            AudioEngine.playNote(note, octave);
        };
        pad.appendChild(btn);
    });

    renderChordsPad(notesArray, rootIdx, octave);
}

function renderChordsPad(notesArray, rootIdx, octave) {
    const chordsPad = document.getElementById('chordsPad');
    if (!chordsPad) return;
    chordsPad.innerHTML = '';

    const chordTypes = [
        { name: 'I', intervals: [0, 4, 7] },
        { name: 'ii', intervals: [2, 5, 9] },
        { name: 'iii', intervals: [4, 7, 11] },
        { name: 'IV', intervals: [5, 9, 12] },
        { name: 'V', intervals: [7, 11, 14] },
        { name: 'vi', intervals: [9, 12, 16] }
    ];

    chordTypes.forEach(chord => {
        const btn = document.createElement('button');
        btn.className = 'note-btn';
        btn.textContent = chord.name;
        btn.onclick = () => {
            chord.intervals.forEach(interval => {
                const noteIdx = (rootIdx + interval) % 12;
                const note = notesArray[noteIdx];
                const noteOct = octave + Math.floor((rootIdx + interval) / 12);
                AudioEngine.playNote(note, noteOct);
            });
        };
        chordsPad.appendChild(btn);
    });
}

// Effects rack controls
function toggleFx(type, checked) {
    if (AudioEngine.effects[type]) {
        AudioEngine.effects[type].active = checked;
        showToast(`${type.toUpperCase()} effect ${checked ? 'enabled' : 'disabled'}`);
    }
}

function setFx(type, param, value) {
    if (!AudioEngine.audioCtx) AudioEngine.init();
    const v = value / 100;
    
    // Display updates
    const display = document.getElementById(`fx-${type}-${param}-display`);
    if (display) display.textContent = value + '%';

    if (type === 'reverb' && param === 'mix') {
        AudioEngine.effects.reverb.wet.gain.setTargetAtTime(v * 0.8, AudioEngine.audioCtx.currentTime, 0.01);
    }
    if (type === 'delay' && param === 'mix') {
        AudioEngine.effects.delay.wet.gain.setTargetAtTime(v * 0.7, AudioEngine.audioCtx.currentTime, 0.01);
    }
}

// Drum kit pads triggers
const drumKits = {
    trap: ['Kick', 'Snare', 'HiHat'],
    acoustic: ['Kick', 'Snare', 'HiHat']
};
let currentKit = 'trap';

function generateDrumPads() {
    const grid = document.getElementById('padsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const pads = drumKits[currentKit];
    pads.forEach(sound => {
        const pad = document.createElement('div');
        pad.className = 'pad';
        const icon = document.createElement('span');
        icon.className = 'pad-icon';
        icon.textContent = sound === 'Kick' ? '🥁' : (sound === 'Snare' ? '⚙️' : '💿');
        const label = document.createElement('span');
        label.className = 'pad-label';
        label.textContent = sound;

        pad.appendChild(icon);
        pad.appendChild(label);
        pad.onclick = () => {
            pad.classList.add('hit');
            setTimeout(() => pad.classList.remove('hit'), 100);
            Sequencer.playDrum(sound);
        };
        grid.appendChild(pad);
    });
}

function changeKit() {
    const select = document.getElementById('kitSelect');
    if (select) {
        currentKit = select.value;
        generateDrumPads();
        showToast(`Swapped to ${currentKit} drum kit`);
    }
}

// Sequencer helpers
function addSequencerTrack() {
    const sound = prompt('Enter drum sound (Kick / Snare / HiHat):', 'Kick');
    if (sound && ['Kick', 'Snare', 'HiHat'].includes(sound)) {
        Sequencer.addTrack(sound);
        Mixer.render();
        showToast(`Track ${sound} added`);
    } else {
        alert('Invalid sound selection! Choose Kick, Snare, or HiHat.');
    }
}

function updateSteps() {
    const select = document.getElementById('stepsSelect');
    if (select) {
        Sequencer.steps = parseInt(select.value);
        Sequencer.tracks.forEach(t => {
            t.steps = new Array(Sequencer.steps).fill(false);
        });
        Sequencer.render();
    }
}

// toast alerts helper
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 300);
    }, 2000);
}

// project configuration local storage
function saveProject() {
    const data = {
        name: document.getElementById('projectName')?.value || 'Untitled',
        bpm: Sequencer.bpm,
        steps: Sequencer.steps,
        tracks: Sequencer.tracks
    };
    localStorage.setItem('beatforge_pro_project', JSON.stringify(data));
    showToast('Project configuration saved locally!');
}

function loadProject() {
    const raw = localStorage.getItem('beatforge_pro_project');
    if (!raw) {
        alert('No saved BeatForge Pro configurations found.');
        return;
    }
    try {
        const data = JSON.parse(raw);
        const nameInput = document.getElementById('projectName');
        if (nameInput) nameInput.value = data.name;

        Sequencer.bpm = data.bpm;
        const bpmInput = document.getElementById('bpmInput');
        if (bpmInput) bpmInput.value = data.bpm;

        Sequencer.steps = data.steps;
        const stepsSelect = document.getElementById('stepsSelect');
        if (stepsSelect) stepsSelect.value = data.steps;

        Sequencer.tracks = data.tracks;
        Sequencer.render();
        Mixer.render();
        showToast('Project configuration loaded successfully');
    } catch(e) {
        alert('Error parsing load details.');
    }
}
