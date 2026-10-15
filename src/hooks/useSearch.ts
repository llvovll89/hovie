import { useInfiniteQuery } from '@tanstack/react-query'
import { tmdb, normalizeTVShow, type MultiResult } from '../lib/tmdb'
import { discoverParams } from '../lib/search'
import type { SearchFilters, Movie } from '../types'
export function useSearch(query: string, filters: SearchFilters, mediaType: 'movie' | 'tv' | 'all' = 'movie') {
  const result = useInfiniteQuery({
    queryKey: ['search', mediaType, query, query.trim() ? null : filters],
    queryFn: async ({ pageParam, signal }) => {
      if (query.trim() && mediaType === 'all') {
        const data = await tmdb.multiSearch(query.trim(), pageParam, signal)
        return { ...data, movies: [] as Movie[], people: data.results.filter((r): r is Extract<MultiResult, { media_type: 'person' }> => r.media_type === 'person'), combined: data.results.filter(r => r.media_type !== 'person').map(r => r.media_type === 'tv' ? normalizeTVShow(r) : r as Movie) }
      }
      const type = mediaType === 'tv' ? 'tv' : 'movie'
      const data = query.trim()
        ? type === 'tv' ? await tmdb.tvSearch(query.trim(), pageParam, signal) : await tmdb.search(query.trim(), pageParam, signal)
        : type === 'tv' ? await tmdb.tvDiscover(discoverParams(filters, type, pageParam), signal) : await tmdb.discover(discoverParams(filters, type, pageParam), signal)
      const movies = type === 'tv' ? data.results.map(r => normalizeTVShow(r as Parameters<typeof normalizeTVShow>[0])) : data.results as Movie[]
      return { ...data, movies, combined: movies, people: [] as Extract<MultiResult, { media_type: 'person' }>[] }
    },
    initialPageParam: 1,
    getNextPageParam: last => last.page < Math.min(last.total_pages, 500) ? last.page + 1 : undefined,
  })
  const movies = result.data?.pages.flatMap(p => p.combined) ?? []
  const people = result.data?.pages.flatMap(p => p.people) ?? []
  return { movies: [...new Map(movies.map(m => [(m.mediaType ?? 'movie') + '_' + m.id, m])).values()], people: [...new Map(people.map(p => [p.id, p])).values()], totalResults: result.data?.pages[0]?.total_results ?? 0, loading: result.isLoading, loadingMore: result.isFetchingNextPage, error: result.error ? '검색 결과를 불러오지 못했습니다.' : null, loadMore: () => { if (result.hasNextPage && !result.isFetchingNextPage) void result.fetchNextPage() }, hasMore: !!result.hasNextPage, retry: result.refetch }
}
