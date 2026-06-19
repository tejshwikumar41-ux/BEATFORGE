export class AudioUtils {
  static createNoiseBuffer(
    context: AudioContext,
    duration: number = 2,
    type: 'white' | 'pink' | 'brown' = 'white'
  ): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const buffer = context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;

        switch (type) {
          case 'white':
            data[i] = white;
            break;
          case 'pink':
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
            break;
          case 'brown':
            data[i] = (b0 + (0.02 * white)) / 1.02;
            b0 = data[i];
            data[i] *= 3.5;
            break;
        }
      }
    }
    return buffer;
  }

  static async generateDrumSound(
    context: AudioContext,
    type: string
  ): Promise<AudioBuffer> {
    const sampleRate = context.sampleRate;
    const generators: Record<string, () => AudioBuffer> = {
      'kick': () => this.generateKick(context, sampleRate),
      'snare': () => this.generateSnare(context, sampleRate),
      'hihat-closed': () => this.generateHiHat(context, sampleRate, 0.08),
      'hihat-open': () => this.generateHiHat(context, sampleRate, 0.3),
      'clap': () => this.generateClap(context, sampleRate),
      'tom-high': () => this.generateTom(context, sampleRate, 300),
      'tom-mid': () => this.generateTom(context, sampleRate, 200),
      'tom-low': () => this.generateTom(context, sampleRate, 120),
      'crash': () => this.generateCymbal(context, sampleRate, 1.5),
      'ride': () => this.generateCymbal(context, sampleRate, 0.8),
      'rimshot': () => this.generateRimshot(context, sampleRate),
      'cowbell': () => this.generateCowbell(context, sampleRate),
      'shaker': () => this.generateShaker(context, sampleRate),
      'tambourine': () => this.generateTambourine(context, sampleRate),
      'conga': () => this.generateTom(context, sampleRate, 250),
      'bongo': () => this.generateTom(context, sampleRate, 350),
    };

    return (generators[type] || generators['kick'])();
  }

  private static generateKick(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.5;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const freq = 150 * Math.exp(-t * 20) + 40;
      const amp = Math.exp(-t * 8);
      data[i] = Math.sin(2 * Math.PI * freq * t) * amp;
      // Add click transient
      if (t < 0.005) {
        data[i] += Math.sin(2 * Math.PI * 1000 * t) * (1 - t / 0.005) * 0.5;
      }
    }
    return buffer;
  }

  private static generateSnare(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.3;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const toneAmp = Math.exp(-t * 30);
      const noiseAmp = Math.exp(-t * 15);
      const tone = Math.sin(2 * Math.PI * 200 * t) * toneAmp * 0.5;
      const noise = (Math.random() * 2 - 1) * noiseAmp * 0.7;
      data[i] = tone + noise;
    }
    return buffer;
  }

  private static generateHiHat(ctx: AudioContext, sr: number, duration: number): AudioBuffer {
    const length = sr * duration;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t / (duration * 0.3));
      // Metallic frequencies
      const metallic = Math.sin(2 * Math.PI * 4000 * t) * 0.3 +
                        Math.sin(2 * Math.PI * 6000 * t) * 0.2 +
                        Math.sin(2 * Math.PI * 8000 * t) * 0.1;
      const noise = (Math.random() * 2 - 1) * 0.6;
      data[i] = (noise + metallic) * amp * 0.5;
    }

    // Highpass filter effect
    let prev = 0;
    for (let i = 0; i < length; i++) {
      const current = data[i];
      data[i] = current - prev + 0.95 * (i > 0 ? data[i] : 0);
      data[i] = 0.3 * data[i] + 0.7 * (current - prev);
      prev = current;
    }

    return buffer;
  }

  private static generateClap(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.3;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      let amp = 0;
      // Multiple bursts
      for (let burst = 0; burst < 4; burst++) {
        const burstTime = burst * 0.008;
        if (t >= burstTime) {
          amp += Math.exp(-(t - burstTime) * 50) * 0.3;
        }
      }
      // Tail
      if (t > 0.03) {
        amp += Math.exp(-(t - 0.03) * 12) * 0.5;
      }
      const noise = (Math.random() * 2 - 1);
      data[i] = noise * amp;
    }

    // Bandpass effect
    const freq = 1200;
    const bw = 800;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    const w0 = 2 * Math.PI * freq / sr;
    const alpha = Math.sin(w0) * Math.sinh(Math.log(2) / 2 * bw / freq * w0 / Math.sin(w0));
    const b0 = alpha;
    const b1 = 0;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;

    for (let i = 0; i < length; i++) {
      const x = data[i];
      const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      data[i] = y * 2;
    }

    return buffer;
  }

  private static generateTom(ctx: AudioContext, sr: number, freq: number): AudioBuffer {
    const length = sr * 0.4;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const f = freq * Math.exp(-t * 5) + freq * 0.5;
      const amp = Math.exp(-t * 6);
      data[i] = Math.sin(2 * Math.PI * f * t) * amp;
    }
    return buffer;
  }

  private static generateCymbal(ctx: AudioContext, sr: number, duration: number): AudioBuffer {
    const length = sr * duration;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t / (duration * 0.4));
      const noise = (Math.random() * 2 - 1);
      const metal = Math.sin(2 * Math.PI * 3000 * t) * 0.1 +
                     Math.sin(2 * Math.PI * 5000 * t) * 0.08 +
                     Math.sin(2 * Math.PI * 7000 * t) * 0.06;
      data[i] = (noise * 0.5 + metal) * amp * 0.4;
    }
    return buffer;
  }

  private static generateRimshot(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.1;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t * 60);
      data[i] = (Math.sin(2 * Math.PI * 800 * t) + Math.sin(2 * Math.PI * 1600 * t) * 0.5) * amp;
    }
    return buffer;
  }

  private static generateCowbell(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.3;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t * 12);
      data[i] = (Math.sin(2 * Math.PI * 560 * t) + Math.sin(2 * Math.PI * 845 * t) * 0.7) * amp * 0.4;
    }
    return buffer;
  }

  private static generateShaker(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.1;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t * 30);
      data[i] = (Math.random() * 2 - 1) * amp * 0.3;
    }
    return buffer;
  }

  private static generateTambourine(ctx: AudioContext, sr: number): AudioBuffer {
    const length = sr * 0.2;
    const buffer = ctx.createBuffer(1, length, sr);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sr;
      const amp = Math.exp(-t * 15);
      const noise = (Math.random() * 2 - 1) * 0.4;
      const jingles = Math.sin(2 * Math.PI * 5000 * t) * 0.2 +
                       Math.sin(2 * Math.PI * 8000 * t) * 0.15;
      data[i] = (noise + jingles) * amp;
    }
    return buffer;
  }

  static dbToGain(db: number): number {
    return Math.pow(10, db / 20);
  }

  static gainToDb(gain: number): number {
    return 20 * Math.log10(Math.max(gain, 0.00001));
  }

  static bufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataSize = buffer.length * blockAlign;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(buffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        const sample = Math.max(-1, Math.min(1, channels[c][i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
