import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getWatched, isFirebaseConfigured } from '../../lib/firebase'
import { tmdb } from '../../lib/tmdb'
import SkeletonCard from '../../components/ui/SkeletonCard'
import MovieCard from '../../components/ui/MovieCard'
import type { WatchedMovie, Movie } from '../../types'

const A = 'var(--accent)'

function buildTopGenres(movies: WatchedMovie[]): number[] {
  const highRated = movies.filter(m => m.myRating >= 4)
  if (highRated.length === 0) return []
  const freq: Record<number, number> = {}
  for (const m of highRated) {
    for (const g of (m.genre_ids ?? [])) {
      freq[g] = (freq[g] ?? 0) + 1
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id))
}

async function fetchRecommendations(uid: string): Promise<Movie[]> {
  const watched = await getWatched(uid)
  const topGenres = buildTopGenres(watched)
  if (topGenres.length === 0) return []
  const watchedIds = new Set(watched.map(m => m.id))
  const data = await tmdb.discover({
    with_genres: topGenres.join(','),
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    page: '1',
  })
  return (data.results as Movie[])
    .filter(m => !watchedIds.has(m.id))
    .slice(0, 8)
}

export default function RecommendedSection() {
  const { user } = useAuth()
  const enabled = !!user && isFirebaseConfigured
  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ['recommended', user?.uid],
    queryFn: () => fetchRecommendations(user!.uid),
    enabled,
  })

  if (!enabled) return null

  if (!isLoading && !isError && (movies?.length ?? 0) === 0) {
    return (
      <section style={{ padding: '80px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 10px', textTransform: 'uppercase' }}>Taste Profile</p>
          <h2 style={{ fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 700, margin: '0 0 10px' }}>내 취향 추천</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 0 20px' }}>
            시청 기록에 4점 이상 별점을 남기면 취향에 맞는 영화를 추천해 드려요.
          </p>
          <Link to="/watched" style={{ fontSize: 12, letterSpacing: '0.12em', color: A, textDecoration: 'none' }}>
            시청 기록 남기러 가기 →
          </Link>
        </div>
      </section>
    )
  }

  if (isError) return null

  return (
    <section style={{ padding: '80px 20px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 10px', textTransform: 'uppercase' }}>Taste Profile</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, margin: 0, paddingBottom: 12, borderBottom: '2px solid var(--accent)' }}>
              내 취향 추천
            </h2>
            <Link to="/watched" style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-4)', textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = A)}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
            >
              시청 기록 보기 →
            </Link>
          </div>
        </div>
        {isLoading ? (
          <div className="movie-grid-4"><SkeletonCard count={8} /></div>
        ) : (
          <div className="movie-grid-4">
            {(movies ?? []).map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}
      </div>
    </section>
  )
}
