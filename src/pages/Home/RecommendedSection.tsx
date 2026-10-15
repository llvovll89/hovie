import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getWatched } from '../../lib/firebase'
import { tmdb, normalizeTVShow } from '../../lib/tmdb'
import { mediaKey } from '../../lib/media'
import { readPreference, savePreference } from '../../lib/preferences'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
import type { Movie } from '../../types'
export default function RecommendedSection() {
  const { user } = useAuth()
  const [dismissed, setDismissed] = useState<string[]>(() => readPreference('hovie_dismissed', []))
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['recommended', user?.uid], enabled: !!user, queryFn: async () => {
    const watched = (await getWatched(user!.uid)).filter(m => !m.needsReview)
    const weights: Record<string, number> = {}
    watched.filter(m => m.myRating >= 4).forEach(m => m.genre_ids?.forEach(g => { const key = (m.mediaType ?? 'movie') + ':' + g; weights[key] = (weights[key] ?? 0) + m.myRating - 3 }))
    const favorites = Object.entries(weights).sort((a,b) => b[1] - a[1]).slice(0, 5)
    if (!favorites.length) return []
    const types = ['movie', 'tv'] as const
    const pool = await Promise.all(types.map(async type => {
      const genres = favorites.filter(([g]) => g.startsWith(type + ':')).map(([g]) => g.split(':')[1])
      if (!genres.length) return [] as Movie[]
      const params = { with_genres: genres.join('|'), sort_by: 'vote_average.desc', 'vote_count.gte': '200' }
      return type === 'tv' ? (await tmdb.tvDiscover(params)).results.map(normalizeTVShow) : (await tmdb.discover(params)).results
    }))
    const seen = new Set(watched.map(mediaKey))
    return pool.flat().filter(m => !seen.has(mediaKey(m))).map(m => ({ ...m, affinity: m.genre_ids.reduce((n,g) => n + (weights[(m.mediaType ?? 'movie') + ':' + g] ?? 0), 0) })).sort((a,b) => b.affinity - a.affinity || b.vote_average - a.vote_average)
  } })
  if (!user) return null
  const items = data?.filter(m => !dismissed.includes(mediaKey(m))).slice(0, 6) ?? []
  return <section className="home-section"><div className="section-heading"><div><h2>내 기록에서 찾은 다음 작품</h2><p>4점 이상 남긴 작품의 장르를 바탕으로 골랐습니다.</p></div><Link to="/watched">감상 기록</Link></div>
    {isError ? <div className="empty-state"><p>추천을 불러오지 못했습니다.</p><button className="button" onClick={() => void refetch()}>다시 시도</button></div> : isLoading ? <div className="home-movie-grid"><SkeletonCard count={6} /></div> : items.length ? <div className="home-movie-grid">{items.map(m => <div key={mediaKey(m)}><MovieCard movie={m} /><button className="text-button dismiss-button" onClick={() => { const next = [...dismissed, mediaKey(m)]; setDismissed(next); savePreference('hovie_dismissed', next) }}>관심 없음</button></div>)}</div> : <div className="empty-state"><p>{data?.length ? '추천 작품을 모두 살펴봤습니다.' : '좋았던 작품에 4점 이상 별점을 남겨보세요.'}</p>{dismissed.length > 0 && <button className="button" onClick={() => { setDismissed([]); savePreference('hovie_dismissed', []) }}>숨긴 추천 다시 보기</button>}</div>}
  </section>
}
