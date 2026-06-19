import { AudioEngine } from '../core/AudioEngine';

export class DrumMachine {
  private context: AudioContext;
  private outputNode: AudioNode;
  private engine: AudioEngine;

  constructor(context: AudioContext, outputNode: AudioNode, engine: AudioEngine) {
    this.context = context;
    this.outputNode = outputNode;
    this.engine = engine;
  }

  triggerPad(soundName: string, velocity: number = 100): void {
    const buffer = this.engine.getDrumBuffer(soundName);
    if (!buffer) return;

    const time = this.context.currentTime;
    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    const velMultiplier = velocity / 127;
    gainNode.gain.setValueAtTime(velMultiplier * 0.8, time);

    source.connect(gainNode);
    gainNode.connect(this.outputNode);
    source.start(time);
  }
}
