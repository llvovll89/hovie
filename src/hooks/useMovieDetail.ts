import { useQuery } from '@tanstack/react-query'
import { tmdb } from '../lib/tmdb'
import type { MovieDetail, CastMember, CrewMember, WatchProviderResult, Movie, VideoItem, CollectionDetail, Keyword, ExternalIds, TMDBReview } from '../types'

interface MovieDetailData {
  movie: MovieDetail
  cast: CastMember[]
  directors: CrewMember[]
  providers: WatchProviderResult | null
  providerRegion: string | null
  recommendations: Movie[]
  similar: Movie[]
  trailerKey: string | null
  collection: CollectionDetail | null
  keywords: Keyword[]
  externalIds: ExternalIds | null
  tmdbReviews: TMDBReview[]
}

const REGION_PRIORITY = ['KR', 'US', 'JP', 'GB']

function pickProviders(results: Record<string, WatchProviderResult>) {
  for (const region of REGION_PRIORITY) {
    if (results[region]) return { data: results[region], region }
  }
  const firstKey = Object.keys(results)[0]
  if (firstKey) return { data: results[firstKey], region: firstKey }
  return { data: null, region: null }
}

function pickTrailer(videos: VideoItem[]): string | null {
  const youtubeVideos = videos.filter(v => v.site === 'YouTube')
  const pick = (lang: string, type: string) => youtubeVideos.find(v => v.iso_639_1 === lang && v.type === type)
  return (
    pick('ko', 'Trailer')?.key ??
    pick('en', 'Trailer')?.key ??
    youtubeVideos.find(v => v.type === 'Trailer')?.key ??
    pick('ko', 'Teaser')?.key ??
    pick('en', 'Teaser')?.key ??
    youtubeVideos[0]?.key ??
    null
  )
}

async function fetchMovieDetail(id: number): Promise<MovieDetailData> {
  const [detail, credits, providers, recs, similar, videos, keywords, externalIds, reviews] = await Promise.all([
    tmdb.detail(id),
    tmdb.credits(id),
    tmdb.watchProviders(id),
    tmdb.recommendations(id),
    tmdb.similar(id),
    tmdb.videos(id),
    tmdb.keywords(id).catch(() => ({ keywords: [] })),
    tmdb.externalIds(id).catch(() => ({ imdb_id: null, instagram_id: null, twitter_id: null })),
    tmdb.movieReviews(id).catch(() => ({ results: [], total_results: 0 })),
  ])

  const castData = (credits.cast as CastMember[]).slice(0, 12)
  const directors = (credits.crew as CrewMember[]).filter(c => c.job === 'Director')
  const results = providers.results as Record<string, WatchProviderResult>
  const { data: providerData, region } = pickProviders(results)

  const recMovies = (recs.results as Movie[]).slice(0, 12)
  const simMovies = (similar.results as Movie[]).slice(0, 6)
  const seen = new Set(recMovies.map(m => m.id))
  const simUnique = simMovies.filter(m => !seen.has(m.id))

  const trailerKey = pickTrailer(videos.results as VideoItem[])

  const movieDetail = detail as MovieDetail
  let collection: CollectionDetail | null = null
  if (movieDetail.belongs_to_collection?.id) {
    try {
      const col = await tmdb.collection(movieDetail.belongs_to_collection.id)
      collection = { ...col, parts: (col.parts as Movie[]) } as CollectionDetail
    } catch { /* ignore */ }
  }

  const keywordList = (keywords.keywords as Keyword[]).slice(0, 20)
  const extIds = externalIds as ExternalIds
  const tmdbReviews = (reviews.results as TMDBReview[]).slice(0, 5)

  return {
    movie: movieDetail,
    cast: castData,
    directors,
    providers: providerData,
    providerRegion: region,
    recommendations: recMovies,
    similar: simUnique,
    trailerKey,
    collection,
    keywords: keywordList,
    externalIds: extIds,
    tmdbReviews,
  }
}

export function useMovieDetail(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieDetail(id),
    enabled: !!id,
  })

  return {
    movie: data?.movie ?? null,
    cast: data?.cast ?? [],
    directors: data?.directors ?? [],
    providers: data?.providers ?? null,
    providerRegion: data?.providerRegion ?? null,
    recommendations: data?.recommendations ?? [],
    similar: data?.similar ?? [],
    trailerKey: data?.trailerKey ?? null,
    collection: data?.collection ?? null,
    keywords: data?.keywords ?? [],
    externalIds: data?.externalIds ?? null,
    tmdbReviews: data?.tmdbReviews ?? [],
    loading: isLoading,
    error: error ? '영화 정보를 불러오는 데 실패했습니다.' : null,
  }
}
