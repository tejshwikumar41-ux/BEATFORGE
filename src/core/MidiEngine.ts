type MidiMessageCallback = (status: number, data1: number, data2: number) => void;

export class MidiEngine {
  private inputs: any[] = [];
  private onMessageCallbacks: Set<MidiMessageCallback> = new Set();
  private initialized = false;
  
  onStateChange: ((status: string) => void) | null = null;

  async init(): Promise<boolean> {
    if (this.initialized) return true;
    if (!navigator.requestMIDIAccess) {
      this.notifyStatus('Web MIDI API is not supported in this browser.');
      return false;
    }

    try {
      const midiAccess = await navigator.requestMIDIAccess();
      this.initialized = true;
      this.setupInputs(midiAccess);
      
      // Device hot-plugging detection
      midiAccess.onstatechange = (e: any) => {
        this.setupInputs(midiAccess);
        this.notifyStatus(`MIDI Device ${e.port.name} is now ${e.port.state}`);
      };
      
      this.notifyStatus('MIDI Access granted successfully.');
      return true;
    } catch (e) {
      this.notifyStatus('MIDI Access permission denied.');
      console.warn('Failed to get MIDI access:', e);
      return false;
    }
  }

  private runningStatus = 0;

  private setupInputs(midiAccess: any): void {
    this.inputs = Array.from(midiAccess.inputs.values());
    this.inputs.forEach(input => {
      input.onmidimessage = (e: any) => this.handleMidiMessage(e);
    });
  }

  private handleMidiMessage(event: any): void {
    const rawData = Array.from(event.data) as number[];
    if (rawData.length === 0) return;

    let status = rawData[0];
    let dataOffset = 1;

    // Filter out MIDI Clock (0xF8) and other real-time messages
    if (status === 0xF8) {
      return;
    }

    // Running Status byte evaluation
    if (status >= 0x80) {
      if (status < 0xF0) {
        this.runningStatus = status;
      }
    } else {
      if (this.runningStatus >= 0x80) {
        status = this.runningStatus;
        dataOffset = 0;
      } else {
        return; // Discard invalid state
      }
    }

    const data1 = rawData[dataOffset] !== undefined ? rawData[dataOffset] : 0;
    const data2 = rawData[dataOffset + 1] !== undefined ? rawData[dataOffset + 1] : 0;
    
    // Normalize Note-on with velocity 0 as a Note-off event (0x80 status)
    let parsedStatus = status;
    const command = status & 0xf0;
    if (command === 0x90 && data2 === 0) {
      parsedStatus = 0x80 | (status & 0x0f); // Convert to Note-off
    }

    this.onMessageCallbacks.forEach(cb => cb(parsedStatus, data1, data2));
  }

  private notifyStatus(msg: string): void {
    if (this.onStateChange) this.onStateChange(msg);
  }

  onMessage(callback: MidiMessageCallback): () => void {
    this.onMessageCallbacks.add(callback);
    return () => this.onMessageCallbacks.delete(callback);
  }
}
