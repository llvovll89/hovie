import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { tmdb, normalizeTVShow } from '../../lib/tmdb'
import { mediaKey } from '../../lib/media'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'
export default function TrendingSection() {
  const [type, setType] = useState<'movie' | 'tv'>('movie')
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['home-trending', type], queryFn: async () => type === 'tv' ? (await tmdb.tvTrending()).results.map(normalizeTVShow) : (await tmdb.trending()).results })
  return <section className="home-section"><div className="section-heading"><h2>지금 많이 찾는 작품</h2><div className="section-actions"><div className="segmented"><button aria-pressed={type === 'movie'} className={type === 'movie' ? 'selected' : ''} onClick={() => setType('movie')}>영화</button><button aria-pressed={type === 'tv'} className={type === 'tv' ? 'selected' : ''} onClick={() => setType('tv')}>TV</button></div><Link to="/trending">트렌딩 전체 보기</Link></div></div>
    {isError ? <div className="empty-state"><p>인기 작품을 불러오지 못했습니다.</p><button className="button" onClick={() => void refetch()}>다시 시도</button></div> : <div className="home-movie-grid">{isLoading ? <SkeletonCard count={6} /> : data?.slice(0, 6).map((m,i) => <MovieCard key={mediaKey(m)} movie={m} rank={i + 1} />)}</div>}
  </section>
}
