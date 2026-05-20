import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getWatchlist, removeFromWatchlist, isFirebaseConfigured } from '../../lib/firebase'
import { useAuthModal } from '../../contexts/AuthModalContext'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import type { Movie } from '../../types'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth()
  const { openSignIn } = useAuthModal()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    getWatchlist(user.uid)
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (!isFirebaseConfigured) {
    return (
      <EmptyState icon="⚙️" title="Firebase 설정 필요" desc=".env 파일에 VITE_FIREBASE_* 값을 입력하면 위시리스트가 활성화됩니다." />
    )
  }

  if (authLoading) {
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 20px' }}>
        <div className="movie-grid-4"><SkeletonCard count={8} /></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>내 위시리스트</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32, maxWidth: 360, lineHeight: 1.7 }}>
          로그인하면 보고 싶은 영화를 저장하고<br />언제든지 다시 찾을 수 있습니다.
        </p>
        <button
          onClick={openSignIn}
          style={{ backgroundColor: A, color: AO, border: 'none', padding: '14px 36px', fontSize: 12, letterSpacing: '0.18em', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
        >
          로그인하기
        </button>
      </div>
    )
  }

  async function handleRemove(movieId: number) {
    if (!user) return
    await removeFromWatchlist(user.uid, movieId)
    setMovies(prev => prev.filter(m => m.id !== movieId))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(0,153,255,0.4)' }} />
          )}
          <div>
            <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 6px', textTransform: 'uppercase' }}>My Hovie</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
              {user.displayName ?? '내'} 위시리스트
            </h1>
          </div>
          {movies.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-4)' }}>{movies.length}편</span>
          )}
        </div>

        {loading ? (
          <div className="movie-grid-4"><SkeletonCard count={8} /></div>
        ) : movies.length === 0 ? (
          <EmptyState icon="♡" title="저장된 영화가 없습니다" desc="영화 상세 페이지에서 ♡ 버튼을 눌러 위시리스트에 추가하세요." />
        ) : (
          <div className="movie-grid-4" style={{ position: 'relative' }}>
            {movies.map(movie => (
              <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} />
                <button
                  onClick={() => handleRemove(movie.id)}
                  title="위시리스트에서 제거"
                  aria-label={`${movie.title} 위시리스트에서 제거`}
                  style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: A, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background-color 0.2s', zIndex: 10 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220,50,50,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <p style={{ fontSize: 52, marginBottom: 16 }}>{icon}</p>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: 'var(--text-4)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}
