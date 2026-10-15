import type { SearchFilters } from '../types'
import type { MediaType } from './media'

export function discoverParams(filters: SearchFilters, type: MediaType, page: number) {
  const sort = type === 'tv' ? filters.sortBy.replace('release_date', 'first_air_date') : filters.sortBy.replace('release_date', 'primary_release_date')
  const params: Record<string, string> = { page: String(page), sort_by: sort, 'vote_count.gte': '50', include_adult: 'false' }
  if (filters.genre) params.with_genres = String(filters.genre)
  if (filters.year) params[type === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = filters.year
  if (filters.minRating) params['vote_average.gte'] = String(filters.minRating)
  if (filters.language) params.with_original_language = filters.language
  if (type === 'movie' && filters.runtime) {
    const [min, max] = filters.runtime.split('~')
    if (min) params['with_runtime.gte'] = min
    if (max) params['with_runtime.lte'] = max
  }
  if (filters.providers) { params.watch_region = 'KR'; params.with_watch_providers = filters.providers; params.with_watch_monetization_types = 'flatrate' }
  return params
}
