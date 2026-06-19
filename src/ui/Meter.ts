export class Meter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private leftVal = 0;
  private rightVal = 0;
  private peakLeft = 0;
  private peakRight = 0;
  private animId = 0;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'meter-canvas';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.resize();
    this.draw();
  }

  resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    this.canvas.width = rect?.width || 20;
    this.canvas.height = rect?.height || 100;
  }

  update(left: number, right: number): void {
    this.leftVal = left;
    this.rightVal = right;

    if (left > this.peakLeft) this.peakLeft = left;
    if (right > this.peakRight) this.peakRight = right;
  }

  private draw = (): void => {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Decay peaks slowly
    this.peakLeft *= 0.98;
    this.peakRight *= 0.98;

    // Draw stereo bars
    const colW = (w - 3) / 2;
    this.drawBar(0, colW, this.leftVal, this.peakLeft);
    this.drawBar(colW + 3, colW, this.rightVal, this.peakRight);

    this.animId = requestAnimationFrame(this.draw);
  };

  private drawBar(x: number, w: number, val: number, peak: number): void {
    const h = this.canvas.height;
    
    // Draw background track
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.fillRect(x, 0, w, h);

    // Draw meter gradient
    const grad = this.ctx.createLinearGradient(0, h, 0, 0);
    grad.addColorStop(0, '#2ecc71');  // Green
    grad.addColorStop(0.7, '#f1c40f'); // Yellow
    grad.addColorStop(0.9, '#e74c3c'); // Red

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(x, h - val * h, w, val * h);

    // Draw peak tick
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, h - peak * h, w, 2);
  }

  destroy(): void {
    cancelAnimationFrame(this.animId);
  }
}
