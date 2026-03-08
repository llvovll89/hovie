import { useState, useEffect, useRef } from 'react'
import { tmdb, IMG } from '../../lib/tmdb'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import Spinner from '../../components/ui/Spinner'
import type { MovieDetail, CastMember, CrewMember, Movie } from '../../types'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

// ── Types ─────────────────────────────────────────────────────

interface SlotData {
  movie: MovieDetail
  cast: CastMember[]
  directors: string[]
}

interface CompRow {
  label: string
  aNode: React.ReactNode
  bNode: React.ReactNode
  winner: 'A' | 'B' | 'tie' | null
  pctA?: number
  pctB?: number
}

// ── Build comparison rows ─────────────────────────────────────

function buildRows(slotA: SlotData, slotB: SlotData): CompRow[] {
  const a = slotA.movie
  const b = slotB.movie

  function win(vA: number | null, vB: number | null): 'A' | 'B' | 'tie' | null {
    if (vA === null || vB === null) return null
    if (vA === vB) return 'tie'
    return vA > vB ? 'A' : 'B'
  }

  function bars(vA: number | null, vB: number | null): { pctA?: number; pctB?: number } {
    if (vA === null && vB === null) return {}
    const max = Math.max(vA ?? 0, vB ?? 0)
    if (max === 0) return {}
    return {
      pctA: vA !== null ? (vA / max) * 100 : undefined,
      pctB: vB !== null ? (vB / max) * 100 : undefined,
    }
  }

  function fmtMoney(n: number) {
    if (!n) return '-'
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    return `$${(n / 1_000_000).toFixed(0)}M`
  }

  function fmtRuntime(m: number) {
    if (!m) return '-'
    return `${Math.floor(m / 60)}h ${m % 60}m`
  }

  const roiA = a.budget > 0 && a.revenue > 0 ? a.revenue / a.budget : null
  const roiB = b.budget > 0 && b.revenue > 0 ? b.revenue / b.budget : null

  const rows: CompRow[] = []

  rows.push({
    label: '평점',
    aNode: a.vote_average > 0 ? `★ ${a.vote_average.toFixed(1)}` : '-',
    bNode: b.vote_average > 0 ? `★ ${b.vote_average.toFixed(1)}` : '-',
    winner: win(a.vote_average || null, b.vote_average || null),
    ...bars(a.vote_average || null, b.vote_average || null),
  })

  rows.push({
    label: '투표 수',
    aNode: a.vote_count > 0 ? `${a.vote_count.toLocaleString()}표` : '-',
    bNode: b.vote_count > 0 ? `${b.vote_count.toLocaleString()}표` : '-',
    winner: win(a.vote_count || null, b.vote_count || null),
    ...bars(a.vote_count || null, b.vote_count || null),
  })

  rows.push({
    label: '개봉연도',
    aNode: a.release_date?.split('-')[0] || '-',
    bNode: b.release_date?.split('-')[0] || '-',
    winner: null,
  })

  rows.push({
    label: '러닝타임',
    aNode: fmtRuntime(a.runtime),
    bNode: fmtRuntime(b.runtime),
    winner: null,
  })

  rows.push({
    label: '인기 지수',
    aNode: a.popularity.toFixed(0),
    bNode: b.popularity.toFixed(0),
    winner: win(a.popularity, b.popularity),
    ...bars(a.popularity, b.popularity),
  })

  rows.push({
    label: '장르',
    aNode: a.genres.map(g => g.name).join(', ') || '-',
    bNode: b.genres.map(g => g.name).join(', ') || '-',
    winner: null,
  })

  if (a.budget > 0 || b.budget > 0) {
    rows.push({
      label: '제작 예산',
      aNode: fmtMoney(a.budget),
      bNode: fmtMoney(b.budget),
      winner: null,
      ...bars(a.budget > 0 ? a.budget : null, b.budget > 0 ? b.budget : null),
    })
  }

  if (a.revenue > 0 || b.revenue > 0) {
    rows.push({
      label: '전 세계 수익',
      aNode: fmtMoney(a.revenue),
      bNode: fmtMoney(b.revenue),
      winner: win(a.revenue > 0 ? a.revenue : null, b.revenue > 0 ? b.revenue : null),
      ...bars(a.revenue > 0 ? a.revenue : null, b.revenue > 0 ? b.revenue : null),
    })
  }

  if (roiA !== null || roiB !== null) {
    rows.push({
      label: 'ROI 수익률',
      aNode: roiA !== null ? `${roiA.toFixed(1)}x` : '-',
      bNode: roiB !== null ? `${roiB.toFixed(1)}x` : '-',
      winner: win(roiA, roiB),
    })
  }

  rows.push({
    label: '제작 국가',
    aNode: a.production_countries.map(c => c.name).join(', ') || '-',
    bNode: b.production_countries.map(c => c.name).join(', ') || '-',
    winner: null,
  })

  rows.push({
    label: '감독',
    aNode: slotA.directors.join(', ') || '-',
    bNode: slotB.directors.join(', ') || '-',
    winner: null,
  })

  rows.push({
    label: '주연 배우',
    aNode: slotA.cast.slice(0, 3).map(c => c.name).join(', ') || '-',
    bNode: slotB.cast.slice(0, 3).map(c => c.name).join(', ') || '-',
    winner: null,
  })

  return rows
}

