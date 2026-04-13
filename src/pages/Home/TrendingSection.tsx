import { Link } from 'react-router-dom'
import { useTrending } from '../../hooks/useTrending'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'

const A = 'var(--accent)'

export default function TrendingSection() {
  const { movies, loading } = useTrending()

  return (
    <section style={{ padding: '80px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 8px', textTransform: 'uppercase' }}>This Week</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Trending Now</h2>
          </div>
          <Link to="/trending" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-4)', textDecoration: 'none', borderBottom: '1px solid var(--border-3)', paddingBottom: 3 }}
            onMouseEnter={e => { e.currentTarget.style.color = A; e.currentTarget.style.borderBottomColor = 'rgba(0,153,255,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.borderBottomColor = 'var(--border-3)' }}
          >VIEW ALL</Link>
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Spinner size={36} /></div>
        ) : (
          <div className="movie-grid-4">
            {movies.map((movie, idx) => <MovieCard key={movie.id} movie={movie} rank={idx + 1} />)}
          </div>
        )}
      </div>
    </section>
  )
}
