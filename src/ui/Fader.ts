export class Fader {
  private container: HTMLElement;
  private value = 0.8;
  private label = '';
  private onChange: (v: number) => void;

  constructor(
    container: HTMLElement,
    label: string,
    value: number,
    onChange: (v: number) => void
  ) {
    this.container = container;
    this.value = value;
    this.label = label;
    this.onChange = onChange;

    this.render();
  }

  private render(): void {
    this.container.classList.add('fader-container');
    this.container.innerHTML = `
      <div class="fader-label">${this.label}</div>
      <div class="fader-track-wrap">
        <input type="range" min="0" max="1" step="0.01" class="fader-input" value="${this.value}">
      </div>
      <div class="fader-val-display">${Math.round(this.value * 100)}%</div>
    `;

    const input = this.container.querySelector('.fader-input') as HTMLInputElement;
    const display = this.container.querySelector('.fader-val-display') as HTMLElement;

    input.addEventListener('input', () => {
      this.value = parseFloat(input.value);
      display.innerText = `${Math.round(this.value * 100)}%`;
      this.onChange(this.value);
    });
  }

  setValue(val: number): void {
    this.value = Math.max(0, Math.min(1, val));
    const input = this.container.querySelector('.fader-input') as HTMLInputElement;
    const display = this.container.querySelector('.fader-val-display') as HTMLElement;
    if (input) input.value = this.value.toString();
    if (display) display.innerText = `${Math.round(this.value * 100)}%`;
  }
}
