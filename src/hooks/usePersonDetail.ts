import { useState, useEffect } from 'react'
import { tmdb } from '../lib/tmdb'
import type { PersonDetail, PersonCredit, PersonTVCredit } from '../types'

interface PersonDetailState {
  person: PersonDetail | null
  castCredits: PersonCredit[]
  crewCredits: PersonCredit[]
  tvCastCredits: PersonTVCredit[]
  loading: boolean
  error: string | null
}

export function usePersonDetail(id: number): PersonDetailState {
  const [state, setState] = useState<PersonDetailState>({
    person: null, castCredits: [], crewCredits: [], tvCastCredits: [], loading: true, error: null,
  })

  useEffect(() => {
    if (!id) return
    setState(prev => ({ ...prev, loading: true, error: null }))

    Promise.all([tmdb.person(id), tmdb.personCredits(id), tmdb.personTVCredits(id)])
      .then(([person, credits, tvCredits]) => {
        const castCredits = (credits.cast as PersonCredit[])
          .filter(c => c.release_date)
          .sort((a, b) => b.release_date.localeCompare(a.release_date))

        const seen = new Set<number>()
        const crewCredits = (credits.crew as PersonCredit[])
          .filter(c => c.release_date && c.job === 'Director' && !seen.has(c.id) && seen.add(c.id))
          .sort((a, b) => b.release_date.localeCompare(a.release_date))

        const tvCastCredits = (tvCredits.cast as PersonTVCredit[])
          .filter(c => c.first_air_date)
          .sort((a, b) => b.first_air_date.localeCompare(a.first_air_date))

        setState({ person: person as PersonDetail, castCredits, crewCredits, tvCastCredits, loading: false, error: null })
      })
      .catch(() => setState(prev => ({ ...prev, loading: false, error: '인물 정보를 불러오는 데 실패했습니다.' })))
  }, [id])

  return state
}
