import React, { useState, useRef, useEffect } from 'react';
import { speak, stopSpeaking, getVoices, createMicRecorder, TTS_LANGUAGES } from '../../services/ttsService.js';
import './DubbingPanel.css';

export function DubbingPanel({ currentTime, duration, toast }) {
  const [ttsText, setTtsText] = useState('');
  const [ttsLang, setTtsLang] = useState('id-ID');
  const [ttsPitch, setTtsPitch] = useState(1.0);
  const [ttsRate, setTtsRate] = useState(1.0);
  const [ttsVolume, setTtsVolume] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [activeTab, setActiveTab] = useState('tts');
  const recorderRef = useRef(null);

  useEffect(() => {
    getVoices(ttsLang).then(setVoices);
  }, [ttsLang]);

  const handleSpeak = async () => {
    if (!ttsText.trim()) { toast?.('Enter text to speak', 'error'); return; }
    setIsSpeaking(true);
    try {
      const voice = voices.find((v) => v.voiceURI === selectedVoice) || null;
      await speak(ttsText, { lang: ttsLang, rate: ttsRate, pitch: ttsPitch, volume: ttsVolume, voice });
    } catch (e) {
      toast?.(e.message || 'TTS error', 'error');
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeak = () => { stopSpeaking(); setIsSpeaking(false); };

  const handleRecordStart = async () => {
    try {
      recorderRef.current = createMicRecorder();
      await recorderRef.current.start();
      setIsRecording(true);
      toast?.('Recording started...', 'info');
    } catch (e) {
      toast?.('Cannot access microphone: ' + e.message, 'error');
    }
  };

  const handleRecordStop = async () => {
    if (!recorderRef.current) return;
    const blob = await recorderRef.current.stop();
    setIsRecording(false);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setRecordedBlobs((prev) => [
        ...prev,
        { id: Date.now(), url, time: currentTime, blob },
      ]);
      toast?.('Recording saved!', 'success');
    }
  };

  return (
    <div className="panel dubbing-panel animate-fadeIn">
      <div className="tabs">
        <button className={`tab ${activeTab === 'tts' ? 'active' : ''}`} onClick={() => setActiveTab('tts')}>
          TTS
        </button>
        <button className={`tab ${activeTab === 'mic' ? 'active' : ''}`} onClick={() => setActiveTab('mic')}>
          Microphone
        </button>
      </div>

      {activeTab === 'tts' && (
        <div className="panel-section animate-fadeIn">
          <p className="section-title">Text-to-Speech Dubbing</p>

          <div>
            <label>Language / Voice</label>
            <select
              className="input select"
              value={ttsLang}
              onChange={(e) => { setTtsLang(e.target.value); setSelectedVoice(null); }}
              id="tts-lang-select"
            >
              {TTS_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {voices.length > 0 && (
            <div>
              <label>Voice</label>
              <select
                className="input select"
                value={selectedVoice || ''}
                onChange={(e) => setSelectedVoice(e.target.value)}
              >
                <option value="">Default voice</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.localService ? '(Local)' : '(Network)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label>Dubbing Text</label>
            <textarea
              className="input textarea"
              placeholder="Ketik teks yang akan di-dubbing di sini..."
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              id="tts-text-input"
            />
          </div>

          {/* Controls */}
          <div className="tts-sliders">
            <div className="slider-row">
              <label>Speed <span className="slider-val">{ttsRate.toFixed(1)}x</span></label>
              <input type="range" min="0.5" max="2" step="0.1" value={ttsRate}
                onChange={(e) => setTtsRate(parseFloat(e.target.value))} />
            </div>
            <div className="slider-row">
              <label>Pitch <span className="slider-val">{ttsPitch.toFixed(1)}</span></label>
              <input type="range" min="0.5" max="2" step="0.1" value={ttsPitch}
                onChange={(e) => setTtsPitch(parseFloat(e.target.value))} />
            </div>
            <div className="slider-row">
              <label>Volume <span className="slider-val">{Math.round(ttsVolume * 100)}%</span></label>
              <input type="range" min="0" max="1" step="0.05" value={ttsVolume}
                onChange={(e) => setTtsVolume(parseFloat(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {!isSpeaking ? (
              <button
                className="btn btn-primary flex-1"
                onClick={handleSpeak}
                disabled={!ttsText.trim()}
                id="tts-speak-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
                Speak
              </button>
            ) : (
              <button className="btn btn-danger flex-1" onClick={handleStopSpeak}>
                ■ Stop
              </button>
            )}
          </div>

          <div className="tts-info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Uses browser built-in Web Speech API — completely free, no API key needed.</span>
          </div>
        </div>
      )}

      {activeTab === 'mic' && (
        <div className="panel-section animate-fadeIn">
          <p className="section-title">Microphone Recording</p>

          <div className={`mic-visualizer ${isRecording ? 'recording' : ''}`}>
            <div className="mic-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </div>
            {isRecording && (
              <div className="recording-waves">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="wave" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            )}
            <p className="mic-status">{isRecording ? '● Recording...' : 'Ready to record'}</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {!isRecording ? (
              <button className="btn btn-primary flex-1" onClick={handleRecordStart} id="mic-record-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="#ef4444" />
                </svg>
                Start Recording
              </button>
            ) : (
              <button className="btn btn-danger flex-1" onClick={handleRecordStop} id="mic-stop-btn">
                ■ Stop Recording
              </button>
            )}
          </div>

          {recordedBlobs.length > 0 && (
            <div className="recorded-list">
              <p className="section-title">Recorded Clips ({recordedBlobs.length})</p>
              {recordedBlobs.map((r, i) => (
                <div key={r.id} className="recorded-item">
                  <span className="recorded-num">#{i + 1}</span>
                  <audio src={r.url} controls style={{ flex: 1, height: 28 }} />
                  <a href={r.url} download={`dubbing-${i + 1}.webm`} className="btn btn-ghost btn-sm btn-icon">
                    ↓
                  </a>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    onClick={() => setRecordedBlobs((prev) => prev.filter((b) => b.id !== r.id))}
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
