import { Track } from '../core/Track';
import { Knob } from './Knob';

export class EffectsPanel {
  private element: HTMLElement;
  private track: Track | null = null;

  constructor(container: HTMLElement) {
    this.element = container;
  }

  setTrack(track: Track): void {
    this.track = track;
    this.render();
  }

  private render(): void {
    if (!this.track) {
      this.element.innerHTML = `<div class="effects-placeholder">Select a track to edit insert effects</div>`;
      return;
    }

    const ec = this.track.effectChain;
    this.element.innerHTML = `
      <div class="panel-header">
        <h3>Effects Rack — ${this.track.name}</h3>
      </div>
      <div class="fx-rack">
        <!-- Reverb -->
        <div class="fx-unit">
          <div class="fx-header">
            <span>Reverb</span>
            <label class="fx-toggle">
              <input type="checkbox" id="reverb-toggle" ${ec.getState().find(f => f.type === 'reverb')?.enabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="fx-controls">
            <div id="reverb-mix-slot"></div>
          </div>
        </div>

        <!-- Delay -->
        <div class="fx-unit">
          <div class="fx-header">
            <span>Delay</span>
            <label class="fx-toggle">
              <input type="checkbox" id="delay-toggle" ${ec.getState().find(f => f.type === 'delay')?.enabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="fx-controls">
            <div id="delay-mix-slot"></div>
          </div>
        </div>
      </div>
    `;

    // Bind checkboxes
    const reverbToggle = this.element.querySelector('#reverb-toggle') as HTMLInputElement;
    reverbToggle.addEventListener('change', () => {
      ec.toggleEffect('reverb', reverbToggle.checked);
    });

    const delayToggle = this.element.querySelector('#delay-toggle') as HTMLInputElement;
    delayToggle.addEventListener('change', () => {
      ec.toggleEffect('delay', delayToggle.checked);
    });

    // Instantiate knobs
    const reverbSlot = this.element.querySelector('#reverb-mix-slot') as HTMLElement;
    new Knob(reverbSlot, 'Mix', ec.reverb.getMix(), 0, 1, (v) => {
      ec.reverb.setMix(v);
    });

    const delaySlot = this.element.querySelector('#delay-mix-slot') as HTMLElement;
    new Knob(delaySlot, 'Mix', 0.3, 0, 1, (v) => {
      ec.delay.setMix(v);
    });
  }
}
