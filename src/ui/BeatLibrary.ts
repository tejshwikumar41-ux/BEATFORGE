import { BEAT_PRESETS } from '../beats/BeatLibraryData';
import { DrumPattern } from '../types';

export class BeatLibrary {
  private element: HTMLElement;
  onLoadPattern!: (pattern: DrumPattern) => void;

  constructor(container: HTMLElement) {
    this.element = container;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="panel-header">
        <h3>Beat Presets</h3>
      </div>
      <div class="beat-presets-list"></div>
    `;

    const list = this.element.querySelector('.beat-presets-list') as HTMLElement;
    list.innerHTML = BEAT_PRESETS.map(preset => `
      <div class="beat-item" data-id="${preset.id}">
        <div class="beat-info">
          <span class="beat-title">${preset.name}</span>
          <span class="beat-genre">${preset.genre} — ${preset.bpm} BPM</span>
        </div>
        <button class="btn-primary sm load-preset-btn">Load</button>
      </div>
    `).join('');

    list.querySelectorAll('.beat-item').forEach(item => {
      const id = item.getAttribute('data-id')!;
      const preset = BEAT_PRESETS.find(p => p.id === id)!;
      item.querySelector('.load-preset-btn')?.addEventListener('click', () => {
        this.onLoadPattern?.(preset.pattern);
      });
    });
  }
}
