import { useState, useCallback, useRef, useEffect } from 'react'

import { ToastContext, type ToastType } from './toast-context'
interface ToastItem { id: number; message: string; type: ToastType }


export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())
  useEffect(() => { const pending = timers.current; return () => pending.forEach(clearTimeout) }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    const timer = setTimeout(() => { timers.current.delete(timer); setToasts(prev => prev.filter(t => t.id !== id)) }, 2800)
    timers.current.add(timer)
  }, [])

  const COLOR: Record<ToastType, string> = {
    success: 'var(--button-bg)',
    error:   '#b42336',
    info:    'rgba(20,20,20,0.95)',
  }
  const BORDER: Record<ToastType, string> = {
    success: 'rgba(0,153,255,0.4)',
    error:   'rgba(239,68,68,0.4)',
    info:    'rgba(255,255,255,0.12)',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div role="status" aria-live="polite" style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'center', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-enter" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            backgroundColor: COLOR[t.type],
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
            border: `1px solid ${BORDER[t.type]}`,
            backdropFilter: 'blur(8px)',
            whiteSpace: 'normal', maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {t.type === 'success' && <span style={{ fontSize: 14 }}>✓</span>}
            {t.type === 'error'   && <span style={{ fontSize: 14 }}>✕</span>}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
