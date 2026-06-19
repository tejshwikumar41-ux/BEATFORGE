export class Distortion {
  input: WaveShaperNode;
  output: WaveShaperNode;
  private drive = 0.5;

  constructor(context: AudioContext) {
    this.input = context.createWaveShaper();
    this.output = this.input;
    this.input.oversample = '4x';
    this.setDrive(this.drive);
  }

  setDrive(value: number): void {
    this.drive = Math.max(0, Math.min(0.99, value));
    const k = this.drive * 100;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.input.curve = curve;
  }

  disconnect(): void {
    this.input.disconnect();
  }
}
