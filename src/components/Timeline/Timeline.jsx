import React, { useRef, useCallback, useState } from 'react';
import './Timeline.css';
import { formatTime, clamp } from '../../utils/timeUtils.js';

export function Timeline({
  duration,
  currentTime,
  trimStart,
  trimEnd,
  onSeek,
  onTrimChange,
  clips,
  onAddClip,
  onRemoveClip,
  isPlaying,
  onPlayPause,
}) {
  const trackRef = useRef(null);
  const dragging = useRef(null); // 'cursor' | 'trimStart' | 'trimEnd'
  const [hoverTime, setHoverTime] = useState(null);

  const getTimeFromX = useCallback(
    (clientX) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || !duration) return 0;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return ratio * duration;
    },
    [duration]
  );

  const handleMouseDown = useCallback(
    (e, type) => {
      e.preventDefault();
      dragging.current = type;
      const onMove = (ev) => {
        const t = getTimeFromX(ev.clientX);
        if (type === 'cursor') onSeek?.(t);
        else if (type === 'trimStart') onTrimChange?.(clamp(t, 0, trimEnd - 0.5), trimEnd);
        else if (type === 'trimEnd') onTrimChange?.(trimStart, clamp(t, trimStart + 0.5, duration));
      };
      const onUp = () => {
        dragging.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [getTimeFromX, duration, trimStart, trimEnd, onSeek, onTrimChange]
  );

  const handleTrackClick = useCallback(
    (e) => {
      if (dragging.current) return;
      const t = getTimeFromX(e.clientX);
      onSeek?.(t);
    },
    [getTimeFromX, onSeek]
  );

  const handleMouseMove = useCallback(
    (e) => {
      setHoverTime(getTimeFromX(e.clientX));
    },
    [getTimeFromX]
  );

  const toPercent = (t) => (duration ? `${(t / duration) * 100}%` : '0%');

  // Generate tick marks
  const ticks = [];
  if (duration) {
    const step = duration > 600 ? 60 : duration > 120 ? 30 : duration > 60 ? 10 : 5;
    for (let t = 0; t <= duration; t += step) {
      ticks.push(t);
    }
  }

  return (
    <div className="timeline-wrapper" id="timeline-panel">
      {/* Transport Controls */}
      <div className="transport-bar">
        <div className="transport-left">
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onSeek?.(trimStart)}
            data-tooltip="Go to Start"
            disabled={!duration}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            className={`btn btn-icon transport-play ${isPlaying ? 'playing' : ''}`}
            onClick={onPlayPause}
            disabled={!duration}
            id="play-pause-btn"
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => onSeek?.(trimEnd)}
            data-tooltip="Go to End"
            disabled={!duration}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" transform="scale(-1,1) translate(-24,0)" />
              <path d="M16 6h2v12h-2z" />
            </svg>
          </button>
        </div>

        <div className="transport-time">
          <span className="time-current">{formatTime(currentTime)}</span>
          <span className="time-sep">/</span>
          <span className="time-duration">{formatTime(duration || 0)}</span>
        </div>

        <div className="transport-trim">
          <span className="trim-label">Trim:</span>
          <span className="trim-value">{formatTime(trimStart)}</span>
          <span className="time-sep">→</span>
          <span className="trim-value">{formatTime(trimEnd || duration || 0)}</span>
          <span className="trim-duration">({formatTime((trimEnd || duration || 0) - trimStart)})</span>
        </div>
      </div>

      {/* Timeline Track */}
      <div
        className="timeline-track-container"
        ref={trackRef}
        onClick={handleTrackClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
      >
        {/* Tick marks */}
        <div className="timeline-ticks">
          {ticks.map((t) => (
            <div
              key={t}
              className="tick"
              style={{ left: toPercent(t) }}
            >
              <div className="tick-line" />
              <span className="tick-label">{formatTime(t)}</span>
            </div>
          ))}
        </div>

        {/* Waveform / track background */}
        <div className="timeline-track">
          {/* Disabled region (before trim start) */}
          <div
            className="trim-disabled left"
            style={{ width: toPercent(trimStart) }}
          />

          {/* Active region */}
          <div
            className="trim-active"
            style={{
              left: toPercent(trimStart),
              width: `calc(${toPercent(trimEnd || duration)} - ${toPercent(trimStart)})`,
            }}
          />

          {/* Disabled region (after trim end) */}
          <div
            className="trim-disabled right"
            style={{
              left: toPercent(trimEnd || duration),
              right: 0,
            }}
          />

          {/* Clips on timeline */}
          {clips?.map((clip, i) => (
            <div
              key={clip.id}
              className="clip-segment"
              style={{
                left: toPercent(clip.start),
                width: `calc(${toPercent(clip.end)} - ${toPercent(clip.start)})`,
              }}
              title={clip.reason || `Clip ${i + 1}`}
            >
              <span className="clip-label">{clip.reason || `Clip ${i + 1}`}</span>
              <button
                className="clip-remove"
                onClick={(e) => { e.stopPropagation(); onRemoveClip?.(clip.id); }}
              >×</button>
            </div>
          ))}

          {/* Trim handles */}
          {duration > 0 && (
            <>
              <div
                className="trim-handle left"
                style={{ left: toPercent(trimStart) }}
                onMouseDown={(e) => handleMouseDown(e, 'trimStart')}
                data-tooltip={formatTime(trimStart)}
              >
                <div className="trim-handle-line" />
                <div className="trim-handle-arrow">◀</div>
              </div>

              <div
                className="trim-handle right"
                style={{ left: toPercent(trimEnd || duration) }}
                onMouseDown={(e) => handleMouseDown(e, 'trimEnd')}
                data-tooltip={formatTime(trimEnd || duration)}
              >
                <div className="trim-handle-arrow">▶</div>
                <div className="trim-handle-line" />
              </div>
            </>
          )}

          {/* Playhead */}
          {duration > 0 && (
            <div
              className="playhead"
              style={{ left: toPercent(currentTime) }}
              onMouseDown={(e) => handleMouseDown(e, 'cursor')}
            >
              <div className="playhead-head" />
              <div className="playhead-line" />
            </div>
          )}

          {/* Hover time tooltip */}
          {hoverTime !== null && duration > 0 && (
            <div
              className="hover-tooltip"
              style={{ left: toPercent(hoverTime) }}
              onMouseDown={(e) => { e.stopPropagation(); onSeek?.(hoverTime); }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
