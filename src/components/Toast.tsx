import React, { useEffect } from 'react';

export interface ToastMsg {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastMsg[];
  onRemove: (id: number) => void;
}

const colors = {
  success: 'var(--accent-green)',
  error: 'var(--accent-orange)',
  info: 'var(--accent-cyan)',
};

const icons = {
  success: '✓',
  error: '✕',
  info: '◆',
};

export const Toast: React.FC<Props> = ({ toasts, onRemove }) => {
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMsg; onRemove: (id: number) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const color = colors[toast.type];

  return (
    <div
      className="toast"
      style={{
        background: 'rgba(10,15,30,0.95)',
        border: `1px solid ${color}40`,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '240px',
        boxShadow: `0 0 20px ${color}20`,
      }}
      onClick={() => onRemove(toast.id)}
    >
      <span style={{ color, fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 700 }}>
        {icons[toast.type]}
      </span>
      <span style={{ fontFamily: 'Rajdhani', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
        {toast.message}
      </span>
    </div>
  );
};
