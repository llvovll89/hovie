import type { Movie } from '../types'
export interface PickCandidate { movie: Movie; runtime: number | null; providers: number[]; providerKnown: boolean }
export function selectTonight(candidates: PickCandidate[], minutes: number, providers: number[], offset = 0) {
  const matches = candidates.filter(c => (!minutes || (c.runtime !== null && c.runtime > 0 && c.runtime <= minutes)) && (!providers.length || c.providers.some(p => providers.includes(p))))
  matches.sort((a,b) => b.movie.vote_average - a.movie.vote_average || a.movie.title.localeCompare(b.movie.title))
  if (!matches.length) return []
  const start = offset % matches.length
  return [...matches.slice(start), ...matches.slice(0,start)].slice(0,3)
}
