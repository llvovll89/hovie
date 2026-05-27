import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMovieDetail } from '../../hooks/useMovieDetail'
import { useAuth } from '../../hooks/useAuth'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { useToast } from '../../contexts/ToastContext'
import { IMG } from '../../lib/tmdb'
import { addToWatchlist, removeFromWatchlist, checkInWatchlist, addToWatched, removeFromWatched, checkInWatched, updateWatchedRating, isFirebaseConfigured } from '../../lib/firebase'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import SkeletonCard from '../../components/ui/SkeletonCard'
import StarRating from '../../components/ui/StarRating'
import StreamingInfo from './StreamingInfo'
import CommentSection from './CommentSection'
import ImageGallery from './ImageGallery'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'


export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const { user } = useAuth()
  const { openSignIn } = useAuthModal()
  const { showToast } = useToast()
  const movieId = Number(id)

  const { movie, cast, directors, providers, providerRegion, recommendations, similar, trailerKey, collection, keywords, externalIds, tmdbReviews, loading, error } = useMovieDetail(movieId)

  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [inWatched, setInWatched] = useState(false)
  const [watchedRating, setWatchedRating] = useState(0)
  const [watchedPickerOpen, setWatchedPickerOpen] = useState(false)
  const [watchedLoading, setWatchedLoading] = useState(false)
  const [trailerPlaying, setTrailerPlaying] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: `${movie?.title ?? ''} - HOVIE`, url }) } catch { }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { }
    }
  }

  useEffect(() => {
    if (!user || !movieId || !isFirebaseConfigured) return
    checkInWatchlist(user.uid, movieId).then(setInWatchlist)
    checkInWatched(user.uid, movieId).then(({ inWatched, myRating }) => {
      setInWatched(inWatched)
      setWatchedRating(myRating)
    })
  }, [user, movieId])

  useEffect(() => {
    if (!trailerPlaying) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setTrailerPlaying(false) }
    document.addEventListener('keydown', fn)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', fn)
    }
  }, [trailerPlaying])

  async function saveWatchedEntry() {
    if (!user || !movie) return
    setWatchedLoading(true)
    try {
      if (inWatched) {
        await updateWatchedRating(user.uid, movieId, watchedRating)
        showToast('별점을 수정했습니다')
      } else {
        await addToWatched(user.uid, {
          id: movie.id, title: movie.title, original_title: movie.original_title,
          poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average, vote_count: movie.vote_count,
          release_date: movie.release_date, overview: movie.overview,
          genre_ids: movie.genres.map(g => g.id), popularity: movie.popularity, adult: false,
        }, watchedRating)
        setInWatched(true)
        showToast('시청 기록을 저장했습니다')
      }
      setWatchedPickerOpen(false)
    } finally { setWatchedLoading(false) }
  }

  async function deleteWatchedEntry() {
    if (!user) return
    setWatchedLoading(true)
    try {
      await removeFromWatched(user.uid, movieId)
      setInWatched(false)
      setWatchedRating(0)
      setWatchedPickerOpen(false)
      showToast('시청 기록을 삭제했습니다', 'info')
    } finally { setWatchedLoading(false) }
  }

  async function toggleWatchlist() {
    if (!isFirebaseConfigured) return
    if (!user) { openSignIn(); return }
    if (!movie) return
    setWatchlistLoading(true)
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, movieId)
        setInWatchlist(false)
        showToast('위시리스트에서 제거했습니다', 'info')
      } else {
        await addToWatchlist(user.uid, {
          id: movie.id, title: movie.title, original_title: movie.original_title,
          poster_path: movie.poster_path, backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average, vote_count: movie.vote_count,
          release_date: movie.release_date, overview: movie.overview,
          genre_ids: movie.genres.map(g => g.id), popularity: movie.popularity, adult: false,
        })
        setInWatchlist(true)
        showToast('위시리스트에 추가했습니다')
      }
    } finally { setWatchlistLoading(false) }
  }

  if (loading) {
    return <MovieDetailSkeleton />
  }

  if (error || !movie) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>{error ?? '영화를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 20, background: 'none', border: '1px solid var(--border-4)', color: 'var(--text)', padding: '10px 24px', cursor: 'pointer', fontSize: 12 }}>
          ← 뒤로 가기
        </button>
      </div>
    )
  }

  const backdropUrl = IMG.backdrop(movie.backdrop_path, 'w1280')
  const posterUrl = IMG.poster(movie.poster_path, 'w500')
  const year = movie.release_date?.split('-')[0]
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null
  const ogImage = IMG.backdrop(movie.backdrop_path, 'w780') ?? IMG.poster(movie.poster_path, 'w500')

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <title>{movie.title} — HOVIE</title>
      <meta name="description" content={movie.overview?.slice(0, 160)} />
      <meta property="og:title" content={`${movie.title} — HOVIE`} />
      <meta property="og:description" content={movie.overview?.slice(0, 160)} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="video.movie" />

      {trailerPlaying && trailerKey && createPortal(
        <div
          className="modal-bg-enter"
          role="dialog"
          aria-modal="true"
          aria-label="예고편"
          style={{ position: 'fixed', inset: 0, zIndex: 9000, backgroundColor: 'rgba(0,0,0,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setTrailerPlaying(false) }}
        >
          <div className="modal-content-enter" style={{ position: 'relative', width: '100%', maxWidth: 1100, padding: '0 20px' }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
          <button
            onClick={() => setTrailerPlaying(false)}
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
        </div>,
        document.body
      )}

      {/* Backdrop */}
      <div style={{ position: 'relative', height: isMobile ? 280 : 500, overflow: 'hidden', backgroundColor: '#000' }}>
        {backdropUrl ? (
          <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'brightness(0.45)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, var(--bg-elevated), var(--bg))' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, var(--bg) 100%)' }} />

        {/* Trailer play button — opens fullscreen modal */}
        {trailerKey && (
          <button
            onClick={() => setTrailerPlaying(true)}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.7)', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}
            title="예고편 보기"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 18, left: 16, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '7px 14px', cursor: 'pointer', fontSize: 12, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!isMobile && '뒤로'}
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>

        {/* Hero info */}
        <div className="detail-hero-info">
          <div className="detail-poster">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', boxShadow: '0 16px 50px rgba(0,0,0,0.8)', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
            )}
          </div>

          <div className="detail-info">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {movie.genres.map(g => (
                <span key={g.id} style={{ fontSize: 10, letterSpacing: '0.15em', color: A, border: '1px solid rgba(0,153,255,0.3)', padding: '3px 10px', textTransform: 'uppercase' }}>
                  {g.name}
                </span>
              ))}
            </div>

            <h1 style={{ fontSize: isMobile ? 22 : 'clamp(22px, 3.5vw, 38px)', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.15 }}>
              {movie.title}
            </h1>
            {movie.original_title !== movie.title && (
              <p style={{ color: 'var(--text-4)', fontSize: 13, margin: '0 0 10px', fontStyle: 'italic' }}>{movie.original_title}</p>
            )}
            {movie.tagline && (
              <p style={{ color: 'var(--text-3)', fontSize: 13, fontStyle: 'italic', margin: '0 0 14px', borderLeft: '2px solid rgba(0,153,255,0.4)', paddingLeft: 12 }}>
                "{movie.tagline}"
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: A, fontSize: 18 }}>★</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{movie.vote_average.toFixed(1)}</span>
                <span style={{ color: 'var(--text-4)', fontSize: 12 }}>/ 10 ({movie.vote_count.toLocaleString()})</span>
              </div>
              {year && <MetaTag label={year} />}
              {runtime && <MetaTag label={runtime} />}
              {movie.status && <MetaTag label={movie.status} />}
            </div>

            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.8, margin: '0 0 20px', maxWidth: 600 }}>
              {movie.overview || '줄거리 정보가 없습니다.'}
            </p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {trailerKey && (
                  <button
                    onClick={() => setTrailerPlaying(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', backgroundColor: A, color: 'var(--accent-on)', border: 'none', fontSize: 12, letterSpacing: '0.08em', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
                  >
                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                    예고편 보기
                  </button>
                )}
                {isFirebaseConfigured && (
                  <button
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: `1px solid ${inWatchlist ? A : 'var(--border-4)'}`, backgroundColor: inWatchlist ? 'rgba(0,153,255,0.1)' : 'transparent', color: inWatchlist ? A : 'var(--text-3)', fontSize: 12, letterSpacing: '0.08em', cursor: watchlistLoading ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!watchlistLoading) e.currentTarget.style.borderColor = A }}
                    onMouseLeave={e => { if (!inWatchlist) e.currentTarget.style.borderColor = 'var(--border-4)' }}
                  >
                    <HeartIcon filled={inWatchlist} />
                    {inWatchlist ? '위시리스트에 저장됨' : '위시리스트에 추가'}
                  </button>
                )}
                {isFirebaseConfigured && (
                  <button
                    onClick={() => {
                      if (!user) { openSignIn(); return }
                      setWatchedPickerOpen(o => !o)
                    }}
                    disabled={watchedLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: `1px solid ${inWatched ? A : 'var(--border-4)'}`, backgroundColor: inWatched ? 'rgba(0,153,255,0.1)' : 'transparent', color: inWatched ? A : 'var(--text-3)', fontSize: 12, letterSpacing: '0.08em', cursor: watchedLoading ? 'wait' : 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!watchedLoading) e.currentTarget.style.borderColor = A }}
                    onMouseLeave={e => { if (!inWatched) e.currentTarget.style.borderColor = 'var(--border-4)' }}
                  >
                    <EyeIcon filled={inWatched} />
                    {inWatched
                      ? watchedRating > 0 ? `시청 완료 ${'★'.repeat(watchedRating)}` : '시청 완료'
                      : '이미 봤어요'}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', border: `1px solid ${copied ? A : 'var(--border-4)'}`, backgroundColor: copied ? 'rgba(0,153,255,0.08)' : 'transparent', color: copied ? A : 'var(--text-3)', fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (!copied) e.currentTarget.style.borderColor = 'var(--border-2)' }}
                  onMouseLeave={e => { if (!copied) e.currentTarget.style.borderColor = 'var(--border-4)' }}
                >
                  {copied ? (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      링크 복사됨
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
                      </svg>
                      공유
                    </>
                  )}
                </button>
              </div>

              {/* Watched rating picker */}
              {watchedPickerOpen && (
                <div style={{ marginTop: 8, padding: '16px 18px', border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-4)', margin: 0, textTransform: 'uppercase' }}>
                    {inWatched ? '내 별점 수정' : '내 별점 (선택사항)'}
                  </p>
                  <StarRating value={watchedRating} onChange={setWatchedRating} size={24} />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={saveWatchedEntry}
                      disabled={watchedLoading}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', backgroundColor: A, color: 'var(--accent-on)', border: 'none', fontSize: 11, letterSpacing: '0.12em', fontWeight: 600, cursor: watchedLoading ? 'wait' : 'pointer', transition: 'background-color 0.2s' }}
                      onMouseEnter={e => { if (!watchedLoading) e.currentTarget.style.backgroundColor = AH }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = A }}
                    >
                      {watchedLoading && <Spinner size={12} />}
                      {inWatched ? '별점 수정' : '기록하기'}
                    </button>
                    {inWatched && (
                      <button
                        onClick={deleteWatchedEntry}
                        disabled={watchedLoading}
                        style={{ padding: '8px 18px', background: 'none', border: '1px solid rgba(220,50,50,0.4)', color: 'rgba(220,50,50,0.7)', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(220,50,50,0.8)'; e.currentTarget.style.color = 'rgba(220,50,50,1)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(220,50,50,0.4)'; e.currentTarget.style.color = 'rgba(220,50,50,0.7)' }}
                      >
                        기록 삭제
                      </button>
                    )}
                    <button
                      onClick={() => setWatchedPickerOpen(false)}
                      style={{ padding: '8px 14px', background: 'none', border: '1px solid var(--border-4)', color: 'var(--text-4)', fontSize: 11, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-4)'; e.currentTarget.style.color = 'var(--text-4)' }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: keywords.length > 0 ? 16 : 0 }}>
              {movie.production_countries.length > 0 && (
                <InfoMini label="제작국" value={movie.production_countries.map(c => c.name).join(', ')} />
              )}
              {movie.spoken_languages.length > 0 && (
                <InfoMini label="언어" value={movie.spoken_languages.map(l => l.name).join(', ')} />
              )}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {keywords.map(kw => (
                  <span key={kw.id} style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-4)', border: '1px solid var(--border)', padding: '3px 10px', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => navigate(`/search?keyword=${kw.id}`)}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    #{kw.name}
                  </span>
                ))}
              </div>
            )}

            {/* External links */}
            {externalIds?.imdb_id && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={`https://www.imdb.com/title/${externalIds.imdb_id}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, letterSpacing: '0.12em', color: '#f5c518', border: '1px solid rgba(245,197,24,0.3)', padding: '5px 12px', textDecoration: 'none', transition: 'all 0.2s', fontWeight: 600 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245,197,24,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,197,24,0.6)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,197,24,0.3)' }}
                >
                  IMDb ↗
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="movie-detail-layout" style={{ marginBottom: 80 }}>
          <div>
            {directors.length > 0 && (
              <SectionBlock title="감독">
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {directors.map(d => (
                    <Link key={d.id} to={`/person/${d.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-elevated)', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = A)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-surface)', flexShrink: 0 }}>
                        {d.profile_path
                          ? <img src={`https://image.tmdb.org/t/p/w185${d.profile_path}`} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: 0 }}>{d.name}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-4)', margin: 0 }}>감독</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </SectionBlock>
            )}
            {cast.length > 0 && (
              <SectionBlock title="출연진">
                <div className="cast-grid">
                  {cast.map(member => <CastCard key={member.id} member={member} />)}
                </div>
              </SectionBlock>
            )}
            <SectionBlock title="스틸컷 & 포스터">
              <ImageGallery movieId={movieId} />
            </SectionBlock>
            {tmdbReviews.length > 0 && (
              <SectionBlock title="TMDB 관객 리뷰">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {tmdbReviews.map(review => (
                    <TMDBReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </SectionBlock>
            )}
            <SectionBlock title="리뷰 & 평점">
              <CommentSection movieId={movieId} />
            </SectionBlock>
          </div>

          <div>
            <SectionBlock title="어디서 볼까?">
              <StreamingInfo providers={providers} region={providerRegion} />
            </SectionBlock>
            {movie.budget > 0 && (
              <SectionBlock title="제작 정보">
                <InfoRow label="예산" value={`$${(movie.budget / 1_000_000).toFixed(0)}M`} />
                {movie.revenue > 0 && <InfoRow label="수익" value={`$${(movie.revenue / 1_000_000).toFixed(0)}M`} />}
              </SectionBlock>
            )}
          </div>
        </div>

        {collection && collection.parts.length > 1 && (
          <CollectionRow collection={collection} currentId={movieId} />
        )}
        {recommendations.length > 0 && <MovieRow label="Recommendations" title="이 영화를 좋아한다면" movies={recommendations} />}
        {similar.length > 0 && <MovieRow label="Similar" title="비슷한 영화" movies={similar} />}
      </div>
    </div>
  )
}

function CollectionRow({ collection, currentId }: { collection: { id: number; name: string; parts: { id: number; title?: string; poster_path: string | null; release_date?: string; vote_average?: number }[] }; currentId: number }) {
  const others = collection.parts.filter(p => p.id !== currentId).sort((a, b) => {
    const aYear = a.release_date?.slice(0, 4) ?? '0'
    const bYear = b.release_date?.slice(0, 4) ?? '0'
    return aYear.localeCompare(bYear)
  })
  if (others.length === 0) return null
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 52, marginBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--accent)', fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>Collection</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          {collection.name}
        </h2>
      </div>
      <div className="similar-grid">
        {others.map(part => (
          <MovieCard key={part.id} movie={{
            id: part.id,
            title: part.title ?? '',
            original_title: part.title ?? '',
            poster_path: part.poster_path,
            backdrop_path: null,
            vote_average: part.vote_average ?? 0,
            vote_count: 0,
            release_date: part.release_date ?? '',
            genre_ids: [],
            overview: '',
            popularity: 0,
            adult: false,
          }} />
        ))}
      </div>
    </div>
  )
}

