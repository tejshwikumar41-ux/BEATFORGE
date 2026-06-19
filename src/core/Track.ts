import { TrackState, Note, AudioClip } from '../types';
import { AudioEngine } from './AudioEngine';
import { EffectChain } from '../effects/EffectChain';
import { AudioUtils } from '../utils/AudioUtils';
import { TRACK_COLORS } from '../utils/Constants';

export class Track {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'drum';
  color: string;
  volume: number = 0.8;
  pan: number = 0;
  muted: boolean = false;
  solo: boolean = false;
  armed: boolean = false;
  notes: Note[] = [];
  clips: AudioClip[] = [];
  height: number = 100;

  private engine: AudioEngine;
  private gainNode: GainNode;
  private panNode: StereoPannerNode;
  private analyserNode: AnalyserNode;
  effectChain: EffectChain;

  instrumentType: string = 'synth';
  instrumentParams: Record<string, number> = {};

  constructor(engine: AudioEngine, state?: Partial<TrackState>) {
    this.engine = engine;
    this.id = state?.id || AudioUtils.generateId();
    this.name = state?.name || 'New Track';
    this.type = state?.type || 'midi';
    this.color = state?.color || TRACK_COLORS[Math.floor(Math.random() * TRACK_COLORS.length)];
    
    if (state?.volume !== undefined) this.volume = state.volume;
    if (state?.pan !== undefined) this.pan = state.pan;
    if (state?.muted !== undefined) this.muted = state.muted;
    if (state?.solo !== undefined) this.solo = state.solo;
    if (state?.notes) this.notes = [...state.notes];
    if (state?.clips) this.clips = [...state.clips];
    if (state?.height) this.height = state.height;
    if (state?.instrumentType) this.instrumentType = state.instrumentType;
    if (state?.instrumentParams) this.instrumentParams = { ...state.instrumentParams };

    // Create audio chain
    this.gainNode = engine.context.createGain();
    this.panNode = engine.context.createStereoPanner();
    this.analyserNode = engine.context.createAnalyser();
    this.analyserNode.fftSize = 256;

    this.effectChain = new EffectChain(engine);
    
    // Track output -> effects -> pan -> gain -> analyser -> master
    this.effectChain.output.connect(this.panNode);
    this.panNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(engine.getMasterOutput());

    this.updateGain();
    this.updatePan();
  }

  get input(): AudioNode {
    return this.effectChain.input;
  }

  get output(): AudioNode {
    return this.analyserNode;
  }

  getState(): TrackState {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      volume: this.volume,
      pan: this.pan,
      muted: this.muted,
      solo: this.solo,
      armed: this.armed,
      notes: [...this.notes],
      clips: [...this.clips],
      effects: this.effectChain.getState(),
      instrumentType: this.instrumentType,
      instrumentParams: { ...this.instrumentParams },
      height: this.height
    };
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    this.updateGain();
  }

  setPan(value: number): void {
    this.pan = Math.max(-1, Math.min(1, value));
    this.updatePan();
  }

  toggleMute(): void {
    this.muted = !this.muted;
    this.updateGain();
  }

  toggleSolo(): void {
    this.solo = !this.solo;
  }

  toggleArm(): void {
    this.armed = !this.armed;
  }

  addNote(note: Note): void {
    this.notes.push(note);
    this.notes.sort((a, b) => a.startTime - b.startTime);
  }

  removeNote(noteId: string): void {
    this.notes = this.notes.filter(n => n.id !== noteId);
  }

  updateNote(noteId: string, updates: Partial<Note>): void {
    const note = this.notes.find(n => n.id === noteId);
    if (note) {
      Object.assign(note, updates);
    }
  }

  getNotesInRange(startBeat: number, endBeat: number): Note[] {
    return this.notes.filter(n => 
      n.startTime < endBeat && (n.startTime + n.duration) > startBeat
    );
  }

  addClip(clip: AudioClip): void {
    this.clips.push(clip);
    this.clips.sort((a, b) => a.startTime - b.startTime);
  }

  removeClip(clipId: string): void {
    this.clips = this.clips.filter(c => c.id !== clipId);
  }

  getMeterData(): { left: number; right: number } {
    const dataArray = new Float32Array(this.analyserNode.fftSize);
    this.analyserNode.getFloatTimeDomainData(dataArray);
    
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const db = AudioUtils.gainToDb(rms);
    const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
    
    return { left: normalized, right: normalized };
  }

  private updateGain(): void {
    const gain = this.muted ? 0 : this.volume;
    this.gainNode.gain.setTargetAtTime(gain, this.engine.context.currentTime, 0.01);
  }

  private updatePan(): void {
    this.panNode.pan.setTargetAtTime(this.pan, this.engine.context.currentTime, 0.01);
  }

  dispose(): void {
    this.gainNode.disconnect();
    this.panNode.disconnect();
    this.analyserNode.disconnect();
    this.effectChain.dispose();
  }
}
