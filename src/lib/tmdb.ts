import type { Movie, MovieDetail, TVDetail, TVShow, Genre, CastMember, CrewMember, WatchProvider, WatchProviderResult, VideoItem, PersonDetail, PersonCredit, PersonTVCredit, CollectionDetail, MovieImage, Keyword, ExternalIds, TMDBReview } from '../types'
import type { MediaType } from './media'
const BASE_URL = 'https://api.themoviedb.org/3'
const TOKEN = import.meta.env.VITE_MOVIE_API_KEY
export interface Page<T> { results: T[]; total_pages: number; total_results: number; page: number }
export interface PersonResult { id: number; media_type: 'person'; name: string; profile_path: string | null; known_for_department: string }
export type MultiResult = (Movie & { media_type: 'movie' }) | (TVShow & { media_type: 'tv' }) | PersonResult
export interface Episode { id: number; episode_number: number; name: string; overview: string; still_path: string | null; air_date: string | null; runtime: number | null; vote_average: number }
export interface ReleaseCountry { iso_3166_1: string; release_dates: { certification: string; release_date: string; type: number }[] }
export interface AggregateCast extends Omit<CastMember, 'character'> { roles: { character: string; episode_count: number }[] }
interface Extras { 'watch/providers'?: { results: Record<string, WatchProviderResult> }; videos?: { results: VideoItem[] }; external_ids?: ExternalIds }
export type MovieBundle = MovieDetail & Extras & { credits?: { cast: CastMember[]; crew: CrewMember[] }; recommendations?: Page<Movie>; similar?: Page<Movie>; keywords?: { keywords: Keyword[] }; reviews?: Page<TMDBReview>; release_dates?: { results: ReleaseCountry[] } }
export type TVBundle = TVDetail & Extras & { aggregate_credits?: { cast: AggregateCast[] }; recommendations?: Page<TVShow>; similar?: Page<TVShow>; content_ratings?: { results: { iso_3166_1: string; rating: string }[] }; next_episode_to_air?: Episode | null }
export class TMDBError extends Error {
  status: number
  retryAfter: number
  constructor(status: number, retryAfter = 0) { super(status === 401 ? 'API 인증 정보를 확인해 주세요.' : status === 429 ? '요청이 많습니다. 잠시 후 다시 시도해 주세요.' : 'TMDB 요청 실패 (' + status + ')'); this.status = status; this.retryAfter = retryAfter }
}
export async function request<T>(path: string, params: Record<string, string> = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(BASE_URL + path)
  url.searchParams.set('language', 'ko-KR')
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  const res = await fetch(url, { signal, headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/json' } })
  if (!res.ok) throw new TMDBError(res.status, Number(res.headers.get('Retry-After')) || 0)
  return res.json()
}
const imageParams = { include_image_language: 'ko,en,null' }
export const tmdb = {
  trending: (window: 'day' | 'week' = 'week') => request<Page<Movie>>('/trending/movie/' + window),
  tvTrending: (window: 'day' | 'week' = 'week') => request<Page<TVShow>>('/trending/tv/' + window),
  search: (query: string, page = 1, signal?: AbortSignal) => request<Page<Movie>>('/search/movie', { query, page: String(page) }, signal),
  tvSearch: (query: string, page = 1, signal?: AbortSignal) => request<Page<TVShow>>('/search/tv', { query, page: String(page) }, signal),
  multiSearch: (query: string, page = 1, signal?: AbortSignal) => request<Page<MultiResult>>('/search/multi', { query, page: String(page), include_adult: 'false' }, signal),
  discover: (params: Record<string, string>, signal?: AbortSignal) => request<Page<Movie>>('/discover/movie', params, signal),
  tvDiscover: (params: Record<string, string>, signal?: AbortSignal) => request<Page<TVShow>>('/discover/tv', params, signal),
  detail: (id: number, signal?: AbortSignal) => request<MovieDetail>('/movie/' + id, {}, signal),
  tvDetail: (id: number, signal?: AbortSignal) => request<TVDetail>('/tv/' + id, {}, signal),
  movieBundle: (id: number, signal?: AbortSignal) => request<MovieBundle>('/movie/' + id, { append_to_response: 'credits,recommendations,similar,videos,watch/providers,keywords,external_ids,reviews,release_dates', include_video_language: 'ko,en' }, signal),
  tvBundle: (id: number, signal?: AbortSignal) => request<TVBundle>('/tv/' + id, { append_to_response: 'aggregate_credits,recommendations,similar,videos,watch/providers,content_ratings', include_video_language: 'ko,en' }, signal),
  watchProviders: (id: number, signal?: AbortSignal) => request<{ results: Record<string, WatchProviderResult> }>('/movie/' + id + '/watch/providers', {}, signal),
  tvWatchProviders: (id: number, signal?: AbortSignal) => request<{ results: Record<string, WatchProviderResult> }>('/tv/' + id + '/watch/providers', {}, signal),
  providerList: (type: MediaType, signal?: AbortSignal) => request<{ results: WatchProvider[] }>('/watch/providers/' + type, { watch_region: 'KR' }, signal),
  credits: (id: number) => request<{ cast: CastMember[]; crew: CrewMember[] }>('/movie/' + id + '/credits'),
  tvCredits: (id: number) => request<{ cast: AggregateCast[] }>('/tv/' + id + '/aggregate_credits'),
  recommendations: (id: number) => request<Page<Movie>>('/movie/' + id + '/recommendations'),
  tvRecommendations: (id: number) => request<Page<TVShow>>('/tv/' + id + '/recommendations'),
  similar: (id: number) => request<Page<Movie>>('/movie/' + id + '/similar'),
  tvSimilar: (id: number) => request<Page<TVShow>>('/tv/' + id + '/similar'),
  genres: () => request<{ genres: Genre[] }>('/genre/movie/list'),
  tvGenres: () => request<{ genres: Genre[] }>('/genre/tv/list'),
  videos: (id: number, language = 'ko-KR', signal?: AbortSignal) => request<{ results: VideoItem[] }>('/movie/' + id + '/videos', { language }, signal),
  tvVideos: (id: number, language = 'ko-KR', signal?: AbortSignal) => request<{ results: VideoItem[] }>('/tv/' + id + '/videos', { language }, signal),
  person: (id: number) => request<PersonDetail>('/person/' + id),
  personCredits: (id: number) => request<{ cast: PersonCredit[]; crew: PersonCredit[] }>('/person/' + id + '/movie_credits'),
  personTVCredits: (id: number) => request<{ cast: PersonTVCredit[]; crew: PersonTVCredit[] }>('/person/' + id + '/tv_credits'),
  upcoming: (page = 1) => request<Page<Movie>>('/discover/movie', { page: String(page), region: 'KR', with_release_type: '3|2', 'release_date.gte': new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }), 'release_date.lte': new Date(Date.now() + 180 * 86400000).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }), sort_by: 'primary_release_date.asc' }),
  images: (id: number) => request<{ backdrops: MovieImage[]; posters: MovieImage[] }>('/movie/' + id + '/images', imageParams),
  tvImages: (id: number) => request<{ backdrops: MovieImage[]; posters: MovieImage[] }>('/tv/' + id + '/images', imageParams),
  collection: (id: number) => request<CollectionDetail>('/collection/' + id),
  tvSeason: (showId: number, seasonNumber: number, signal?: AbortSignal) => request<{ id: number; name: string; season_number: number; episodes: Episode[] }>('/tv/' + showId + '/season/' + seasonNumber, {}, signal),
  keywords: (id: number) => request<{ keywords: Keyword[] }>('/movie/' + id + '/keywords'),
  externalIds: (id: number) => request<ExternalIds>('/movie/' + id + '/external_ids'),
  movieReviews: (id: number) => request<Page<TMDBReview>>('/movie/' + id + '/reviews'),
  tvKeywords: (id: number) => request<{ results: Keyword[] }>('/tv/' + id + '/keywords'),
  tvExternalIds: (id: number) => request<ExternalIds>('/tv/' + id + '/external_ids'),
}
export function normalizeTVShow(show: TVShow): Movie {
  return { id: show.id, title: show.name, original_title: show.original_name, poster_path: show.poster_path, backdrop_path: show.backdrop_path, vote_average: show.vote_average, vote_count: show.vote_count, release_date: show.first_air_date ?? '', genre_ids: show.genre_ids ?? [], overview: show.overview, popularity: show.popularity, adult: false, mediaType: 'tv' }
}
export function pickTrailer(videos: VideoItem[]) {
  const yt = videos.filter(v => v.site === 'YouTube')
  return (yt.find(v => v.iso_639_1 === 'ko' && v.type === 'Trailer') ?? yt.find(v => v.type === 'Trailer') ?? yt.find(v => v.type === 'Teaser'))?.key ?? null
}
export const IMG = {
  poster: (path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500') => path ? 'https://image.tmdb.org/t/p/' + size + path : null,
  backdrop: (path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') => path ? 'https://image.tmdb.org/t/p/' + size + path : null,
}
