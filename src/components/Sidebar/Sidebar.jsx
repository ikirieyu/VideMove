import React from 'react';
import './Sidebar.css';

const TOOLS = [
  {
    id: 'import',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
      </svg>
    ),
    label: 'Import',
  },
  {
    id: 'template',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: 'Template',
  },
  {
    id: 'ai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
    label: 'AI',
    badge: 'AI',
  },
  {
    id: 'subtitle',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <line x1="6" y1="10" x2="18" y2="10" /><line x1="6" y1="14" x2="14" y2="14" />
      </svg>
    ),
    label: 'Subtitle',
  },
  {
    id: 'dubbing',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
    label: 'Dubbing',
  },
];

export function Sidebar({ activeTool, onSelectTool }) {
  return (
    <div className="sidebar" id="sidebar">
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={`sidebar-btn ${activeTool === tool.id ? 'active' : ''}`}
          onClick={() => onSelectTool(tool.id)}
          data-tooltip={tool.label}
          id={`sidebar-${tool.id}`}
        >
          <div className="sidebar-icon">{tool.icon}</div>
          <span className="sidebar-label">{tool.label}</span>
          {tool.badge && (
            <span className="sidebar-badge">{tool.badge}</span>
          )}
          {activeTool === tool.id && <div className="sidebar-indicator" />}
        </button>
      ))}
    </div>
  );
}
