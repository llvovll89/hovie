import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMovieDetail } from '../../hooks/useMovieDetail'
import { useAuth } from '../../hooks/useAuth'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { IMG } from '../../lib/tmdb'
import {
  addToWatchlist, removeFromWatchlist,
  checkInWatchlist, isFirebaseConfigured, signInWithGoogle,
} from '../../lib/firebase'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import StreamingInfo from './StreamingInfo'
import CommentSection from './CommentSection'
import type { MovieDetail as TMovieDetail } from '../../types'

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const { user } = useAuth()
  const movieId = Number(id)

  const { movie, cast, providers, providerRegion, recommendations, similar, loading, error } = useMovieDetail(movieId)

  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)

  useEffect(() => {
    if (!user || !movieId || !isFirebaseConfigured) return
    checkInWatchlist(user.uid, movieId).then(setInWatchlist)
  }, [user, movieId])

  async function toggleWatchlist() {
    if (!isFirebaseConfigured) return
    if (!user) { signInWithGoogle(); return }
    if (!movie) return
    setWatchlistLoading(true)
    try {
      if (inWatchlist) {
        await removeFromWatchlist(user.uid, movieId)
        setInWatchlist(false)
      } else {
        // MovieDetail extends Movie shape; pass minimal Movie fields
        await addToWatchlist(user.uid, {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          release_date: movie.release_date,
          overview: movie.overview,
          genre_ids: movie.genres.map(g => g.id),
          popularity: movie.popularity,
          adult: false,
        })
        setInWatchlist(true)
      }
    } finally {
      setWatchlistLoading(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><Spinner size={48} /></div>
  }

  if (error || !movie) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>{error ?? '영화를 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 20, background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 24px', cursor: 'pointer', fontSize: 12 }}>
          ← 뒤로 가기
        </button>
      </div>
    )
  }

  const backdropUrl = IMG.backdrop(movie.backdrop_path, 'w1280')
  const posterUrl = IMG.poster(movie.poster_path, 'w500')
  const year = movie.release_date?.split('-')[0]
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>

      {/* Backdrop */}
      <div style={{ position: 'relative', height: isMobile ? 280 : 500, overflow: 'hidden' }}>
        {backdropUrl ? (
          <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'brightness(0.28)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, #111, #000)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.5) 70%, #000 100%)' }} />
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
          {/* Poster */}
          <div className="detail-poster">
            {posterUrl ? (
              <img src={posterUrl} alt={movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', boxShadow: '0 16px 50px rgba(0,0,0,0.8)', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {movie.genres.map(g => (
                <span key={g.id} style={{ fontSize: 10, letterSpacing: '0.15em', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)', padding: '3px 10px', textTransform: 'uppercase' }}>
                  {g.name}
                </span>
              ))}
            </div>

            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? 22 : 'clamp(22px, 3.5vw, 38px)', fontWeight: 700, margin: '0 0 6px', lineHeight: 1.15 }}>
              {movie.title}
            </h1>
            {movie.original_title !== movie.title && (
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 10px', fontStyle: 'italic' }}>{movie.original_title}</p>
            )}
            {movie.tagline && (
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontStyle: 'italic', margin: '0 0 14px', borderLeft: '2px solid rgba(201,168,76,0.4)', paddingLeft: 12 }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Rating + meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#C9A84C', fontSize: 18 }}>★</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{movie.vote_average.toFixed(1)}</span>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>/ 10 ({movie.vote_count.toLocaleString()})</span>
              </div>
              {year && <MetaTag label={year} />}
              {runtime && <MetaTag label={runtime} />}
              {movie.status && <MetaTag label={movie.status} />}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.8, margin: '0 0 20px', maxWidth: 600 }}>
              {movie.overview || '줄거리 정보가 없습니다.'}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {/* Watchlist button */}
              {isFirebaseConfigured && (
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 20px',
                    border: `1px solid ${inWatchlist ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
                    backgroundColor: inWatchlist ? 'rgba(201,168,76,0.12)' : 'transparent',
                    color: inWatchlist ? '#C9A84C' : 'rgba(255,255,255,0.65)',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    cursor: watchlistLoading ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!watchlistLoading) e.currentTarget.style.borderColor = '#C9A84C' }}
                  onMouseLeave={e => { if (!inWatchlist) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                >
                  <HeartIcon filled={inWatchlist} />
                  {inWatchlist ? '위시리스트에 저장됨' : '위시리스트에 추가'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {movie.production_countries.length > 0 && (
                <InfoMini label="제작국" value={movie.production_countries.map(c => c.name).join(', ')} />
              )}
              {movie.spoken_languages.length > 0 && (
                <InfoMini label="언어" value={movie.spoken_languages.map(l => l.name).join(', ')} />
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="movie-detail-layout" style={{ marginBottom: 80 }}>
          {/* Left */}
          <div>
            {cast.length > 0 && (
              <SectionBlock title="출연진">
                <div className="cast-grid">
                  {cast.map(member => <CastCard key={member.id} member={member} />)}
                </div>
              </SectionBlock>
            )}
            <SectionBlock title="리뷰 & 평점">
              <CommentSection movieId={movieId} />
            </SectionBlock>
          </div>

          {/* Right */}
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

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <MovieRow label="Recommendations" title="이 영화를 좋아한다면" movies={recommendations} />
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <MovieRow label="Similar" title="비슷한 영화" movies={similar} />
        )}
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function MovieRow({ label, title, movies }: { label: string; title: string; movies: ReturnType<typeof useMovieDetail>['recommendations'] }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 52, marginBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: 0, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
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
    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px' }}>
      {label}
    </span>
  )
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)', marginBottom: 3, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{value}</p>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, margin: '0 0 18px', paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function CastCard({ member }: { member: { id: number; name: string; character: string; profile_path: string | null } }) {
  const img = member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : null
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#1a1a1a', marginBottom: 6, border: '1px solid rgba(255,255,255,0.07)' }}>
        {img ? <img src={img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: '0 0 2px', lineHeight: 1.3 }}>{member.name}</p>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.3 }}>{member.character}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{value}</span>
    </div>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" fill={filled ? '#C9A84C' : 'none'} stroke={filled ? '#C9A84C' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
    </svg>
  )
}
