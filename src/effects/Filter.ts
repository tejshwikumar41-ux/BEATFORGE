export class Filter {
  input: BiquadFilterNode;
  output: BiquadFilterNode;

  constructor(context: AudioContext) {
    this.input = context.createBiquadFilter();
    this.output = this.input;
    this.input.type = 'lowpass';
    this.input.frequency.value = 2000;
    this.input.Q.value = 1.0;
  }

  setType(type: 'lowpass' | 'highpass' | 'bandpass'): void {
    this.input.type = type;
  }

  setFrequency(value: number): void {
    this.input.frequency.value = Math.max(20, Math.min(20000, value));
  }

  setQ(value: number): void {
    this.input.Q.value = Math.max(0.0001, Math.min(20, value));
  }

  disconnect(): void {
    this.input.disconnect();
  }
}
