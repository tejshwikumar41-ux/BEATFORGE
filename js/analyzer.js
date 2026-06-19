// ============================================
//   BEATFORGE PRO - ANALYZER
// ============================================

const Analyzer = {
    canvas: null,
    canvasCtx: null,
    animationId: null,

    init() {
        this.canvas = document.getElementById('frequencyCanvas');
        if (!this.canvas) return;
        this.canvasCtx = this.canvas.getContext('2d');
        this.draw();
    },

    draw() {
        this.animationId = requestAnimationFrame(() => this.draw());
        if (!this.canvasCtx || !AudioEngine.analyserNode) return;

        const width = this.canvas.width = this.canvas.clientWidth;
        const height = this.canvas.height = this.canvas.clientHeight;

        const bufferLength = AudioEngine.analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        AudioEngine.analyserNode.getByteFrequencyData(dataArray);

        this.canvasCtx.fillStyle = '#0f172a';
        this.canvasCtx.fillRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            const grad = this.canvasCtx.createLinearGradient(0, height, 0, height - barHeight);
            grad.addColorStop(0, '#0ea5e9');
            grad.addColorStop(1, '#d946ef');

            this.canvasCtx.fillStyle = grad;
            this.canvasCtx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
        }
    }
};
