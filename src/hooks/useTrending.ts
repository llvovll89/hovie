import { useQuery } from '@tanstack/react-query'
import { tmdb } from '../lib/tmdb'
import type { Movie } from '../types'

export function useTrending(timeWindow: 'day' | 'week' = 'week') {
  const { data, isLoading } = useQuery({
    queryKey: ['trending', timeWindow],
    queryFn: () => tmdb.trending(timeWindow).then(d => (d.results as Movie[]).slice(0, 8)),
    staleTime: 10 * 60 * 1000,
  })

  return { movies: data ?? [], loading: isLoading }
}
