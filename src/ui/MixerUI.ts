import { Mixer } from '../core/Mixer';
import { Track } from '../core/Track';
import { Fader } from './Fader';
import { Meter } from './Meter';

export class MixerUI {
  private element: HTMLElement;
  private mixer: Mixer;
  private masterVolumeCallback: (v: number) => void;

  private faders: Map<string, Fader> = new Map();
  private meters: Map<string, Meter> = new Map();
  private animId = 0;

  constructor(
    container: HTMLElement,
    mixer: Mixer,
    onMasterVolume: (v: number) => void
  ) {
    this.element = container;
    this.mixer = mixer;
    this.masterVolumeCallback = onMasterVolume;

    this.render();
    this.startMeterSync();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="mixer-strips-container"></div>
      <div class="mixer-master-strip">
        <div class="channel-strip">
          <div class="strip-header">Master</div>
          <div class="strip-body">
            <div class="meter-slot" id="master-meter-slot"></div>
            <div class="fader-slot" id="master-fader-slot"></div>
          </div>
        </div>
      </div>
    `;

    this.renderTracks();
    this.renderMaster();
  }

  renderTracks(): void {
    const container = this.element.querySelector('.mixer-strips-container') as HTMLElement;
    const tracks = this.mixer.getAllTracks();

    // Clear old meters
    this.meters.forEach(m => m.destroy());
    this.meters.clear();
    this.faders.clear();

    container.innerHTML = tracks.map(t => `
      <div class="channel-strip" data-id="${t.id}" style="border-top: 4px solid ${t.color};">
        <div class="strip-header">${t.name}</div>
        <div class="strip-body">
          <div class="pan-widget">
            <label>Pan</label>
            <input type="range" min="-1" max="1" step="0.1" class="pan-input" value="${t.pan}">
          </div>
          <div class="meter-slot" id="meter-slot-${t.id}"></div>
          <div class="fader-slot" id="fader-slot-${t.id}"></div>
          <div class="strip-controls">
            <button class="strip-btn btn-mute ${t.muted ? 'active' : ''}">M</button>
            <button class="strip-btn btn-solo ${t.solo ? 'active' : ''}">S</button>
          </div>
        </div>
      </div>
    `).join('');

    // Instantiate track sliders and meters
    tracks.forEach(t => {
      const faderSlot = container.querySelector(`#fader-slot-${t.id}`) as HTMLElement;
      const meterSlot = container.querySelector(`#meter-slot-${t.id}`) as HTMLElement;

      const f = new Fader(faderSlot, 'Vol', t.volume, (v) => {
        t.setVolume(v);
      });
      this.faders.set(t.id, f);

      const m = new Meter(meterSlot);
      this.meters.set(t.id, m);

      // Bind controls
      const strip = container.querySelector(`[data-id="${t.id}"]`) as HTMLElement;
      strip.querySelector('.pan-input')?.addEventListener('input', (e) => {
        const pan = parseFloat((e.target as HTMLInputElement).value);
        t.setPan(pan);
      });

      const muteBtn = strip.querySelector('.btn-mute') as HTMLButtonElement;
      muteBtn.addEventListener('click', () => {
        t.toggleMute();
        muteBtn.classList.toggle('active', t.muted);
      });

      const soloBtn = strip.querySelector('.btn-solo') as HTMLButtonElement;
      soloBtn.addEventListener('click', () => {
        this.mixer.toggleTrackSolo(t.id);
        soloBtn.classList.toggle('active', t.solo);
      });
    });
  }

  private renderMaster(): void {
    const faderSlot = this.element.querySelector('#master-fader-slot') as HTMLElement;
    const meterSlot = this.element.querySelector('#master-meter-slot') as HTMLElement;

    new Fader(faderSlot, 'Gain', 0.8, (v) => {
      this.masterVolumeCallback(v);
    });

    const m = new Meter(meterSlot);
    this.meters.set('master', m);
  }

  private startMeterSync(): void {
    const tick = () => {
      // Update track meters
      this.mixer.getAllTracks().forEach(t => {
        const data = t.getMeterData();
        const m = this.meters.get(t.id);
        if (m) m.update(data.left, data.right);
      });

      // Update master meter
      // master meter is updated via audio engine analyzer if accessible, 
      // or we can read from mixer volume/active track peaks
      this.animId = requestAnimationFrame(tick);
    };
    tick();
  }

  destroy(): void {
    cancelAnimationFrame(this.animId);
    this.meters.forEach(m => m.destroy());
  }
}
