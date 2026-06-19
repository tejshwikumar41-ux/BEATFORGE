import { NOTE_NAMES } from './Constants';

export class MusicTheory {
  static midiToNoteName(midi: number): string {
    const octave = Math.floor(midi / 12) - 1;
    const note = NOTE_NAMES[midi % 12];
    return `${note}${octave}`;
  }

  static noteNameToMidi(name: string): number {
    const match = name.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 60;
    const noteIndex = NOTE_NAMES.indexOf(match[1]);
    const octave = parseInt(match[2]);
    return (octave + 1) * 12 + noteIndex;
  }

  static midiToFrequency(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  static frequencyToMidi(freq: number): number {
    return Math.round(12 * Math.log2(freq / 440) + 69);
  }

  static getScale(root: number, scaleType: string): number[] {
    const scales: Record<string, number[]> = {
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
    const notes: number[] = [];
    for (let octave = 0; octave < 10; octave++) {
      for (const interval of intervals) {
        const note = root + octave * 12 + interval;
        if (note <= 127) notes.push(note);
      }
    }
    return notes;
  }

  static getChord(root: number, chordType: string): number[] {
    const chords: Record<string, number[]> = {
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

  static quantize(beat: number, snapValue: number): number {
    if (snapValue === 0) return beat;
    return Math.round(beat / snapValue) * snapValue;
  }

  static beatsToTime(beats: number, bpm: number): number {
    return (beats / bpm) * 60;
  }

  static timeToBeats(time: number, bpm: number): number {
    return (time * bpm) / 60;
  }

  static beatsToBarPosition(beats: number, numerator: number = 4): string {
    const bar = Math.floor(beats / numerator) + 1;
    const beat = Math.floor(beats % numerator) + 1;
    const tick = Math.round((beats % 1) * 480);
    return `${bar}.${beat}.${tick.toString().padStart(3, '0')}`;
  }
}
