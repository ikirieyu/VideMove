import React, { useState } from 'react';
import { getClipSuggestions, suggestCaption, loadSettings } from '../../services/aiService.js';
import './AIPanel.css';

export function AIPanel({ transcript, duration, onClipSuggestions, onCaptionSuggested, toast }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [captionPlatform, setCaptionPlatform] = useState('TikTok');
  const [captionLang, setCaptionLang] = useState('id');
  const [activeTab, setActiveTab] = useState('autocut');

  const getSettings = () => loadSettings();

  const getProviderLabel = () => {
    const s = getSettings();
    const id = s.activeProvider || 'openai';
    const p = s.providers?.[id];
    return p?.label || 'AI';
  };

  const handleAutocut = async () => {
    if (!transcript) { toast?.('Generate subtitles first to get a transcript', 'error'); return; }
    if (!prompt.trim()) { toast?.('Enter a prompt first', 'error'); return; }
    setIsLoading(true);
    try {
      const settings = getSettings();
      const results = await getClipSuggestions(settings, transcript, prompt, duration || 60);
      setSuggestions(results);
      onClipSuggestions?.(results);
      toast?.(`Found ${results.length} clip suggestions!`, 'success');
    } catch (e) {
      toast?.(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaption = async () => {
    if (!prompt.trim()) { toast?.('Describe your video content', 'error'); return; }
    setIsLoading(true);
    try {
      const settings = getSettings();
      const results = await suggestCaption(settings, prompt, captionPlatform, captionLang);
      setCaptions(results);
      toast?.('Captions generated!', 'success');
    } catch (e) {
      toast?.(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    'Ambil bagian paling menarik dan lucu',
    'Take the most informative 30-second segment',
    'Cari bagian yang ada penjelasan penting',
    'Find the most dramatic or emotional moment',
  ];

  const providerLabel = getProviderLabel();

  return (
    <div className="panel ai-panel animate-fadeIn">
      <div className="ai-header">
        <div className="ai-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c5cfc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#aiGrad)" />
          </svg>
        </div>
        <span className="ai-label">{providerLabel} Assistant</span>
        <span className="badge badge-green" style={{ fontSize: '9px' }}>Active</span>
      </div>

      <div className="tabs" style={{ margin: '0' }}>
        <button className={`tab ${activeTab === 'autocut' ? 'active' : ''}`} onClick={() => setActiveTab('autocut')}>Auto-Cut</button>
        <button className={`tab ${activeTab === 'caption' ? 'active' : ''}`} onClick={() => setActiveTab('caption')}>Caption</button>
      </div>

      {activeTab === 'autocut' && (
        <div className="panel-section animate-fadeIn">
          <p className="section-title">AI Auto-Cut Prompt</p>
          <textarea
            className="input textarea"
            placeholder="Contoh: Ambil 30 detik paling menarik dari video ini..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            id="ai-prompt-input"
          />

          <div className="example-prompts">
            <p className="section-title">Contoh Prompt:</p>
            {examplePrompts.map((p, i) => (
              <button key={i} className="example-prompt-btn" onClick={() => setPrompt(p)}>
                <span className="prompt-arrow">→</span>
                {p}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleAutocut}
            disabled={isLoading || !prompt.trim()}
            id="ai-autocut-btn"
          >
            {isLoading ? (
              <><div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Find Best Clips
              </>
            )}
          </button>

          {!transcript && (
            <div className="ai-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Generate subtitles first to enable AI auto-cut</span>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="suggestions-list">
              <p className="section-title">Suggested Clips ({suggestions.length})</p>
              {suggestions.map((s, i) => (
                <div key={i} className="suggestion-item">
                  <div className="suggestion-time">
                    <span className="suggestion-idx">{i + 1}</span>
                    <div>
                      <span className="suggestion-range">{Math.floor(s.start)}s → {Math.floor(s.end)}s</span>
                      <span className="suggestion-dur">({Math.floor(s.end - s.start)}s)</span>
                    </div>
                  </div>
                  <p className="suggestion-reason">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'caption' && (
        <div className="panel-section animate-fadeIn">
          <p className="section-title">Describe Your Video</p>
          <textarea
            className="input textarea"
            placeholder="Describe what your video is about..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <div style={{ flex: 1 }}>
              <label>Platform</label>
              <select className="input select" value={captionPlatform} onChange={(e) => setCaptionPlatform(e.target.value)}>
                {['TikTok', 'Instagram', 'YouTube', 'Facebook'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Language</label>
              <select className="input select" value={captionLang} onChange={(e) => setCaptionLang(e.target.value)}>
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleCaption}
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? (
              <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating...</>
            ) : (
              '✨ Generate Captions'
            )}
          </button>

          {captions.length > 0 && (
            <div className="suggestions-list">
              <p className="section-title">Caption Suggestions</p>
              {captions.map((c, i) => (
                <button key={i} className="caption-item" onClick={() => onCaptionSuggested?.(c)}>
                  <span className="suggestion-idx">{i + 1}</span>
                  <span style={{ fontSize: 12, flex: 1, textAlign: 'left' }}>{c}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Use ↗</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
