import type { TVShow, Movie } from '../types'

const BASE_URL = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_MOVIE_API_KEY

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function request<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('language', 'ko-KR')
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

export const tmdb = {
  trending: (timeWindow: 'day' | 'week' = 'week') =>
    request<{ results: unknown[] }>(`/trending/movie/${timeWindow}`),

  search: (query: string, page = 1) =>
    request<{ results: unknown[]; total_results: number; total_pages: number }>(
      '/search/movie', { query, page: String(page) }
    ),

  discover: (params: Record<string, string>) =>
    request<{ results: unknown[]; total_results: number; total_pages: number }>(
      '/discover/movie', params
    ),

  detail: (id: number) =>
    request<unknown>(`/movie/${id}`),

  watchProviders: (id: number) =>
    request<{ results: Record<string, unknown> }>(`/movie/${id}/watch/providers`),

  credits: (id: number) =>
    request<{ cast: unknown[]; crew: unknown[] }>(`/movie/${id}/credits`),

  recommendations: (id: number) =>
    request<{ results: unknown[] }>(`/movie/${id}/recommendations`),

  similar: (id: number) =>
    request<{ results: unknown[] }>(`/movie/${id}/similar`),

  genres: () =>
    request<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),

  videos: (id: number) =>
    request<{ results: unknown[] }>(`/movie/${id}/videos`),

  person: (id: number) =>
    request<unknown>(`/person/${id}`),

  personCredits: (id: number) =>
    request<{ cast: unknown[]; crew: unknown[] }>(`/person/${id}/movie_credits`),

  upcoming: (page = 1) =>
    request<{ results: unknown[]; total_pages: number; total_results: number; dates: { maximum: string; minimum: string } }>(
      '/movie/upcoming', { page: String(page), region: 'KR' }
    ),

  images: (id: number) =>
    request<{ backdrops: unknown[]; posters: unknown[] }>(`/movie/${id}/images`),

  // ── TV ──────────────────────────────────────────────────────
  tvTrending: (timeWindow: 'day' | 'week' = 'week') =>
    request<{ results: unknown[] }>(`/trending/tv/${timeWindow}`),

  tvSearch: (query: string, page = 1) =>
    request<{ results: unknown[]; total_results: number; total_pages: number }>(
      '/search/tv', { query, page: String(page) }
    ),

  tvDiscover: (params: Record<string, string>) =>
    request<{ results: unknown[]; total_results: number; total_pages: number }>(
      '/discover/tv', params
    ),

  tvDetail: (id: number) =>
    request<unknown>(`/tv/${id}`),

  tvCredits: (id: number) =>
    request<{ cast: unknown[] }>(`/tv/${id}/aggregate_credits`),

  tvWatchProviders: (id: number) =>
    request<{ results: Record<string, unknown> }>(`/tv/${id}/watch/providers`),

  tvRecommendations: (id: number) =>
    request<{ results: unknown[] }>(`/tv/${id}/recommendations`),

  tvSimilar: (id: number) =>
    request<{ results: unknown[] }>(`/tv/${id}/similar`),

  tvVideos: (id: number) =>
    request<{ results: unknown[] }>(`/tv/${id}/videos`),

  tvImages: (id: number) =>
    request<{ backdrops: unknown[]; posters: unknown[] }>(`/tv/${id}/images`),

  tvGenres: () =>
    request<{ genres: { id: number; name: string }[] }>('/genre/tv/list'),

  personTVCredits: (id: number) =>
    request<{ cast: unknown[]; crew: unknown[] }>(`/person/${id}/tv_credits`),

  collection: (id: number) =>
    request<{ id: number; name: string; overview: string; poster_path: string | null; backdrop_path: string | null; parts: unknown[] }>(`/collection/${id}`),

  tvSeason: (showId: number, seasonNumber: number) =>
    request<{ id: number; name: string; season_number: number; episodes: unknown[] }>(`/tv/${showId}/season/${seasonNumber}`),
}

export function normalizeTVShow(show: TVShow): Movie {
  return {
    id: show.id,
    title: show.name,
    original_title: show.original_name,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    vote_average: show.vote_average,
    vote_count: show.vote_count,
    release_date: show.first_air_date ?? '',
    genre_ids: show.genre_ids ?? [],
    overview: show.overview,
    popularity: show.popularity,
    adult: false,
    mediaType: 'tv',
  }
}

export const IMG = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
}
