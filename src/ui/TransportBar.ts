import { Transport } from '../core/Transport';
import { ProjectManager } from '../core/ProjectManager';
import { MusicTheory } from '../utils/MusicTheory';

export class TransportBar {
  private element: HTMLElement;
  private transport: Transport;
  private projectManager: ProjectManager;

  private playBtn!: HTMLButtonElement;
  private recBtn!: HTMLButtonElement;
  private loopBtn!: HTMLButtonElement;
  private metroBtn!: HTMLButtonElement;
  private bpmInput!: HTMLInputElement;
  private timeDisplay!: HTMLElement;

  onSave!: () => void;
  onOpen!: () => void;
  onExport!: () => void;

  constructor(container: HTMLElement, transport: Transport, pm: ProjectManager) {
    this.element = container;
    this.transport = transport;
    this.projectManager = pm;

    this.render();
    this.bindEvents();
    this.setupTransportSync();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="topnav-left">
        <div class="brand">
          <div class="brand-icon"><i class="fas fa-wave-square"></i></div>
          <div class="brand-text">
            <span class="brand-name">Studio Pro</span>
            <span class="brand-tag">DAW</span>
          </div>
        </div>
        <div class="nav-divider"></div>
        <div class="project-name">
          <input type="text" id="projectName" value="${this.projectManager.getProject().name}" spellcheck="false">
        </div>
      </div>

      <div class="topnav-center">
        <div class="transport-bar">
          <button class="transport-btn" id="rewindBtn" title="Rewind to Start">
            <i class="fas fa-backward"></i>
          </button>
          <button class="transport-btn btn-play" id="playBtn" title="Play/Pause">
            <i class="fas fa-play" id="playIcon"></i>
          </button>
          <button class="transport-btn btn-rec" id="recBtn" title="Record">
            <i class="fas fa-circle"></i>
          </button>
          <button class="transport-btn" id="loopBtn" title="Loop Toggle">
            <i class="fas fa-redo"></i>
          </button>
          <button class="transport-btn" id="metroBtn" title="Metronome">
            <i class="fas fa-bell"></i>
          </button>
        </div>

        <div class="bpm-widget">
          <button class="bpm-btn" id="bpmDec">−</button>
          <div class="bpm-display">
            <input type="number" id="bpmInput" value="${this.transport.bpm}" min="20" max="300">
            <span class="bpm-label">BPM</span>
          </div>
          <button class="bpm-btn" id="bpmInc">+</button>
        </div>

        <div class="time-widget" id="timeDisplay">
          001.1.000
        </div>
      </div>

      <div class="topnav-right">
        <button class="nav-btn" id="saveBtn"><i class="fas fa-save"></i> Save</button>
        <button class="nav-btn" id="openBtn"><i class="fas fa-folder-open"></i> Open</button>
        <button class="nav-btn primary" id="exportBtn"><i class="fas fa-download"></i> Export</button>
      </div>
    `;

    this.playBtn = this.element.querySelector('#playBtn') as HTMLButtonElement;
    this.recBtn = this.element.querySelector('#recBtn') as HTMLButtonElement;
    this.loopBtn = this.element.querySelector('#loopBtn') as HTMLButtonElement;
    this.metroBtn = this.element.querySelector('#metroBtn') as HTMLButtonElement;
    this.bpmInput = this.element.querySelector('#bpmInput') as HTMLInputElement;
    this.timeDisplay = this.element.querySelector('#timeDisplay') as HTMLElement;
  }

  private bindEvents(): void {
    this.playBtn.addEventListener('click', () => {
      if (this.transport.isPlaying) {
        this.transport.stop();
      } else {
        this.transport.play();
      }
    });

    this.recBtn.addEventListener('click', () => {
      if (this.transport.isRecording) {
        this.transport.stop();
      } else {
        this.transport.record();
      }
    });

    this.loopBtn.addEventListener('click', () => {
      this.transport.toggleLoop();
      this.updateButtons();
    });

    this.metroBtn.addEventListener('click', () => {
      this.transport.toggleMetronome();
      this.updateButtons();
    });

    this.element.querySelector('#rewindBtn')?.addEventListener('click', () => {
      this.transport.seek(0);
    });

    this.bpmInput.addEventListener('change', () => {
      this.transport.bpm = parseInt(this.bpmInput.value);
      this.projectManager.updateProject({ bpm: this.transport.bpm });
    });

    this.element.querySelector('#bpmDec')?.addEventListener('click', () => {
      this.transport.bpm--;
      this.bpmInput.value = this.transport.bpm.toString();
      this.projectManager.updateProject({ bpm: this.transport.bpm });
    });

    this.element.querySelector('#bpmInc')?.addEventListener('click', () => {
      this.transport.bpm++;
      this.bpmInput.value = this.transport.bpm.toString();
      this.projectManager.updateProject({ bpm: this.transport.bpm });
    });

    const nameInput = this.element.querySelector('#projectName') as HTMLInputElement;
    nameInput.addEventListener('change', () => {
      this.projectManager.updateProject({ name: nameInput.value });
    });

    this.element.querySelector('#saveBtn')?.addEventListener('click', () => this.onSave?.());
    this.element.querySelector('#openBtn')?.addEventListener('click', () => this.onOpen?.());
    this.element.querySelector('#exportBtn')?.addEventListener('click', () => this.onExport?.());
  }

  private setupTransportSync(): void {
    this.transport.onTick((beat) => {
      this.timeDisplay.innerText = MusicTheory.beatsToBarPosition(beat);
    });

    this.transport.onPlay(() => this.updateButtons());
    this.transport.onStop(() => this.updateButtons());
    this.updateButtons();
  }

  private updateButtons(): void {
    const playIcon = this.playBtn.querySelector('#playIcon') as HTMLElement;
    if (this.transport.isPlaying) {
      this.playBtn.classList.add('active');
      playIcon.className = 'fas fa-pause';
    } else {
      this.playBtn.classList.remove('active');
      playIcon.className = 'fas fa-play';
    }

    if (this.transport.isRecording) {
      this.recBtn.classList.add('active');
    } else {
      this.recBtn.classList.remove('active');
    }

    if (this.transport.loopEnabled) {
      this.loopBtn.classList.add('active');
    } else {
      this.loopBtn.classList.remove('active');
    }

    if (this.transport.metronomeEnabled) {
      this.metroBtn.classList.add('active');
    } else {
      this.metroBtn.classList.remove('active');
    }
  }
}
