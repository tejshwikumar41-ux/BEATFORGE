// ============================================
//   BEATFORGE PRO - RECORDER
// ============================================

const Recorder = {
    mediaRecorder: null,
    chunks: [],
    isRecording: false,

    init() {
        if (!AudioEngine.audioCtx) AudioEngine.init();
        try {
            const dest = AudioEngine.audioCtx.createMediaStreamDestination();
            AudioEngine.masterGain.connect(dest);

            this.mediaRecorder = new MediaRecorder(dest.stream);
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };
            this.mediaRecorder.onstop = () => {
                this.exportWav();
            };
        } catch(e) {
            console.error('Recorder initialization error:', e);
        }
    },

    toggle() {
        if (!this.mediaRecorder) this.init();
        if (!this.mediaRecorder) return;

        const recBtn = document.getElementById('recBtn');
        if (this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            if (recBtn) recBtn.classList.remove('recording');
            showToast('Recording stopped. Downloading audio...');
        } else {
            this.chunks = [];
            this.mediaRecorder.start();
            this.isRecording = true;
            if (recBtn) recBtn.classList.add('recording');
            showToast('Recording started...');
        }
    },

    exportWav() {
        if (this.chunks.length === 0) return;
        const blob = new Blob(this.chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'beatforge-pro-render.wav';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
};

function toggleRecord() {
    Recorder.toggle();
}

function exportAudio() {
    Recorder.exportWav();
}
