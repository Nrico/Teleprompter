// Lightweight voice listener for web teleprompter
// Uses Web Speech API when available with fallback to volume based detection
// Exported class: VoiceListener
// Compatible with modern browsers without dependencies

export class VoiceListener {
  constructor(options = {}) {
    this.onTranscriptionUpdate = options.onTranscriptionUpdate || (() => {});
    this.onPauseDetected = options.onPauseDetected || (() => {});
    this.onError = options.onError || (() => {});
    this.method = null; // 'webspeech' or 'volume-fallback'

    this._recognition = null; // SpeechRecognition instance
    this._audioContext = null;
    this._mediaStream = null;
    this._volumeInterval = null;
    this._speaking = false;
    this._lastSpeech = 0;
  }

  // Determine which method is supported
  _detectMethod() {
    if (typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) return 'webspeech';
    }
    return 'volume-fallback';
  }

  async start() {
    this.method = this._detectMethod();
    console.log('Using voice recognition method:', this.method);

    if (this.method === 'webspeech') {
      return this._startWebSpeech();
    } else {
      return this._startVolumeFallback();
    }
  }

  stop() {
    if (this.method === 'webspeech') {
      this._stopWebSpeech();
    } else if (this.method === 'volume-fallback') {
      this._stopVolumeFallback();
    }
  }

  // ------------------ Web Speech API ------------------
  _startWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Should not happen as method check ensures this
      console.warn('Web Speech API not supported');
      this.method = 'volume-fallback';
      return this._startVolumeFallback();
    }
    this._recognition = new SpeechRecognition();
    this._recognition.continuous = true;
    this._recognition.interimResults = true;

    this._recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join(' ');
      this.onTranscriptionUpdate(transcript);
    };

    this._recognition.onerror = (e) => {
      this.onError(e);
    };

    try {
      this._recognition.start();
    } catch (err) {
      // Some browsers throw if called twice
      this.onError(err);
    }
  }

  _stopWebSpeech() {
    if (this._recognition) {
      this._recognition.onresult = null;
      this._recognition.onerror = null;
      try { this._recognition.stop(); } catch (_) {}
      this._recognition = null;
    }
  }

  // ------------------ Volume Fallback ------------------
  async _startVolumeFallback() {
    try {
      this._mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      this.onError(err);
      return;
    }

    this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = this._audioContext.createMediaStreamSource(this._mediaStream);
    const analyser = this._audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const data = new Uint8Array(analyser.fftSize);
    source.connect(analyser);

    this._speaking = false;
    this._lastSpeech = performance.now();

    const checkVolume = () => {
      analyser.getByteTimeDomainData(data);
      // Normalized RMS
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const now = performance.now();
      const threshold = 0.05; // simple noise threshold

      if (rms > threshold) {
        this._speaking = true;
        this._lastSpeech = now;
      } else {
        if (this._speaking && now - this._lastSpeech > 400) {
          // Considered a pause after 400ms of silence
          this._speaking = false;
          this.onPauseDetected();
        }
      }
    };

    this._volumeInterval = setInterval(checkVolume, 100);
  }

  _stopVolumeFallback() {
    if (this._volumeInterval) {
      clearInterval(this._volumeInterval);
      this._volumeInterval = null;
    }
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach(t => t.stop());
      this._mediaStream = null;
    }
    if (this._audioContext) {
      this._audioContext.close();
      this._audioContext = null;
    }
  }
}

// Example usage (not executed automatically):
// const listener = new VoiceListener({
//   onTranscriptionUpdate: text => {
//     // Scroll teleprompter or highlight script here
//     console.log('Transcribed:', text);
//   },
//   onPauseDetected: () => {
//     // Could trigger scroll advancement when speaker pauses
//     console.log('Pause detected');
//   },
//   onError: err => console.error(err)
// });
// listener.start();
