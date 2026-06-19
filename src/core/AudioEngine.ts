import { AudioUtils } from '../utils/AudioUtils';
import { DRUM_SOUNDS } from '../utils/Constants';

export class AudioEngine {
  context!: AudioContext;
  masterGain!: GainNode;
  masterCompressor!: DynamicsCompressorNode;
  masterAnalyser!: AnalyserNode;
  private drumBuffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    this.context = new AudioContext({ sampleRate: 44100 });
    
    // Master chain: compressor -> gain -> analyser -> destination
    this.masterCompressor = this.context.createDynamicsCompressor();
    this.masterCompressor.threshold.value = -6;
    this.masterCompressor.knee.value = 10;
    this.masterCompressor.ratio.value = 4;
    this.masterCompressor.attack.value = 0.003;
    this.masterCompressor.release.value = 0.25;

    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.8;

    this.masterAnalyser = this.context.createAnalyser();
    this.masterAnalyser.fftSize = 2048;
    this.masterAnalyser.smoothingTimeConstant = 0.85;

    this.masterCompressor.connect(this.masterGain);
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.context.destination);

    // Generate drum samples
    await this.generateDrumSamples();
    
    this.initialized = true;
  }

  private async generateDrumSamples(): Promise<void> {
    for (const sound of DRUM_SOUNDS) {
      const buffer = await AudioUtils.generateDrumSound(this.context, sound);
      this.drumBuffers.set(sound, buffer);
    }
  }

  getDrumBuffer(name: string): AudioBuffer | undefined {
    return this.drumBuffers.get(name);
  }

  getMasterOutput(): AudioNode {
    return this.masterCompressor;
  }

  setMasterVolume(value: number): void {
    this.masterGain.gain.setTargetAtTime(value, this.context.currentTime, 0.01);
  }

  getMeterData(): { left: number; right: number } {
    if (!this.initialized) return { left: 0, right: 0 };
    const dataArray = new Float32Array(this.masterAnalyser.fftSize);
    this.masterAnalyser.getFloatTimeDomainData(dataArray);
    
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    const db = AudioUtils.gainToDb(rms);
    const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
    
    return { left: normalized, right: normalized };
  }

  getSpectrumData(): Uint8Array {
    if (!this.initialized) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  createConvolutionReverb(duration: number = 2, decay: number = 2): ConvolverNode {
    const convolver = this.context.createConvolver();
    const length = this.context.sampleRate * duration;
    const impulse = this.context.createBuffer(2, length, this.context.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    convolver.buffer = impulse;
    return convolver;
  }

  suspend(): void {
    this.context?.suspend();
  }

  resume(): void {
    this.context?.resume();
  }
}
