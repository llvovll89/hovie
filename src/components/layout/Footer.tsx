import { Link } from 'react-router-dom'
import Brand from '../ui/Brand'
export default function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><div><Link to="/" className="wordmark" aria-label="HOVIE 홈"><Brand /></Link><p>발견한 작품을 나만의 기록으로.</p></div><div className="footer-links"><Link to="/about">서비스 안내</Link><Link to="/tonight">오늘 볼 작품</Link><Link to="/lists">공유 목록</Link><a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a><a href="https://www.justwatch.com/kr" target="_blank" rel="noopener noreferrer">JustWatch</a></div><p className="attribution">영화·TV 정보: TMDB / 시청 서비스 정보: JustWatch<br />This product uses the TMDB API but is not endorsed or certified by TMDB.</p></div></footer>
}
