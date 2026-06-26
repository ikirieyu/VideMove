import React, { useRef, useState } from 'react';
import './ImportPanel.css';

export function ImportPanel({ onVideoLoad, toast }) {
  const fileRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('video/')) {
      toast?.('Please select a valid video file', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoInfo({ name: file.name, size: (file.size / 1024 / 1024).toFixed(1), type: file.type });
    onVideoLoad?.(url, file);
    toast?.(`Loaded: ${file.name}`, 'success');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="panel import-panel animate-fadeIn">
      <div className="panel-section">
        <p className="section-title">Import Video</p>

        <div
          className={`drop-zone ${isDragging ? 'dragging' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          id="video-drop-zone"
        >
          <div className="drop-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="drop-title">{isDragging ? 'Drop it!' : 'Upload Video'}</p>
          <p className="drop-sub">MP4, MOV, WebM, AVI</p>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])}
            id="video-file-input"
          />
        </div>

        {videoInfo && (
          <div className="video-info animate-fadeIn">
            <div className="video-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div className="video-info-text">
              <span className="video-name">{videoInfo.name}</span>
              <span className="video-meta">{videoInfo.size} MB</span>
            </div>
          </div>
        )}
      </div>

      <div className="panel-divider" />

      <div className="panel-section">
        <p className="section-title">YouTube URL</p>
        <div className="yt-note">
          <div className="yt-note-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff0000">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-2.73 12.57 12.57 0 0 0-3.82-.64c-1.34 0-2.64.22-3.82.64A4.83 4.83 0 0 1 4.41 6.69 4.59 4.59 0 0 0 2 10.5v3a4.59 4.59 0 0 0 2.41 3.81 4.83 4.83 0 0 1 3.77 2.73A12.57 12.57 0 0 0 12 20.64c1.34 0 2.64-.22 3.82-.64a4.83 4.83 0 0 1 3.77-2.73A4.59 4.59 0 0 0 22 13.5v-3a4.59 4.59 0 0 0-2.41-3.81z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>YouTube Download</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              Download video dulu dari YouTube, lalu upload di atas. (Gunakan y2mate.com atau savefrom.net)
            </p>
          </div>
        </div>

        <div className="yt-links">
          <a href="https://y2mate.com" target="_blank" rel="noopener noreferrer" className="yt-link-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
            y2mate.com
          </a>
          <a href="https://savefrom.net" target="_blank" rel="noopener noreferrer" className="yt-link-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
            savefrom.net
          </a>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="panel-section">
        <p className="section-title">Supported Formats</p>
        <div className="format-list">
          {['MP4', 'MOV', 'WebM', 'AVI', 'MKV'].map((f) => (
            <span key={f} className="badge badge-purple">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
