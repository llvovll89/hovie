import { describe, it, expect } from 'vitest'
import { IMG, normalizeTVShow } from './tmdb'
import type { TVShow } from '../types'

describe('IMG', () => {
  it('builds a poster URL with the requested size', () => {
    expect(IMG.poster('/abc.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
  })

  it('returns null when there is no poster path', () => {
    expect(IMG.poster(null)).toBeNull()
  })

  it('builds a backdrop URL with the requested size', () => {
    expect(IMG.backdrop('/xyz.jpg', 'w1280')).toBe('https://image.tmdb.org/t/p/w1280/xyz.jpg')
  })

  it('returns null when there is no backdrop path', () => {
    expect(IMG.backdrop(null)).toBeNull()
  })
})

describe('normalizeTVShow', () => {
  it('maps a TV show onto the shared Movie shape', () => {
    const show: TVShow = {
      id: 1,
      name: '더 러너',
      original_name: 'The Runner',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      vote_average: 7.5,
      vote_count: 100,
      first_air_date: '2026-01-01',
      genre_ids: [18, 35],
      overview: '설명',
      popularity: 12.3,
    }

    const movie = normalizeTVShow(show)

    expect(movie).toMatchObject({
      id: 1,
      title: '더 러너',
      original_title: 'The Runner',
      release_date: '2026-01-01',
      mediaType: 'tv',
      adult: false,
    })
  })

  it('falls back to an empty release date when first_air_date is missing', () => {
    const show = { id: 2, name: 'x', original_name: 'x', poster_path: null, backdrop_path: null, vote_average: 0, vote_count: 0, first_air_date: undefined as unknown as string, genre_ids: undefined as unknown as number[], overview: '', popularity: 0 } as TVShow
    const movie = normalizeTVShow(show)
    expect(movie.release_date).toBe('')
    expect(movie.genre_ids).toEqual([])
  })
})
