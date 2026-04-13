import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../../hooks/useSearch'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { tmdb } from '../../lib/tmdb'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import type { Genre, SearchFilters } from '../../types'

const A = 'var(--accent)'

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: '인기순' },
  { value: 'release_date.desc', label: '최신순' },
  { value: 'release_date.asc', label: '오래된 순' },
  { value: 'vote_average.desc', label: '평점순' },
] as const

const RATING_OPTIONS = [0, 5, 6, 7, 8]
const YEAR_OPTIONS = ['', ...Array.from({ length: 35 }, (_, i) => String(2024 - i))]

const RUNTIME_OPTIONS: { value: SearchFilters['runtime']; label: string }[] = [
  { value: '',        label: '전체' },
  { value: '~90',     label: '~90분' },
  { value: '90~120',  label: '90~120분' },
  { value: '120~150', label: '120~150분' },
  { value: '150~',    label: '150분 이상' },
]

const LANGUAGE_OPTIONS = [
  { value: '',   label: '전체' },
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'en', label: '🇺🇸 영어' },
  { value: 'ja', label: '🇯🇵 일본어' },
  { value: 'zh', label: '🇨🇳 중국어' },
  { value: 'fr', label: '🇫🇷 프랑스어' },
  { value: 'es', label: '🇪🇸 스페인어' },
  { value: 'de', label: '🇩🇪 독일어' },
]

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [genres, setGenres] = useState<Genre[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie')
  const { isMobile } = useBreakpoint()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filters = useMemo<SearchFilters>(() => ({
    genre:     searchParams.get('genre') ? Number(searchParams.get('genre')) : null,
    year:      searchParams.get('year') ?? '',
    minRating: Number(searchParams.get('rating') ?? 0),
    sortBy:    (searchParams.get('sort') ?? 'popularity.desc') as SearchFilters['sortBy'],
    runtime:   (searchParams.get('runtime') ?? '') as SearchFilters['runtime'],
    language:  searchParams.get('lang') ?? '',
  }), [searchParams])

  const query = searchParams.get('q') ?? ''
  const browseMode = !query.trim()

  const { movies, totalResults, loading, error, loadMore, hasMore } = useSearch(query, filters, mediaType)

  useEffect(() => {
    const fn = mediaType === 'tv' ? tmdb.tvGenres : tmdb.genres
    fn().then(d => setGenres(d.genres)).catch(console.error)
  }, [mediaType])

  // Infinite scroll sentinel
  const loadMoreRef = useRef(loadMore)
  loadMoreRef.current = loadMore

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMoreRef.current()
    }, { threshold: 0 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    const params = new URLSearchParams(searchParams)
    if (key === 'genre')     value ? params.set('genre', String(value)) : params.delete('genre')
    else if (key === 'year')      value ? params.set('year', String(value)) : params.delete('year')
    else if (key === 'minRating') Number(value) > 0 ? params.set('rating', String(value)) : params.delete('rating')
    else if (key === 'sortBy')    value === 'popularity.desc' ? params.delete('sort') : params.set('sort', String(value))
    else if (key === 'runtime')   value ? params.set('runtime', String(value)) : params.delete('runtime')
    else if (key === 'language')  value ? params.set('lang', String(value)) : params.delete('lang')
    setSearchParams(params)
  }

  const sidebar = (
    <aside className="search-sidebar">
      <FilterSection title="정렬">
        {SORT_OPTIONS.map(opt => (
          <FilterOption key={opt.value} label={opt.label} active={filters.sortBy === opt.value} onClick={() => updateFilter('sortBy', opt.value)} />
        ))}
      </FilterSection>

      {/* Runtime filter — movie browse mode only */}
      {mediaType === 'movie' && (
        <FilterSection title="상영시간" dimmed={!browseMode}>
          {RUNTIME_OPTIONS.map(opt => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              active={filters.runtime === opt.value}
              disabled={!browseMode}
              onClick={() => browseMode && updateFilter('runtime', opt.value)}
            />
          ))}
          {!browseMode && (
            <p style={{ fontSize: 10, color: 'var(--text-5)', marginTop: 4, lineHeight: 1.5 }}>
              검색어 없이 탐색할 때 적용됩니다
            </p>
          )}
        </FilterSection>
      )}

      {/* Language filter — browse mode only */}
      <FilterSection title="원어" dimmed={!browseMode}>
        {LANGUAGE_OPTIONS.map(opt => (
          <FilterOption
            key={opt.value}
            label={opt.label}
            active={filters.language === opt.value}
            disabled={!browseMode}
            onClick={() => browseMode && updateFilter('language', opt.value)}
          />
        ))}
        {!browseMode && (
          <p style={{ fontSize: 10, color: 'var(--text-5)', marginTop: 4, lineHeight: 1.5 }}>
            검색어 없이 탐색할 때 적용됩니다
          </p>
        )}
      </FilterSection>

      <FilterSection title="최소 평점">
        {RATING_OPTIONS.map(r => (
          <FilterOption key={r} label={r === 0 ? '전체' : `${r}점 이상`} active={filters.minRating === r} onClick={() => updateFilter('minRating', r)} />
        ))}
      </FilterSection>

      <FilterSection title="장르">
        <FilterOption label="전체" active={!filters.genre} onClick={() => updateFilter('genre', null)} />
        {genres.map(g => (
          <FilterOption key={g.id} label={g.name} active={filters.genre === g.id} onClick={() => updateFilter('genre', g.id)} />
        ))}
      </FilterSection>

      <FilterSection title="연도">
        <select
          value={filters.year}
          onChange={e => updateFilter('year', e.target.value)}
          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-2)', color: filters.year ? 'var(--text)' : 'var(--text-4)', padding: '9px 12px', fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y} style={{ backgroundColor: 'var(--bg-elevated)' }}>{y || '전체 연도'}</option>
          ))}
        </select>
      </FilterSection>
    </aside>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', marginBottom: 6, textTransform: 'uppercase' }}>
            {query ? 'Search Results' : 'Browse'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                  {query ? `"${query}" 검색 결과` : '전체 탐색'}
                </h1>
                <div style={{ display: 'flex', border: '1px solid var(--border-2)', overflow: 'hidden' }}>
                  {(['movie', 'tv'] as const).map(mt => (
                    <button
                      key={mt}
                      onClick={() => {
                        setMediaType(mt)
                        const params = new URLSearchParams(searchParams)
                        params.delete('genre')
                        setSearchParams(params)
                      }}
                      style={{ padding: '5px 14px', background: mediaType === mt ? A : 'transparent', color: mediaType === mt ? 'var(--accent-on)' : 'var(--text-3)', border: 'none', fontSize: 11, letterSpacing: '0.12em', fontWeight: mediaType === mt ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {mt === 'movie' ? '영화' : 'TV'}
                    </button>
                  ))}
                </div>
              </div>
              {totalResults > 0 && (
                <p style={{ color: 'var(--text-4)', fontSize: 13, margin: 0 }}>{totalResults.toLocaleString()}개의 결과</p>
              )}
            </div>
            {isMobile && (
              <button
                onClick={() => setFilterOpen(o => !o)}
                style={{ background: 'none', border: '1px solid var(--border-4)', color: 'var(--text-3)', fontSize: 11, letterSpacing: '0.15em', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
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
            {!loading && error ? (
              <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-3)' }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
                <p>{error}</p>
              </div>
            ) : !loading && movies.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <p style={{ fontSize: 40, marginBottom: 14 }}>🎬</p>
                <p style={{ color: 'var(--text-3)', fontSize: 15 }}>검색 결과가 없습니다.</p>
                <p style={{ color: 'var(--text-4)', fontSize: 12, marginTop: 6 }}>다른 키워드나 필터를 시도해보세요.</p>
              </div>
            ) : (
              <>
                <div className="movie-grid-auto">
                  {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} style={{ height: 1 }} />

                {/* Loading indicator */}
                {loading && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                    <Spinner size={32} />
                  </div>
                )}

                {!loading && !hasMore && movies.length > 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-5)', fontSize: 11, letterSpacing: '0.15em', padding: '32px 0' }}>
                    — 모든 결과를 불러왔습니다 —
                  </p>
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

function FilterSection({ title, children, dimmed }: { title: string; children: React.ReactNode; dimmed?: boolean }) {
  return (
    <div style={{ marginBottom: 24, opacity: dimmed ? 0.55 : 1, transition: 'opacity 0.2s' }}>
      <p style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--text-4)', marginBottom: 8, textTransform: 'uppercase' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</div>
    </div>
  )
}

function FilterOption({ label, active, disabled, onClick }: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ textAlign: 'left', background: 'none', border: 'none', padding: '7px 10px', fontSize: 13, color: active ? 'var(--accent)' : 'var(--text-3)', cursor: disabled ? 'default' : 'pointer', transition: 'color 0.2s', borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`, fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-3)' }}
    >
      {label}
    </button>
  )
}
