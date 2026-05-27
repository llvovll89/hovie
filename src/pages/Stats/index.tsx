import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getWatched, isFirebaseConfigured } from '../../lib/firebase'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { IMG } from '../../lib/tmdb'
import type { WatchedMovie } from '../../types'

const A = 'var(--accent)'

// 장르 ID → 한국어 이름 매핑
const GENRE_MAP: Record<number, string> = {
  28: 'Action',    12: 'Adventure',   16: 'Animation', 35: 'Comedy',
  80: 'Crime',     99: 'Documentary', 18: 'Drama',     10751: 'Family',
  14: 'Fantasy',   36: 'History',     27: 'Horror',    10402: 'Music',
  9648: 'Mystery', 10749: 'Romance',  878: 'Sci-Fi',   10770: 'TV Movie',
  53: 'Thriller',  10752: 'War',      37: 'Western',
}

function getRatingLabel(r: number) {
  if (r >= 5) return '최고예요'
  if (r >= 4) return '좋아요'
  if (r >= 3) return '괜찮아요'
  if (r >= 2) return '별로예요'
  if (r >= 1) return '싫어요'
  return '미평가'
}

export default function Stats() {
  const { user, loading: authLoading } = useAuth()
  const { openSignIn } = useAuthModal()
  const navigate = useNavigate()
  const [movies, setMovies] = useState<WatchedMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getWatched(user.uid)
      .then(setMovies)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const stats = useMemo(() => {
    const rated = movies.filter(m => m.myRating > 0)
    const avgRating = rated.length > 0 ? (rated.reduce((sum, m) => sum + m.myRating, 0) / rated.length) : 0
    const topRated = [...movies].filter(m => m.myRating >= 4).sort((a, b) => b.myRating - a.myRating).slice(0, 6)

    // Genre frequency
    const genreFreq: Record<number, number> = {}
    for (const m of movies) {
      for (const gid of (m.genre_ids ?? [])) {
        genreFreq[gid] = (genreFreq[gid] ?? 0) + 1
      }
    }
    const topGenres = Object.entries(genreFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, count]) => ({ id: Number(id), name: GENRE_MAP[Number(id)] ?? `Genre ${id}`, count }))

    const maxGenreCount = topGenres[0]?.count ?? 1

    // Rating distribution (1–5)
    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    for (const m of rated) {
      if (m.myRating >= 1 && m.myRating <= 5) ratingDist[m.myRating]++
    }
    const maxRatingCount = Math.max(...Object.values(ratingDist), 1)

    // Monthly activity (last 12 months)
    const monthlyMap: Record<string, number> = {}
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap[key] = 0
    }
    for (const m of movies) {
      if (m.watchedAt) {
        const d = new Date(m.watchedAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key in monthlyMap) monthlyMap[key]++
      }
    }
    const monthly = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      label: `${month.split('-')[1]}월`,
      count,
    }))
    const maxMonthly = Math.max(...monthly.map(m => m.count), 1)

    return { avgRating, topRated, topGenres, maxGenreCount, ratingDist, maxRatingCount, monthly, maxMonthly }
  }, [movies])

  if (!isFirebaseConfigured) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚙️</p>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>Firebase 설정 후 이용 가능합니다.</p>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 56, marginBottom: 20 }}>📊</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>나의 시청 통계</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
          로그인하면 시청 통계를 확인할 수 있습니다.
        </p>
        <button
          onClick={openSignIn}
          style={{ backgroundColor: A, color: '#fff', border: 'none', padding: '12px 32px', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.08em' }}
        >
          로그인
        </button>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 56, marginBottom: 20 }}>🎬</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>아직 시청 기록이 없어요</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
          영화를 보고 기록하면 통계가 쌓여요.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ backgroundColor: A, color: '#fff', border: 'none', padding: '12px 32px', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.12em' }}
        >
          영화 탐색하기
        </button>
      </div>
    )
  }

  const rated = movies.filter(m => m.myRating > 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <title>나의 시청 통계 — HOVIE</title>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 10px', textTransform: 'uppercase' }}>My Profile</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, margin: 0 }}>나의 시청 통계</h1>
            <Link to="/watched" style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-4)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = A)}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
            >
              시청 목록 보기 →
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 52 }}>
          <StatCard icon="🎬" label="총 시청 편수" value={`${movies.length}편`} />
          <StatCard icon="⭐" label="평균 별점" value={rated.length > 0 ? `${stats.avgRating.toFixed(1)} / 5` : '-'} />
          <StatCard icon="📝" label="평가한 영화" value={`${rated.length}편`} />
          <StatCard icon="🏆" label="최고 별점" value={rated.length > 0 ? `${Math.max(...rated.map(m => m.myRating))}점` : '-'} />
        </div>

        {/* Genre chart */}
        {stats.topGenres.length > 0 && (
          <ChartSection title="좋아하는 장르" label="Genre Analysis">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.topGenres.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', width: 72, flexShrink: 0, textAlign: 'right' }}>{g.name}</span>
                  <div style={{ flex: 1, height: 8, backgroundColor: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(g.count / stats.maxGenreCount) * 100}%`,
                      backgroundColor: A,
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-4)', width: 28, flexShrink: 0 }}>{g.count}</span>
                </div>
              ))}
            </div>
          </ChartSection>
        )}

        {/* Rating distribution */}
        {rated.length > 0 && (
          <ChartSection title="별점 분포" label="Rating Distribution">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
              {[5, 4, 3, 2, 1].map(r => {
                const count = stats.ratingDist[r] ?? 0
                const pct = (count / stats.maxRatingCount) * 100
                return (
                  <div key={r} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{count}</span>
                    <div style={{ width: '100%', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px 2px 0 0', overflow: 'hidden', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        height: `${pct}%`,
                        backgroundColor: A,
                        opacity: 0.5 + (r / 10),
                        transition: 'height 0.6s ease',
                        minHeight: count > 0 ? 4 : 0,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{'★'.repeat(r)}</span>
                  </div>
                )
              })}
            </div>
          </ChartSection>
        )}

        {/* Monthly activity */}
        <ChartSection title="월별 시청 현황" label="Activity">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {stats.monthly.map(m => {
              const pct = (m.count / stats.maxMonthly) * 100
              const isCurrentMonth = m.month === new Date().toISOString().slice(0, 7)
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {m.count > 0 && <span style={{ fontSize: 9, color: 'var(--text-4)' }}>{m.count}</span>}
                  <div style={{ width: '100%', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px 2px 0 0', height: 72, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{
                      width: '100%',
                      height: `${pct}%`,
                      backgroundColor: isCurrentMonth ? A : 'rgba(0,153,255,0.45)',
                      transition: 'height 0.6s ease',
                      minHeight: m.count > 0 ? 3 : 0,
                    }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{m.label}</span>
                </div>
              )
            })}
          </div>
        </ChartSection>

        {/* Top rated movies */}
        {stats.topRated.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 8px', textTransform: 'uppercase' }}>Top Picks</p>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                내가 가장 좋아하는 영화
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {stats.topRated.map(m => (
                <div key={m.id} onClick={() => navigate(`/movie/${m.id}`)} style={{ cursor: 'pointer' }}>
                  <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', backgroundColor: 'var(--bg-elevated)', borderRadius: 2, marginBottom: 8 }}>
                    {m.poster_path
                      ? <img src={IMG.poster(m.poster_path, 'w342') ?? ''} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎬</div>
                    }
                    <div style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: A, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 2 }}>
                      {'★'.repeat(m.myRating)}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '2px 0 0' }}>{getRatingLabel(m.myRating)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ padding: '20px 22px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', borderRadius: 2 }}>
      <p style={{ fontSize: 24, margin: '0 0 8px' }}>{icon}</p>
      <p style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-4)', margin: '0 0 4px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{value}</p>
    </div>
  )
}

function ChartSection({ title, label, children }: { title: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40, padding: '28px 24px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)', borderRadius: 2 }}>
      <p style={{ color: A, fontSize: 10, letterSpacing: '0.35em', margin: '0 0 4px', textTransform: 'uppercase' }}>{label}</p>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>{title}</h3>
      {children}
    </div>
  )
}
