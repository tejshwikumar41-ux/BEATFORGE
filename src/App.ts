import { AudioEngine } from './core/AudioEngine';
import { Transport } from './core/Transport';
import { Mixer } from './core/Mixer';
import { ProjectManager } from './core/ProjectManager';
import { MidiEngine } from './core/MidiEngine';
import { Track } from './core/Track';
import { TransportBar } from './ui/TransportBar';
import { Timeline } from './ui/Timeline';
import { PianoRoll } from './ui/PianoRoll';
import { MixerUI } from './ui/MixerUI';
import { TrackPanel } from './ui/TrackPanel';
import { EffectsPanel } from './ui/EffectsPanel';
import { InstrumentPanel } from './ui/InstrumentPanel';
import { BeatLibrary } from './ui/BeatLibrary';
import { Synthesizer } from './instruments/Synthesizer';

// Import CSS
import './styles/main.css';
import './styles/mixer.css';
import './styles/piano-roll.css';
import './styles/timeline.css';
import './styles/effects.css';
import './styles/instruments.css';

export class App {
  private audioEngine: AudioEngine;
  private transport: Transport;
  private mixer: Mixer;
  private projectManager: ProjectManager;
  private midiEngine: MidiEngine;

  private transportBar!: TransportBar;
  private timeline!: Timeline;
  private pianoRoll!: PianoRoll;
  private mixerUI!: MixerUI;
  private trackPanel!: TrackPanel;
  private effectsPanel!: EffectsPanel;
  private instrumentPanel!: InstrumentPanel;
  private beatLibrary!: BeatLibrary;

  private activeTrack: Track | null = null;

  constructor() {
    this.audioEngine = new AudioEngine();
    this.transport = new Transport(this.audioEngine);
    this.mixer = new Mixer(this.audioEngine);
    this.projectManager = new ProjectManager();
    this.midiEngine = new MidiEngine();
  }

  async start(): Promise<void> {
    const splash = document.getElementById('splash-screen')!;
    const startBtn = document.getElementById('start-btn')!;
    const studio = document.getElementById('studio')!;

    startBtn.addEventListener('click', async () => {
      await this.audioEngine.init();
      this.transport.init();
      this.midiEngine.init(); // Initialize asynchronously in the background

      splash.classList.add('hidden');
      studio.classList.remove('hidden');

      this.setupWorkspace(studio);
      this.addDefaultTracks();
    });
  }

  private setupWorkspace(container: HTMLElement): void {
    container.innerHTML = `
      <header class="topnav" id="transport-bar-container"></header>
      <div class="studio-main">
        <aside class="left-panel">
          <div id="track-panel-container"></div>
          <div id="instrument-panel-container"></div>
          <div id="effects-panel-container"></div>
          <div id="beat-library-container"></div>
        </aside>
        <main class="main-content">
          <div class="tabs">
            <button class="tab-btn active" id="tab-timeline-btn">Arrangement</button>
            <button class="tab-btn" id="tab-piano-btn">Piano Roll</button>
            <button class="tab-btn" id="tab-mixer-btn">Mixer</button>
          </div>
          <div class="tab-views">
            <div class="tab-view-content" id="view-timeline"></div>
            <div class="tab-view-content hidden" id="view-piano"></div>
            <div class="tab-view-content hidden" id="view-mixer"></div>
          </div>
        </main>
      </div>
    `;

    // Initialize UI Panels
    this.transportBar = new TransportBar(
      container.querySelector('#transport-bar-container')!,
      this.transport,
      this.projectManager
    );

    this.trackPanel = new TrackPanel(container.querySelector('#track-panel-container')!);
    this.effectsPanel = new EffectsPanel(container.querySelector('#effects-panel-container')!);
    this.beatLibrary = new BeatLibrary(container.querySelector('#beat-library-container')!);

    const timelineContainer = container.querySelector('#view-timeline') as HTMLElement;
    this.timeline = new Timeline(timelineContainer, this.transport);

    const pianoContainer = container.querySelector('#view-piano') as HTMLElement;
    this.pianoRoll = new PianoRoll(pianoContainer);

    const mixerContainer = container.querySelector('#view-mixer') as HTMLElement;
    this.mixerUI = new MixerUI(mixerContainer, this.mixer, (v) => {
      this.audioEngine.setMasterVolume(v);
    });

    // Create a dummy synthesizer for the panel display
    const dummySynth = new Synthesizer(this.audioEngine.context, this.audioEngine.getMasterOutput());
    this.instrumentPanel = new InstrumentPanel(
      container.querySelector('#instrument-panel-container')!,
      dummySynth
    );

    this.bindEvents();
    this.setupViewTabs();
  }

  private bindEvents(): void {
    this.trackPanel.onAddTrack = (type) => {
      const track = new Track(this.audioEngine, {
        name: `Track ${this.mixer.getAllTracks().length + 1}`,
        type
      });
      this.mixer.addTrack(track);
      this.syncTracks();
    };

    this.timeline.onSelectTrack = (track) => {
      this.activeTrack = track;
      this.pianoRoll.setTrack(track);
      this.effectsPanel.setTrack(track);
    };

    this.beatLibrary.onLoadPattern = (pattern) => {
      // Load pattern into a drum track
      const drumTrack = this.mixer.getAllTracks().find(t => t.type === 'drum');
      if (drumTrack) {
        // Map drum patterns steps
        pattern.tracks.forEach(pt => {
          pt.steps.forEach((step, index) => {
            if (step) {
              drumTrack.addNote({
                id: `${Date.now()}-${Math.random()}`,
                pitch: pt.pitch,
                velocity: pt.velocity[index] || 100,
                startTime: index * 0.25,
                duration: 0.25,
                channel: 10
              });
            }
          });
        });
        this.syncTracks();
      }
    };

    this.midiEngine.onMessage((status, data1, data2) => {
      // Direct MIDI notes to active track synth/sampler fallback
      const type = status & 0xf0;
      if (type === 0x90 && data2 > 0) {
        // Note On
        this.mixer.getAllTracks().forEach(track => {
          if (track.armed && track.type === 'midi') {
            // Play note on synth
          }
        });
      }
    });
  }

  private syncTracks(): void {
    const tracks = this.mixer.getAllTracks();
    this.timeline.setTracks(tracks);
    this.mixerUI.renderTracks();
  }

  private addDefaultTracks(): void {
    const defaultMidi = new Track(this.audioEngine, { name: 'Lead Synth', type: 'midi' });
    const defaultDrum = new Track(this.audioEngine, { name: 'Drum Kit', type: 'drum' });

    this.mixer.addTrack(defaultMidi);
    this.mixer.addTrack(defaultDrum);

    this.syncTracks();
    this.timeline.onSelectTrack(defaultMidi);
  }

  private setupViewTabs(): void {
    const tabs = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.tab-view-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        views.forEach(v => v.classList.add('hidden'));

        tab.classList.add('active');
        if (tab.id === 'tab-timeline-btn') {
          document.getElementById('view-timeline')!.classList.remove('hidden');
        } else if (tab.id === 'tab-piano-btn') {
          document.getElementById('view-piano')!.classList.remove('hidden');
        } else if (tab.id === 'tab-mixer-btn') {
          document.getElementById('view-mixer')!.classList.remove('hidden');
        }
      });
    });
  }
}
