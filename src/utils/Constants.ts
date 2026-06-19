export const TRACK_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#82E0AA', '#F8C471',
  '#D7BDE2', '#A3E4D7', '#F9E79F', '#AED6F1'
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const DRUM_SOUNDS = [
  'kick', 'snare', 'hihat-closed', 'hihat-open',
  'clap', 'tom-high', 'tom-mid', 'tom-low',
  'crash', 'ride', 'rimshot', 'cowbell',
  'shaker', 'tambourine', 'conga', 'bongo'
];

export const PIXELS_PER_BEAT = 80;
export const PIANO_KEY_HEIGHT = 16;
export const TRACK_DEFAULT_HEIGHT = 100;
export const MIN_TRACK_HEIGHT = 60;
export const MAX_TRACK_HEIGHT = 300;

export const SNAP_VALUES: Record<string, number> = {
  '1/1': 4,
  '1/2': 2,
  '1/4': 1,
  '1/8': 0.5,
  '1/16': 0.25,
  '1/32': 0.125,
  'off': 0
};

export const DEFAULT_BPM = 120;
export const MIN_BPM = 20;
export const MAX_BPM = 300;
export const MAX_TRACKS = 64;

export const GENRES = [
  'Hip Hop', 'EDM', 'Pop', 'R&B', 'Rock',
  'Trap', 'House', 'Techno', 'Lo-Fi', 'Jazz',
  'Reggaeton', 'Drum & Bass', 'Dubstep', 'Ambient'
];
