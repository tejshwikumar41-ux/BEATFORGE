import { AudioEngine } from '../core/AudioEngine';

export class Reverb {
  input: GainNode;
  output: GainNode;
  private convolver: ConvolverNode;
  private wetNode: GainNode;
  private dryNode: GainNode;
  private mix = 0.3;

  constructor(context: AudioContext, engine: AudioEngine) {
    this.input = context.createGain();
    this.output = context.createGain();
    
    this.convolver = engine.createConvolutionReverb();
    this.wetNode = context.createGain();
    this.dryNode = context.createGain();

    this.input.connect(this.convolver);
    this.convolver.connect(this.wetNode);
    this.wetNode.connect(this.output);

    this.input.connect(this.dryNode);
    this.dryNode.connect(this.output);

    this.setMix(this.mix);
  }

  setMix(value: number): void {
    this.mix = Math.max(0, Math.min(1, value));
    this.wetNode.gain.value = this.mix;
    this.dryNode.gain.value = 1 - this.mix;
  }

  getMix(): number {
    return this.mix;
  }

  disconnect(): void {
    this.input.disconnect();
    this.convolver.disconnect();
    this.wetNode.disconnect();
    this.dryNode.disconnect();
    this.output.disconnect();
  }
}
