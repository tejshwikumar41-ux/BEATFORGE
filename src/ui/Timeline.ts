import { Track } from '../core/Track';
import { Transport } from '../core/Transport';
import { PIXELS_PER_BEAT } from '../utils/Constants';

export class Timeline {
  private element: HTMLElement;
  private transport: Transport;
  private tracks: Track[] = [];

  private gridCanvas!: HTMLCanvasElement;
  private tracksContainer!: HTMLElement;
  private playhead!: HTMLElement;
  private zoom = 1;

  onSelectTrack!: (track: Track) => void;
  onEditTrackClips!: (track: Track) => void;

  constructor(container: HTMLElement, transport: Transport) {
    this.element = container;
    this.transport = transport;

    this.render();
    this.setupSync();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="timeline-headers-panel">
        <div class="timeline-header-corner">Tracks</div>
        <div class="track-headers-list"></div>
      </div>
      <div class="timeline-grid-panel">
        <div class="timeline-ruler"></div>
        <div class="timeline-canvas-container">
          <canvas class="timeline-grid-canvas"></canvas>
          <div class="timeline-tracks-area"></div>
          <div class="timeline-playhead"></div>
        </div>
      </div>
    `;

    this.gridCanvas = this.element.querySelector('.timeline-grid-canvas') as HTMLCanvasElement;
    this.tracksContainer = this.element.querySelector('.timeline-tracks-area') as HTMLElement;
    this.playhead = this.element.querySelector('.timeline-playhead') as HTMLElement;

    this.setupGridDrag();
  }

  setTracks(tracks: Track[]): void {
    this.tracks = tracks;
    this.renderTrackHeaders();
    this.renderTrackRows();
    this.drawGrid();
  }

  private renderTrackHeaders(): void {
    const list = this.element.querySelector('.track-headers-list') as HTMLElement;
    list.innerHTML = this.tracks.map(t => `
      <div class="track-header" data-id="${t.id}" style="border-left: 4px solid ${t.color}; height: ${t.height}px;">
        <div class="track-info">
          <span class="track-name">${t.name}</span>
          <span class="track-type-badge">${t.type}</span>
        </div>
        <div class="track-controls">
          <button class="track-header-btn btn-mute ${t.muted ? 'active' : ''}" title="Mute">M</button>
          <button class="track-header-btn btn-solo ${t.solo ? 'active' : ''}" title="Solo">S</button>
          <button class="track-header-btn btn-arm ${t.armed ? 'active' : ''}" title="Arm Record">R</button>
        </div>
      </div>
    `).join('');

    // Bind header clicks
    list.querySelectorAll('.track-header').forEach(header => {
      const id = header.getAttribute('data-id')!;
      const track = this.tracks.find(t => t.id === id)!;

      header.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('btn-mute')) {
          track.toggleMute();
          target.classList.toggle('active');
        } else if (target.classList.contains('btn-solo')) {
          track.toggleSolo();
          target.classList.toggle('active');
        } else if (target.classList.contains('btn-arm')) {
          track.toggleArm();
          target.classList.toggle('active');
        } else {
          this.onSelectTrack?.(track);
          list.querySelectorAll('.track-header').forEach(h => h.classList.remove('selected'));
          header.classList.add('selected');
        }
      });
    });
  }

  private renderTrackRows(): void {
    this.tracksContainer.innerHTML = this.tracks.map(t => `
      <div class="track-row" data-id="${t.id}" style="height: ${t.height}px;">
        ${t.clips.map(c => `
          <div class="audio-clip-box" style="left: ${c.startTime * PIXELS_PER_BEAT * this.zoom}px; width: ${c.duration * PIXELS_PER_BEAT * this.zoom}px;">
            <div class="clip-label">${c.name}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    this.tracksContainer.querySelectorAll('.track-row').forEach(row => {
      row.addEventListener('dblclick', () => {
        const id = row.getAttribute('data-id')!;
        const track = this.tracks.find(t => t.id === id)!;
        this.onEditTrackClips?.(track);
      });
    });
  }

  private drawGrid(): void {
    const ctx = this.gridCanvas.getContext('2d')!;
    const w = this.gridCanvas.parentElement!.clientWidth;
    const h = this.gridCanvas.parentElement!.clientHeight;

    this.gridCanvas.width = w;
    this.gridCanvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const beatW = PIXELS_PER_BEAT * this.zoom;
    const totalBeats = Math.ceil(w / beatW);

    for (let i = 0; i < totalBeats; i++) {
      const x = i * beatW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();

      if (i % 4 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      }
    }
  }

  private setupGridDrag(): void {
    const area = this.element.querySelector('.timeline-canvas-container') as HTMLElement;
    area.addEventListener('mousedown', (e) => {
      if (e.target !== area && e.target !== this.gridCanvas) return;
      const rect = area.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const beat = x / (PIXELS_PER_BEAT * this.zoom);
      this.transport.seek(beat);
    });
  }

  private setupSync(): void {
    this.transport.onTick((beat) => {
      this.playhead.style.left = `${beat * PIXELS_PER_BEAT * this.zoom}px`;
    });
  }
}
