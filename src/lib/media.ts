import type { Movie } from '../types'

export type MediaType = 'movie' | 'tv'
export const mediaKey = (item: Pick<Movie, 'id' | 'mediaType'>) => `${item.mediaType ?? 'movie'}_${item.id}`
export const mediaHref = (item: Pick<Movie, 'id' | 'mediaType'>) => `/${item.mediaType ?? 'movie'}/${item.id}`
export const isResolved = (item: Movie) => !item.needsReview

export function dedupeLibrary<T extends Movie>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.needsReview ? `legacy_${item.legacyId}` : mediaKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
