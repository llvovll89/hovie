import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { Comment, Movie } from '../types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean)

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

const googleProvider = new GoogleAuthProvider()

/* ── Auth ──────────────────────────────── */

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithPopup(auth, googleProvider)
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase not configured')
  return signOut(auth)
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

/* ── Watchlist ─────────────────────────── */

export async function addToWatchlist(userId: string, movie: Movie): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await setDoc(doc(db, 'users', userId, 'watchlist', String(movie.id)), {
    id: movie.id,
    title: movie.title,
    original_title: movie.original_title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    release_date: movie.release_date,
    overview: movie.overview,
    genre_ids: movie.genre_ids ?? [],
    popularity: movie.popularity ?? 0,
    adult: movie.adult ?? false,
    addedAt: serverTimestamp(),
  })
}

export async function removeFromWatchlist(userId: string, movieId: number): Promise<void> {
  if (!db) throw new Error('Firebase not configured')
  await deleteDoc(doc(db, 'users', userId, 'watchlist', String(movieId)))
}

export async function getWatchlist(userId: string): Promise<Movie[]> {
  if (!db) return []
  const q = query(
    collection(db, 'users', userId, 'watchlist'),
    orderBy('addedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => d.data() as Movie)
}

export async function checkInWatchlist(userId: string, movieId: number): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'users', userId, 'watchlist', String(movieId)))
  return snap.exists()
}
