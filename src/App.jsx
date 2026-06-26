import React, { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header/Header.jsx';
import { Sidebar } from './components/Sidebar/Sidebar.jsx';
import VideoPlayer from './components/VideoPlayer/VideoPlayer.jsx';
import { Timeline } from './components/Timeline/Timeline.jsx';
import { ImportPanel } from './components/ImportPanel/ImportPanel.jsx';
import { TemplatePanel } from './components/TemplatePanel/TemplatePanel.jsx';
import { AIPanel } from './components/AIPanel/AIPanel.jsx';
import { SubtitlePanel } from './components/SubtitlePanel/SubtitlePanel.jsx';
import { DubbingPanel } from './components/DubbingPanel/DubbingPanel.jsx';
import { ExportModal } from './components/ExportModal/ExportModal.jsx';
import { SettingsModal } from './components/SettingsModal/SettingsModal.jsx';
import { ToastContainer } from './components/Toast.jsx';
import { useToast } from './hooks/useToast.js';
import {
  loadSettings,
  saveSettings,
  getDefaultLayoutSettings,
  ASPECT_RATIOS,
} from './services/aiService.js';

export default function App() {
  // Video state
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState('neonDark');
  const [videoTitle, setVideoTitle] = useState('');

  // Layout settings (aspect ratio, subtitle style, title style)
  const [layoutSettings, setLayoutSettings] = useState(() => {
    const saved = loadSettings();
    return saved.layoutSettings || getDefaultLayoutSettings();
  });

  // Subtitle state
  const [subtitles, setSubtitles] = useState([]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [transcript, setTranscript] = useState('');

  // AI clip suggestions
  const [clips, setClips] = useState([]);

  // UI state
  const [activeTool, setActiveTool] = useState('import');
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Groq key (for subtitle)
  const [groqKey, setGroqKey] = useState(() => loadSettings().groqApiKey || '');

  const videoPlayerRef = useRef(null);
  const { toasts, addToast, removeToast } = useToast();

  // Compute resolution from aspect ratio
  const resolution = ASPECT_RATIOS[layoutSettings.aspectRatio || '16:9'] || ASPECT_RATIOS['16:9'];

  // Persist layoutSettings to localStorage when changed
  const handleLayoutChange = useCallback((newLayout) => {
    setLayoutSettings(newLayout);
    const currentSettings = loadSettings();
    saveSettings({ ...currentSettings, layoutSettings: newLayout });
  }, []);

  // Load video
  const handleVideoLoad = useCallback((url, file) => {
    setVideoSrc(url);
    setVideoFile(file);
    setTrimStart(0);
    setTrimEnd(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setClips([]);
    setSubtitles([]);
    setTranscript('');
    setActiveTool('template');
  }, []);

  const handleDurationLoad = useCallback((dur) => {
    setDuration(dur);
    setTrimEnd(dur);
  }, []);

  const handleTimeUpdate = useCallback((t) => {
    setCurrentTime(t);
  }, []);

  // Playback
  const handlePlayPause = useCallback(() => {
    const player = videoPlayerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.seek(currentTime < trimStart || currentTime >= trimEnd ? trimStart : currentTime);
      player.play();
      setIsPlaying(true);
    }
  }, [currentTime, trimStart, trimEnd]);

  const handleSeek = useCallback((t) => {
    videoPlayerRef.current?.seek(t);
    setCurrentTime(t);
  }, []);

  const handleTrimChange = useCallback((start, end) => {
    setTrimStart(start);
    setTrimEnd(end);
  }, []);

  // AI clip suggestions → add to timeline
  const handleClipSuggestions = useCallback((suggestions) => {
    const newClips = suggestions.map((s, i) => ({
      id: `ai-${Date.now()}-${i}`,
      start: s.start,
      end: s.end,
      reason: s.reason,
    }));
    setClips((prev) => [...prev, ...newClips]);
    if (newClips.length > 0) {
      setTrimStart(newClips[0].start);
      setTrimEnd(newClips[0].end);
      handleSeek(newClips[0].start);
    }
  }, [handleSeek]);

  const handleRemoveClip = useCallback((id) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Settings save
  const handleSaveSettings = useCallback((newSettings) => {
    setGroqKey(newSettings.groqApiKey || '');
    // layoutSettings already persisted via handleLayoutChange
    addToast('Settings saved!', 'success');
  }, [addToast]);

  // Export
  const handleExport = useCallback(async (opts) => {
    if (!videoFile) { addToast('No video loaded', 'error'); return; }
    setIsExporting(true);
    setExportProgress(0);

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      addToast('Loading FFmpeg engine...', 'info');
      const ffmpeg = new FFmpeg();

      ffmpeg.on('progress', ({ progress }) => {
        setExportProgress(Math.round(progress * 100));
      });

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      addToast('Processing video...', 'info');
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const { trimStart: ts, trimEnd: te, width, height, quality } = opts;
      const crf = quality === 'high' ? 18 : quality === 'medium' ? 23 : 28;
      const dur = te - ts;

      await ffmpeg.exec([
        '-ss', String(ts),
        '-i', 'input.mp4',
        '-t', String(dur),
        '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
        '-c:v', 'libx264',
        '-crf', String(crf),
        '-preset', 'fast',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `videmove_export_${Date.now()}.mp4`;
      a.click();

      setExportProgress(100);
      addToast('Export complete! Downloading...', 'success');
      setTimeout(() => setShowExport(false), 1000);

    } catch (e) {
      console.error(e);
      addToast('Export failed: ' + e.message, 'error');
    } finally {
      setIsExporting(false);
    }
  }, [videoFile, addToast]);

  // Panel components
  const panels = {
    import: (
      <ImportPanel onVideoLoad={handleVideoLoad} toast={addToast} />
    ),
    template: (
      <TemplatePanel
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        title={videoTitle}
        onTitleChange={setVideoTitle}
        layoutSettings={layoutSettings}
        onLayoutChange={handleLayoutChange}
      />
    ),
    ai: (
      <AIPanel
        transcript={transcript}
        duration={duration}
        onClipSuggestions={handleClipSuggestions}
        onCaptionSuggested={setVideoTitle}
        toast={addToast}
      />
    ),
    subtitle: (
      <SubtitlePanel
        videoFile={videoFile}
        groqApiKey={groqKey}
        showSubtitles={showSubtitles}
        onToggleSubtitles={setShowSubtitles}
        subtitles={subtitles}
        onSubtitlesChange={setSubtitles}
        onTranscriptChange={setTranscript}
        toast={addToast}
      />
    ),
    dubbing: (
      <DubbingPanel
        currentTime={currentTime}
        duration={duration}
        toast={addToast}
      />
    ),
  };

  return (
    <div className="app">
      <Header
        projectName={videoFile?.name}
        onSettings={() => setShowSettings(true)}
        onExport={() => setShowExport(true)}
        hasVideo={!!videoSrc}
        isExporting={isExporting}
      />

      <div className="app-body">
        <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />

        {/* Left Panel */}
        <div className="panel-container" id="left-panel">
          <div className="panel-tab-header">
            <p className="panel-title">
              {activeTool === 'import' && 'Import'}
              {activeTool === 'template' && 'Template & Layout'}
              {activeTool === 'ai' && '✨ AI Assistant'}
              {activeTool === 'subtitle' && 'Subtitle'}
              {activeTool === 'dubbing' && 'Dubbing'}
            </p>
          </div>
          <div className="panel-content">
            {panels[activeTool]}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="canvas-area" id="canvas-area">
          <div className="canvas-header">
            <div className="preview-label">
              <div className="preview-dot" />
              <span>Preview</span>
            </div>
            <div className="canvas-actions">
              {/* Aspect ratio badge */}
              <span style={{
                fontSize: 9, fontWeight: 700, color: 'var(--accent-primary)',
                background: 'rgba(124,92,252,0.12)', padding: '2px 7px',
                borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124,92,252,0.2)',
                letterSpacing: 1,
              }}>
                {layoutSettings.aspectRatio || '16:9'}
              </span>
              <label className="subtitle-toggle-inline">
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Subtitles</span>
                <label className="toggle" style={{ transform: 'scale(0.85)' }}>
                  <input
                    type="checkbox"
                    checked={showSubtitles}
                    onChange={(e) => setShowSubtitles(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </label>
            </div>
          </div>

          <VideoPlayer
            ref={videoPlayerRef}
            videoSrc={videoSrc}
            trimStart={trimStart}
            trimEnd={trimEnd}
            currentTime={currentTime}
            onTimeUpdate={handleTimeUpdate}
            onDurationLoad={handleDurationLoad}
            template={selectedTemplate}
            subtitles={subtitles}
            showSubtitles={showSubtitles}
            title={videoTitle}
            resolution={resolution}
            layoutSettings={layoutSettings}
          />

          <Timeline
            duration={duration}
            currentTime={currentTime}
            trimStart={trimStart}
            trimEnd={trimEnd}
            onSeek={handleSeek}
            onTrimChange={handleTrimChange}
            clips={clips}
            onRemoveClip={handleRemoveClip}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
        </div>
      </div>

      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onExport={handleExport}
          trimStart={trimStart}
          trimEnd={trimEnd}
          duration={duration}
          isExporting={isExporting}
          exportProgress={exportProgress}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
