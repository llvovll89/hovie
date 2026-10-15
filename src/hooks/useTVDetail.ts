import { useQuery } from '@tanstack/react-query'
import { tmdb, normalizeTVShow, pickTrailer } from '../lib/tmdb'
export function useTVDetail(id: number) {
  const { data, isLoading, error } = useQuery({ queryKey: ['tv', id], queryFn: ({ signal }) => tmdb.tvBundle(id, signal), enabled: Number.isInteger(id) && id > 0 })
  const fallback = useQuery({ queryKey: ['tv-trailer-en', id], queryFn: ({ signal }) => tmdb.tvVideos(id, 'en-US', signal), enabled: !!data && !pickTrailer(data.videos?.results ?? []) })
  const recs = (data?.recommendations?.results ?? []).slice(0, 12).map(normalizeTVShow)
  return {
    show: data ?? null, cast: (data?.aggregate_credits?.cast ?? []).slice(0, 12).map(m => ({ ...m, character: m.roles?.[0]?.character ?? '' })),
    providers: data?.['watch/providers']?.results?.KR ?? null, providerRegion: 'KR', providerCountries: data?.['watch/providers']?.results ?? {},
    recommendations: recs, similar: (data?.similar?.results ?? []).map(normalizeTVShow).filter(m => !recs.some(r => r.id === m.id)).slice(0, 6),
    trailerKey: pickTrailer(data?.videos?.results ?? []) ?? pickTrailer(fallback.data?.results ?? []),
    koreanRating: data?.content_ratings?.results?.find(r => r.iso_3166_1 === 'KR')?.rating, nextEpisode: data?.next_episode_to_air ?? null,
    loading: isLoading, error: error ? 'TV 정보를 불러오지 못했습니다. 다시 시도해 주세요.' : null,
  }
}
