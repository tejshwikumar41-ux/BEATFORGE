import { AudioEngine } from './AudioEngine';
import { Track } from './Track';

export class AudioRecorder {
  private engine: AudioEngine;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  async requestMicAccess(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });
      return true;
    } catch (e) {
      console.error('Microphone access denied:', e);
      return false;
    }
  }

  startRecording(track: Track): void {
    if (!this.stream || this.isRecording) return;

    // Connect microphone to track
    const source = this.engine.context.createMediaStreamSource(this.stream);
    source.connect(track.input);

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
  }

  async stopRecording(): Promise<AudioBuffer | null> {
    if (!this.mediaRecorder || !this.isRecording) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        try {
          const audioBuffer = await this.engine.context.decodeAudioData(arrayBuffer);
          resolve(audioBuffer);
        } catch (e) {
          console.error('Error decoding recorded audio:', e);
          resolve(null);
        }
      };

      this.mediaRecorder!.stop();
      this.isRecording = false;
    });
  }

  async exportMix(duration: number): Promise<Blob> {
    const offlineCtx = new OfflineAudioContext(2, 
      this.engine.context.sampleRate * duration,
      this.engine.context.sampleRate
    );

    // Render the mix
    const renderedBuffer = await offlineCtx.startRendering();
    
    // Convert to WAV
    const { AudioUtils } = await import('../utils/AudioUtils');
    return AudioUtils.bufferToWav(renderedBuffer);
  }

  dispose(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    this.mediaRecorder = null;
    this.stream = null;
  }
}
