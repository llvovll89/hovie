import { useInfiniteQuery } from '@tanstack/react-query'
import { tmdb } from '../../lib/tmdb'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
export default function Upcoming() {
  const result = useInfiniteQuery({ queryKey: ['upcoming', 'KR', new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })], queryFn: ({ pageParam }) => tmdb.upcoming(pageParam), initialPageParam: 1, getNextPageParam: last => last.page < Math.min(last.total_pages,500) ? last.page + 1 : undefined })
  const movies = [...new Map((result.data?.pages.flatMap(p => p.results) ?? []).map(m => [m.id,m])).values()]
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  return <div className="page-shell"><title>한국 개봉 예정 영화 - HOVIE</title><div className="page-heading"><div><h1>극장에서 만날 다음 이야기</h1><p>오늘부터 6개월간 한국 극장 개봉이 등록된 작품입니다.</p><p className="helper">TMDB 등록 일정으로, 실제 개봉일은 변경될 수 있습니다.</p></div></div>{result.isError && <div className="empty-state" role="alert"><h2>개봉 정보를 불러오지 못했습니다</h2><button className="button" onClick={() => void result.refetch()}>다시 시도</button></div>}<div className="library-grid">{result.isLoading ? <SkeletonCard count={12} /> : movies.map(m => <article key={m.id}><MovieCard movie={m} /><p className="helper">한국 개봉 {m.release_date || '미정'}{m.release_date === today ? ' / 오늘 개봉' : ''}</p></article>)}</div>{!result.isLoading && !result.isError && !movies.length && <div className="empty-state"><h2>등록된 개봉 예정작이 없습니다</h2><p>새로운 일정이 등록되면 여기에 표시됩니다.</p></div>}{result.hasNextPage && <button className="button load-more" disabled={result.isFetchingNextPage} onClick={() => void result.fetchNextPage()}>{result.isFetchingNextPage ? '불러오는 중…' : '더 보기'}</button>}</div>
}
