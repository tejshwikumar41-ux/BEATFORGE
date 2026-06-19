export class WaveformDisplay {
  static drawWaveform(
    canvas: HTMLCanvasElement,
    buffer: AudioBuffer | null,
    color: string = '#4ECDC4'
  ): void {
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!buffer) {
      // Draw placeholder waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.05) * (h / 3) * Math.sin(x * 0.005);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      return;
    }

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / w);
    const amp = h / 2;

    ctx.fillStyle = color;
    for (let i = 0; i < w; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const dat = data[i * step + j];
        if (dat < min) min = dat;
        if (dat > max) max = dat;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }
}
