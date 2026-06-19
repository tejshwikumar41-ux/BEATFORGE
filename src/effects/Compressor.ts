export class Compressor {
  input: DynamicsCompressorNode;
  output: DynamicsCompressorNode;

  constructor(context: AudioContext) {
    this.input = context.createDynamicsCompressor();
    this.output = this.input;

    // Defaults
    this.input.threshold.value = -12;
    this.input.knee.value = 12;
    this.input.ratio.value = 4;
    this.input.attack.value = 0.003;
    this.input.release.value = 0.25;
  }

  setThreshold(value: number): void {
    this.input.threshold.value = Math.max(-100, Math.min(0, value));
  }

  setRatio(value: number): void {
    this.input.ratio.value = Math.max(1, Math.min(20, value));
  }

  setAttack(value: number): void {
    this.input.attack.value = Math.max(0, Math.min(1.0, value));
  }

  setRelease(value: number): void {
    this.input.release.value = Math.max(0, Math.min(1.0, value));
  }

  disconnect(): void {
    this.input.disconnect();
  }
}
