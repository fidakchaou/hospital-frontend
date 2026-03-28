import React, { useState, useEffect, useCallback } from 'react';

let toastHandler = null;

export function showToast(message, type = 'success') {
  if (toastHandler) toastHandler(message, type);
}

function ToastItem({ id, message, type, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(id), 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    success: <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    error: <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="white" strokeWidth="2" /><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" /></>,
    info: <><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></>,
  };

  const colors = {
    success: '#14b8a6',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#0f766e',
  };

  const color = colors[type] || colors.success;

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      onClick={() => { setExiting(true); setTimeout(() => onRemove(id), 300); }}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '14px', backgroundColor: 'white', boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${color}25`, minWidth: '300px', maxWidth: '400px', cursor: 'pointer' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${color}40` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">{icons[type]}</svg>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a2332', flex: 1 }}>{message}</span>
      <div style={{ color: '#9ca3af', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    toastHandler = addToast;
    return () => { toastHandler = null; };
  }, [addToast]);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(toast => <ToastItem key={toast.id} {...toast} onRemove={removeToast} />)}
    </div>
  );
}