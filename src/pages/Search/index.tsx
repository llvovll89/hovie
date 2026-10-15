import Modal from '../../components/ui/Modal'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal'
import { X } from '@phosphor-icons/react/dist/csr/X'
import { User } from '@phosphor-icons/react/dist/csr/User'
import { useSearch } from '../../hooks/useSearch'
import { tmdb, IMG } from '../../lib/tmdb'
import { mediaKey } from '../../lib/media'
import { savePreference, readPreference } from '../../lib/preferences'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import SearchDropdown from '../../components/ui/SearchDropdown'
import ProviderPicker from '../../components/ui/ProviderPicker'
import FilterSelect from '../../components/ui/FilterSelect'
import type { SearchFilters } from '../../types'
const SORTS = [['popularity.desc', '인기순'], ['release_date.desc', '최신순'], ['release_date.asc', '오래된 순'], ['vote_average.desc', '평점순']]
const RUNTIMES = [['', '전체'], ['~90', '90분 이하'], ['90~120', '90~120분'], ['120~150', '120~150분'], ['150~', '150분 이상']]
const LANGUAGES = [['', '전체'], ['ko', '한국어'], ['en', '영어'], ['ja', '일본어'], ['zh', '중국어'], ['fr', '프랑스어'], ['es', '스페인어'], ['de', '독일어']]
export default function Search() {
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const { isMobile } = useBreakpoint()
  const query = params.get('q') ?? ''
  const type = params.get('type') === 'tv' ? 'tv' : params.get('type') === 'all' && query.trim() ? 'all' : 'movie'
  const browsing = !query.trim()
  const filters = useMemo<SearchFilters>(() => ({
    genre: /^\d+$/.test(params.get('genre') ?? '') ? Number(params.get('genre')) : null,
    year: /^\d{4}$/.test(params.get('year') ?? '') ? params.get('year')! : '',
    minRating: [0, 5, 6, 7, 8].includes(Number(params.get('rating'))) ? Number(params.get('rating')) : 0,
    sortBy: (SORTS.some(([v]) => v === params.get('sort')) ? params.get('sort') : 'popularity.desc') as SearchFilters['sortBy'],
    runtime: (RUNTIMES.some(([v]) => v === params.get('runtime')) ? params.get('runtime') : '') as SearchFilters['runtime'],
    language: LANGUAGES.some(([v]) => v === params.get('lang')) ? params.get('lang')! : '',
    providers: (params.get('providers') ?? '').split('|').filter(v => /^\d+$/.test(v)).join('|'),
  }), [params])
  const result = useSearch(query, filters, type)
  const genres = useQuery({ queryKey: ['genres', type], queryFn: type === 'tv' ? tmdb.tvGenres : tmdb.genres })
  const sentinel = useRef<HTMLDivElement>(null)
  const { loadMore, hasMore, loadingMore } = result
  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore || loadingMore) return
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) loadMore() }, { rootMargin: '300px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loadingMore])
  function update(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next) }
  function changeType(value: string) {
    const next = new URLSearchParams(params); next.set('type', value); next.delete('genre')
    if (value === 'tv') next.delete('runtime')
    setParams(next)
  }
  const count = [filters.genre, filters.year, filters.minRating, filters.runtime, filters.language, filters.providers].filter(Boolean).length
  const filterPanel = <aside id="search-filters" className={'filter-panel ' + (filterOpen ? 'is-open' : '')}>
        <div className="filter-panel-top"><h2>탐색 조건</h2><button className="text-button" onClick={() => setParams({ type: type === 'tv' ? 'tv' : 'movie' })}>초기화</button><button className="icon-button mobile-only" aria-label="필터 닫기" onClick={() => setFilterOpen(false)}><X size={20} /></button></div>
        <FilterSelect label="정렬" value={filters.sortBy} onChange={v => update('sort', v)} options={SORTS.map(([value,label]) => ({ value,label }))} />
        <FilterSelect label="장르" value={filters.genre ?? ''} onChange={v => update('genre', v)} options={[{ value:'',label:'전체 장르' }, ...(genres.data?.genres.map(g => ({ value:g.id,label:g.name })) ?? [])]} disabled={genres.isLoading} />
        <FilterSelect label="연도" value={filters.year} onChange={v => update('year', v)} options={[{ value:'',label:'전체 연도' }, ...Array.from({ length:new Date().getFullYear()+2-1950 }, (_,i) => { const y=new Date().getFullYear()+1-i; return { value:String(y),label:y+'년' } })]} />
        <FilterSelect label="최소 평점" value={filters.minRating} onChange={v => update('rating', v)} options={[0,5,6,7,8].map(v => ({ value:v,label:v ? v+'점 이상' : '전체' }))} />
        {type === 'movie' && <FilterSelect label="상영시간" value={filters.runtime} onChange={v => update('runtime', v)} options={RUNTIMES.map(([value,label]) => ({ value,label }))} />}
        <FilterSelect label="원어" value={filters.language} onChange={v => update('lang', v)} options={LANGUAGES.map(([value,label]) => ({ value,label }))} />
        <details open={!!filters.providers}><summary>시청 서비스 {filters.providers ? '(' + filters.providers.split('|').length + ')' : ''}</summary><ProviderPicker type={type === 'tv' ? 'tv' : 'movie'} value={filters.providers ?? ''} onChange={v => { update('providers', v); savePreference('hovie_providers_' + type, v) }} />
          <button className="text-button" onClick={() => update('providers', readPreference<string>('hovie_providers_' + type, ''))}>내 서비스 불러오기</button></details>
        <p className="helper">조건을 바꾸면 결과에 바로 반영됩니다.</p><button className="button primary mobile-only" onClick={() => setFilterOpen(false)}>결과 보기</button>
      </aside>
  return <div className="page-shell">
    <title>{(query ? query + ' 검색' : '작품 탐색') + " - HOVIE"}</title>
    <div className="page-heading"><div><h1>{query ? '“' + query + '” 검색 결과' : '어떤 작품을 찾고 있나요?'}</h1><p>{browsing ? '취향과 시청 서비스에 맞춰 골라보세요.' : '영화, TV, 인물을 한곳에서 찾아보세요.'}</p></div></div>
    <div className="search-page-input"><SearchDropdown /></div>
    <div className="search-toolbar"><div className="segmented" role="group" aria-label="콘텐츠 종류">{(query ? [['all', '전체'], ['movie', '영화'], ['tv', 'TV']] : [['movie', '영화'], ['tv', 'TV']]).map(([value, label]) => <button type="button" key={value} aria-pressed={type === value} className={type === value ? 'selected' : ''} onClick={() => changeType(value)}>{label}</button>)}</div>
      {browsing && <button className="button filter-toggle" aria-expanded={filterOpen} aria-controls="search-filters" onClick={() => setFilterOpen(v => !v)}><SlidersHorizontal size={18} />필터{count ? ' ' + count : ''}</button>}
      <p className="result-count" aria-live="polite">{result.loading ? '불러오는 중' : result.totalResults.toLocaleString() + '개 결과'}</p>
    </div>
    {!browsing && <p className="search-notice">제목 검색에서는 상세 조건과 정렬을 적용하지 않습니다. <button className="text-button" onClick={() => { const next = new URLSearchParams(params); next.delete('q'); if (type === 'all') next.set('type', 'movie'); setParams(next) }}>조건으로 탐색하기</button></p>}
    <div className={'discovery-layout ' + (!browsing ? 'without-filters' : '')}>
      {browsing && (isMobile ? filterOpen && <Modal onClose={() => setFilterOpen(false)} ariaLabel="탐색 조건" style={{ backgroundColor: 'var(--bg)' }}>{filterPanel}</Modal> : filterPanel)}
      <section className="search-results" aria-label="검색 결과">
        <h2 className="sr-only">작품 검색 결과</h2>
        {result.error ? <div className="empty-state" role="alert"><h2>{result.error}</h2><button className="button" onClick={() => void result.retry()}>다시 시도</button></div> : result.loading ? <div className="movie-grid-auto"><SkeletonCard count={12} /></div> : <>
          {result.people.length > 0 && <div className="people-results"><h2>인물</h2><div className="people-scroll">{result.people.map(p => <Link key={p.id} to={'/person/' + p.id} className="person-result">{p.profile_path ? <img src={IMG.poster(p.profile_path, 'w185')!} alt="" /> : <User size={36} />}<strong>{p.name}</strong><small>{p.known_for_department === 'Acting' ? '배우' : p.known_for_department === 'Directing' ? '감독' : p.known_for_department}</small></Link>)}</div></div>}
          {result.movies.length > 0 && <div className="movie-grid-auto">{result.movies.map(m => <MovieCard key={mediaKey(m)} movie={m} />)}</div>}
          {!result.movies.length && !result.people.length && <div className="empty-state"><h2>조건에 맞는 결과가 없습니다</h2><p>검색어나 필터를 바꿔보세요.</p><button className="button" onClick={() => setParams({ type: type === 'tv' ? 'tv' : 'movie' })}>조건 초기화</button></div>}
          <div ref={sentinel} />
          {result.loadingMore && <div className="movie-grid-auto" style={{ marginTop: 24 }}><SkeletonCard count={6} /></div>}
          {result.hasMore && <button className="button load-more" disabled={result.loadingMore} onClick={loadMore}>더 보기</button>}
        </>}
      </section>
    </div>
  </div>
}
