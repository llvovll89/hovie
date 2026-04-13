import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getWatched, removeFromWatched, isFirebaseConfigured } from '../../lib/firebase'
import { useAuthModal } from '../../contexts/AuthModalContext'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import StarRating from '../../components/ui/StarRating'
import type { WatchedMovie } from '../../types'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

type SortKey = 'recent' | 'rating_high' | 'rating_low'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent',      label: '최신순' },
  { key: 'rating_high', label: '별점 높은순' },
  { key: 'rating_low',  label: '별점 낮은순' },
]

export default function Watched() {
  const { user, loading: authLoading } = useAuth()
  const { openSignIn } = useAuthModal()
  const [movies, setMovies] = useState<WatchedMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('recent')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    getWatched(user.uid)
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (!isFirebaseConfigured) {
    return (
      <EmptyState icon="⚙️" title="Firebase 설정 필요" desc=".env 파일에 VITE_FIREBASE_* 값을 입력하면 시청 기록이 활성화됩니다." />
    )
  }

  if (authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Spinner size={40} /></div>
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>시청 완료 목록</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 32, maxWidth: 360, lineHeight: 1.7 }}>
          로그인하면 본 영화를 기록하고<br />나만의 시청 히스토리를 만들 수 있습니다.
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
    await removeFromWatched(user.uid, movieId)
    setMovies(prev => prev.filter(m => m.id !== movieId))
  }

  const ratedMovies = movies.filter(m => m.myRating > 0)
  const avgRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((s, m) => s + m.myRating, 0) / ratedMovies.length).toFixed(1)
    : null

  const sorted = [...movies].sort((a, b) => {
    if (sortBy === 'rating_high') return b.myRating - a.myRating
    if (sortBy === 'rating_low') return (a.myRating || 6) - (b.myRating || 6)
    return new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(0,153,255,0.4)' }} />
          )}
          <div>
            <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 6px', textTransform: 'uppercase' }}>My Hovie</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
              {user.displayName ?? '내'} 시청 완료
            </h1>
          </div>
        </div>

        {/* Stats */}
        {movies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 32, border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-elevated)' }}>
            <StatCell label="총 시청" value={`${movies.length}편`} />
            <StatCell label="별점 기록" value={`${ratedMovies.length}편`} />
            {avgRating && <StatCell label="평균 별점" value={`★ ${avgRating}`} accent />}
            <StatCell label="최고 별점" value={ratedMovies.length > 0 ? `★ ${Math.max(...ratedMovies.map(m => m.myRating))}` : '-'} />
          </div>
        )}

        {/* Sort bar */}
        {movies.length > 1 && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--border)' }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                style={{
                  padding: '8px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${sortBy === opt.key ? A : 'transparent'}`,
                  color: sortBy === opt.key ? A : 'var(--text-3)',
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: -1,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="👁"
            title="시청 기록이 없습니다"
            desc="영화 상세 페이지에서 '이미 봤어요'를 눌러 시청 기록을 추가하세요."
          />
        ) : (
          <div className="movie-grid-4" style={{ position: 'relative' }}>
            {sorted.map(movie => (
              <div key={movie.id} style={{ position: 'relative' }}>
                <MovieCard movie={movie} />

                {/* Personal rating badge */}
                <div style={{
                  position: 'absolute', bottom: 46, left: 0, right: 0,
                  padding: '6px 10px',
                  backgroundColor: 'rgba(0,0,0,0.78)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  pointerEvents: 'none',
                }}>
                  {movie.myRating > 0 ? (
                    <StarRating value={movie.myRating} readOnly size={13} />
                  ) : (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>미평가</span>
                  )}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                    {new Date(movie.watchedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(movie.id)}
                  title="시청 기록 삭제"
                  style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background-color 0.2s', zIndex: 10 }}
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

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ padding: '16px 28px', borderRight: '1px solid var(--border-2)', textAlign: 'center', flex: '1 0 auto' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-4)', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: accent ? A : 'var(--text)', margin: 0, fontFamily: 'Playfair Display, serif' }}>{value}</p>
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
