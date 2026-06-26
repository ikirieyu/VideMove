// TTS Service using Web Speech API (browser built-in) + ElevenLabs free fallback

/**
 * Get available voices for a language
 */
export function getVoices(langCode = 'id-ID') {
  return new Promise((resolve) => {
    const tryGet = () => {
      const voices = window.speechSynthesis.getVoices();
      const filtered = voices.filter(
        (v) => v.lang.startsWith(langCode.split('-')[0])
      );
      resolve(filtered.length ? filtered : voices);
    };
    // Chrome needs event
    if (window.speechSynthesis.getVoices().length > 0) {
      tryGet();
    } else {
      window.speechSynthesis.onvoiceschanged = tryGet;
    }
  });
}

/**
 * Speak text using Web Speech API
 * @param {string} text
 * @param {object} options - { lang, rate, pitch, volume, voice }
 * @returns {Promise} resolves when speech ends
 */
export function speak(text, options = {}) {
  return new Promise((resolve, reject) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'id-ID';
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    if (options.voice) utterance.voice = options.voice;
    utterance.onend = resolve;
    utterance.onerror = reject;
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

/**
 * Record audio from microphone
 * @returns {{ start, stop, getBlob }}
 */
export function createMicRecorder() {
  let mediaRecorder = null;
  let chunks = [];
  let stream = null;

  return {
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start(100);
    },
    stop() {
      return new Promise((resolve) => {
        if (!mediaRecorder) return resolve(null);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          stream?.getTracks().forEach((t) => t.stop());
          resolve(blob);
        };
        mediaRecorder.stop();
      });
    },
  };
}

// Language options for TTS
export const TTS_LANGUAGES = [
  { code: 'id-ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'ms-MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', flag: '🇨🇳' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
];
