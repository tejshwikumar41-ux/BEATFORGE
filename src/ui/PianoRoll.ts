import { Note } from '../types';
import { Track } from '../core/Track';
import { MusicTheory } from '../utils/MusicTheory';
import { PIANO_KEY_HEIGHT, PIXELS_PER_BEAT, NOTE_NAMES } from '../utils/Constants';

export class PianoRoll {
  private element: HTMLElement;
  private activeTrack: Track | null = null;
  private keysList!: HTMLElement;
  private gridCanvas!: HTMLCanvasElement;
  private notesArea!: HTMLElement;

  private notes: Note[] = [];
  private zoomX = 1;
  private snapValue = 0.25; // 1/16 snap default
  private currentOctave = 3;

  constructor(container: HTMLElement) {
    this.element = container;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="piano-roll-header">
        <h4>MIDI Editor</h4>
        <div class="piano-roll-controls">
          <label>Snap</label>
          <select class="snap-select">
            <option value="1">1/4 Note</option>
            <option value="0.5">1/8 Note</option>
            <option value="0.25" selected>1/16 Note</option>
            <option value="0">Off</option>
          </select>
        </div>
      </div>
      <div class="piano-roll-editor-body">
        <div class="piano-roll-keys"></div>
        <div class="piano-roll-grid-container">
          <canvas class="piano-roll-grid-canvas"></canvas>
          <div class="piano-roll-notes-area"></div>
        </div>
      </div>
    `;

    this.keysList = this.element.querySelector('.piano-roll-keys') as HTMLElement;
    this.gridCanvas = this.element.querySelector('.piano-roll-grid-canvas') as HTMLCanvasElement;
    this.notesArea = this.element.querySelector('.piano-roll-notes-area') as HTMLElement;

    this.bindEvents();
    this.renderKeys();
  }

  setTrack(track: Track): void {
    this.activeTrack = track;
    this.notes = track.notes;
    this.renderNotes();
    this.drawGrid();
  }

  private renderKeys(): void {
    let html = '';
    // Show 3 octaves from C2 to B5
    for (let midi = 72; midi >= 36; midi--) {
      const noteName = MusicTheory.midiToNoteName(midi);
      const isBlack = noteName.includes('#');
      html += `
        <div class="piano-key ${isBlack ? 'black' : 'white'}" data-midi="${midi}" style="height: ${PIANO_KEY_HEIGHT}px;">
          <span>${noteName}</span>
        </div>
      `;
    }
    this.keysList.innerHTML = html;
  }

  private drawGrid(): void {
    const ctx = this.gridCanvas.getContext('2d')!;
    const w = this.gridCanvas.parentElement!.clientWidth;
    const h = (72 - 36 + 1) * PIANO_KEY_HEIGHT;

    this.gridCanvas.width = w;
    this.gridCanvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Draw horizontal key dividers
    for (let i = 0; i <= 72 - 36 + 1; i++) {
      const y = i * PIANO_KEY_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw vertical beat dividers
    const beatW = PIXELS_PER_BEAT * this.zoomX;
    const totalBeats = Math.ceil(w / beatW);
    for (let i = 0; i < totalBeats; i++) {
      const x = i * beatW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }

  private renderNotes(): void {
    this.notesArea.innerHTML = '';
    this.notes.forEach(note => {
      // Find row offset
      const row = 72 - note.pitch;
      if (row < 0 || row > (72 - 36)) return;

      const div = document.createElement('div');
      div.className = 'piano-note-box';
      div.style.left = `${note.startTime * PIXELS_PER_BEAT * this.zoomX}px`;
      div.style.top = `${row * PIANO_KEY_HEIGHT}px`;
      div.style.width = `${note.duration * PIXELS_PER_BEAT * this.zoomX}px`;
      div.style.height = `${PIANO_KEY_HEIGHT - 2}px`;
      div.setAttribute('data-id', note.id);

      this.notesArea.appendChild(div);
    });
  }

  private bindEvents(): void {
    // Add snap select listener
    const snap = this.element.querySelector('.snap-select') as HTMLSelectElement;
    snap.addEventListener('change', () => {
      this.snapValue = parseFloat(snap.value);
    });

    // Draw note on grid double click
    this.notesArea.addEventListener('dblclick', (e) => {
      if (e.target !== this.notesArea) {
        // Double clicked note - delete it
        const noteId = (e.target as HTMLElement).getAttribute('data-id')!;
        this.notes = this.notes.filter(n => n.id !== noteId);
        if (this.activeTrack) {
          this.activeTrack.notes = this.notes;
        }
        this.renderNotes();
        return;
      }

      const rect = this.notesArea.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const rawBeat = clickX / (PIXELS_PER_BEAT * this.zoomX);
      const startTime = MusicTheory.quantize(rawBeat, this.snapValue);

      const row = Math.floor(clickY / PIANO_KEY_HEIGHT);
      const pitch = 72 - row;

      const newNote: Note = {
        id: `${Date.now()}`,
        pitch,
        velocity: 100,
        startTime,
        duration: this.snapValue === 0 ? 0.25 : this.snapValue,
        channel: 1
      };

      this.notes.push(newNote);
      if (this.activeTrack) {
        this.activeTrack.addNote(newNote);
      }
      this.renderNotes();
    });
  }
}
