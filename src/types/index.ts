export interface Note {
  id: string;
  pitch: number;        // MIDI note number 0-127
  velocity: number;     // 0-127
  startTime: number;    // in beats
  duration: number;     // in beats
  channel: number;
}

export interface AudioClip {
  id: string;
  name: string;
  buffer: AudioBuffer | null;
  startTime: number;    // in beats
  duration: number;     // in beats
  offset: number;       // clip start offset
  gain: number;
  fadeIn: number;
  fadeOut: number;
}

export interface TrackState {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'drum';
  color: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  clips: AudioClip[];
  notes: Note[];
  effects: EffectState[];
  instrumentType?: string;
  instrumentParams?: Record<string, number>;
  height: number;
}

export interface EffectState {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface ProjectState {
  id: string;
  name: string;
  bpm: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  tracks: TrackState[];
  masterVolume: number;
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BeatPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  tags: string[];
  pattern: DrumPattern;
  license: string;
  author: string;
}

export interface DrumPattern {
  steps: number;
  tracks: DrumTrackPattern[];
}

export interface DrumTrackPattern {
  name: string;
  sample: string;
  steps: boolean[];
  velocity: number[];
  pitch: number;
}

export interface SynthParams {
  oscillatorType: OscillatorType;
  oscillator2Type: OscillatorType;
  oscillator2Detune: number;
  oscillatorMix: number;
  filterType: BiquadFilterType;
  filterFrequency: number;
  filterQ: number;
  filterEnvelopeAmount: number;
  attackTime: number;
  decayTime: number;
  sustainLevel: number;
  releaseTime: number;
  filterAttack: number;
  filterDecay: number;
  filterSustain: number;
  filterRelease: number;
  lfoRate: number;
  lfoAmount: number;
  lfoTarget: 'pitch' | 'filter' | 'amplitude';
  reverbMix: number;
  delayMix: number;
  delayTime: number;
  gain: number;
  portamento: number;
  unisonVoices: number;
  unisonDetune: number;
}

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: string;
  description: string;
}

export type ToolType = 'select' | 'draw' | 'erase' | 'cut' | 'stretch';
export type SnapValue = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32' | 'off';

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  currentBeat: number;
  bpm: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  metronomeEnabled: boolean;
}

export interface MeterData {
  left: number;
  right: number;
  peakLeft: number;
  peakRight: number;
}
