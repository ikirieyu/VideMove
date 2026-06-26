import React, { useState, useEffect, useRef } from 'react';
import { transcribeAudio, segmentsToSRT, parseSRT } from '../../services/whisperService.js';
import './SubtitlePanel.css';

export function SubtitlePanel({
  videoFile,
  groqApiKey,
  showSubtitles,
  onToggleSubtitles,
  subtitles,
  onSubtitlesChange,
  onTranscriptChange,
  toast,
}) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [srtText, setSrtText] = useState('');
  const [lang, setLang] = useState('id');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (subtitles?.length) {
      setSrtText(
        subtitles
          .map((s, i) => `${i + 1}\n${formatSRTTime(s.start)} --> ${formatSRTTime(s.end)}\n${s.text}`)
          .join('\n\n')
      );
    }
  }, [subtitles]);

  const handleTranscribe = async () => {
    if (!groqApiKey) { toast?.('Add Groq API key in Settings for transcription', 'error'); return; }
    if (!videoFile) { toast?.('Load a video first', 'error'); return; }
    setIsTranscribing(true);
    try {
      const result = await transcribeAudio(groqApiKey, videoFile, lang);
      const srt = segmentsToSRT(result.segments);
      setSrtText(srt);
      const parsed = parseSRT(srt);
      onSubtitlesChange?.(parsed);
      onTranscriptChange?.(result.text);
      toast?.('Subtitles generated!', 'success');
    } catch (e) {
      toast?.(e.message, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSRTChange = (e) => {
    setSrtText(e.target.value);
    try {
      const parsed = parseSRT(e.target.value);
      onSubtitlesChange?.(parsed);
    } catch { }
  };

  const handleSRTUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setSrtText(text);
      onSubtitlesChange?.(parseSRT(text));
      toast?.('SRT file loaded!', 'success');
    };
    reader.readAsText(file);
  };

  const handleExportSRT = () => {
    if (!srtText) { toast?.('No subtitles to export', 'error'); return; }
    const blob = new Blob([srtText], { type: 'text/srt' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'subtitles.srt';
    a.click();
  };

  return (
    <div className="panel subtitle-panel animate-fadeIn">
      {/* Toggle */}
      <div className="subtitle-toggle-row">
        <div>
          <p style={{ fontSize: 13, fontWeight: 600 }}>Subtitles</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {subtitles?.length ? `${subtitles.length} lines loaded` : 'No subtitles'}
          </p>
        </div>
        <label className="toggle" id="subtitle-toggle">
          <input type="checkbox" checked={showSubtitles} onChange={(e) => onToggleSubtitles?.(e.target.checked)} />
          <span className="toggle-slider" />
        </label>
      </div>

      <div className="panel-divider" />

      {/* Auto Transcribe */}
      <div className="panel-section">
        <p className="section-title">Auto-Generate (Whisper AI)</p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <div style={{ flex: 1 }}>
            <label>Language</label>
            <select className="input select" value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="id">Indonesia 🇮🇩</option>
              <option value="en">English 🇺🇸</option>
              <option value="ms">Melayu 🇲🇾</option>
              <option value="ja">Japanese 🇯🇵</option>
              <option value="ko">Korean 🇰🇷</option>
              <option value="zh">Chinese 🇨🇳</option>
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleTranscribe}
          disabled={isTranscribing || !videoFile}
          id="transcribe-btn"
        >
          {isTranscribing ? (
            <><div className="spinner" style={{ width: 14, height: 14 }} /> Transcribing...</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
              Auto-Transcribe (Groq Whisper)
            </>
          )}
        </button>

        {!groqApiKey && (
          <div className="ai-hint" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--accent-red)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Add Groq API key in Settings (free at console.groq.com)
          </div>
        )}
      </div>

      <div className="panel-divider" />

      {/* Manual / SRT Upload */}
      <div className="panel-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="section-title">Manual / SRT File</p>
          <div style={{ display: 'flex', gap: 4 }}>
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: 11 }}>
              Upload SRT
              <input type="file" accept=".srt,.txt" style={{ display: 'none' }} onChange={handleSRTUpload} />
            </label>
            {srtText && (
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={handleExportSRT}>
                Export
              </button>
            )}
          </div>
        </div>

        <textarea
          className="input textarea"
          style={{ minHeight: 120, fontFamily: 'monospace', fontSize: 11 }}
          placeholder={`1\n00:00:00,000 --> 00:00:03,000\nHello World\n\n2\n00:00:03,500 --> 00:00:06,000\nSecond subtitle`}
          value={srtText}
          onChange={handleSRTChange}
          id="srt-editor"
        />
        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Edit SRT directly — changes apply in real-time. {subtitles?.length || 0} lines.
        </p>
      </div>
    </div>
  );
}

function formatSRTTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}
