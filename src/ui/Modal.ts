export class Modal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    document.body.appendChild(this.overlay);

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });
  }

  show(title: string, content: HTMLElement | string): void {
    this.overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;

    const body = this.overlay.querySelector('.modal-body') as HTMLElement;
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }

    const closeBtn = this.overlay.querySelector('.modal-close') as HTMLElement;
    closeBtn.addEventListener('click', () => this.close());

    this.overlay.classList.remove('hidden');
  }

  close(): void {
    this.overlay.classList.add('hidden');
  }
}
