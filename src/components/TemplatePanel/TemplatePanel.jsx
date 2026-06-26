import React, { useState } from 'react';
import { TEMPLATES } from '../../templates/templates.js';
import { ASPECT_RATIOS } from '../../services/aiService.js';
import './TemplatePanel.css';

export function TemplatePanel({
  selectedTemplate,
  onSelectTemplate,
  title,
  onTitleChange,
  layoutSettings,
  onLayoutChange,
}) {
  const [activeTab, setActiveTab] = useState('template');

  const layout = layoutSettings || {};
  const update = (key, val) => onLayoutChange?.({ ...layout, [key]: val });

  const SubtitlePositions = ['bottom', 'center', 'top'];
  const TitlePositions = ['bottom', 'center', 'top'];

  return (
    <div className="panel template-panel animate-fadeIn">
      {/* Tab switcher */}
      <div className="tabs" style={{ margin: '0' }}>
        <button className={`tab ${activeTab === 'template' ? 'active' : ''}`} onClick={() => setActiveTab('template')}>
          🎨 Template
        </button>
        <button className={`tab ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')}>
          📐 Layout
        </button>
      </div>

      {/* ── Template Tab ── */}
      {activeTab === 'template' && (
        <div className="animate-fadeIn">
          <div className="panel-section">
            <p className="section-title">Templates</p>
            <div className="template-grid">
              {Object.values(TEMPLATES).map((tpl) => (
                <div
                  key={tpl.id}
                  className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                  onClick={() => onSelectTemplate(tpl.id)}
                  id={`template-${tpl.id}`}
                >
                  <div className="template-preview" style={{ background: tpl.preview.bg }}>
                    <div className="template-preview-inner">
                      <div className="template-preview-bar" style={{ background: tpl.preview.accent, opacity: 0.9 }} />
                      <div className="template-preview-lines">
                        <div style={{ background: tpl.preview.accent, height: 4, borderRadius: 2, width: '70%', opacity: 0.8 }} />
                        <div style={{ background: 'rgba(255,255,255,0.3)', height: 2, borderRadius: 2, width: '50%' }} />
                      </div>
                    </div>
                    {selectedTemplate === tpl.id && (
                      <div className="template-check">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <polyline points="20 6 9 17 4 12" strokeWidth="3" stroke="white" fill="none" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="template-info">
                    <span className="template-name">{tpl.name}</span>
                    <div className="template-platforms">
                      {tpl.platform.slice(0, 2).map((p) => (
                        <span key={p} className="platform-chip">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <>
              <div className="panel-divider" />
              <div className="panel-section">
                <p className="section-title">Template Description</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {TEMPLATES[selectedTemplate]?.description}
                </p>
              </div>
              <div className="panel-divider" />
              <div className="panel-section">
                <p className="section-title">Video Title / Caption</p>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter title to show on video..."
                  value={title || ''}
                  onChange={(e) => onTitleChange?.(e.target.value)}
                  id="video-title-input"
                />
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Leave empty to hide title overlay
                </p>
              </div>
              <div className="panel-divider" />
              <div className="panel-section">
                <p className="section-title">Platform Targets</p>
                <div className="platform-tags">
                  {TEMPLATES[selectedTemplate]?.platform.map((p) => (
                    <span key={p} className="badge badge-cyan">{p}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Layout Editor Tab ── */}
      {activeTab === 'layout' && (
        <div className="animate-fadeIn">

          {/* Aspect Ratio */}
          <div className="panel-section">
            <p className="section-title">Aspect Ratio</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
              {Object.entries(ASPECT_RATIOS).map(([ratio, info]) => {
                const isSelected = (layout.aspectRatio || '16:9') === ratio;
                const previewW = ratio === '9:16' ? 30 : ratio === '1:1' ? 44 : ratio === '4:3' ? 52 : ratio === '21:9' ? 70 : 60;
                const previewH = ratio === '9:16' ? 52 : ratio === '1:1' ? 44 : ratio === '4:3' ? 40 : ratio === '21:9' ? 28 : 34;
                return (
                  <button
                    key={ratio}
                    onClick={() => update('aspectRatio', ratio)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(34,211,238,0.1))'
                        : 'var(--bg-elevated)',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 4px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    }}
                  >
                    {/* Visual preview box */}
                    <div style={{
                      width: previewW, height: previewH,
                      background: isSelected
                        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))'
                        : 'var(--bg-tertiary)',
                      borderRadius: 3,
                      border: `1px solid ${isSelected ? 'transparent' : 'var(--border-subtle)'}`,
                    }} />
                    <span style={{ fontSize: 9, fontWeight: 600, color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      {ratio}
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
              {ASPECT_RATIOS[layout.aspectRatio || '16:9']?.label} —{' '}
              {ASPECT_RATIOS[layout.aspectRatio || '16:9']?.width}×{ASPECT_RATIOS[layout.aspectRatio || '16:9']?.height}
            </p>
          </div>

          <div className="panel-divider" />

          {/* Subtitle Controls */}
          <div className="panel-section">
            <p className="section-title">Subtitle Style</p>

            {/* Position */}
            <label style={{ marginBottom: 6, display: 'block' }}>Position</label>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
              {SubtitlePositions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => update('subtitlePosition', pos)}
                  style={{
                    flex: 1,
                    background: (layout.subtitlePosition || 'bottom') === pos ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    color: (layout.subtitlePosition || 'bottom') === pos ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${(layout.subtitlePosition || 'bottom') === pos ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 4px',
                    cursor: 'pointer', fontSize: 11, fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                >
                  {pos === 'bottom' ? '⬇ Bot' : pos === 'center' ? '⭕ Mid' : '⬆ Top'}
                </button>
              ))}
            </div>

            {/* Font size */}
            <label>Font Size: <strong style={{ color: 'var(--accent-primary)' }}>{layout.subtitleFontSize || 22}px</strong></label>
            <input
              type="range" min={10} max={80} step={1}
              value={layout.subtitleFontSize || 22}
              onChange={(e) => update('subtitleFontSize', Number(e.target.value))}
              className="range-slider"
              style={{ width: '100%', marginBottom: 'var(--space-md)' }}
            />

            {/* Colors */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', alignItems: 'center' }}>
              <div>
                <label style={{ marginBottom: 4, display: 'block' }}>Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="color"
                    value={layout.subtitleColor || '#FFFFFF'}
                    onChange={(e) => update('subtitleColor', e.target.value)}
                    style={{ width: 36, height: 28, borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer', background: 'none' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{layout.subtitleColor || '#FFFFFF'}</span>
                </div>
              </div>

              <div>
                <label style={{ marginBottom: 4, display: 'block' }}>
                  <label className="toggle" style={{ transform: 'scale(0.75)', marginRight: 4 }}>
                    <input
                      type="checkbox"
                      checked={layout.subtitleBgEnabled !== false}
                      onChange={(e) => update('subtitleBgEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  Bg Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: layout.subtitleBgEnabled !== false ? 1 : 0.4 }}>
                  <input
                    type="color"
                    value={layout.subtitleBgColor || '#000000'}
                    onChange={(e) => update('subtitleBgColor', e.target.value)}
                    disabled={layout.subtitleBgEnabled === false}
                    style={{ width: 36, height: 28, borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{layout.subtitleBgColor || '#000000'}</span>
                </div>
              </div>
            </div>

            {/* Opacity */}
            {layout.subtitleBgEnabled !== false && (
              <>
                <label>
                  Background Opacity:{' '}
                  <strong style={{ color: 'var(--accent-primary)' }}>
                    {Math.round((layout.subtitleBgOpacity ?? 0.55) * 100)}%
                  </strong>
                </label>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={layout.subtitleBgOpacity ?? 0.55}
                  onChange={(e) => update('subtitleBgOpacity', Number(e.target.value))}
                  className="range-slider"
                  style={{ width: '100%' }}
                />
              </>
            )}
          </div>

          <div className="panel-divider" />

          {/* Title Controls */}
          <div className="panel-section">
            <p className="section-title">Title / Caption Style</p>

            <label style={{ marginBottom: 6, display: 'block' }}>Position</label>
            <div style={{ display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
              {TitlePositions.map((pos) => (
                <button
                  key={pos}
                  onClick={() => update('titlePosition', pos)}
                  style={{
                    flex: 1,
                    background: (layout.titlePosition || 'bottom') === pos ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    color: (layout.titlePosition || 'bottom') === pos ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${(layout.titlePosition || 'bottom') === pos ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 4px',
                    cursor: 'pointer', fontSize: 11, fontWeight: 500,
                  }}
                >
                  {pos === 'bottom' ? '⬇ Bot' : pos === 'center' ? '⭕ Mid' : '⬆ Top'}
                </button>
              ))}
            </div>

            <label>Font Size: <strong style={{ color: 'var(--accent-primary)' }}>{layout.titleFontSize || 36}px</strong></label>
            <input
              type="range" min={12} max={120} step={2}
              value={layout.titleFontSize || 36}
              onChange={(e) => update('titleFontSize', Number(e.target.value))}
              className="range-slider"
              style={{ width: '100%', marginBottom: 'var(--space-md)' }}
            />

            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div>
                <label style={{ marginBottom: 4, display: 'block' }}>Text Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="color"
                    value={layout.titleColor || '#FFFFFF'}
                    onChange={(e) => update('titleColor', e.target.value)}
                    style={{ width: 36, height: 28, borderRadius: 6, border: '1px solid var(--border-default)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{layout.titleColor || '#FFFFFF'}</span>
                </div>
              </div>
              <div>
                <label style={{ marginBottom: 4, display: 'block' }}>UPPERCASE</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!layout.titleUppercase}
                    onChange={(e) => update('titleUppercase', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
