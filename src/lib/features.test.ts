// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mediaKey, mediaHref, dedupeLibrary } from './media'
import { discoverParams } from './search'
import { encodeList, decodeList, type SharedList } from './share'
import { selectTonight } from './tonight'
import { request, tmdb, TMDBError } from './tmdb'
import type { Movie, SearchFilters } from '../types'
const movie: Movie = { id: 42, title: '같은 ID', original_title: '', poster_path: null, backdrop_path: null, vote_average: 8, vote_count: 30, release_date: '', genre_ids: [], overview: '', popularity: 1, adult: false }
const filters: SearchFilters = { genre: 18, year: '2026', minRating: 7, sortBy: 'release_date.desc', runtime: '90~120', language: 'ko', providers: '8|337' }
afterEach(() => vi.unstubAllGlobals())
describe('media identity and legacy preservation', () => {
  it('keeps a movie and TV series with the same ID independent', () => { expect(mediaKey(movie)).toBe('movie_42'); expect(mediaKey({ ...movie, mediaType: 'tv' })).toBe('tv_42'); expect(mediaHref({ ...movie, mediaType: 'tv' })).toBe('/tv/42'); expect(dedupeLibrary([movie, { ...movie, mediaType: 'tv' }, movie])).toHaveLength(2) })
  it('does not silently merge unresolved legacy data into movie data', () => expect(dedupeLibrary([movie, { ...movie, needsReview: true, legacyId: '42' }])).toHaveLength(2))
})
describe('API filter semantics', () => {
  it('uses region and OR service selection for subscriptions', () => expect(discoverParams(filters, 'movie', 2)).toMatchObject({ page: '2', sort_by: 'primary_release_date.desc', watch_region: 'KR', with_watch_providers: '8|337', with_watch_monetization_types: 'flatrate', 'with_runtime.gte': '90', 'with_runtime.lte': '120', primary_release_year: '2026' }))
  it('maps TV year and sorting, and omits movie runtime', () => { const p = discoverParams(filters, 'tv', 1); expect(p.sort_by).toBe('first_air_date.desc'); expect(p.first_air_date_year).toBe('2026'); expect(p['with_runtime.gte']).toBeUndefined(); expect(p.primary_release_year).toBeUndefined() })
  it('passes cancellation to fetch and distinguishes authentication failures', async () => { const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 401 })); vi.stubGlobal('fetch', fetch); const controller = new AbortController(); await expect(request('/movie/42', {}, controller.signal)).rejects.toBeInstanceOf(TMDBError); expect(fetch.mock.calls[0][1].signal).toBe(controller.signal) })
  it('includes language-neutral images and supports multi search', async () => { const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ results: [] }))); vi.stubGlobal('fetch',fetch); await tmdb.images(42); expect(String(fetch.mock.calls[0][0])).toContain('include_image_language=ko%2Cen%2Cnull'); await tmdb.multiSearch('배우'); expect(String(fetch.mock.calls[1][0])).toContain('/search/multi?') })
})
describe('share snapshots', () => {
  const list: SharedList = { version: 1, title: '오늘 함께 볼 영화 🎬', description: '추천 <script>도 텍스트로', items: [{ id: 42, mediaType: 'movie' }, { id: 42, mediaType: 'tv' }] }
  it('round-trips Korean text and preserves movie/TV identity', () => expect(decodeList(encodeList(list))).toEqual(list))
  it('rejects malformed links, unsupported types, and oversized lists', () => { expect(() => decodeList('broken')).toThrow(); expect(() => decodeList(encodeList({ ...list, items: [{ id: -2, mediaType: 'movie' }] }))).toThrow(); expect(() => decodeList(encodeList({ ...list, items: Array.from({length:25},() => ({id:1,mediaType:'movie'})) }))).toThrow() })
})
describe('tonight selection', () => {
  const candidates = [{ movie, runtime: 115, providers: [8], providerKnown: true }, { movie: { ...movie, id: 43 }, runtime: null, providers: [8], providerKnown: true }, { movie: { ...movie, id: 44 }, runtime: 95, providers: [337], providerKnown: true }]
  it('requires known duration and selected service when constrained', () => expect(selectTonight(candidates,120,[8]).map(c => c.movie.id)).toEqual([42]))
  it('includes unknown duration only without a time constraint', () => expect(selectTonight(candidates,0,[])).toHaveLength(3))
  it('returns no false matches and can rotate candidates', () => { expect(selectTonight(candidates,60,[8])).toEqual([]); expect(selectTonight(candidates,0,[],1)[0].movie.id).not.toBe(selectTonight(candidates,0,[],0)[0].movie.id) })
})
