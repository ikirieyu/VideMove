import React, { useState } from 'react';
import {
  PROVIDER_DEFAULTS,
  loadSettings,
  saveSettings,
} from '../../services/aiService.js';

export function SettingsModal({ onClose, onSave }) {
  const existing = loadSettings();

  const [activeTab, setActiveTab] = useState('ai');
  const [activeProvider, setActiveProvider] = useState(existing.activeProvider || 'openai');
  const [providers, setProviders] = useState(() => {
    // Merge saved with defaults so all keys exist
    const merged = {};
    Object.keys(PROVIDER_DEFAULTS).forEach((id) => {
      merged[id] = {
        ...PROVIDER_DEFAULTS[id],
        ...(existing.providers?.[id] || {}),
      };
    });
    return merged;
  });
  const [subtitleProvider, setSubtitleProvider] = useState(existing.subtitleProvider || 'groq');
  const [groqApiKey, setGroqApiKey] = useState(existing.groqApiKey || '');
  const [showKey, setShowKey] = useState({});

  const updateProvider = (id, field, value) => {
    setProviders((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = () => {
    const newSettings = {
      ...existing,
      activeProvider,
      providers,
      subtitleProvider,
      groqApiKey,
    };
    saveSettings(newSettings);
    onSave?.(newSettings);
    onClose?.();
  };

  const providerIds = Object.keys(PROVIDER_DEFAULTS);
  const currentProv = providers[activeProvider] || PROVIDER_DEFAULTS[activeProvider];

  const SUBTITLE_PROVIDERS = [
    { id: 'groq', label: 'Groq Whisper', note: 'Fast, free 28,800s/day' },
    { id: 'browser', label: 'Browser Speech API', note: 'Built-in, no key needed' },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content settings-modal-wide">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Settings</h3>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>AI Provider · Subtitle · Video</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ margin: '0', padding: '0 var(--space-lg)', borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'ai', label: '🤖 AI Provider' },
            { id: 'subtitle', label: '📝 Subtitle' },
            { id: 'about', label: '💡 Info' },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">

          {/* ── AI Provider Tab ── */}
          {activeTab === 'ai' && (
            <div className="animate-fadeIn">
              <p className="section-title" style={{ marginBottom: 'var(--space-md)' }}>
                Active AI Provider
              </p>

              {/* Provider picker grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)',
              }}>
                {providerIds.map((id) => {
                  const p = providers[id];
                  const hasKey = !!p.apiKey;
                  const isActive = activeProvider === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveProvider(id)}
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(124,92,252,0.25), rgba(34,211,238,0.15))'
                          : 'var(--bg-elevated)',
                        border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                        {p.modelName}
                      </div>
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 6, height: 6, borderRadius: '50%',
                        background: hasKey ? 'var(--accent-green)' : 'var(--border-default)',
                      }} />
                    </button>
                  );
                })}
              </div>

              {/* Selected provider config */}
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
              }}>
                <p className="section-title" style={{ marginBottom: 'var(--space-md)' }}>
                  Configure: {currentProv.label}
                </p>

                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <label>API Key</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey[activeProvider] ? 'text' : 'password'}
                      className="input"
                      placeholder="Enter API key..."
                      value={currentProv.apiKey || ''}
                      onChange={(e) => updateProvider(activeProvider, 'apiKey', e.target.value)}
                      id={`apikey-${activeProvider}`}
                    />
                    <button
                      onClick={() => setShowKey((prev) => ({ ...prev, [activeProvider]: !prev[activeProvider] }))}
                      style={{
                        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 12,
                      }}
                    >
                      {showKey[activeProvider] ? '🙈' : '👁'}
                    </button>
                    {currentProv.apiKey && (
                      <div style={{
                        position: 'absolute', right: 34, top: '50%', transform: 'translateY(-50%)',
                        width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)',
                      }} />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  <div style={{ flex: 2 }}>
                    <label>Base URL</label>
                    <input
                      type="text"
                      className="input"
                      value={currentProv.baseUrl || ''}
                      onChange={(e) => updateProvider(activeProvider, 'baseUrl', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Model</label>
                    <input
                      type="text"
                      className="input"
                      value={currentProv.modelName || ''}
                      onChange={(e) => updateProvider(activeProvider, 'modelName', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{
                  background: 'rgba(124,92,252,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-sm)',
                  fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5,
                }}>
                  🔒 API keys disimpan di localStorage browser — tidak dikirim ke server manapun.
                </div>
              </div>
            </div>
          )}

          {/* ── Subtitle Tab ── */}
          {activeTab === 'subtitle' && (
            <div className="animate-fadeIn">
              <p className="section-title" style={{ marginBottom: 'var(--space-md)' }}>
                Subtitle / Transcription Provider
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                {SUBTITLE_PROVIDERS.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => setSubtitleProvider(sp.id)}
                    style={{
                      background: subtitleProvider === sp.id
                        ? 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(34,211,238,0.1))'
                        : 'var(--bg-elevated)',
                      border: `1px solid ${subtitleProvider === sp.id ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-md)',
                      cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: subtitleProvider === sp.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                        {sp.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{sp.note}</div>
                    </div>
                    {subtitleProvider === sp.id && (
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {subtitleProvider === 'groq' && (
                <div>
                  <label>Groq API Key (Whisper Transcription)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="input"
                      placeholder="gsk_..."
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      id="groq-api-key-input"
                    />
                    {groqApiKey && (
                      <div style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-green)',
                      }} />
                    )}
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    Get free key at{' '}
                    <a href="https://console.groq.com/keys" target="_blank" rel="noopener" style={{ color: 'var(--accent-primary)' }}>
                      console.groq.com
                    </a>{' '}
                    — 28,800 sec/day free
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Info Tab ── */}
          {activeTab === 'about' && (
            <div className="animate-fadeIn">
              <p className="section-title" style={{ marginBottom: 'var(--space-md)' }}>AI Stack</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {[
                  { name: 'OpenAI gpt-4o-mini', use: 'Auto-cut, Caption (default)', quota: 'Paid · gpt-4o-mini' },
                  { name: 'Pollinations AI', use: 'Auto-cut, Caption (free alt)', quota: 'Free · openai-fast' },
                  { name: 'Groq Whisper Large v3', use: 'Transcription & Subtitle', quota: '28,800 sec/day · Free' },
                  { name: 'Web Speech API', use: 'TTS Dubbing', quota: 'Unlimited · Browser built-in' },
                  { name: 'FFmpeg.wasm', use: 'Video Export', quota: 'Unlimited · Local' },
                ].map((ai) => (
                  <div key={ai.name} style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>{ai.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>— {ai.use}</div>
                    </div>
                    <span style={{ fontSize: 9, color: 'var(--accent-green)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {ai.quota}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} id="save-settings-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
