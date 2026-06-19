export class Delay {
  input: GainNode;
  output: GainNode;
  private delayNode: DelayNode;
  private feedbackNode: GainNode;
  private wetNode: GainNode;
  private dryNode: GainNode;

  private delayTime = 0.3;
  private feedback = 0.4;
  private mix = 0.3;

  constructor(context: AudioContext) {
    this.input = context.createGain();
    this.output = context.createGain();
    
    this.delayNode = context.createDelay(2.0);
    this.feedbackNode = context.createGain();
    this.wetNode = context.createGain();
    this.dryNode = context.createGain();

    this.delayNode.delayTime.value = this.delayTime;
    this.feedbackNode.gain.value = this.feedback;

    // Routing
    this.input.connect(this.delayNode);
    this.delayNode.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delayNode); // feedback loop

    this.delayNode.connect(this.wetNode);
    this.wetNode.connect(this.output);

    this.input.connect(this.dryNode);
    this.dryNode.connect(this.output);

    this.updateGains();
  }

  setDelayTime(value: number): void {
    this.delayTime = Math.max(0.01, Math.min(2.0, value));
    this.delayNode.delayTime.value = this.delayTime;
  }

  setFeedback(value: number): void {
    this.feedback = Math.max(0, Math.min(0.95, value));
    this.feedbackNode.gain.value = this.feedback;
  }

  setMix(value: number): void {
    this.mix = Math.max(0, Math.min(1, value));
    this.updateGains();
  }

  private updateGains(): void {
    this.wetNode.gain.value = this.mix;
    this.dryNode.gain.value = 1 - this.mix;
  }

  disconnect(): void {
    this.input.disconnect();
    this.delayNode.disconnect();
    this.feedbackNode.disconnect();
    this.wetNode.disconnect();
    this.dryNode.disconnect();
    this.output.disconnect();
  }
}
