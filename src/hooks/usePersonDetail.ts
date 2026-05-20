import { useQuery } from '@tanstack/react-query'
import { tmdb } from '../lib/tmdb'
import type { PersonDetail, PersonCredit, PersonTVCredit } from '../types'

interface PersonDetailData {
  person: PersonDetail
  castCredits: PersonCredit[]
  crewCredits: PersonCredit[]
  tvCastCredits: PersonTVCredit[]
}

async function fetchPersonDetail(id: number): Promise<PersonDetailData> {
  const [person, credits, tvCredits] = await Promise.all([
    tmdb.person(id),
    tmdb.personCredits(id),
    tmdb.personTVCredits(id),
  ])

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

  return { person: person as PersonDetail, castCredits, crewCredits, tvCastCredits }
}

export function usePersonDetail(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPersonDetail(id),
    enabled: !!id,
  })

  return {
    person: data?.person ?? null,
    castCredits: data?.castCredits ?? [],
    crewCredits: data?.crewCredits ?? [],
    tvCastCredits: data?.tvCastCredits ?? [],
    loading: isLoading,
    error: error ? '인물 정보를 불러오는 데 실패했습니다.' : null,
  }
}
