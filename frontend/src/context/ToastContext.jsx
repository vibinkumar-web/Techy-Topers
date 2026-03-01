import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <ToastContainer toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}

// ── Icons ──────────────────────────────────────────────
function CheckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
            <path d="M6 10.5l3 3 5-5.5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function ErrorIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
            <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    );
}
function WarnIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3L18.5 17H1.5L10 3z" fill="currentColor" opacity="0.15" />
            <path d="M10 8v4M10 14v.5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    );
}
function InfoIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
            <path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" />
        </svg>
    );
}

const CONFIG = {
    success: { icon: <CheckIcon />, color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Success' },
    error: { icon: <ErrorIcon />, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', label: 'Error' },
    warning: { icon: <WarnIcon />, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: 'Warning' },
    info: { icon: <InfoIcon />, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Info' },
};

// ── Toast Container ─────────────────────────────────────
function ToastContainer({ toasts, dismiss }) {
    if (toasts.length === 0) return null;
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '420px',
            width: 'calc(100vw - 40px)',
        }}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} dismiss={dismiss} />
            ))}
        </div>
    );
}

function Toast({ toast, dismiss }) {
    const cfg = CONFIG[toast.type] || CONFIG.success;

    return (
        <div
            title={toast.message}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderLeft: `4px solid ${cfg.color}`,
                borderRadius: '10px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                animation: 'toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Progress bar */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '3px',
                background: cfg.color,
                opacity: 0.3,
                transformOrigin: 'left',
                animation: 'toastProgress 4s linear forwards',
            }} />

            {/* Icon */}
            <div style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }}>
                {cfg.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: cfg.text,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '2px',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    {cfg.label}
                </div>
                <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.45',
                    fontFamily: 'system-ui, sans-serif',
                    wordBreak: 'break-word',
                }}>
                    {toast.message}
                </div>
            </div>

            {/* Close */}
            <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '16px',
                    lineHeight: 1,
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'color 0.15s',
                    marginTop: '-2px',
                    fontFamily: 'system-ui, sans-serif',
                }}
                onMouseEnter={e => e.target.style.color = '#374151'}
                onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >
                ✕
            </button>

            <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes toastProgress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
        </div>
    );
}
