import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { List } from '@phosphor-icons/react/dist/csr/List'
import { X } from '@phosphor-icons/react/dist/csr/X'
import { Sun } from '@phosphor-icons/react/dist/csr/Sun'
import { Moon } from '@phosphor-icons/react/dist/csr/Moon'
import { UserCircle } from '@phosphor-icons/react/dist/csr/UserCircle'
import { SignOut } from '@phosphor-icons/react/dist/csr/SignOut'
import { useAuth } from '../../hooks/useAuth'
import { signOutUser } from '../../lib/firebase'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'
import SearchDropdown from '../ui/SearchDropdown'
import Brand from '../ui/Brand'
const ITEMS = [['/trending', '트렌딩'], ['/upcoming', '개봉 예정'], ['/compare', '작품 비교'], ['/search', '탐색'], ['/watchlist', '내 목록']]
export default function Navbar() {
  const { pathname, search } = useLocation()
  return <Navigation key={pathname + search} pathname={pathname} />
}
function Navigation({ pathname }: { pathname: string }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const { openSignIn, openSignUp } = useAuthModal()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  return <header className="site-header"><nav className="navbar" aria-label="주 메뉴">
    <Link to="/" className="wordmark" aria-label="HOVIE 홈"><Brand /></Link>
    <div className="desktop-nav">{ITEMS.map(([to, label]) => <Link key={to} to={to} aria-current={pathname === to ? 'page' : undefined}>{label}</Link>)}</div>
    <div className="nav-actions">
      <button className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}>{theme === 'dark' ? <Sun size={21} /> : <Moon size={21} />}</button>
      <button className="icon-button" aria-label="검색 열기" aria-expanded={searchOpen} aria-controls="nav-search" onClick={() => { setSearchOpen(v => !v); setMenuOpen(false) }}><MagnifyingGlass size={21} /></button>
      <button className="icon-button mobile-only" aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menuOpen} aria-controls="nav-menu" onClick={() => { setMenuOpen(v => !v); setSearchOpen(false) }}>{menuOpen ? <X size={23} /> : <List size={23} />}</button>
      <div className="desktop-auth">{user ? <button className="button" aria-expanded={menuOpen} aria-controls="nav-menu" onClick={() => setMenuOpen(v => !v)}><UserCircle size={20} />{user.displayName ?? '내 계정'}</button> : <><button className="text-button" onClick={openSignIn}>로그인</button><button className="button primary" onClick={openSignUp}>회원가입</button></>}</div>
    </div>
  </nav>
    {searchOpen && <div id="nav-search" className="nav-panel"><SearchDropdown autoFocus onClose={() => setSearchOpen(false)} /></div>}
    {menuOpen && <div id="nav-menu" className="nav-menu"><div className="mobile-nav-links">{ITEMS.map(([to,label]) => <Link key={to} to={to}>{label}</Link>)}</div><Link to="/watched">감상 기록</Link><Link to="/stats">시청 통계</Link><Link to="/tonight">오늘 볼 작품</Link><Link to="/lists">공유 목록 만들기</Link>{user ? <button className="text-button" onClick={() => { void signOutUser().catch(() => showToast('로그아웃하지 못했습니다.', 'error')) }}><SignOut size={18} />로그아웃</button> : <div className="action-row"><button className="button" onClick={openSignIn}>로그인</button><button className="button primary" onClick={openSignUp}>회원가입</button></div>}</div>}
  </header>
}
