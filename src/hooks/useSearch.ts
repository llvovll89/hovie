import { useState, useEffect, useCallback, useRef } from 'react'
import { tmdb } from '../lib/tmdb'
import type { Movie, SearchFilters } from '../types'

interface SearchResult {
  movies: Movie[]
  totalResults: number
  totalPages: number
  loading: boolean
  error: string | null
}

export function useSearch(query: string, filters: SearchFilters, page: number): SearchResult {
  const [movies, setMovies] = useState<Movie[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchMovies = useCallback(async () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      let data

      if (query.trim()) {
        data = await tmdb.search(query.trim(), page)
      } else {
        const params: Record<string, string> = {
          page: String(page),
          sort_by: filters.sortBy,
        }
        if (filters.genre) params['with_genres'] = String(filters.genre)
        if (filters.year) params['primary_release_year'] = filters.year
        if (filters.minRating > 0) params['vote_average.gte'] = String(filters.minRating)
        params['vote_count.gte'] = '50'
        data = await tmdb.discover(params)
      }

      setMovies(data.results as Movie[])
      setTotalResults(data.total_results)
      setTotalPages(Math.min(data.total_pages, 500))
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('영화를 불러오는 데 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [query, filters, page])

  useEffect(() => {
    fetchMovies()
    return () => abortRef.current?.abort()
  }, [fetchMovies])

  return { movies, totalResults, totalPages, loading, error }
}
