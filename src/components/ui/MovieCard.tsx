import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IMG } from '../../lib/tmdb'
import type { Movie } from '../../types'

const A = 'var(--accent)'

interface Props { movie: Movie; rank?: number }

export default function MovieCard({ movie, rank }: Props) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const posterUrl = IMG.poster(movie.poster_path, 'w342')

  return (
    <div onClick={() => navigate(`/movie/${movie.id}`)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ cursor: 'pointer', position: 'relative' }}>
      <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', backgroundColor: '#111', borderRadius: 2 }}>
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: 32 }}>🎬</span>
            <span style={{ fontSize: 11 }}>포스터 없음</span>
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease' }} />

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 14px', transform: hovered ? 'translateY(0)' : 'translateY(8px)', opacity: hovered ? 1 : 0, transition: 'all 0.3s ease' }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: A, fontSize: 12 }}>★ {movie.vote_average.toFixed(1)}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{movie.release_date?.split('-')[0]}</span>
          </div>
        </div>

        {rank !== undefined && (
          <div style={{ position: 'absolute', top: 10, left: 10, width: 26, height: 26, backgroundColor: A, color: 'var(--accent-on)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {rank}
          </div>
        )}

        {movie.vote_average > 0 && rank === undefined && (
          <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', color: A, fontSize: 11, fontWeight: 600, padding: '3px 7px', borderRadius: 2 }}>
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      <div style={{ padding: '8px 2px 0' }}>
        <p style={{ fontSize: 13, color: hovered ? '#fff' : 'rgba(255,255,255,0.75)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
          {movie.title}
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>{movie.release_date?.split('-')[0]}</p>
      </div>
    </div>
  )
}
