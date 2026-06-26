import React from 'react';
import './Header.css';

export function Header({ projectName, onSettings, onExport, hasVideo, isExporting }) {
  return (
    <header className="header" id="app-header">
      <div className="header-left">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c5cfc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <polygon points="5,3 19,12 5,21" fill="url(#logoGrad)" />
              <circle cx="20" cy="12" r="2" fill="#a855f7" />
            </svg>
          </div>
          <span className="logo-text">
            Vide<span className="glow-text">Move</span>
          </span>
          <span className="badge badge-purple" style={{ fontSize: '9px' }}>AI</span>
        </div>

        {projectName && (
          <div className="header-project">
            <span className="header-divider">/</span>
            <span className="header-project-name">{projectName}</span>
          </div>
        )}
      </div>

      <div className="header-center">
        <div className="header-platform-badges">
          <span className="platform-badge" style={{ background: 'rgba(255, 0, 80, 0.15)', color: '#ff0050', border: '1px solid rgba(255,0,80,0.3)' }}>TikTok</span>
          <span className="platform-badge" style={{ background: 'rgba(214, 41, 118, 0.15)', color: '#d62976', border: '1px solid rgba(214,41,118,0.3)' }}>Instagram</span>
          <span className="platform-badge" style={{ background: 'rgba(24, 119, 242, 0.15)', color: '#1877f2', border: '1px solid rgba(24,119,242,0.3)' }}>Facebook</span>
          <span className="platform-badge" style={{ background: 'rgba(255, 0, 0, 0.15)', color: '#ff0000', border: '1px solid rgba(255,0,0,0.3)' }}>YouTube</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={onSettings}
          data-tooltip="Settings & API Keys"
          id="settings-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </button>

        <button
          className="btn btn-primary btn-sm"
          onClick={onExport}
          disabled={!hasVideo || isExporting}
          id="export-btn"
        >
          {isExporting ? (
            <><div className="spinner" style={{ width: 14, height: 14 }} /> Exporting...</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export Video
            </>
          )}
        </button>
      </div>
    </header>
  );
}
