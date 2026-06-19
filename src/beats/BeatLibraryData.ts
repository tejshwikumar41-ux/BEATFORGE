import { BeatPreset } from '../types';

export const BEAT_PRESETS: BeatPreset[] = [
  {
    id: 'hiphop-classic',
    name: 'Classic Hip Hop',
    genre: 'Hip Hop',
    bpm: 90,
    tags: ['boom-bap', 'classic', 'dusty'],
    license: 'MIT',
    author: 'Studio Pro',
    pattern: {
      steps: 16,
      tracks: [
        {
          name: 'kick',
          sample: 'kick',
          steps: [true, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false],
          velocity: [100, 0, 0, 0, 0, 0, 0, 90, 0, 100, 0, 0, 0, 0, 0, 0],
          pitch: 60
        },
        {
          name: 'snare',
          sample: 'snare',
          steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          velocity: [0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0],
          pitch: 60
        },
        {
          name: 'hihat-closed',
          sample: 'hihat-closed',
          steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
          velocity: [80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0, 80, 0],
          pitch: 60
        }
      ]
    }
  },
  {
    id: 'house-four-floor',
    name: 'Four to the Floor',
    genre: 'House',
    bpm: 124,
    tags: ['edm', 'club', 'house'],
    license: 'MIT',
    author: 'Studio Pro',
    pattern: {
      steps: 16,
      tracks: [
        {
          name: 'kick',
          sample: 'kick',
          steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
          velocity: [100, 0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0],
          pitch: 60
        },
        {
          name: 'clap',
          sample: 'clap',
          steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          velocity: [0, 0, 0, 0, 100, 0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0],
          pitch: 60
        },
        {
          name: 'hihat-open',
          sample: 'hihat-open',
          steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
          velocity: [0, 0, 90, 0, 0, 0, 90, 0, 0, 0, 90, 0, 0, 0, 90, 0],
          pitch: 60
        }
      ]
    }
  }
];
