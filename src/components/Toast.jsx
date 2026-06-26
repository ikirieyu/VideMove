import React from 'react';

function ToastIcon({ type }) {
  if (type === 'success') return <span style={{ color: '#10b981' }}>✓</span>;
  if (type === 'error') return <span style={{ color: '#ef4444' }}>✕</span>;
  return <span style={{ color: '#7c5cfc' }}>ℹ</span>;
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type}`}
          onClick={() => onRemove(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <ToastIcon type={t.type} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
