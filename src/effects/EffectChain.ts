import { EffectState } from '../types';
import { AudioEngine } from '../core/AudioEngine';
import { Reverb } from './Reverb';
import { Delay } from './Delay';
import { Compressor } from './Compressor';
import { EQ } from './EQ';
import { Distortion } from './Distortion';
import { Chorus } from './Chorus';
import { Filter } from './Filter';

export class EffectChain {
  input: GainNode;
  output: GainNode;

  private engine: AudioEngine;
  private context: AudioContext;

  filter: Filter;
  eq: EQ;
  distortion: Distortion;
  chorus: Chorus;
  delay: Delay;
  reverb: Reverb;
  compressor: Compressor;

  private states: Record<string, boolean> = {
    filter: false,
    eq: true,
    distortion: false,
    chorus: false,
    delay: false,
    reverb: false,
    compressor: false
  };

  constructor(engine: AudioEngine) {
    this.engine = engine;
    this.context = engine.context;

    this.input = this.context.createGain();
    this.output = this.context.createGain();

    // Instantiate effects
    this.filter = new Filter(this.context);
    this.eq = new EQ(this.context);
    this.distortion = new Distortion(this.context);
    this.chorus = new Chorus(this.context);
    this.delay = new Delay(this.context);
    this.reverb = new Reverb(this.context, this.engine);
    this.compressor = new Compressor(this.context);

    this.rebuildChain();
  }

  toggleEffect(name: string, enabled: boolean): void {
    if (this.states[name] !== undefined) {
      this.states[name] = enabled;
      this.rebuildChain();
    }
  }

  rebuildChain(): void {
    // Disconnect everything first
    this.input.disconnect();
    this.filter.disconnect();
    this.eq.disconnect();
    this.distortion.disconnect();
    this.chorus.disconnect();
    this.delay.disconnect();
    this.reverb.disconnect();
    this.compressor.disconnect();

    const activeNodes: AudioNode[] = [this.input];

    if (this.states.filter) activeNodes.push(this.filter.input);
    if (this.states.eq) activeNodes.push(this.eq.input);
    if (this.states.distortion) activeNodes.push(this.distortion.input);
    if (this.states.chorus) activeNodes.push(this.chorus.input);
    if (this.states.delay) activeNodes.push(this.delay.input);
    if (this.states.reverb) activeNodes.push(this.reverb.input);
    if (this.states.compressor) activeNodes.push(this.compressor.input);

    activeNodes.push(this.output);

    // Connect sequentially
    for (let i = 0; i < activeNodes.length - 1; i++) {
      activeNodes[i].connect(activeNodes[i + 1]);
    }
  }

  getState(): EffectState[] {
    return [
      { id: 'filter', type: 'filter', name: 'Filter', enabled: this.states.filter, params: {} },
      { id: 'eq', type: 'eq', name: 'EQ', enabled: this.states.eq, params: {} },
      { id: 'distortion', type: 'distortion', name: 'Distortion', enabled: this.states.distortion, params: {} },
      { id: 'chorus', type: 'chorus', name: 'Chorus', enabled: this.states.chorus, params: {} },
      { id: 'delay', type: 'delay', name: 'Delay', enabled: this.states.delay, params: {} },
      { id: 'reverb', type: 'reverb', name: 'Reverb', enabled: this.states.reverb, params: {} },
      { id: 'compressor', type: 'compressor', name: 'Compressor', enabled: this.states.compressor, params: {} }
    ];
  }

  dispose(): void {
    this.input.disconnect();
    this.filter.disconnect();
    this.eq.disconnect();
    this.distortion.disconnect();
    this.chorus.disconnect();
    this.delay.disconnect();
    this.reverb.disconnect();
    this.compressor.disconnect();
    this.output.disconnect();
  }
}
