import { Synthesizer } from '../instruments/Synthesizer';
import { Knob } from './Knob';

export class InstrumentPanel {
  private element: HTMLElement;
  private synth: Synthesizer;

  constructor(container: HTMLElement, synth: Synthesizer) {
    this.element = container;
    this.synth = synth;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="panel-header">
        <h3>Synthesizer Knobs</h3>
      </div>
      <div class="instrument-knobs-grid">
        <div class="knob-slot" id="synth-attack-slot"></div>
        <div class="knob-slot" id="synth-decay-slot"></div>
        <div class="knob-slot" id="synth-sustain-slot"></div>
        <div class="knob-slot" id="synth-release-slot"></div>
        <div class="knob-slot" id="synth-cutoff-slot"></div>
      </div>
    `;

    // Instantiate knobs
    const attackSlot = this.element.querySelector('#synth-attack-slot') as HTMLElement;
    new Knob(attackSlot, 'Attack', this.synth.params.attackTime, 0.001, 1.5, (v) => {
      this.synth.updateParams({ attackTime: v });
    });

    const decaySlot = this.element.querySelector('#synth-decay-slot') as HTMLElement;
    new Knob(decaySlot, 'Decay', this.synth.params.decayTime, 0.01, 2.0, (v) => {
      this.synth.updateParams({ decayTime: v });
    });

    const sustainSlot = this.element.querySelector('#synth-sustain-slot') as HTMLElement;
    new Knob(sustainSlot, 'Sustain', this.synth.params.sustainLevel, 0.0, 1.0, (v) => {
      this.synth.updateParams({ sustainLevel: v });
    });

    const releaseSlot = this.element.querySelector('#synth-release-slot') as HTMLElement;
    new Knob(releaseSlot, 'Release', this.synth.params.releaseTime, 0.01, 3.0, (v) => {
      this.synth.updateParams({ releaseTime: v });
    });

    const cutoffSlot = this.element.querySelector('#synth-cutoff-slot') as HTMLElement;
    new Knob(cutoffSlot, 'Cutoff', this.synth.params.filterFrequency, 100, 8000, (v) => {
      this.synth.updateParams({ filterFrequency: v });
    });
  }
}
