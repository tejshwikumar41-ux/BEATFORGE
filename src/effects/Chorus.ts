export class Chorus {
  input: GainNode;
  output: GainNode;
  private delayNode: DelayNode;
  private lfo: OscillatorNode;
  private depthNode: GainNode;
  private wetNode: GainNode;
  private dryNode: GainNode;

  private rate = 1.5; // LFO speed in Hz
  private depth = 0.002; // Modulation depth in seconds
  private mix = 0.5;

  constructor(context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();

    this.delayNode = context.createDelay(0.1);
    this.delayNode.delayTime.value = 0.03; // Base delay time

    this.depthNode = context.createGain();
    this.depthNode.gain.value = this.depth;

    this.lfo = context.createOscillator();
    this.lfo.frequency.value = this.rate;

    this.wetNode = context.createGain();
    this.dryNode = context.createGain();

    // LFO -> Depth -> DelayTime Modulation
    this.lfo.connect(this.depthNode);
    this.depthNode.connect(this.delayNode.delayTime);

    // Audio path
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.wetNode);
    this.wetNode.connect(this.output);

    this.input.connect(this.dryNode);
    this.dryNode.connect(this.output);

    this.lfo.start();
    this.setMix(this.mix);
  }

  setRate(value: number): void {
    this.rate = Math.max(0.1, Math.min(10, value));
    this.lfo.frequency.setValueAtTime(this.rate, this.lfo.context.currentTime);
  }

  setDepth(value: number): void {
    this.depth = Math.max(0.0005, Math.min(0.02, value));
    this.depthNode.gain.setValueAtTime(this.depth, this.depthNode.context.currentTime);
  }

  setMix(value: number): void {
    this.mix = Math.max(0, Math.min(1, value));
    this.wetNode.gain.value = this.mix;
    this.dryNode.gain.value = 1 - this.mix;
  }

  disconnect(): void {
    try {
      this.lfo.stop();
    } catch (e) {}
    this.input.disconnect();
    this.delayNode.disconnect();
    this.depthNode.disconnect();
    this.lfo.disconnect();
    this.wetNode.disconnect();
    this.dryNode.disconnect();
    this.output.disconnect();
  }
}
