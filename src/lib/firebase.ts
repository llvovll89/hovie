import type { User } from 'firebase/auth'
type SDK = typeof import('./firebase-sdk')
export const isFirebaseConfigured = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_MESSAGING_SENDER_ID','VITE_FIREBASE_APP_ID'].every(key => !!import.meta.env[key])
let pending: Promise<SDK> | undefined
const load = () => pending ??= import('./firebase-sdk').catch(error => { pending = undefined; throw error })
export function onAuthChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured) { callback(null); return () => {} }
  let active = true
  let unsubscribe: (() => void) | undefined
  void load().then(sdk => { if (active) unsubscribe = sdk.onAuthChange(callback) }).catch(() => { if (active) callback(null) })
  return () => { active = false; unsubscribe?.() }
}
export const signInWithGoogle: SDK['signInWithGoogle'] = (...args) => load().then(sdk => sdk.signInWithGoogle(...args))
export const signOutUser: SDK['signOutUser'] = (...args) => load().then(sdk => sdk.signOutUser(...args))
export const signUpWithEmail: SDK['signUpWithEmail'] = (...args) => load().then(sdk => sdk.signUpWithEmail(...args))
export const signInWithEmail: SDK['signInWithEmail'] = (...args) => load().then(sdk => sdk.signInWithEmail(...args))
export const addComment: SDK['addComment'] = (...args) => load().then(sdk => sdk.addComment(...args))
export const getComments: SDK['getComments'] = (...args) => load().then(sdk => sdk.getComments(...args))
export const addToWatchlist: SDK['addToWatchlist'] = (...args) => load().then(sdk => sdk.addToWatchlist(...args))
export const getWatchlist: SDK['getWatchlist'] = (...args) => load().then(sdk => sdk.getWatchlist(...args))
export const checkInWatchlist: SDK['checkInWatchlist'] = (...args) => load().then(sdk => sdk.checkInWatchlist(...args))
export const removeFromWatchlist: SDK['removeFromWatchlist'] = (...args) => load().then(sdk => sdk.removeFromWatchlist(...args))
export const addToWatched: SDK['addToWatched'] = (...args) => load().then(sdk => sdk.addToWatched(...args))
export const getWatched: SDK['getWatched'] = (...args) => load().then(sdk => sdk.getWatched(...args))
export const removeFromWatched: SDK['removeFromWatched'] = (...args) => load().then(sdk => sdk.removeFromWatched(...args))
export const checkInWatched: SDK['checkInWatched'] = (...args) => load().then(sdk => sdk.checkInWatched(...args))
export const updateWatchedRating: SDK['updateWatchedRating'] = (...args) => load().then(sdk => sdk.updateWatchedRating(...args))
export const resolveLegacy: SDK['resolveLegacy'] = (...args) => load().then(sdk => sdk.resolveLegacy(...args))
export const getEpisodeProgress: SDK['getEpisodeProgress'] = (...args) => load().then(sdk => sdk.getEpisodeProgress(...args))
export const setEpisodeProgress: SDK['setEpisodeProgress'] = (...args) => load().then(sdk => sdk.setEpisodeProgress(...args))
export const deleteComment: SDK['deleteComment'] = (...args) => load().then(sdk => sdk.deleteComment(...args))
export const addTVComment: SDK['addTVComment'] = (...args) => load().then(sdk => sdk.addTVComment(...args))
export const deleteTVComment: SDK['deleteTVComment'] = (...args) => load().then(sdk => sdk.deleteTVComment(...args))
export const getTVComments: SDK['getTVComments'] = (...args) => load().then(sdk => sdk.getTVComments(...args))
