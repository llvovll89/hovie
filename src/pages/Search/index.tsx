import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { tmdb } from '../../lib/tmdb'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import type { Genre, SearchFilters } from '../../types'

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: '인기순' },
  { value: 'release_date.desc', label: '최신순' },
  { value: 'release_date.asc', label: '오래된 순' },
  { value: 'vote_average.desc', label: '평점순' },
] as const

const RATING_OPTIONS = [0, 5, 6, 7, 8]
const YEAR_OPTIONS = ['', ...Array.from({ length: 35 }, (_, i) => String(2024 - i))]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [genres, setGenres] = useState<Genre[]>([])
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const { isMobile } = useBreakpoint()

  // Derive filters directly from URL params — this is the source of truth
  const filters = useMemo<SearchFilters>(() => ({
    genre: searchParams.get('genre') ? Number(searchParams.get('genre')) : null,
    year: searchParams.get('year') ?? '',
    minRating: Number(searchParams.get('rating') ?? 0),
    sortBy: (searchParams.get('sort') ?? 'popularity.desc') as SearchFilters['sortBy'],
  }), [searchParams])

  const query = searchParams.get('q') ?? ''

  // Reset to page 1 when filters/query change
  useEffect(() => { setPage(1) }, [searchParams])

  const { movies, totalResults, totalPages, loading, error } = useSearch(query, filters, page)

  useEffect(() => {
    tmdb.genres().then(d => setGenres(d.genres)).catch(console.error)
  }, [])

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    const params = new URLSearchParams(searchParams)
    if (key === 'genre') {
      value ? params.set('genre', String(value)) : params.delete('genre')
    } else if (key === 'year') {
      value ? params.set('year', String(value)) : params.delete('year')
    } else if (key === 'minRating') {
      Number(value) > 0 ? params.set('rating', String(value)) : params.delete('rating')
    } else if (key === 'sortBy') {
      value === 'popularity.desc' ? params.delete('sort') : params.set('sort', String(value))
    }
    setSearchParams(params)
  }

  const sidebar = (
    <aside className="search-sidebar">
      <FilterSection title="정렬">
        {SORT_OPTIONS.map(opt => (
          <FilterOption key={opt.value} label={opt.label} active={filters.sortBy === opt.value} onClick={() => updateFilter('sortBy', opt.value)} />
        ))}
      </FilterSection>
      <FilterSection title="장르">
        <FilterOption label="전체" active={!filters.genre} onClick={() => updateFilter('genre', null)} />
        {genres.map(g => (
          <FilterOption key={g.id} label={g.name} active={filters.genre === g.id} onClick={() => updateFilter('genre', g.id)} />
        ))}
      </FilterSection>
      <FilterSection title="최소 평점">
        {RATING_OPTIONS.map(r => (
          <FilterOption key={r} label={r === 0 ? '전체' : `${r}점 이상`} active={filters.minRating === r} onClick={() => updateFilter('minRating', r)} />
        ))}
      </FilterSection>
      <FilterSection title="연도">
        <select
          value={filters.year}
          onChange={e => updateFilter('year', e.target.value)}
          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: filters.year ? '#fff' : 'rgba(255,255,255,0.35)', padding: '9px 12px', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y} style={{ backgroundColor: '#111' }}>{y || '전체 연도'}</option>
          ))}
        </select>
      </FilterSection>
    </aside>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ color: '#C9A84C', fontSize: 10, letterSpacing: '0.4em', marginBottom: 6, textTransform: 'uppercase' }}>
            {query ? 'Search Results' : 'Browse'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>
                {query ? `"${query}" 검색 결과` : '전체 탐색'}
              </h1>
              {totalResults > 0 && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>{totalResults.toLocaleString()}개의 결과</p>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setFilterOpen(o => !o)}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.15em', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
                </svg>
                필터 {filterOpen ? '닫기' : '열기'}
              </button>
            )}
          </div>
        </div>

        <div className="search-layout">
          {(!isMobile || filterOpen) && sidebar}

          <div className="search-results">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <Spinner size={40} />
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: 'rgba(255,255,255,0.4)' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
                <p>{error}</p>
              </div>
            ) : movies.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <p style={{ fontSize: 40, marginBottom: 14 }}>🎬</p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>검색 결과가 없습니다.</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 6 }}>다른 키워드나 필터를 시도해보세요.</p>
              </div>
            ) : (
              <>
                <div className="movie-grid-auto">
                  {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 48 }}>
                    <PaginationBtn label="← PREV" disabled={page === 1} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0) }} />
                    {getPaginationRange(page, totalPages).map((p, i) =>
                      p === '...' ? (
                        <span key={`d${i}`} style={{ color: 'rgba(255,255,255,0.3)', padding: '8px 4px', fontSize: 12 }}>···</span>
                      ) : (
                        <PaginationBtn key={p} label={String(p)} active={p === page} onClick={() => { setPage(Number(p)); window.scrollTo(0, 0) }} />
                      )
                    )}
                    <PaginationBtn label="NEXT →" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0) }} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  )
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ textAlign: 'left', background: 'none', border: 'none', padding: '7px 10px', fontSize: 13, color: active ? '#C9A84C' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s', borderLeft: `2px solid ${active ? '#C9A84C' : 'transparent'}`, fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
    >
      {label}
    </button>
  )
}

function PaginationBtn({ label, active, disabled, onClick }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ padding: '8px 12px', border: `1px solid ${active ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`, background: active ? '#C9A84C' : 'none', color: active ? '#000' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: '0.08em', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', fontWeight: active ? 600 : 400 }}
    >
      {label}
    </button>
  )
}

function getPaginationRange(current: number, total: number): (number | '...')[] {
  const range: (number | '...')[] = [1]
  const left = Math.max(2, current - 2)
  const right = Math.min(total - 1, current + 2)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  if (total > 1) range.push(total)
  return range
}
