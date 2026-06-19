export class EQ {
  input: BiquadFilterNode;
  output: BiquadFilterNode;

  private lowFilter: BiquadFilterNode;
  private midFilter: BiquadFilterNode;
  private highFilter: BiquadFilterNode;

  constructor(context: AudioContext) {
    this.lowFilter = context.createBiquadFilter();
    this.lowFilter.type = 'lowshelf';
    this.lowFilter.frequency.value = 200;
    this.lowFilter.gain.value = 0;

    this.midFilter = context.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.lowFilter.Q.value = 1.0;
    this.midFilter.gain.value = 0;

    this.highFilter = context.createBiquadFilter();
    this.highFilter.type = 'highshelf';
    this.highFilter.frequency.value = 5000;
    this.highFilter.gain.value = 0;

    // Route: low -> mid -> high
    this.lowFilter.connect(this.midFilter);
    this.midFilter.connect(this.highFilter);

    this.input = this.lowFilter;
    this.output = this.highFilter;
  }

  setLow(db: number): void {
    this.lowFilter.gain.value = Math.max(-40, Math.min(40, db));
  }

  setMid(db: number): void {
    this.midFilter.gain.value = Math.max(-40, Math.min(40, db));
  }

  setHigh(db: number): void {
    this.highFilter.gain.value = Math.max(-40, Math.min(40, db));
  }

  disconnect(): void {
    this.lowFilter.disconnect();
    this.midFilter.disconnect();
    this.highFilter.disconnect();
  }
}
