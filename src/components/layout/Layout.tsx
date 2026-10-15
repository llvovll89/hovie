import { House } from '@phosphor-icons/react/dist/csr/House'
import { TrendUp } from '@phosphor-icons/react/dist/csr/TrendUp'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { BookmarkSimple } from '@phosphor-icons/react/dist/csr/BookmarkSimple'
import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AuthModal from '../ui/AuthModal'
import { AuthModalContext } from '../../contexts/AuthModalContext'
import { ToastProvider } from '../../contexts/ToastContext'

const BOTTOM_TABS = [
  {
    to: '/',
    label: '홈',
    icon: <House size={22} />,
    exact: true,
  },
  {
    to: '/trending',
    label: '트렌딩',
    icon: <TrendUp size={22} />,
    exact: false,
  },
  {
    to: '/search',
    label: '탐색',
    icon: <MagnifyingGlass size={22} />,
    exact: false,
  },
  {
    to: '/watchlist',
    label: '내 목록',
    icon: <BookmarkSimple size={22} />,
    exact: false,
  },
]

function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)', height: 58, alignItems: 'stretch' }}>
      {BOTTOM_TABS.map(tab => {
        const active = tab.exact ? pathname === tab.to : (pathname === tab.to || pathname.startsWith(tab.to + '/'))
        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', color: active ? 'var(--accent)' : 'var(--text-4)', transition: 'color 0.2s' }}
          >
            {tab.icon}
            <span style={{ fontSize: 9, letterSpacing: '0.04em', fontFamily: 'Pretendard Variable, sans-serif' }}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <AuthModalContext.Provider value={{ openSignIn: () => setAuthMode('signin'), openSignUp: () => setAuthMode('signup') }}>
      <ToastProvider>
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100dvh', color: 'var(--text)' }}>
          <a className="skip-link" href="#main-content">본문 바로가기</a>
          {!/^\/(movie|tv)\//.test(pathname) && <link rel="canonical" href={'https://hovie.vercel.app' + pathname} />}
          {['/watchlist','/watched','/stats','/tonight','/lists'].includes(pathname) && <meta name="robots" content="noindex" />}
          <Navbar />
          <main id="main-content" tabIndex={-1} key={pathname} className="page-enter" style={{ paddingTop: isHome ? 0 : 72 }}>
            <Outlet />
          </main>
          <Footer />
          <BottomNav />
          {authMode && (
            <AuthModal
              mode={authMode}
              onClose={() => setAuthMode(null)}
              onSwitchMode={m => setAuthMode(m)}
            />
          )}
        </div>
      </ToastProvider>
    </AuthModalContext.Provider>
  )
}
