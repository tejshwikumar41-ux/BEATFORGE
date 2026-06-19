export class Knob {
  private container: HTMLElement;
  private value = 0.5;
  private min = 0;
  private max = 1;
  private label = '';
  private onChange: (v: number) => void;

  private isDragging = false;
  private startY = 0;
  private startValue = 0.5;

  private svgIndicator!: SVGPathElement;
  private valueDisplay!: HTMLElement;
  private dialBody!: HTMLElement;

  constructor(
    container: HTMLElement,
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void
  ) {
    this.container = container;
    this.value = value;
    this.min = min;
    this.max = max;
    this.label = label;
    this.onChange = onChange;

    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.container.classList.add('knob-container');
    this.container.innerHTML = `
      <div class="knob-label">${this.label}</div>
      <div class="knob-body" role="slider" aria-label="${this.label}" aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-valuenow="${this.value}" tabindex="0">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" class="knob-track" />
          <path class="knob-indicator" d="" />
        </svg>
        <div class="knob-dial"></div>
      </div>
      <div class="knob-val-display">50%</div>
    `;

    this.svgIndicator = this.container.querySelector('.knob-indicator') as SVGPathElement;
    this.valueDisplay = this.container.querySelector('.knob-val-display') as HTMLElement;
    this.dialBody = this.container.querySelector('.knob-body') as HTMLElement;
    this.updateUI();
  }

  private bindEvents(): void {
    this.dialBody.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      this.startValue = this.value;
      document.body.classList.add('no-select');
      this.dialBody.focus();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaY = this.startY - e.clientY;
      const sensitivity = 0.005;
      const range = this.max - this.min;
      let newValue = this.startValue + deltaY * sensitivity * range;
      newValue = Math.max(this.min, Math.min(this.max, newValue));

      if (newValue !== this.value) {
        this.value = newValue;
        this.onChange(this.value);
        this.updateUI();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        document.body.classList.remove('no-select');
      }
    });

    // Keyboard accessibility support
    this.dialBody.addEventListener('keydown', (e) => {
      const isShift = e.shiftKey;
      const step = (this.max - this.min) * (isShift ? 0.10 : 0.01); // 10% coarse, 1% fine
      let newValue = this.value;

      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        newValue = Math.min(this.max, this.value + step);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        newValue = Math.max(this.min, this.value - step);
        e.preventDefault();
      }

      if (newValue !== this.value) {
        this.value = newValue;
        this.onChange(this.value);
        this.updateUI();
      }
    });
  }

  private updateUI(): void {
    const percent = (this.value - this.min) / (this.max - this.min);
    const rotation = -135 + percent * 270;
    
    const dial = this.container.querySelector('.knob-dial') as HTMLElement;
    if (dial) dial.style.transform = `rotate(${rotation}deg)`;

    // Draw active arc
    const startAngle = -135;
    const endAngle = rotation;
    this.svgIndicator.setAttribute('d', this.describeArc(50, 50, 40, startAngle, endAngle));

    // Update ARIA values
    this.dialBody.setAttribute('aria-valuenow', this.value.toString());

    // Update value text
    if (this.max === 100) {
      this.valueDisplay.innerText = `${Math.round(this.value)}%`;
    } else {
      this.valueDisplay.innerText = this.value.toFixed(2);
    }
  }

  private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  private describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }
}
