// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
const memory = vi.hoisted(() => new Map<string, Record<string, unknown>>())
vi.mock('firebase/app', () => ({ initializeApp: () => ({}), getApps: () => [], getApp: () => ({}) }))
vi.mock('firebase/auth', () => ({ getAuth: () => ({}), initializeAuth: () => ({}), indexedDBLocalPersistence: {}, browserLocalPersistence: {}, browserPopupRedirectResolver: {}, GoogleAuthProvider: class {}, signInWithPopup: vi.fn(), signOut: vi.fn(), onAuthStateChanged: vi.fn(), createUserWithEmailAndPassword: vi.fn(), signInWithEmailAndPassword: vi.fn(), updateProfile: vi.fn() }))
vi.mock('firebase/firestore', () => {
  class Timestamp { toDate() { return new Date('2026-10-15T00:00:00Z') } }
  const snapshot = (ref: { path: string }) => ({ ref, id: ref.path.split('/').at(-1), exists: () => memory.has(ref.path), data: () => memory.has(ref.path) ? { ...memory.get(ref.path) } : undefined })
  return { getFirestore: () => ({}), Timestamp, serverTimestamp: () => new Timestamp(),
    doc: (_db: unknown, ...parts: string[]) => ({ path: parts.join('/'), id: parts.at(-1) }), collection: (_db: unknown, ...parts: string[]) => ({ path: parts.join('/') }),
    query: (ref: unknown) => ref, orderBy: vi.fn(), getDoc: async (ref: { path: string }) => snapshot(ref),
    getDocs: async (ref: { path: string }) => ({ docs: [...memory.keys()].filter(p => p.startsWith(ref.path + '/') && p.split('/').length === ref.path.split('/').length + 1).map(path => snapshot({ path })) }),
    updateDoc: async (ref: { path: string }, data: Record<string, unknown>) => { memory.set(ref.path, { ...memory.get(ref.path), ...data }) },
    deleteDoc: vi.fn(), addDoc: vi.fn(),
    runTransaction: async (_db: unknown, operation: (t: unknown) => Promise<void>) => { const pending: (() => void)[] = []; await operation({ get: async (ref: { path: string }) => snapshot(ref), set: (ref: { path: string }, data: Record<string, unknown>) => pending.push(() => { memory.set(ref.path, data) }), update: (ref: { path: string }, data: Record<string, unknown>) => pending.push(() => { memory.set(ref.path, { ...memory.get(ref.path), ...data }) }), delete: (ref: { path: string }) => pending.push(() => { memory.delete(ref.path) }) }); pending.forEach(write => write()) },
  }
})
let storage: typeof import('./firebase')
beforeAll(async () => {
  for (const key of ['API_KEY','AUTH_DOMAIN','PROJECT_ID','STORAGE_BUCKET','MESSAGING_SENDER_ID','APP_ID']) vi.stubEnv('VITE_FIREBASE_' + key, 'test')
  storage = await import('./firebase')
})
beforeEach(() => memory.clear())
const movie = { id: 42, title: '테스트 작품', original_title: '', poster_path: null, backdrop_path: null, vote_average: 8, vote_count: 100, release_date: '2026-01-01', genre_ids: [18], overview: '', popularity: 1, adult: false }
describe('library persistence with Firestore transaction double', () => {
  it('saves, rates, and deletes the same ID independently for movie and TV', async () => {
    await storage.addToWatchlist('user', movie); await storage.addToWatchlist('user', { ...movie, mediaType: 'tv' })
    expect(await storage.getWatchlist('user')).toHaveLength(2)
    await storage.removeFromWatchlist('user', 42, 'movie')
    expect(await storage.checkInWatchlist('user',42,'movie')).toBe(false)
    expect(await storage.checkInWatchlist('user',42,'tv')).toBe(true)
    await storage.addToWatched('user', movie, 3); await storage.addToWatched('user', { ...movie, mediaType:'tv' }, 5)
    await storage.updateWatchedRating('user',42,4,'movie')
    expect((await storage.checkInWatched('user',42,'movie')).myRating).toBe(4)
    expect((await storage.checkInWatched('user',42,'tv')).myRating).toBe(5)
    await storage.removeFromWatched('user',42,'movie')
    expect((await storage.getWatched('user'))[0].mediaType).toBe('tv')
  })
  it('keeps unknown legacy media unresolved until the user chooses, and preserves its backup', async () => {
    memory.set('users/user/watchlist/42', { ...movie, addedAt: 'original-date' })
    expect((await storage.getWatchlist('user'))[0].needsReview).toBe(true)
    expect(await storage.checkInWatchlist('user',42,'movie')).toBe(false)
    await storage.resolveLegacy('user','watchlist','42','tv')
    expect(memory.get('users/user/watchlist/42')).toMatchObject({ title: movie.title, migratedTo:'tv_42' })
    expect(await storage.getWatchlist('user')).toMatchObject([{ mediaType:'tv', addedAt:'original-date' }])
    await storage.removeFromWatchlist('user',42,'tv')
    expect(await storage.getWatchlist('user')).toEqual([])
    expect(memory.has('users/user/watchlist/42')).toBe(true)
  })
  it('never overwrites a newer entry while resolving old data', async () => {
    memory.set('users/user/watched/42', { ...movie, myRating:1, watchedAt:'old' })
    await storage.addToWatched('user', { ...movie, mediaType:'tv' },5)
    await storage.resolveLegacy('user','watched','42','tv')
    expect((await storage.checkInWatched('user',42,'tv')).myRating).toBe(5)
  })
  it('adds and removes episode checks without duplicate IDs', async () => {
    await storage.setEpisodeProgress('user',42,1,3,true); await storage.setEpisodeProgress('user',42,1,3,true)
    await storage.setEpisodeProgress('user',42,1,1,true)
    expect(await storage.getEpisodeProgress('user',42,1)).toEqual([1,3])
    await storage.setEpisodeProgress('user',42,1,3,false)
    expect(await storage.getEpisodeProgress('user',42,1)).toEqual([1])
  })
})
