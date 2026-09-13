import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onClose: () => void
  ariaLabel: string
  children: React.ReactNode | ((requestClose: () => void, closing: boolean) => React.ReactNode)
  style?: React.CSSProperties
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
const EXIT_MS = 160

export default function Modal({ onClose, ariaLabel, children, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [closing, setClosing] = useState(false)

  const requestClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, EXIT_MS)
  }, [onClose])

  // Mount-only: scroll lock, initial focus, Tab-trap. Doesn't depend on onClose
  // so it never re-subscribes and steals focus back while the modal is open.
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    focusables?.[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus?.()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  return createPortal(
    <div
      ref={containerRef}
      className={closing ? 'modal-bg-exit' : 'modal-bg-enter'}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style }}
      onClick={e => { if (e.target === e.currentTarget) requestClose() }}
    >
      {typeof children === 'function' ? children(requestClose, closing) : children}
    </div>,
    document.body
  )
}
