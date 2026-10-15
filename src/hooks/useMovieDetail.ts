import { useQuery } from '@tanstack/react-query'
import { tmdb, pickTrailer } from '../lib/tmdb'
export function useMovieDetail(id: number) {
  const detail = useQuery({ queryKey: ['movie', id], queryFn: ({ signal }) => tmdb.movieBundle(id, signal), enabled: Number.isInteger(id) && id > 0 })
  const data = detail.data
  const collection = useQuery({ queryKey: ['collection', data?.belongs_to_collection?.id], queryFn: () => tmdb.collection(data!.belongs_to_collection!.id), enabled: !!data?.belongs_to_collection?.id })
  const fallback = useQuery({ queryKey: ['movie-trailer-en', id], queryFn: ({ signal }) => tmdb.videos(id, 'en-US', signal), enabled: !!data && !pickTrailer(data.videos?.results ?? []) })
  const recs = data?.recommendations?.results?.slice(0, 12) ?? []
  return {
    movie: data ?? null, cast: data?.credits?.cast?.slice(0, 12) ?? [], directors: data?.credits?.crew?.filter(c => c.job === 'Director') ?? [],
    providers: data?.['watch/providers']?.results?.KR ?? null, providerRegion: 'KR', providerCountries: data?.['watch/providers']?.results ?? {},
    recommendations: recs, similar: (data?.similar?.results ?? []).filter(m => !recs.some(r => r.id === m.id)).slice(0, 6),
    trailerKey: pickTrailer(data?.videos?.results ?? []) ?? pickTrailer(fallback.data?.results ?? []),
    collection: collection.data ?? null, keywords: data?.keywords?.keywords?.slice(0, 20) ?? [], externalIds: data?.external_ids ?? null, tmdbReviews: data?.reviews?.results?.slice(0, 5) ?? [],
    koreanRelease: data?.release_dates?.results?.find(r => r.iso_3166_1 === 'KR')?.release_dates ?? [],
    loading: detail.isLoading, error: detail.error ? '영화 정보를 불러오지 못했습니다. 다시 시도해 주세요.' : null,
  }
}
