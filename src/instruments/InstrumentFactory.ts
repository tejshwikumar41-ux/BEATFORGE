import { AudioEngine } from '../core/AudioEngine';
import { Synthesizer } from './Synthesizer';
import { Sampler } from './Sampler';
import { DrumMachine } from './DrumMachine';

export type Instrument = Synthesizer | Sampler | DrumMachine;

export class InstrumentFactory {
  static createInstrument(
    type: 'audio' | 'midi' | 'drum',
    context: AudioContext,
    outputNode: AudioNode,
    engine: AudioEngine
  ): Instrument {
    switch (type) {
      case 'drum':
        return new DrumMachine(context, outputNode, engine);
      case 'audio':
        return new Sampler(context, outputNode);
      case 'midi':
      default:
        return new Synthesizer(context, outputNode);
    }
  }
}
