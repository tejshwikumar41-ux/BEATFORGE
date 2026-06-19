import { SynthParams } from '../types';
import { MusicTheory } from '../utils/MusicTheory';

export interface SynthVoice {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  oscMix: GainNode;
  filter: BiquadFilterNode;
  gainNode: GainNode;
  ended: boolean;
}

export class Synthesizer {
  private context: AudioContext;
  private outputNode: AudioNode;
  private voices: Map<number, SynthVoice> = new Map();
  params: SynthParams;

  constructor(context: AudioContext, outputNode: AudioNode) {
    this.context = context;
    this.outputNode = outputNode;
    this.params = this.getDefaultParams();
  }

  getDefaultParams(): SynthParams {
    return {
      oscillatorType: 'sawtooth',
      oscillator2Type: 'square',
      oscillator2Detune: 12,
      oscillatorMix: 0.5,
      filterType: 'lowpass',
      filterFrequency: 1000,
      filterQ: 1,
      filterEnvelopeAmount: 500,
      attackTime: 0.05,
      decayTime: 0.2,
      sustainLevel: 0.6,
      releaseTime: 0.3,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.4,
      filterRelease: 0.5,
      lfoRate: 5,
      lfoAmount: 10,
      lfoTarget: 'filter',
      reverbMix: 0,
      delayMix: 0,
      delayTime: 0.3,
      gain: 0.5,
      portamento: 0,
      unisonVoices: 1,
      unisonDetune: 10
    };
  }

  triggerNote(pitch: number, velocity: number = 100): void {
    this.stopNote(pitch);

    const freq = MusicTheory.midiToFrequency(pitch);
    const time = this.context.currentTime;

    const osc1 = this.context.createOscillator();
    osc1.type = this.params.oscillatorType;
    osc1.frequency.setValueAtTime(freq, time);

    const osc2 = this.context.createOscillator();
    osc2.type = this.params.oscillator2Type;
    osc2.frequency.setValueAtTime(freq, time);
    osc2.detune.setValueAtTime(this.params.oscillator2Detune, time);

    const oscMix = this.context.createGain();
    const mix = this.params.oscillatorMix;
    osc1.connect(oscMix);
    osc2.connect(oscMix);

    // Filter
    const filter = this.context.createBiquadFilter();
    filter.type = this.params.filterType;
    filter.Q.setValueAtTime(this.params.filterQ, time);
    
    // Gain ADSR
    const gainNode = this.context.createGain();
    const velMultiplier = velocity / 127;
    const peakGain = this.params.gain * velMultiplier;

    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(peakGain, time + this.params.attackTime);
    gainNode.gain.setValueAtTime(peakGain, time + this.params.attackTime);
    gainNode.gain.exponentialRampToValueAtTime(peakGain * this.params.sustainLevel, time + this.params.attackTime + this.params.decayTime);

    // Filter ADSR
    const baseFreq = this.params.filterFrequency;
    const peakFreq = baseFreq + this.params.filterEnvelopeAmount;
    filter.frequency.setValueAtTime(baseFreq, time);
    filter.frequency.linearRampToValueAtTime(peakFreq, time + this.params.filterAttack);
    filter.frequency.exponentialRampToValueAtTime(baseFreq + (peakFreq - baseFreq) * this.params.filterSustain, time + this.params.filterAttack + this.params.filterDecay);

    // Connections
    oscMix.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.outputNode);

    // Start
    osc1.start(time);
    osc2.start(time);

    this.voices.set(pitch, {
      osc1,
      osc2,
      oscMix,
      filter,
      gainNode,
      ended: false
    });
  }

  stopNote(pitch: number): void {
    const voice = this.voices.get(pitch);
    if (!voice || voice.ended) return;

    const time = this.context.currentTime;
    voice.ended = true;

    // Release phase
    voice.gainNode.gain.cancelScheduledValues(time);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, time);
    voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, time + this.params.releaseTime);

    voice.filter.frequency.cancelScheduledValues(time);
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, time);
    voice.filter.frequency.exponentialRampToValueAtTime(this.params.filterFrequency, time + this.params.filterRelease);

    setTimeout(() => {
      try {
        voice.osc1.stop();
        voice.osc2.stop();
        voice.osc1.disconnect();
        voice.osc2.disconnect();
        voice.oscMix.disconnect();
        voice.filter.disconnect();
        voice.gainNode.disconnect();
      } catch (e) {}
    }, (this.params.releaseTime + 0.1) * 1000);

    this.voices.delete(pitch);
  }

  updateParams(updates: Partial<SynthParams>): void {
    this.params = { ...this.params, ...updates };
  }
}
