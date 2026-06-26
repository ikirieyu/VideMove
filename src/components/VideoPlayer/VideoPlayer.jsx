import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import './VideoPlayer.css';
import { TEMPLATES } from '../../templates/templates.js';
import { ASPECT_RATIOS, getDefaultLayoutSettings } from '../../services/aiService.js';

const VideoPlayer = forwardRef(function VideoPlayer(
  {
    videoSrc,
    trimStart,
    trimEnd,
    currentTime,
    onTimeUpdate,
    onDurationLoad,
    template,
    subtitles,
    showSubtitles,
    title,
    resolution,
    layoutSettings,
  },
  ref
) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getVideo: () => videoRef.current,
    getCanvas: () => canvasRef.current,
    seek: (t) => { if (videoRef.current) videoRef.current.currentTime = t; },
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    isPlaying: () => !videoRef.current?.paused,
  }));

  // Merge defaults
  const layout = { ...getDefaultLayoutSettings(), ...(layoutSettings || {}) };

  // Helper: hexToRgba
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Compute Y position from a position label
  const getY = (pos, H, offsetBottom, offsetTop) => {
    if (pos === 'top') return offsetTop;
    if (pos === 'center') return H / 2;
    return H - offsetBottom;
  };

  // Draw frame to canvas with template overlay + layout settings
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    const tpl = TEMPLATES[template] || TEMPLATES.neonDark;
    const W = canvas.width;
    const H = canvas.height;

    // Draw video frame
    ctx.drawImage(video, 0, 0, W, H);

    // Letterbox bars (cinematic)
    if (tpl.border?.type === 'letterbox') {
      const barH = tpl.border.barHeight || 80;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, barH);
      ctx.fillRect(0, H - barH, W, barH);
    }

    // Overlay gradient
    if (tpl.overlay?.gradient) {
      ctx.save();
      const ovGrad = ctx.createLinearGradient(0, 0, 0, H);
      ovGrad.addColorStop(0, 'rgba(0,0,0,0)');
      ovGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = ovGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Border strip (boldPromo)
    if (tpl.border?.type === 'strip') {
      ctx.save();
      const stripGrad = ctx.createLinearGradient(0, 0, W, 0);
      stripGrad.addColorStop(0, tpl.colors.primary);
      stripGrad.addColorStop(1, tpl.colors.secondary);
      ctx.fillStyle = stripGrad;
      ctx.fillRect(0, H - (tpl.border.stripHeight || 6), W, tpl.border.stripHeight || 6);
      ctx.restore();
    }

    // Neon border
    if (tpl.border?.type === 'neon') {
      ctx.save();
      ctx.strokeStyle = tpl.border.color;
      ctx.lineWidth = tpl.border.width;
      ctx.shadowColor = tpl.border.color;
      ctx.shadowBlur = 12;
      ctx.strokeRect(
        tpl.border.width / 2,
        tpl.border.width / 2,
        W - tpl.border.width,
        H - tpl.border.width
      );
      ctx.restore();
    }

    // ── Title overlay (uses layoutSettings) ──────────────────────────────────
    if (title) {
      const tStyle = tpl.title;
      const rawFontSize = layout.titleFontSize || tStyle.fontSize || 36;
      const fontSize = Math.round(rawFontSize * (W / 1920) * 2.5);
      const fontFamily = tStyle.fontFamily || 'Outfit';
      ctx.save();
      ctx.font = `700 ${fontSize}px "${fontFamily}", sans-serif`;
      ctx.textAlign = 'center';

      const titlePos = layout.titlePosition || 'bottom';
      const textY = getY(titlePos, H, 60 * (H / 1080), 60 * (H / 1080));
      ctx.textBaseline = titlePos === 'center' ? 'middle' : titlePos === 'top' ? 'top' : 'alphabetic';

      if (tStyle.glow) {
        ctx.shadowColor = tpl.colors.primary;
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = layout.titleColor || tpl.colors.text;
      const displayText = layout.titleUppercase ? title.toUpperCase() : title;
      ctx.fillText(displayText, W / 2, textY, W - 40);
      ctx.restore();
    }

    // ── Subtitle overlay (uses layoutSettings) ──────────────────────────────
    if (showSubtitles && subtitles?.length) {
      const vt = video.currentTime;
      const current = subtitles.find((s) => vt >= s.start && vt <= s.end);
      if (current) {
        const rawSubSize = layout.subtitleFontSize || 22;
        const subFontSize = Math.round(rawSubSize * (W / 1920) * 2.5);
        const fontFamily = tpl.title?.fontFamily || 'Inter';

        ctx.save();
        ctx.font = `600 ${subFontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = 'center';

        const subPos = layout.subtitlePosition || 'bottom';
        const subY = getY(subPos, H, 50 * (H / 1080), 60 * (H / 1080));
        ctx.textBaseline = subPos === 'center' ? 'middle' : subPos === 'top' ? 'top' : 'alphabetic';

        const textW = ctx.measureText(current.text).width;

        // Background
        if (layout.subtitleBgEnabled !== false) {
          const opacity = layout.subtitleBgOpacity ?? 0.55;
          ctx.fillStyle = hexToRgba(layout.subtitleBgColor || '#000000', opacity);
          const pad = 12;
          const bgH = subFontSize + 14;
          const bgY = subPos === 'top'
            ? subY - 4
            : subPos === 'center'
            ? subY - bgH / 2
            : subY - subFontSize - 4;
          ctx.beginPath();
          ctx.roundRect
            ? ctx.roundRect(W / 2 - textW / 2 - pad, bgY, textW + pad * 2, bgH, 4)
            : ctx.fillRect(W / 2 - textW / 2 - pad, bgY, textW + pad * 2, bgH);
          ctx.fill();
        }

        ctx.fillStyle = layout.subtitleColor || '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(current.text, W / 2, subY);
        ctx.restore();
      }
    }

    if (!video.paused && !video.ended) {
      animFrameRef.current = requestAnimationFrame(drawFrame);
    }
  }, [template, subtitles, showSubtitles, title, layout]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => { animFrameRef.current = requestAnimationFrame(drawFrame); };
    const onPause = () => { cancelAnimationFrame(animFrameRef.current); drawFrame(); };
    const onSeeked = () => { drawFrame(); };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFrame]);

  useEffect(() => { drawFrame(); }, [drawFrame]);

  // Canvas size based on aspect ratio from layoutSettings
  const aspectKey = layout.aspectRatio || '16:9';
  const aspectInfo = ASPECT_RATIOS[aspectKey] || ASPECT_RATIOS['16:9'];
  const canvasWidth = 640;
  const canvasHeight = Math.round(640 * (aspectInfo.height / aspectInfo.width));

  return (
    <div className="video-player" ref={containerRef}>
      <video
        ref={videoRef}
        src={videoSrc || ''}
        className="video-hidden"
        onTimeUpdate={(e) => {
          const t = e.target.currentTime;
          if (trimEnd && t >= trimEnd) {
            e.target.pause();
            e.target.currentTime = trimStart || 0;
          }
          onTimeUpdate?.(t);
        }}
        onLoadedMetadata={(e) => onDurationLoad?.(e.target.duration)}
        crossOrigin="anonymous"
        playsInline
      />
      {!videoSrc ? (
        <div className="video-placeholder">
          <div className="placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="playGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c5cfc" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="url(#playGrad)" strokeWidth="1.5" fill="none" />
              <polygon points="10,8 10,16 17,12" fill="url(#playGrad)" />
            </svg>
          </div>
          <p className="placeholder-title">Upload or Import Video</p>
          <p className="placeholder-sub">Drag &amp; drop or use the Import panel</p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          className="video-canvas"
          width={canvasWidth}
          height={canvasHeight}
          style={{ borderRadius: 'var(--radius-lg)' }}
        />
      )}
    </div>
  );
});

export default VideoPlayer;
