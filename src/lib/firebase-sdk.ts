import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore'
import type { Comment, Movie, WatchedMovie } from '../types'
import { mediaKey, dedupeLibrary, type MediaType } from './media'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null
export const auth = app ? (() => {
  try { return initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] }) }
  catch { return getAuth(app) }
})() : null
export const db = app ? getFirestore(app) : null

const googleProvider = new GoogleAuthProvider()

/* ── Auth ──────────────────────────────── */

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase not configured')
  return signOut(auth)
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  if (!auth) throw new Error('Firebase not configured')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  return cred
}

export async function signInWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithEmailAndPassword(auth, email, password)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

/* ── Comments ──────────────────────────── */

export async function addComment(
  movieId: number, user: User, content: string, rating: number
): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await addDoc(collection(db, 'movies', String(movieId), 'comments'), {
    userId: user.uid,
    userEmail: user.email,
    userDisplayName: user.displayName ?? '익명',
    userPhotoURL: user.photoURL,
    content,
    rating,
    createdAt: serverTimestamp(),
  })
}

export async function getComments(movieId: number): Promise<Comment[]> {
  if (!db) return []
  const q = query(
    collection(db, 'movies', String(movieId), 'comments'),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      userId: data.userId,
      userEmail: data.userEmail,
      userDisplayName: data.userDisplayName,
      userPhotoURL: data.userPhotoURL,
      movieId,
      content: data.content,
      rating: data.rating,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } satisfies Comment
  })
}

