import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { tmdb, normalizeTVShow } from '../../lib/tmdb'
import { mediaKey } from '../../lib/media'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
export default function Trending() {
  const [params, setParams] = useSearchParams()
  const type = params.get('type') === 'tv' ? 'tv' : 'movie'
  const window = params.get('window') === 'day' ? 'day' : 'week'
  const result = useQuery({ queryKey: ['trending', type, window], queryFn: async () => type === 'tv' ? (await tmdb.tvTrending(window)).results.map(normalizeTVShow) : (await tmdb.trending(window)).results })
  function change(key: string, value: string) { const next = new URLSearchParams(params); next.set(key,value); setParams(next) }
  return <div className="page-shell"><title>트렌딩 - HOVIE</title><div className="page-heading"><div><h1>지금 주목받는 이야기</h1><p>TMDB에서 많이 찾는 영화와 TV를 만나보세요.</p></div></div><div className="search-toolbar"><div className="segmented">{[['movie','영화'],['tv','TV']].map(([v,l]) => <button key={v} className={type === v ? 'selected' : ''} aria-pressed={type === v} onClick={() => change('type',v)}>{l}</button>)}</div><div className="segmented">{[['day','오늘'],['week','이번 주']].map(([v,l]) => <button key={v} className={window === v ? 'selected' : ''} aria-pressed={window === v} onClick={() => change('window',v)}>{l}</button>)}</div></div>{result.isError ? <div className="empty-state" role="alert"><h2>인기 작품을 불러오지 못했습니다</h2><button className="button" onClick={() => void result.refetch()}>다시 시도</button></div> : <div className="library-grid">{result.isLoading ? <SkeletonCard count={12} /> : result.data?.map((m,i) => <MovieCard key={mediaKey(m)} movie={m} rank={i+1} />)}</div>}</div>
}