function MovieRow({ label, title, movies }: { label: string; title: string; movies: ReturnType<typeof useMovieDetail>['recommendations'] }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 52, marginBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: 'var(--accent)', fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          {title}
        </h2>
      </div>
      <div className="similar-grid">
        {movies.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
    </div>
  )
}

function MetaTag({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 12, color: 'var(--text-3)', border: '1px solid var(--border-2)', padding: '3px 10px' }}>
      {label}
    </span>
  )
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', marginBottom: 3, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{value}</p>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 18px', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function CastCard({ member }: { member: { id: number; name: string; character: string; profile_path: string | null } }) {
  const img = member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : null
  return (
    <Link to={`/person/${member.id}`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
      <div
        style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-elevated)', marginBottom: 6, border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {img ? <img src={img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', margin: '0 0 2px', lineHeight: 1.3 }}>{member.name}</p>
      <p style={{ fontSize: 10, color: 'var(--text-4)', margin: 0, lineHeight: 1.3 }}>{member.character}</p>
    </Link>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{value}</span>
    </div>
  )
}

function TMDBReviewCard({ review }: { review: import('../../types').TMDBReview }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.content.length > 300
  const displayContent = isLong && !expanded ? review.content.slice(0, 300) + '…' : review.content
  const avatarPath = review.author_details.avatar_path
  const avatarUrl = avatarPath?.startsWith('/https') ? avatarPath.slice(1) : avatarPath ? `https://image.tmdb.org/t/p/w185${avatarPath}` : null
  const date = new Date(review.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '16px 18px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-surface)', flexShrink: 0 }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={review.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-4)' }}>👤</div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{review.author}</span>
            {review.author_details.rating && (
              <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                ★ {review.author_details.rating}/10
              </span>
            )}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{date}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
        {displayContent}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
        >
          {expanded ? '접기' : '더 보기'}
        </button>
      )}
    </div>
  )
}

function EyeIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="15" height="15" fill="none" stroke="var(--accent)" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="var(--accent)" />
    </svg>
  ) : (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
    </svg>
  )
}

function MovieDetailSkeleton() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div className="skeleton" style={{ height: 560 }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <div className="detail-hero-info">
          <div className="detail-poster">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '2/3' }} />
          </div>
          <div className="detail-info" style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 18, width: 120, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 42, width: '70%', marginBottom: 14 }} />
            <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 28 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ height: 44, width: 140 }} />
              <div className="skeleton" style={{ height: 44, width: 44 }} />
              <div className="skeleton" style={{ height: 44, width: 44 }} />
            </div>
          </div>
        </div>
        <div className="movie-detail-layout" style={{ padding: '0 0 80px' }}>
          <div>
            <div className="skeleton" style={{ height: 24, width: 80, marginBottom: 18 }} />
            <div className="cast-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 11, width: '80%', margin: '0 auto 4px' }} />
                  <div className="skeleton" style={{ height: 10, width: '60%', margin: '0 auto' }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="skeleton" style={{ height: 24, width: 100, marginBottom: 18 }} />
            <SkeletonCard count={4} />
          </div>
        </div>
      </div>
    </div>
  )
}
