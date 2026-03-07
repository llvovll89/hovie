import { useState, useEffect } from 'react'
import { tmdb } from '../lib/tmdb'
import type { MovieDetail, CastMember, CrewMember, WatchProviderResult, Movie, VideoItem } from '../types'

interface MovieDetailState {
  movie: MovieDetail | null
  cast: CastMember[]
  directors: CrewMember[]
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
  const youtubeVideos = videos.filter(v => v.site === 'YouTube')
  // Priority: Korean trailer → English trailer → any trailer → Korean teaser → English teaser
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

export function useMovieDetail(id: number): MovieDetailState {
  const [state, setState] = useState<MovieDetailState>({
    movie: null, cast: [], directors: [], providers: null, providerRegion: null,
    recommendations: [], similar: [], trailerKey: null, loading: true, error: null,
  })

  useEffect(() => {
    if (!id) return
    setState(prev => ({ ...prev, loading: true, error: null }))

    Promise.all([
      tmdb.detail(id),
      tmdb.credits(id),
      tmdb.watchProviders(id),
      tmdb.recommendations(id),
      tmdb.similar(id),
      tmdb.videos(id),
    ])
      .then(([detail, credits, providers, recs, similar, videos]) => {
        const castData = (credits.cast as CastMember[]).slice(0, 12)
        const directors = (credits.crew as CrewMember[]).filter(c => c.job === 'Director')
        const results = providers.results as Record<string, WatchProviderResult>
        const { data: providerData, region } = pickProviders(results)

        const recMovies = (recs.results as Movie[]).slice(0, 12)
        const simMovies = (similar.results as Movie[]).slice(0, 6)
        const seen = new Set(recMovies.map(m => m.id))
        const simUnique = simMovies.filter(m => !seen.has(m.id))

        const trailerKey = pickTrailer(videos.results as VideoItem[])

        setState({
          movie: detail as MovieDetail,
          cast: castData,
          directors,
          providers: providerData,
          providerRegion: region,
          recommendations: recMovies,
          similar: simUnique,
          trailerKey,
          loading: false,
          error: null,
        })
      })
      .catch(() => setState(prev => ({ ...prev, loading: false, error: '영화 정보를 불러오는 데 실패했습니다.' })))
  }, [id])

  return state
}
