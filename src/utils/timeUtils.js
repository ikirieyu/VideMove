// Time utility functions

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00.0';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}.${ms}`;
  return `${m}:${pad(s)}.${ms}`;
}

export function formatTimecode(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function parseTime(str) {
  // Supports: "1:23.4", "01:23", "83.4"
  const parts = str.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  } else if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(str);
}

function pad(n) {
  return String(n).padStart(2, '0');
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Resolution presets
export const RESOLUTION_PRESETS = [
  { id: 'landscape1080', label: 'Landscape 1080p', width: 1920, height: 1080, platform: 'YouTube', ratio: '16:9' },
  { id: 'portrait1080', label: 'Portrait 1080p', width: 1080, height: 1920, platform: 'TikTok / Reels', ratio: '9:16' },
  { id: 'square1080', label: 'Square 1080p', width: 1080, height: 1080, platform: 'Instagram', ratio: '1:1' },
  { id: 'landscape720', label: 'Landscape 720p', width: 1280, height: 720, platform: 'YouTube', ratio: '16:9' },
  { id: 'portrait720', label: 'Portrait 720p', width: 720, height: 1280, platform: 'Shorts', ratio: '9:16' },
  { id: 'custom', label: 'Custom', width: null, height: null, platform: 'Custom', ratio: 'Custom' },
];
