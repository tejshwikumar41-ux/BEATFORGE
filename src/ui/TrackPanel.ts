import { Track } from '../core/Track';

export class TrackPanel {
  private element: HTMLElement;
  onAddTrack!: (type: 'audio' | 'midi' | 'drum') => void;

  constructor(container: HTMLElement) {
    this.element = container;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="track-panel-header">
        <h3>Tracks List</h3>
        <div class="add-track-controls">
          <button class="btn-primary sm add-midi-btn"><i class="fas fa-plus"></i> MIDI</button>
          <button class="btn-primary sm add-drum-btn"><i class="fas fa-plus"></i> Drum</button>
        </div>
      </div>
      <div class="track-panel-list"></div>
    `;

    this.element.querySelector('.add-midi-btn')?.addEventListener('click', () => {
      this.onAddTrack?.('midi');
    });

    this.element.querySelector('.add-drum-btn')?.addEventListener('click', () => {
      this.onAddTrack?.('drum');
    });
  }
}
