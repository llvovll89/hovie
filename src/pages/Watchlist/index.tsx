import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getWatchlist, removeFromWatchlist, signInWithGoogle, isFirebaseConfigured } from '../../lib/firebase'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import type { Movie } from '../../types'

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth()
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
      <EmptyState
        icon="⚙️"
        title="Firebase 설정 필요"
        desc=".env 파일에 VITE_FIREBASE_* 값을 입력하면 위시리스트가 활성화됩니다."
      />
    )
  }

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Spinner size={40} /></div>
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          내 위시리스트
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 32, maxWidth: 360, lineHeight: 1.7 }}>
          로그인하면 보고 싶은 영화를 저장하고<br />언제든지 다시 찾을 수 있습니다.
        </p>
        <button
          onClick={signInWithGoogle}
          style={{ backgroundColor: '#C9A84C', color: '#000', border: 'none', padding: '14px 36px', fontSize: 12, letterSpacing: '0.18em', fontWeight: 600, cursor: 'pointer' }}
        >
          Google로 로그인
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
    <div style={{ minHeight: '100vh', backgroundColor: '#000', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.4)' }} />
          )}
          <div>
            <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', margin: '0 0 6px', textTransform: 'uppercase' }}>My Hovie</p>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, margin: 0 }}>
              {user.displayName ?? '내'} 위시리스트
            </h1>
          </div>
          {movies.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              {movies.length}편
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <Spinner size={40} />
          </div>
        ) : movies.length === 0 ? (
          <EmptyState
            icon="♡"
            title="저장된 영화가 없습니다"
            desc="영화 상세 페이지에서 ♡ 버튼을 눌러 위시리스트에 추가하세요."
          />
        ) : (
          <div className="movie-grid-4" style={{ position: 'relative' }}>
            {movies.map(movie => (
              <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} />
                <button
                  onClick={() => handleRemove(movie.id)}
                  title="위시리스트에서 제거"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 28,
                    height: 28,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#C9A84C',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(4px)',
                    transition: 'background-color 0.2s',
                    zIndex: 10,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(220,50,50,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)')}
                >
                  ×
                </button>
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
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}
