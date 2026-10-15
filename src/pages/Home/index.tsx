import { Link } from 'react-router-dom'
import Hero from './Hero'
import TrendingSection from './TrendingSection'
import RecommendedSection from './RecommendedSection'
import { useAuth } from '../../hooks/useAuth'
import { BookmarkSimple } from '@phosphor-icons/react/dist/csr/BookmarkSimple'
import { Checks } from '@phosphor-icons/react/dist/csr/Checks'
import { Shuffle } from '@phosphor-icons/react/dist/csr/Shuffle'
import { ShareNetwork } from '@phosphor-icons/react/dist/csr/ShareNetwork'
export default function Home() {
  const { user } = useAuth()
  return <>
    <title>HOVIE - 오늘 볼 영화와 TV를 찾아보세요</title>
    <meta name="description" content="한국 시청 서비스별 영화와 TV 탐색, 감상 기록, 오늘 볼 작품 추천까지 HOVIE에서 만나보세요." />
    <Hero />
    <div className="home-shortcuts">{[[BookmarkSimple, '/watchlist', '보고 싶은 작품'], [Checks, '/watched', '감상 기록'], [Shuffle, '/tonight', '오늘 볼 작품'], [ShareNetwork, '/lists', '공유 목록']] .map(([Icon, to, label]) => { const Glyph = Icon as typeof BookmarkSimple; return <Link key={String(to)} to={String(to)}><Glyph size={22} /><span>{String(label)}</span></Link> })}</div>
    <TrendingSection />
    <RecommendedSection />
    {!user && <section className="home-note"><div><h2>좋았던 영화가<br />다음 영화의 시작이 됩니다.</h2><p>작품에 별점을 남기면 감상 기록에서 취향을 찾아 추천합니다.<br />보고 싶은 작품은 목록에 모아두고, 한 편씩 만나보세요.</p></div><Link className="button" to="/watched">감상 기록 시작하기</Link></section>}
  </>
}
