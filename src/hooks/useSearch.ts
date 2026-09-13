import { useInfiniteQuery } from '@tanstack/react-query'
import { tmdb, normalizeTVShow } from '../lib/tmdb'
import type { Movie, SearchFilters, TVShow } from '../types'

interface SearchResult {
  movies: Movie[]
  totalResults: number
  totalPages: number
  loading: boolean
  error: string | null
  loadMore: () => void
  hasMore: boolean
}

interface SearchPage {
  movies: Movie[]
  totalResults: number
  totalPages: number
  page: number
}

function buildDiscoverParams(filters: SearchFilters, page: number): Record<string, string> {
  const params: Record<string, string> = { page: String(page), sort_by: filters.sortBy }
  if (filters.genre) params['with_genres'] = String(filters.genre)
  if (filters.year) params['primary_release_year'] = filters.year
  if (filters.minRating > 0) params['vote_average.gte'] = String(filters.minRating)
  if (filters.language) params['with_original_language'] = filters.language
  if (filters.runtime === '~90') params['with_runtime.lte'] = '90'
  else if (filters.runtime === '90~120') { params['with_runtime.gte'] = '90'; params['with_runtime.lte'] = '120' }
  else if (filters.runtime === '120~150') { params['with_runtime.gte'] = '120'; params['with_runtime.lte'] = '150' }
  else if (filters.runtime === '150~') params['with_runtime.gte'] = '150'
  params['vote_count.gte'] = '50'
  return params
}

function buildTVDiscoverParams(filters: SearchFilters, page: number): Record<string, string> {
  const params: Record<string, string> = { page: String(page), sort_by: filters.sortBy }
  if (filters.genre) params['with_genres'] = String(filters.genre)
  if (filters.year) params['first_air_date_year'] = filters.year
  if (filters.minRating > 0) params['vote_average.gte'] = String(filters.minRating)
  if (filters.language) params['with_original_language'] = filters.language
  params['vote_count.gte'] = '50'
  return params
}

async function fetchSearchPage(query: string, filters: SearchFilters, mediaType: 'movie' | 'tv', page: number): Promise<SearchPage> {
  const data = query.trim()
    ? mediaType === 'tv'
      ? await tmdb.tvSearch(query.trim(), page)
      : await tmdb.search(query.trim(), page)
    : mediaType === 'tv'
      ? await tmdb.tvDiscover(buildTVDiscoverParams(filters, page))
      : await tmdb.discover(buildDiscoverParams(filters, page))

  const movies = mediaType === 'tv'
    ? (data.results as TVShow[]).map(normalizeTVShow)
    : data.results as Movie[]

  return {
    movies,
    totalResults: data.total_results,
    totalPages: Math.min(data.total_pages, 500),
    page,
  }
}

export function useSearch(query: string, filters: SearchFilters, mediaType: 'movie' | 'tv' = 'movie'): SearchResult {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, error } = useInfiniteQuery({
    queryKey: ['search', mediaType, query, filters],
    queryFn: ({ pageParam }) => fetchSearchPage(query, filters, mediaType, pageParam),
    initialPageParam: 1,
    getNextPageParam: last => (last.page < last.totalPages ? last.page + 1 : undefined),
  })

  return {
    movies: data?.pages.flatMap(p => p.movies) ?? [],
    totalResults: data?.pages[0]?.totalResults ?? 0,
    totalPages: data?.pages[0]?.totalPages ?? 0,
    loading: isLoading || isFetchingNextPage,
    error: error ? '영화를 불러오는 데 실패했습니다.' : null,
    loadMore: () => { if (hasNextPage) fetchNextPage() },
    hasMore: !!hasNextPage,
  }
}
