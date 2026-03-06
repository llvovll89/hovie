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
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, margin: 0 }}>Trending Now</h2>
          </div>
          <Link to="/trending" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: 3 }}
            onMouseEnter={e => { e.currentTarget.style.color = A; e.currentTarget.style.borderBottomColor = 'rgba(170,255,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)' }}
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
