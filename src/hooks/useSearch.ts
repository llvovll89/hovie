import { useState, useEffect, useCallback } from 'react'
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

export function useSearch(query: string, filters: SearchFilters, mediaType: 'movie' | 'tv' = 'movie'): SearchResult {
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable key for detecting query/filter changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filtersStr = JSON.stringify({ query, mediaType, ...filters })

  // Reset page and movies when query or filters change
  useEffect(() => {
    setPage(1)
    setMovies([])
    setTotalPages(0)
    setTotalResults(0)
    setError(null)
  }, [filtersStr]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovies = useCallback(async (pageToFetch: number) => {
    let cancelled = false
    const abort = new AbortController()

    setLoading(true)

    try {
      const data = query.trim()
        ? mediaType === 'tv'
          ? await tmdb.tvSearch(query.trim(), pageToFetch)
          : await tmdb.search(query.trim(), pageToFetch)
        : mediaType === 'tv'
          ? await tmdb.tvDiscover(buildTVDiscoverParams(filters, pageToFetch))
          : await tmdb.discover(buildDiscoverParams(filters, pageToFetch))

      if (cancelled) return
      const capped = Math.min(data.total_pages, 500)
      const normalized = mediaType === 'tv'
        ? (data.results as TVShow[]).map(normalizeTVShow)
        : data.results as Movie[]
      setTotalResults(data.total_results)
      setTotalPages(capped)
      setMovies(prev => pageToFetch === 1 ? normalized : [...prev, ...normalized])
    } catch (err) {
      if (!cancelled && err instanceof Error && err.name !== 'AbortError') {
        setError('영화를 불러오는 데 실패했습니다.')
      }
    } finally {
      if (!cancelled) setLoading(false)
    }

    return () => { cancelled = true; abort.abort() }
  }, [query, filters, mediaType]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cleanup = fetchMovies(page)
    return () => { cleanup?.then(fn => fn?.()) }
  }, [fetchMovies, page]) // eslint-disable-line react-hooks/exhaustive-deps

  function loadMore() {
    if (!loading && page < totalPages) setPage(p => p + 1)
  }

  return { movies, totalResults, totalPages, loading, error, loadMore, hasMore: page < totalPages }
}
