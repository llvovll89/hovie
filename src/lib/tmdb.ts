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
}

export const IMG = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
}
