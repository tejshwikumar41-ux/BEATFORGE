const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

class MusicTheory {
  static midiToNoteName(midi) {
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_NAMES[midi % 12];
    return `${note}${octave}`;
  }

  static noteNameToMidi(name) {
    const match = name.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 60;
    const noteIndex = NOTE_NAMES.indexOf(match[1]);
    const octave = parseInt(match[2]);
    return (octave + 1) * 12 + noteIndex;
  }

  static midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  static frequencyToMidi(freq) {
    return Math.round(12 * Math.log2(freq / 440) + 69);
  }

  static getScale(root, scaleType) {
    const scales = {
      'major': [0, 2, 4, 5, 7, 9, 11],
      'minor': [0, 2, 3, 5, 7, 8, 10],
      'dorian': [0, 2, 3, 5, 7, 9, 10],
      'mixolydian': [0, 2, 4, 5, 7, 9, 10],
      'pentatonic': [0, 2, 4, 7, 9],
      'minor-pentatonic': [0, 3, 5, 7, 10],
      'blues': [0, 3, 5, 6, 7, 10],
      'chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
      'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
      'whole-tone': [0, 2, 4, 6, 8, 10],
      'diminished': [0, 2, 3, 5, 6, 8, 9, 11],
      'phrygian': [0, 1, 3, 5, 7, 8, 10],
      'lydian': [0, 2, 4, 6, 7, 9, 11]
    };
    const intervals = scales[scaleType] || scales['chromatic'];
    const notes = [];
    for (let octave = 0; octave < 10; octave++) {
      for (const interval of intervals) {
        const note = root + octave * 12 + interval;
        if (note <= 127) notes.push(note);
      }
    }
    return notes;
  }

  static getChord(root, chordType) {
    const chords = {
      'major': [0, 4, 7],
      'minor': [0, 3, 7],
      'dim': [0, 3, 6],
      'aug': [0, 4, 8],
      'sus2': [0, 2, 7],
      'sus4': [0, 5, 7],
      'maj7': [0, 4, 7, 11],
      'min7': [0, 3, 7, 10],
      'dom7': [0, 4, 7, 10],
      'dim7': [0, 3, 6, 9],
      'maj9': [0, 4, 7, 11, 14],
      'min9': [0, 3, 7, 10, 14],
      'add9': [0, 4, 7, 14]
    };
    return (chords[chordType] || chords['major']).map(i => root + i);
  }

  static quantize(beat, snapValue) {
    if (snapValue === 0) return beat;
    return Math.round(beat / snapValue) * snapValue;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

console.log('Running MusicTheory Unit Tests...');

try {
  // Test note name to MIDI number conversion
  assert(MusicTheory.noteNameToMidi('C4') === 60, 'C4 converts to MIDI 60');
  assert(MusicTheory.noteNameToMidi('A4') === 69, 'A4 converts to MIDI 69');
  assert(MusicTheory.noteNameToMidi('C5') === 72, 'C5 converts to MIDI 72');

  // Test MIDI number to note name conversion
  assert(MusicTheory.midiToNoteName(60) === 'C4', 'MIDI 60 converts to C4');
  assert(MusicTheory.midiToNoteName(69) === 'A4', 'MIDI 69 converts to A4');
  assert(MusicTheory.midiToNoteName(72) === 'C5', 'MIDI 72 converts to C5');

  // Test MIDI to frequency calculations
  assert(Math.round(MusicTheory.midiToFrequency(69)) === 440, 'MIDI 69 (A4) is 440Hz');
  assert(Math.round(MusicTheory.midiToFrequency(60)) === 262, 'MIDI 60 (C4) is ~262Hz');

  // Test Scale calculations
  const cMajor = MusicTheory.getScale(60, 'major').slice(0, 7);
  const expectedCMajor = [60, 62, 64, 65, 67, 69, 71];
  assert(JSON.stringify(cMajor) === JSON.stringify(expectedCMajor), 'C Major scale generated correctly');

  // Test Chord calculations
  const cMajChord = MusicTheory.getChord(60, 'major');
  assert(JSON.stringify(cMajChord) === JSON.stringify([60, 64, 67]), 'C Major triad is C-E-G');

  // Test Quantization
  assert(MusicTheory.quantize(1.23, 0.25) === 1.25, '1.23 quantizes to 1.25 with 1/16 snap');
  assert(MusicTheory.quantize(1.11, 0.5) === 1.0, '1.11 quantizes to 1.0 with 1/8 snap');

  console.log('\nAll MusicTheory unit tests passed successfully!');
} catch (e) {
  console.error('\nFAIL:', e.message);
  process.exit(1);
}