// ── Main page ─────────────────────────────────────────────────

export default function Compare() {
  const [slotA, setSlotA] = useState<SlotData | null>(null)
  const [slotB, setSlotB] = useState<SlotData | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [randomLoading, setRandomLoading] = useState(false)
  const { isMobile } = useBreakpoint()

  async function loadSlot(movieId: number, slot: 'A' | 'B') {
    const setLoading = slot === 'A' ? setLoadingA : setLoadingB
    setLoading(true)
    try {
      const [detail, credits] = await Promise.all([
        tmdb.detail(movieId),
        tmdb.credits(movieId),
      ])
      const directors = (credits.crew as CrewMember[])
        .filter(c => c.job === 'Director')
        .map(d => d.name)
      const cast = (credits.cast as CastMember[]).slice(0, 5)
      const data: SlotData = { movie: detail as MovieDetail, cast, directors }
      if (slot === 'A') setSlotA(data)
      else setSlotB(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRandom() {
    setRandomLoading(true)
    try {
      const data = await tmdb.trending('week')
      const movies = (data.results as Movie[]).filter(m => m.id)
      const shuffled = [...movies].sort(() => Math.random() - 0.5)
      await Promise.all([
        loadSlot(shuffled[0].id, 'A'),
        loadSlot(shuffled[1].id, 'B'),
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setRandomLoading(false)
    }
  }

  const rows = slotA && slotB ? buildRows(slotA, slotB) : null
  const winsA = rows?.filter(r => r.winner === 'A').length ?? 0
  const winsB = rows?.filter(r => r.winner === 'B').length ?? 0
  const overallWinner = winsA > winsB ? 'A' : winsB > winsA ? 'B' : 'tie'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', margin: '0 0 8px', textTransform: 'uppercase' }}>Compare</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, margin: 0 }}>영화 비교</h1>
            <RandomButton loading={randomLoading} onClick={handleRandom} />
          </div>
        </div>

        {/* Pickers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 72px 1fr',
          gap: isMobile ? 12 : 0,
          marginBottom: 40,
          alignItems: 'start',
        }}>
          <MoviePicker label="A" slot={slotA} loading={loadingA || (randomLoading && !slotA)} onSelect={id => loadSlot(id, 'A')} onClear={() => setSlotA(null)} side="left" />
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700, color: 'var(--border-2)', letterSpacing: '0.05em' }}>VS</span>
            </div>
          )}
          <MoviePicker label="B" slot={slotB} loading={loadingB || (randomLoading && !slotB)} onSelect={id => loadSlot(id, 'B')} onClear={() => setSlotB(null)} side="right" />
        </div>

        {/* Comparison result */}
        {rows && slotA && slotB && (
          <div style={{ border: '1px solid var(--border-2)' }}>

            {/* Movie header */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 52px 1fr' : '1fr 96px 1fr', borderBottom: '1px solid var(--border-2)' }}>
              <MovieHeader slot={slotA} side="A" winner={overallWinner === 'A'} wins={winsA} isMobile={isMobile} />
              <VsCenter winsA={winsA} winsB={winsB} isMobile={isMobile} />
              <MovieHeader slot={slotB} side="B" winner={overallWinner === 'B'} wins={winsB} isMobile={isMobile} />
            </div>

            {/* Data rows */}
            {rows.map((row, i) => (
              <CompRowItem key={i} row={row} isMobile={isMobile} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!rows && !randomLoading && (
          <div style={{ textAlign: 'center', padding: '72px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>⚔️</div>
            <p style={{ color: 'var(--text-3)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
              두 영화를 선택하거나{' '}
              <button
                onClick={handleRandom}
                style={{ background: 'none', border: 'none', color: A, fontSize: 15, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                랜덤 비교
              </button>
              를 눌러<br />어떤 영화가 더 나은지 확인해보세요.
            </p>
          </div>
        )}

        {randomLoading && !rows && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <Spinner size={40} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── RandomButton ──────────────────────────────────────────────

function RandomButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 22px',
        backgroundColor: loading ? 'var(--bg-elevated)' : A,
        color: loading ? 'var(--text-3)' : AO,
        border: 'none', fontSize: 11, letterSpacing: '0.15em', fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer', transition: 'background-color 0.2s',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = AH }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = loading ? 'var(--bg-elevated)' : A }}
    >
      {loading ? <Spinner size={13} /> : (
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      )}
      랜덤 비교
    </button>
  )
}

// ── MoviePicker ───────────────────────────────────────────────

function MoviePicker({
  label, slot, loading, onSelect, onClear, side,
}: {
  label: string; slot: SlotData | null; loading: boolean
  onSelect: (id: number) => void; onClear: () => void; side: 'left' | 'right'
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function handleInput(val: string) {
    setQuery(val)
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    if (!val.trim()) { setResults([]); setOpen(false); return }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      try {
        const d = await tmdb.search(val.trim(), 1)
        setResults((d.results as Movie[]).slice(0, 6))
        setOpen(true)
      } finally { setSearching(false) }
    }, 280)
  }

  function pick(movie: Movie) {
    onSelect(movie.id)
    setQuery(''); setResults([]); setOpen(false)
  }

  if (loading) {
    return (
      <div style={{ border: '1px solid var(--border-2)', minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={28} />
      </div>
    )
  }

  if (slot) {
    const poster = IMG.poster(slot.movie.poster_path, 'w342')
    const isRight = side === 'right'
    return (
      <div style={{
        border: '1px solid var(--border-2)', backgroundColor: 'var(--bg-elevated)',
        display: 'flex', flexDirection: isRight ? 'row-reverse' : 'row',
        gap: 14, padding: '14px 16px', alignItems: 'flex-start',
      }}>
        <div style={{ width: 56, flexShrink: 0 }}>
          {poster
            ? <img src={poster} alt={slot.movie.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎬</div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: isRight ? 'right' : 'left' }}>
          <p style={{ fontSize: 9, color: A, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 5px' }}>영화 {label}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {slot.movie.title}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '0 0 8px' }}>
            {slot.movie.release_date?.split('-')[0]}
            {slot.movie.vote_average > 0 && ` · ★ ${slot.movie.vote_average.toFixed(1)}`}
          </p>
          <button
            onClick={onClear}
            style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-4)', fontSize: 10, letterSpacing: '0.1em', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.color = A }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-4)' }}
          >
            변경
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ border: '1px solid var(--border-2)', padding: '12px 14px' }}>
        <p style={{ fontSize: 9, color: A, letterSpacing: '0.25em', textTransform: 'uppercase', margin: '0 0 10px' }}>
          영화 {label} 선택
        </p>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="영화 제목으로 검색..."
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-3)',
              color: 'var(--text)', padding: '10px 36px 10px 14px', fontSize: 13,
              outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,153,255,0.4)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
          />
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            {searching
              ? <Spinner size={12} />
              : <svg width="13" height="13" fill="none" stroke="var(--text-4)" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>
            }
          </div>
        </div>
      </div>

      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderTop: 'none', zIndex: 200, maxHeight: 300, overflowY: 'auto' }}>
          {results.map(movie => (
            <button
              key={movie.id}
              onClick={() => pick(movie)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <div style={{ width: 28, height: 42, flexShrink: 0, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
                {movie.poster_path
                  ? <img src={IMG.poster(movie.poster_path, 'w185')!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🎬</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{movie.title}</p>
                <p style={{ fontSize: 10, color: 'var(--text-4)', margin: 0 }}>{movie.release_date?.split('-')[0]}</p>
              </div>
              {movie.vote_average > 0 && (
                <span style={{ fontSize: 11, color: A, flexShrink: 0 }}>★ {movie.vote_average.toFixed(1)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── VsCenter ──────────────────────────────────────────────────

function VsCenter({ winsA, winsB, isMobile }: { winsA: number; winsB: number; isMobile: boolean }) {
  const total = winsA + winsB
  const pctA = total > 0 ? (winsA / total) * 100 : 50
  const pctB = total > 0 ? (winsB / total) * 100 : 50

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? '16px 4px' : '24px 8px',
      backgroundColor: 'var(--bg-elevated)',
      borderLeft: '1px solid var(--border-2)', borderRight: '1px solid var(--border-2)',
      gap: 8,
    }}>
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: isMobile ? 14 : 18, fontWeight: 700, color: 'var(--text-4)' }}>VS</span>
      {total > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <p style={{ fontSize: 8, color: 'var(--text-5)', letterSpacing: '0.1em', margin: 0 }}>SCORE</p>
          <p style={{ fontSize: isMobile ? 15 : 20, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
            {winsA}<span style={{ color: 'var(--text-4)', fontSize: isMobile ? 10 : 12, fontWeight: 400, margin: '0 3px' }}>—</span>{winsB}
          </p>
          {/* Win ratio bar */}
          <div style={{ width: '100%', height: 4, display: 'flex', overflow: 'hidden', borderRadius: 0 }}>
            <div style={{ width: `${pctA}%`, height: '100%', backgroundColor: winsA >= winsB ? A : 'var(--border-2)', transition: 'width 0.6s ease' }} />
            <div style={{ width: `${pctB}%`, height: '100%', backgroundColor: winsB > winsA ? A : 'var(--border-2)', transition: 'width 0.6s ease' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── MovieHeader ───────────────────────────────────────────────

function MovieHeader({ slot, side, winner, wins, isMobile }: {
  slot: SlotData; side: 'A' | 'B'; winner: boolean; wins: number; isMobile: boolean
}) {
  const m = slot.movie
  const poster = IMG.poster(m.poster_path, 'w342')
  const isRight = side === 'B'

  return (
    <div style={{
      display: 'flex',
      flexDirection: isRight ? 'row-reverse' : 'row',
      gap: isMobile ? 10 : 20,
      padding: isMobile ? '16px 12px' : '24px 24px',
      alignItems: 'center',
      backgroundColor: winner ? 'rgba(0,153,255,0.04)' : 'transparent',
      position: 'relative',
    }}>
      {winner && (
        <div style={{
          position: 'absolute', top: 10,
          ...(isRight ? { left: 10 } : { right: 10 }),
          backgroundColor: A, color: AO,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
          padding: '3px 8px',
        }}>
          승리
        </div>
      )}
      <div style={{ width: isMobile ? 44 : 68, flexShrink: 0 }}>
        {poster
          ? <img
            src={poster}
            alt={m.title}
            style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block', outline: winner ? `2px solid ${A}` : 'none', outlineOffset: 2 }}
          />
          : <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: isRight ? 'right' : 'left' }}>
        <p style={{ fontSize: 9, color: A, letterSpacing: '0.22em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          영화 {side}
        </p>
        <p style={{ fontSize: isMobile ? 12 : 15, fontWeight: 700, color: 'var(--text)', margin: '0 0 4px', lineHeight: 1.3, wordBreak: 'break-word' }}>
          {m.title}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '0 0 6px' }}>
          {m.release_date?.split('-')[0]}
        </p>
        {wins > 0 && (
          <p style={{ fontSize: 11, color: winner ? A : 'var(--text-4)', margin: 0, fontWeight: winner ? 600 : 400 }}>
            {wins}개 항목 우세
          </p>
        )}
      </div>
    </div>
  )
}

// ── CompRowItem ───────────────────────────────────────────────

function CompRowItem({ row, isMobile }: { row: CompRow; isMobile: boolean }) {
  const aWins = row.winner === 'A'
  const bWins = row.winner === 'B'
  const labelW = isMobile ? 64 : 108

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `1fr ${labelW}px 1fr`, borderBottom: '1px solid var(--border)' }}>

      {/* A value */}
      <div style={{
        padding: isMobile ? '11px 10px' : '13px 20px',
        textAlign: 'right',
        backgroundColor: aWins ? 'rgba(0,153,255,0.05)' : 'transparent',
        borderLeft: aWins ? `2px solid ${A}` : '2px solid transparent',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <span style={{ fontSize: isMobile ? 11 : 13, color: aWins ? A : 'var(--text-2)', fontWeight: aWins ? 600 : 400, wordBreak: 'break-word', lineHeight: 1.4 }}>
          {row.aNode}
        </span>
        {row.pctA !== undefined && (
          <div style={{ marginTop: 5, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: 3, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <div style={{ width: `${row.pctA}%`, height: '100%', backgroundColor: aWins ? A : 'rgba(255,255,255,0.12)', marginLeft: 'auto', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '11px 4px' : '13px 6px',
        backgroundColor: 'var(--bg-elevated)',
        borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: isMobile ? 8 : 10, color: 'var(--text-4)', letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1.4 }}>
          {row.label}
        </span>
      </div>

      {/* B value */}
      <div style={{
        padding: isMobile ? '11px 10px' : '13px 20px',
        backgroundColor: bWins ? 'rgba(0,153,255,0.05)' : 'transparent',
        borderRight: bWins ? `2px solid ${A}` : '2px solid transparent',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <span style={{ fontSize: isMobile ? 11 : 13, color: bWins ? A : 'var(--text-2)', fontWeight: bWins ? 600 : 400, wordBreak: 'break-word', lineHeight: 1.4 }}>
          {row.bNode}
        </span>
        {row.pctB !== undefined && (
          <div style={{ marginTop: 5 }}>
            <div style={{ width: '100%', height: 3, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden' }}>
              <div style={{ width: `${row.pctB}%`, height: '100%', backgroundColor: bWins ? A : 'rgba(255,255,255,0.12)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
