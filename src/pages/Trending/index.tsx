import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb, IMG } from '../../lib/tmdb'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import type { Movie } from '../../types'

export default function Trending() {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    tmdb.trending(timeWindow)
      .then(d => setMovies(d.results as Movie[]))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [timeWindow])

  const hero = movies[0]
  const rest = movies.slice(1)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>

      {/* Hero — #1 Trending */}
      {loading ? (
        <div style={{ height: 560, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size={48} />
        </div>
      ) : hero ? (
        <TrendingHero movie={hero} timeWindow={timeWindow} onToggle={setTimeWindow} />
      ) : null}

      {/* Grid */}
      {!loading && rest.length > 0 && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 20px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', margin: '0 0 8px', textTransform: 'uppercase' }}>
                {timeWindow === 'week' ? 'This Week' : 'Today'}
              </p>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, margin: 0 }}>
                더 많은 인기 영화
              </h2>
            </div>
          </div>
          <div className="movie-grid-4">
            {rest.map((movie, idx) => (
              <MovieCard key={movie.id} movie={movie} rank={idx + 2} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TrendingHero({
  movie,
  timeWindow,
  onToggle,
}: {
  movie: Movie
  timeWindow: 'day' | 'week'
  onToggle: (v: 'day' | 'week') => void
}) {
  const navigate = useNavigate()
  const backdrop = IMG.backdrop(movie.backdrop_path, 'original')

  return (
    <div style={{ position: 'relative', height: 620, overflow: 'hidden' }}>
      {/* Background */}
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.25)' }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, #000, transparent)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 60 }}>

        {/* Toggle + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            {(['week', 'day'] as const).map(tw => (
              <button
                key={tw}
                onClick={() => onToggle(tw)}
                style={{
                  padding: '7px 18px',
                  background: timeWindow === tw ? '#C9A84C' : 'transparent',
                  color: timeWindow === tw ? '#000' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  fontWeight: timeWindow === tw ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tw === 'week' ? '이번 주' : '오늘'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#C9A84C', fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>#1</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>TRENDING</span>
          </div>
        </div>

        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(32px, 5vw, 62px)',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: '0 0 12px',
            maxWidth: 640,
          }}
        >
          {movie.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <span style={{ color: '#C9A84C', fontSize: 15, fontWeight: 600 }}>★ {movie.vote_average.toFixed(1)}</span>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{movie.release_date?.split('-')[0]}</span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.75, maxWidth: 560, margin: '0 0 28px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {movie.overview || '줄거리 정보가 없습니다.'}
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{ backgroundColor: '#C9A84C', color: '#000', border: 'none', padding: '12px 28px', fontSize: 12, letterSpacing: '0.15em', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#D4B96A')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#C9A84C')}
          >
            상세 정보 보기
          </button>
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 24px', fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          >
            어디서 볼까? →
          </button>
        </div>
      </div>
    </div>
  )
}