type Shelf = 'watchlist' | 'watched'
function shelfDoc(userId: string, shelf: Shelf, id: number, type: MediaType) {
  if (!db) throw new Error('로그인 서비스를 사용할 수 없습니다.')
  return doc(db, 'users', userId, shelf, mediaKey({ id, mediaType: type }))
}
function moviePayload(movie: Movie) {
  return { id: movie.id, title: movie.title, original_title: movie.original_title ?? '', poster_path: movie.poster_path ?? null, backdrop_path: movie.backdrop_path ?? null, vote_average: movie.vote_average ?? 0, vote_count: movie.vote_count ?? 0, release_date: movie.release_date ?? '', overview: movie.overview ?? '', genre_ids: movie.genre_ids ?? [], popularity: movie.popularity ?? 0, adult: movie.adult ?? false, mediaType: movie.mediaType ?? 'movie' }
}
async function readShelf(userId: string, shelf: Shelf) {
  if (!db) return []
  const snap = await getDocs(query(collection(db, 'users', userId, shelf), orderBy(shelf === 'watched' ? 'watchedAt' : 'addedAt', 'desc')))
  return dedupeLibrary(snap.docs.filter(d => !d.data().migratedTo).map(d => {
    const data = d.data()
    return { ...data, legacyId: d.id, needsReview: data.mediaType !== 'movie' && data.mediaType !== 'tv', watchedAt: data.watchedAt instanceof Timestamp ? data.watchedAt.toDate() : new Date(0) } as WatchedMovie
  }).sort((a, b) => Number(a.legacyId === String(a.id)) - Number(b.legacyId === String(b.id))))
}
async function findShelfDoc(userId: string, shelf: Shelf, id: number, type: MediaType) {
  const ref = shelfDoc(userId, shelf, id, type)
  const current = await getDoc(ref)
  if (current.exists()) return current
  // Only explicitly typed legacy documents can be matched automatically.
  const legacy = await getDoc(doc(db!, 'users', userId, shelf, String(id)))
  return legacy.exists() && legacy.data().mediaType === type && !legacy.data().migratedTo ? legacy : null
}
export async function addToWatchlist(userId: string, movie: Movie) {
  const ref = shelfDoc(userId, 'watchlist', movie.id, movie.mediaType ?? 'movie')
  await runTransaction(db!, async transaction => {
    const existing = await transaction.get(ref)
    transaction.set(ref, { ...moviePayload(movie), addedAt: existing.data()?.addedAt ?? serverTimestamp() })
  })
}
export async function getWatchlist(userId: string): Promise<Movie[]> { return readShelf(userId, 'watchlist') }
export async function checkInWatchlist(userId: string, id: number, type: MediaType = 'movie') {
  if (!db) return false
  return !!(await findShelfDoc(userId, 'watchlist', id, type))
}
async function removeEntry(userId: string, shelf: Shelf, id: number, type: MediaType) {
  const current = await findShelfDoc(userId, shelf, id, type)
  const legacyRef = doc(db!, 'users', userId, shelf, String(id))
  await runTransaction(db!, async transaction => {
    const legacy = await transaction.get(legacyRef)
    if (current) transaction.delete(current.ref)
    if (legacy.exists() && legacy.data().mediaType === type) transaction.delete(legacyRef)
  })
}
export async function removeFromWatchlist(userId: string, id: number, type: MediaType = 'movie') { await removeEntry(userId, 'watchlist', id, type) }
export async function addToWatched(userId: string, movie: Movie, myRating = 0) {
  const ref = shelfDoc(userId, 'watched', movie.id, movie.mediaType ?? 'movie')
  await runTransaction(db!, async transaction => {
    const existing = await transaction.get(ref)
    transaction.set(ref, { ...moviePayload(movie), myRating, watchedAt: existing.data()?.watchedAt ?? serverTimestamp() })
  })
}
export async function getWatched(userId: string): Promise<WatchedMovie[]> { return readShelf(userId, 'watched') }
export async function removeFromWatched(userId: string, id: number, type: MediaType = 'movie') { await removeEntry(userId, 'watched', id, type) }
export async function checkInWatched(userId: string, id: number, type: MediaType = 'movie') {
  if (!db) return { inWatched: false, myRating: 0 }
  const snap = await findShelfDoc(userId, 'watched', id, type)
  return { inWatched: !!snap, myRating: snap?.data()?.myRating ?? 0 }
}
export async function updateWatchedRating(userId: string, id: number, myRating: number, type: MediaType = 'movie') {
  const snap = await findShelfDoc(userId, 'watched', id, type)
  if (!snap) throw new Error('감상 기록을 찾을 수 없습니다.')
  await updateDoc(snap.ref, { myRating })
}
export async function resolveLegacy(userId: string, shelf: Shelf, legacyId: string, type: MediaType) {
  if (!db) throw new Error('로그인이 필요합니다.')
  const oldRef = doc(db, 'users', userId, shelf, legacyId)
  await runTransaction(db, async transaction => {
    const old = await transaction.get(oldRef)
    if (!old.exists() || old.data().migratedTo) return
    const data = old.data()
    const target = shelfDoc(userId, shelf, data.id, type)
    const existing = await transaction.get(target)
    // The original document remains as a backup. Never overwrite a newer entry.
    if (!existing.exists()) transaction.set(target, { ...data, mediaType: type })
    transaction.update(oldRef, { migratedTo: target.id, resolvedAt: serverTimestamp() })
  })
}
export async function getEpisodeProgress(userId: string, showId: number, season: number): Promise<number[]> {
  if (!db) return []
  const snap = await getDoc(doc(db, 'users', userId, 'episodes', showId + '_' + season))
  return snap.data()?.watched ?? []
}
export async function setEpisodeProgress(userId: string, showId: number, season: number, episode: number, checked: boolean) {
  if (!db) throw new Error('로그인이 필요합니다.')
  const ref = doc(db, 'users', userId, 'episodes', showId + '_' + season)
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(ref)
    const watched = new Set<number>(snap.data()?.watched ?? [])
    if (checked) watched.add(episode); else watched.delete(episode)
    transaction.set(ref, { showId, season, watched: [...watched].sort((a, b) => a - b), updatedAt: serverTimestamp() })
  })
}

export async function deleteComment(movieId: number, commentId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'movies', String(movieId), 'comments', commentId))
}

/* ── TV Comments ───────────────────────────────────────────── */

export async function addTVComment(
  tvId: number, user: User, content: string, rating: number
): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await addDoc(collection(db, 'tv', String(tvId), 'comments'), {
    userId: user.uid,
    userEmail: user.email,
    userDisplayName: user.displayName ?? '익명',
    userPhotoURL: user.photoURL,
    content,
    rating,
    createdAt: serverTimestamp(),
  })
}

export async function deleteTVComment(tvId: number, commentId: string): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'tv', String(tvId), 'comments', commentId))
}

export async function getTVComments(tvId: number): Promise<Comment[]> {
  if (!db) return []
  const q = query(
    collection(db, 'tv', String(tvId), 'comments'),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => {
    const data = d.data()
    return {
      id: d.id,
      userId: data.userId,
      userEmail: data.userEmail,
      userDisplayName: data.userDisplayName,
      userPhotoURL: data.userPhotoURL,
      movieId: tvId,
      content: data.content,
      rating: data.rating,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } satisfies Comment
  })
}
