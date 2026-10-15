import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Star } from '@phosphor-icons/react/dist/csr/Star'
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { tmdb, IMG } from '../../lib/tmdb'
import SearchDropdown from '../../components/ui/SearchDropdown'
export default function Hero() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['home-trending', 'movie'], queryFn: async () => (await tmdb.trending('week')).results })
  const movie = data?.find(m => m.backdrop_path)
  return <section className="home-hero"><div className="hero-intro"><h1>오늘은 어떤 이야기를<br />만나볼까요?</h1><p>볼 작품을 찾고, 어디서 보는지 확인하고,<br className="desktop-break" /> 나만의 감상을 남겨보세요.</p><SearchDropdown size="lg" /><div className="hero-quick-links"><Link to="/search">조건으로 탐색</Link><Link to="/tonight">오늘 볼 작품 고르기 <ArrowUpRight size={16} /></Link></div></div>
    <div className="hero-feature">{isLoading ? <><div className="skeleton hero-image" /><div className="feature-caption" style={{ minHeight: 77 }} aria-hidden="true" /></> : movie ? <><Link to={'/movie/' + movie.id} className="hero-image" aria-label={movie.title + ' 상세 보기'}><img src={IMG.backdrop(movie.backdrop_path, 'w1280')!} srcSet={IMG.backdrop(movie.backdrop_path, 'w780') + ' 780w, ' + IMG.backdrop(movie.backdrop_path, 'w1280') + ' 1280w'} sizes="(max-width: 767px) 100vw, 58vw" alt={movie.title + ' 스틸컷'} fetchPriority="high" width="1280" height="720" /><span className="feature-play"><ArrowUpRight size={25} /></span></Link><div className="feature-caption"><div><span className="feature-kicker">이번 주 주목할 작품</span><Link to={'/movie/' + movie.id}><h2>{movie.title}</h2></Link></div><span className="feature-rating"><Star weight="fill" size={17} />{movie.vote_average.toFixed(1)}<small>TMDB</small></span></div></> : <div className="empty-state"><p>{isError ? '대표 작품을 불러오지 못했습니다.' : '대표 작품을 준비하고 있습니다.'}</p><button className="button" onClick={() => void refetch()}>다시 시도</button></div>}</div>
  </section>
}
