import { useState, useEffect } from 'react'
import { tmdb } from '../lib/tmdb'
import type { MovieDetail, CastMember, WatchProviderResult, Movie } from '../types'

interface MovieDetailState {
  movie: MovieDetail | null
  cast: CastMember[]
  providers: WatchProviderResult | null
  providerRegion: string | null
  recommendations: Movie[]
  similar: Movie[]
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

export function useMovieDetail(id: number): MovieDetailState {
  const [state, setState] = useState<MovieDetailState>({
    movie: null, cast: [], providers: null, providerRegion: null,
    recommendations: [], similar: [], loading: true, error: null,
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
    ])
      .then(([detail, credits, providers, recs, similar]) => {
        const castData = (credits.cast as CastMember[]).slice(0, 12)
        const results = providers.results as Record<string, WatchProviderResult>
        const { data: providerData, region } = pickProviders(results)

        // Merge recommendations + similar, deduplicate by id
        const recMovies = (recs.results as Movie[]).slice(0, 12)
        const simMovies = (similar.results as Movie[]).slice(0, 6)
        const seen = new Set(recMovies.map(m => m.id))
        const simUnique = simMovies.filter(m => !seen.has(m.id))

        setState({
          movie: detail as MovieDetail,
          cast: castData,
          providers: providerData,
          providerRegion: region,
          recommendations: recMovies,
          similar: simUnique,
          loading: false,
          error: null,
        })
      })
      .catch(() => setState(prev => ({ ...prev, loading: false, error: '영화 정보를 불러오는 데 실패했습니다.' })))
  }, [id])

  return state
}
