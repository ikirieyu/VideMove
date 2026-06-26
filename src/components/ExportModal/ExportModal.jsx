import React, { useState } from 'react';
import { RESOLUTION_PRESETS } from '../../utils/timeUtils.js';
import './ExportModal.css';

export function ExportModal({ onClose, onExport, trimStart, trimEnd, duration, isExporting, exportProgress }) {
  const [selectedPreset, setSelectedPreset] = useState('landscape1080');
  const [customW, setCustomW] = useState(1920);
  const [customH, setCustomH] = useState(1080);
  const [quality, setQuality] = useState('high');
  const [format, setFormat] = useState('mp4');
  const [burnSubtitles, setBurnSubtitles] = useState(true);

  const preset = RESOLUTION_PRESETS.find((p) => p.id === selectedPreset);
  const width = selectedPreset === 'custom' ? customW : preset?.width;
  const height = selectedPreset === 'custom' ? customH : preset?.height;
  const clipDur = (trimEnd || duration) - trimStart;

  const QUALITY_OPTIONS = [
    { id: 'high', label: 'High Quality', crf: 18, desc: '~10-30 MB/min', color: '#7c5cfc' },
    { id: 'medium', label: 'Medium', crf: 23, desc: '~5-15 MB/min', color: '#22d3ee' },
    { id: 'low', label: 'Small File', crf: 28, desc: '~2-8 MB/min', color: '#10b981' },
  ];

  const handleExport = () => {
    onExport?.({
      width,
      height,
      quality,
      format,
      burnSubtitles,
      trimStart,
      trimEnd: trimEnd || duration,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content export-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="export-modal-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Export Video</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Clip duration: {Math.round(clipDur)}s
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Resolution */}
          <div className="export-section">
            <p className="section-title">Resolution</p>
            <div className="resolution-grid">
              {RESOLUTION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  className={`resolution-btn ${selectedPreset === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedPreset(p.id)}
                  id={`res-${p.id}`}
                >
                  <span className="res-ratio">{p.ratio}</span>
                  <span className="res-label">{p.label.replace(' 1080p', '').replace(' 720p', '')}</span>
                  {p.width && <span className="res-size">{p.width}×{p.height}</span>}
                  <span className="res-platform">{p.platform}</span>
                </button>
              ))}
            </div>

            {selectedPreset === 'custom' && (
              <div className="custom-res animate-fadeIn">
                <div>
                  <label>Width (px)</label>
                  <input type="number" className="input" value={customW}
                    onChange={(e) => setCustomW(parseInt(e.target.value))} min={240} max={7680} step={2} />
                </div>
                <div>
                  <label>Height (px)</label>
                  <input type="number" className="input" value={customH}
                    onChange={(e) => setCustomH(parseInt(e.target.value))} min={240} max={7680} step={2} />
                </div>
              </div>
            )}
          </div>

          {/* Quality */}
          <div className="export-section">
            <p className="section-title">Quality</p>
            <div className="quality-options">
              {QUALITY_OPTIONS.map((q) => (
                <button
                  key={q.id}
                  className={`quality-btn ${quality === q.id ? 'active' : ''}`}
                  onClick={() => setQuality(q.id)}
                  style={quality === q.id ? { borderColor: q.color, background: `${q.color}15` } : {}}
                  id={`quality-${q.id}`}
                >
                  <span className="quality-label" style={quality === q.id ? { color: q.color } : {}}>{q.label}</span>
                  <span className="quality-desc">{q.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="export-section">
            <p className="section-title">Options</p>
            <div className="export-options">
              <div className="export-option-row">
                <div>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>Burn-in Subtitles</span>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Embed subtitles into video</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={burnSubtitles} onChange={(e) => setBurnSubtitles(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="export-summary">
            <div className="export-summary-row">
              <span>Resolution</span>
              <span>{width} × {height}</span>
            </div>
            <div className="export-summary-row">
              <span>Duration</span>
              <span>{Math.round(clipDur)}s</span>
            </div>
            <div className="export-summary-row">
              <span>Format</span>
              <span>MP4 (H.264)</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {isExporting && (
            <div className="export-progress">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${exportProgress}%` }} />
              </div>
              <span>{exportProgress}%</span>
            </div>
          )}
          <button className="btn btn-ghost" onClick={onClose} disabled={isExporting}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
            id="start-export-btn"
          >
            {isExporting ? (
              <><div className="spinner" style={{ width: 14, height: 14 }} /> Exporting...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Export MP4
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
