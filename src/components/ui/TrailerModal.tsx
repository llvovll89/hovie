import Modal from './Modal'

interface Props {
  trailerKey: string
  onClose: () => void
}

export default function TrailerModal({ trailerKey, onClose }: Props) {
  return (
    <Modal onClose={onClose} ariaLabel="예고편">
      {(requestClose, closing) => (
        <>
          <div className={closing ? 'modal-content-exit' : 'modal-content-enter'} style={{ position: 'relative', width: '100%', maxWidth: 1100, padding: '0 20px' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="예고편"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
          <button
            onClick={requestClose}
            style={{ marginTop: 20, background: 'none', border: '1px solid rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)', padding: '9px 24px', cursor: 'pointer', fontSize: 12, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
            </svg>
            닫기 (ESC)
          </button>
        </>
      )}
    </Modal>
  )
}
