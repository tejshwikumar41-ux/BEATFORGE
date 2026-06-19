import { MusicTheory } from '../utils/MusicTheory';

export class Sampler {
  private context: AudioContext;
  private outputNode: AudioNode;
  private sampleBuffer: AudioBuffer | null = null;
  private activeSources: Map<number, { source: AudioBufferSourceNode; gainNode: GainNode }> = new Map();

  rootNote = 60; // Middle C (C4)
  attackTime = 0.01;
  releaseTime = 0.2;

  constructor(context: AudioContext, outputNode: AudioNode) {
    this.context = context;
    this.outputNode = outputNode;
  }

  setBuffer(buffer: AudioBuffer): void {
    this.sampleBuffer = buffer;
  }

  triggerNote(pitch: number, velocity: number = 100): void {
    if (!this.sampleBuffer) {
      this.triggerSynthFallback(pitch, velocity);
      return;
    }

    this.stopNote(pitch);

    const time = this.context.currentTime;
    const source = this.context.createBufferSource();
    source.buffer = this.sampleBuffer;

    // Pitch shift formula: playbackRate = 2 ^ ((pitch - rootNote) / 12)
    const speed = Math.pow(2, (pitch - this.rootNote) / 12);
    source.playbackRate.setValueAtTime(speed, time);

    const gainNode = this.context.createGain();
    const velMultiplier = velocity / 127;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.7 * velMultiplier, time + this.attackTime);

    source.connect(gainNode);
    gainNode.connect(this.outputNode);

    source.start(time);

    this.activeSources.set(pitch, { source, gainNode });
  }

  stopNote(pitch: number): void {
    const active = this.activeSources.get(pitch);
    if (!active) return;

    const time = this.context.currentTime;
    active.gainNode.gain.cancelScheduledValues(time);
    active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, time);
    active.gainNode.gain.exponentialRampToValueAtTime(0.0001, time + this.releaseTime);

    const { source, gainNode } = active;
    setTimeout(() => {
      try {
        source.stop();
        source.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    }, (this.releaseTime + 0.05) * 1000);

    this.activeSources.delete(pitch);
  }

  private triggerSynthFallback(pitch: number, velocity: number): void {
    // Play a basic sine wave if no buffer is loaded
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.setValueAtTime(MusicTheory.midiToFrequency(pitch), this.context.currentTime);
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime((velocity / 127) * 0.4, this.context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.outputNode);
    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }
}
