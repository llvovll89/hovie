import { createContext, useContext, useState, useCallback, useRef } from 'react'

type ToastType = 'success' | 'error' | 'info'
interface ToastItem { id: number; message: string; type: ToastType }
interface ToastCtx { showToast: (message: string, type?: ToastType) => void }

export const ToastContext = createContext<ToastCtx>({ showToast: () => {} })
export function useToast() { return useContext(ToastContext) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const COLOR: Record<ToastType, string> = {
    success: 'var(--accent)',
    error:   '#ef4444',
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
      <div style={{
        position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'center', pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '10px 20px',
            backgroundColor: COLOR[t.type],
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
            border: `1px solid ${BORDER[t.type]}`,
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
