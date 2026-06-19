import { TransportState } from '../types';
import { AudioEngine } from './AudioEngine';

type TransportCallback = (beat: number) => void;
type EventCallback = () => void;

export class Transport {
  private engine: AudioEngine;
  private _isPlaying = false;
  private _isRecording = false;
  private _currentBeat = 0;
  private _bpm = 120;
  private _loopEnabled = false;
  private _loopStart = 0;
  private _loopEnd = 16;
  private _metronomeEnabled = false;
  
  private startTime = 0;
  private startBeat = 0;
  private animationFrame = 0;
  private callbacks: Set<TransportCallback> = new Set();
  private playCallbacks: Set<EventCallback> = new Set();
  private stopCallbacks: Set<EventCallback> = new Set();
  
  private metronomeGain!: GainNode;
  private scheduledMetronomeBeats: Set<number> = new Set();
  private lookAheadTime = 0.1;
  private schedulerWorker: Worker | null = null;
  private workerUrl: string = '';

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  init(): void {
    this.metronomeGain = this.engine.context.createGain();
    this.metronomeGain.gain.value = 0.3;
    this.metronomeGain.connect(this.engine.getMasterOutput());

    // Create inline worker to bypass background tab throttling
    const workerBlob = new Blob([`
      let intervalId = null;
      self.onmessage = function(e) {
        if (e.data.action === 'start') {
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(() => {
            self.postMessage('tick');
          }, e.data.interval || 25);
        } else if (e.data.action === 'stop') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      };
    `], { type: 'application/javascript' });

    this.workerUrl = URL.createObjectURL(workerBlob);
    this.schedulerWorker = new Worker(this.workerUrl);
    this.schedulerWorker.onmessage = () => {
      if (this._isPlaying) {
        this.scheduler();
      }
    };
  }

  dispose(): void {
    if (this.schedulerWorker) {
      this.schedulerWorker.postMessage({ action: 'stop' });
      this.schedulerWorker.terminate();
      this.schedulerWorker = null;
    }
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = '';
    }
  }

  get state(): TransportState {
    return {
      isPlaying: this._isPlaying,
      isRecording: this._isRecording,
      currentBeat: this._currentBeat,
      bpm: this._bpm,
      loopEnabled: this._loopEnabled,
      loopStart: this._loopStart,
      loopEnd: this._loopEnd,
      metronomeEnabled: this._metronomeEnabled
    };
  }

  get isPlaying(): boolean { return this._isPlaying; }
  get isRecording(): boolean { return this._isRecording; }
  get currentBeat(): number { return this._currentBeat; }
  get bpm(): number { return this._bpm; }
  get loopEnabled(): boolean { return this._loopEnabled; }
  get loopStart(): number { return this._loopStart; }
  get loopEnd(): number { return this._loopEnd; }
  get metronomeEnabled(): boolean { return this._metronomeEnabled; }

  set bpm(value: number) {
    this._bpm = Math.max(20, Math.min(300, value));
    if (this._isPlaying) {
      this.startBeat = this._currentBeat;
      this.startTime = this.engine.context.currentTime;
    }
  }

  play(): void {
    if (this._isPlaying) return;
    this._isPlaying = true;
    this.startTime = this.engine.context.currentTime;
    this.startBeat = this._currentBeat;
    this.scheduledMetronomeBeats.clear();
    
    this.engine.resume();
    this.tick();
    
    // Start background Web Worker timer
    this.schedulerWorker?.postMessage({ action: 'start', interval: 25 });
    
    this.playCallbacks.forEach(cb => cb());
  }

  stop(): void {
    if (!this._isPlaying) return;
    this._isPlaying = false;
    this._isRecording = false;
    cancelAnimationFrame(this.animationFrame);
    
    this.schedulerWorker?.postMessage({ action: 'stop' });
    
    this.stopCallbacks.forEach(cb => cb());
  }

  record(): void {
    this._isRecording = true;
    if (!this._isPlaying) {
      this.play();
    }
  }

  pause(): void {
    if (!this._isPlaying) return;
    this._isPlaying = false;
    cancelAnimationFrame(this.animationFrame);
    this.schedulerWorker?.postMessage({ action: 'stop' });
  }

  seek(beat: number): void {
    this._currentBeat = Math.max(0, beat);
    this.startBeat = this._currentBeat;
    this.startTime = this.engine.context.currentTime;
    this.scheduledMetronomeBeats.clear();
    this.notifyCallbacks();
  }

  setLoop(start: number, end: number): void {
    this._loopStart = start;
    this._loopEnd = end;
  }

  toggleLoop(): void {
    this._loopEnabled = !this._loopEnabled;
  }

  toggleMetronome(): void {
    this._metronomeEnabled = !this._metronomeEnabled;
  }

  onTick(callback: TransportCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  onPlay(callback: EventCallback): () => void {
    this.playCallbacks.add(callback);
    return () => this.playCallbacks.delete(callback);
  }

  onStop(callback: EventCallback): () => void {
    this.stopCallbacks.add(callback);
    return () => this.stopCallbacks.delete(callback);
  }

  beatsToSeconds(beats: number): number {
    return (beats / this._bpm) * 60;
  }

  secondsToBeats(seconds: number): number {
    return (seconds * this._bpm) / 60;
  }

  private tick = (): void => {
    if (!this._isPlaying) return;

    const elapsed = this.engine.context.currentTime - this.startTime;
    this._currentBeat = this.startBeat + this.secondsToBeats(elapsed);

    // Handle looping
    if (this._loopEnabled && this._currentBeat >= this._loopEnd) {
      const loopLength = this._loopEnd - this._loopStart;
      this._currentBeat = this._loopStart + ((this._currentBeat - this._loopStart) % loopLength);
      this.startBeat = this._currentBeat;
      this.startTime = this.engine.context.currentTime;
      this.scheduledMetronomeBeats.clear();
    }

    this.notifyCallbacks();
    this.animationFrame = requestAnimationFrame(this.tick);
  };

  private scheduler(): void {
    if (!this._metronomeEnabled || !this._isPlaying) return;
    
    const currentTime = this.engine.context.currentTime;
    const elapsed = currentTime - this.startTime;
    const currentBeat = this.startBeat + this.secondsToBeats(elapsed);
    const lookAheadBeats = this.secondsToBeats(this.lookAheadTime);
    
    for (let beat = Math.floor(currentBeat); beat <= Math.ceil(currentBeat + lookAheadBeats); beat++) {
      if (beat >= 0 && !this.scheduledMetronomeBeats.has(beat)) {
        const beatTime = this.startTime + this.beatsToSeconds(beat - this.startBeat);
        if (beatTime >= currentTime && beatTime < currentTime + this.lookAheadTime) {
          this.scheduleMetronomeClick(beatTime, beat % 4 === 0);
          this.scheduledMetronomeBeats.add(beat);
        }
      }
    }
  }

  private scheduleMetronomeClick(time: number, isDownbeat: boolean): void {
    const ctx = this.engine.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = isDownbeat ? 1000 : 800;
    osc.type = 'sine';
    
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.connect(gain);
    gain.connect(this.metronomeGain);
    
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(cb => cb(this._currentBeat));
  }
}
