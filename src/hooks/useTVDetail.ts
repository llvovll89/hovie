import { useState, useEffect } from 'react'
import { tmdb, normalizeTVShow } from '../lib/tmdb'
import type { TVDetail, CastMember, WatchProviderResult, Movie, VideoItem, TVShow } from '../types'

interface TVDetailState {
  show: TVDetail | null
  cast: CastMember[]
  providers: WatchProviderResult | null
  providerRegion: string | null
  recommendations: Movie[]
  similar: Movie[]
  trailerKey: string | null
  loading: boolean
  error: string | null
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
  const yt = videos.filter(v => v.site === 'YouTube')
  const pick = (lang: string, type: string) => yt.find(v => v.iso_639_1 === lang && v.type === type)
  return (
    pick('ko', 'Trailer')?.key ??
    pick('en', 'Trailer')?.key ??
    yt.find(v => v.type === 'Trailer')?.key ??
    pick('ko', 'Teaser')?.key ??
    pick('en', 'Teaser')?.key ??
    yt[0]?.key ??
    null
  )
}

interface AggregateCast {
  id: number
  name: string
  profile_path: string | null
  order: number
  roles: { character: string; episode_count: number }[]
}

export function useTVDetail(id: number): TVDetailState {
  const [state, setState] = useState<TVDetailState>({
    show: null, cast: [], providers: null, providerRegion: null,
    recommendations: [], similar: [], trailerKey: null, loading: true, error: null,
  })

  useEffect(() => {
    if (!id) return
    setState(prev => ({ ...prev, loading: true, error: null }))

    Promise.all([
      tmdb.tvDetail(id),
      tmdb.tvCredits(id),
      tmdb.tvWatchProviders(id),
      tmdb.tvRecommendations(id),
      tmdb.tvSimilar(id),
      tmdb.tvVideos(id),
    ])
      .then(([detail, credits, providers, recs, similar, videos]) => {
        const castData: CastMember[] = (credits.cast as AggregateCast[])
          .sort((a, b) => a.order - b.order)
          .slice(0, 12)
          .map(m => ({
            id: m.id,
            name: m.name,
            profile_path: m.profile_path,
            order: m.order,
            character: m.roles[0]?.character ?? '',
          }))

        const { data: providerData, region } = pickProviders(
          providers.results as Record<string, WatchProviderResult>
        )

        const recShows = (recs.results as TVShow[]).slice(0, 12).map(normalizeTVShow)
        const simShows = (similar.results as TVShow[]).slice(0, 6).map(normalizeTVShow)
        const seen = new Set(recShows.map(m => m.id))

        setState({
          show: detail as TVDetail,
          cast: castData,
          providers: providerData,
          providerRegion: region,
          recommendations: recShows,
          similar: simShows.filter(m => !seen.has(m.id)),
          trailerKey: pickTrailer(videos.results as VideoItem[]),
          loading: false,
          error: null,
        })
      })
      .catch(() => setState(prev => ({ ...prev, loading: false, error: 'TV 시리즈 정보를 불러오는 데 실패했습니다.' })))
  }, [id])

  return state
}
