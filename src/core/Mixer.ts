import { Track } from './Track';
import { AudioEngine } from './AudioEngine';

export class Mixer {
  private engine: AudioEngine;
  private tracks: Map<string, Track> = new Map();
  private soloActive = false;

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  addTrack(track: Track): void {
    this.tracks.set(track.id, track);
    this.updateSoloState();
  }

  removeTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.dispose();
      this.tracks.delete(trackId);
      this.updateSoloState();
    }
  }

  getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  getAllTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  setTrackVolume(trackId: string, volume: number): void {
    const track = this.tracks.get(trackId);
    if (track) track.setVolume(volume);
  }

  setTrackPan(trackId: string, pan: number): void {
    const track = this.tracks.get(trackId);
    if (track) track.setPan(pan);
  }

  toggleTrackMute(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) track.toggleMute();
  }

  toggleTrackSolo(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.toggleSolo();
      this.updateSoloState();
    }
  }

  private updateSoloState(): void {
    const tracks = Array.from(this.tracks.values());
    this.soloActive = tracks.some(t => t.solo);
  }

  isSoloActive(): boolean {
    return this.soloActive;
  }

  dispose(): void {
    this.tracks.forEach(track => track.dispose());
    this.tracks.clear();
  }
}
