// Whisper transcription via Groq API (free tier: 28,800 sec audio/day)
// Groq offers free Whisper inference - fastest available

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

/**
 * Transcribe audio/video file using Groq Whisper
 * @param {string} apiKey - Groq API key (free at console.groq.com)
 * @param {File|Blob} audioFile
 * @param {string} language - e.g. 'id' for Indonesian, 'en' for English
 * @returns {Promise<{ text, segments }>}
 */
export async function transcribeAudio(apiKey, audioFile, language = 'id') {
  if (!apiKey) throw new Error('Groq API key required for transcription');

  const formData = new FormData();
  formData.append('file', audioFile, 'audio.webm');
  formData.append('model', 'whisper-large-v3');
  formData.append('language', language);
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  const res = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error: ${res.status}`);
  }

  return await res.json();
}

/**
 * Convert Groq Whisper segments to SRT format
 */
export function segmentsToSRT(segments) {
  if (!segments?.length) return '';
  return segments
    .map((seg, i) => {
      const start = formatSRTTime(seg.start);
      const end = formatSRTTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text.trim()}\n`;
    })
    .join('\n');
}

/**
 * Parse SRT string to array of subtitle objects
 */
export function parseSRT(srtString) {
  const blocks = srtString.trim().split(/\n\n+/);
  return blocks
    .map((block) => {
      const lines = block.trim().split('\n');
      if (lines.length < 3) return null;
      const timeMatch = lines[1].match(
        /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/
      );
      if (!timeMatch) return null;
      return {
        id: parseInt(lines[0]),
        start: parseSRTTime(timeMatch[1]),
        end: parseSRTTime(timeMatch[2]),
        text: lines.slice(2).join('\n'),
      };
    })
    .filter(Boolean);
}

function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function parseSRTTime(timeStr) {
  const [time, ms] = timeStr.split(',');
  const [h, m, s] = time.split(':').map(Number);
  return h * 3600 + m * 60 + s + parseInt(ms) / 1000;
}

function pad(n, len = 2) {
  return String(n).padStart(len, '0');
}
