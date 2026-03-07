import { useState, useEffect, useCallback } from 'react'
import { tmdb } from '../../lib/tmdb'
import Spinner from '../../components/ui/Spinner'
import type { MovieImage } from '../../types'

const BASE_IMG = 'https://image.tmdb.org/t/p'

interface Props {
  movieId: number
  mediaType?: 'movie' | 'tv'
}

export default function ImageGallery({ movieId, mediaType = 'movie' }: Props) {
  const [backdrops, setBackdrops] = useState<MovieImage[]>([])
  const [posters, setPosters] = useState<MovieImage[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'backdrops' | 'posters'>('backdrops')
  const [showAll, setShowAll] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    ;(mediaType === 'tv' ? tmdb.tvImages(movieId) : tmdb.images(movieId))
      .then(d => {
        setBackdrops((d.backdrops as MovieImage[]).slice(0, 20))
        setPosters((d.posters as MovieImage[]).slice(0, 20))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [movieId])

  const images = tab === 'backdrops' ? backdrops : posters
  const PREVIEW = 9
  const displayed = showAll ? images : images.slice(0, PREVIEW)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() => setLightboxIndex(i => (i === null || i === 0) ? images.length - 1 : i - 1), [images.length])
  const nextImage = useCallback(() => setLightboxIndex(i => (i === null) ? 0 : (i + 1) % images.length), [images.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'ArrowRight') nextImage()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxIndex, closeLightbox, prevImage, nextImage])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner size={28} /></div>
  }

  if (backdrops.length === 0 && posters.length === 0) {
    return <p style={{ color: 'var(--text-4)', fontSize: 13 }}>이미지가 없습니다.</p>
  }

  const currentImg = lightboxIndex !== null ? images[lightboxIndex] : null
  const thumbSize = tab === 'backdrops' ? 'w780' : 'w342'
  const fullSize = tab === 'backdrops' ? 'original' : 'w780'

  return (
    <>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        {(['backdrops', 'posters'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowAll(false) }}
            style={{
              padding: '8px 20px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              color: tab === t ? 'var(--accent)' : 'var(--text-3)',
              fontSize: 12,
              letterSpacing: '0.12em',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
              marginBottom: -1,
            }}
          >
            {t === 'backdrops' ? `스틸컷 ${backdrops.length}` : `포스터 ${posters.length}`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: tab === 'backdrops' ? 'repeat(auto-fill, minmax(200px, 1fr))' : 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: 6,
      }}>
        {displayed.map((img, i) => (
          <button
            key={img.file_path}
            onClick={() => setLightboxIndex(i)}
            style={{
              padding: 0,
              border: '1px solid var(--border)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              overflow: 'hidden',
              aspectRatio: tab === 'backdrops' ? '16/9' : '2/3',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            <img
              src={`${BASE_IMG}/${thumbSize}${img.file_path}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Show more */}
      {!showAll && images.length > PREVIEW && (
        <button
          onClick={() => setShowAll(true)}
          style={{ marginTop: 14, width: '100%', padding: '10px', background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
        >
          {images.length - PREVIEW}장 더 보기
        </button>
      )}

      {/* Lightbox */}
      {currentImg && lightboxIndex !== null && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9500, backgroundColor: 'rgba(0,0,0,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) closeLightbox() }}
        >
          {/* Image */}
          <div style={{ position: 'relative', maxWidth: tab === 'backdrops' ? '90vw' : '50vw', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={`${BASE_IMG}/${fullSize}${currentImg.file_path}`}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }}
            />

            {/* Prev */}
            <button
              onClick={prevImage}
              style={{ position: 'absolute', left: -52, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', borderRadius: 0 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Next */}
            <button
              onClick={nextImage}
              style={{ position: 'absolute', right: -52, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', borderRadius: 0 }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 20 }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: '0.1em' }}>
              {lightboxIndex + 1} / {images.length}
            </span>
            <button
              onClick={closeLightbox}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '7px 20px', cursor: 'pointer', fontSize: 11, letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
              닫기 (ESC)
            </button>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
              {currentImg.width} × {currentImg.height}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
