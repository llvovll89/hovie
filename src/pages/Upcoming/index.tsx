import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb, IMG } from '../../lib/tmdb'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import { useToast } from '../../contexts/ToastContext'
import type { Movie } from '../../types'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

function getDday(dateStr: string): { label: string; urgent: boolean } {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const release = new Date(dateStr); release.setHours(0, 0, 0, 0)
  const diff = Math.ceil((release.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { label: '개봉', urgent: false }
  if (diff === 0) return { label: 'D-DAY', urgent: true }
  if (diff <= 7) return { label: `D-${diff}`, urgent: true }
  return { label: `D-${diff}`, urgent: false }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function Upcoming() {
  const { showToast } = useToast()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    tmdb.upcoming(page)
      .then(d => {
        const results = (d.results as Movie[]).filter(m => m.release_date)
        setMovies(prev => page === 1 ? results : [...prev, ...results])
        setTotalPages(Math.min(d.total_pages, 8))
        setTotalResults(d.total_results)
      })
      .catch(() => showToast('개봉 예정작을 불러오지 못했습니다.', 'error'))
      .finally(() => { setLoading(false); setLoadingMore(false) })
  }, [page])

  const hero = movies[0]
  const rest = movies.slice(1)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>

      {loading ? (
        <div style={{ height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={48} />
        </div>
      ) : hero ? (
        <UpcomingHero movie={hero} />
      ) : null}

      {!loading && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 20px 80px' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 8px', textTransform: 'uppercase' }}>Coming Soon</p>
              <h2 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
                개봉 예정 영화
              </h2>
            </div>
            {totalResults > 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-4)', paddingBottom: 4 }}>
                {totalResults.toLocaleString()}편
              </span>
            )}
          </div>

          {rest.length > 0 ? (
            <div className="movie-grid-4">
              {rest.map(movie => (
                <div key={movie.id} style={{ position: 'relative' }}>
                  <MovieCard movie={movie} />
                  {movie.release_date && <DdayBadge dateStr={movie.release_date} />}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <p style={{ fontSize: 40, marginBottom: 14 }}>🎬</p>
              <p style={{ color: 'var(--text-3)', fontSize: 15 }}>개봉 예정작이 없습니다.</p>
            </div>
          )}

          {/* Load more */}
          {page < totalPages && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 56 }}>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 40px', border: `1px solid ${loadingMore ? 'var(--border)' : 'var(--border-2)'}`, backgroundColor: 'transparent', color: loadingMore ? 'var(--text-4)' : 'var(--text-2)', fontSize: 12, letterSpacing: '0.15em', cursor: loadingMore ? 'wait' : 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => { if (!loadingMore) { e.currentTarget.style.borderColor = A; e.currentTarget.style.color = A } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
              >
                {loadingMore ? <Spinner size={14} /> : null}
                더 불러오기
              </button>
            </div>
          )}

          {page >= totalPages && movies.length > 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-5)', fontSize: 11, letterSpacing: '0.15em', marginTop: 56 }}>
              — 모든 개봉 예정작을 불러왔습니다 —
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function DdayBadge({ dateStr }: { dateStr: string }) {
  const { label, urgent } = getDday(dateStr)
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: urgent ? A : 'rgba(0,0,0,0.72)',
      color: urgent ? AO : 'rgba(255,255,255,0.85)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.08em',
      padding: '4px 9px',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      {label}
    </div>
  )
}

function UpcomingHero({ movie }: { movie: Movie }) {
  const navigate = useNavigate()
  const backdrop = IMG.backdrop(movie.backdrop_path, 'original')
  const { label, urgent } = getDday(movie.release_date)

  return (
    <div style={{ position: 'relative', height: 620, overflow: 'hidden' }}>
      {backdrop && (
        <img src={backdrop} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, var(--bg), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 60 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Next Up</span>
          <div style={{
            backgroundColor: urgent ? A : 'rgba(255,255,255,0.12)',
            color: urgent ? AO : 'rgba(255,255,255,0.9)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            padding: '5px 14px',
          }}>
            {label}
          </div>
          {movie.release_date && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {formatDate(movie.release_date)}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: 'clamp(32px, 5vw, 62px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 12px', maxWidth: 640 }}>
          {movie.title}
        </h1>

        {movie.vote_average > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <span style={{ color: A, fontSize: 15, fontWeight: 600 }}>★ {movie.vote_average.toFixed(1)}</span>
          </div>
        )}

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.75, maxWidth: 560, margin: '0 0 28px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {movie.overview || '줄거리 정보가 없습니다.'}
        </p>

        <button
          onClick={() => navigate(`/movie/${movie.id}`)}
          style={{ width: 'fit-content', backgroundColor: A, color: AO, border: 'none', padding: '12px 28px', fontSize: 12, letterSpacing: '0.15em', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
        >
          상세 정보 보기
        </button>
      </div>
    </div>
  )
}
