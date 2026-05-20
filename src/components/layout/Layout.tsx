import { useState } from 'react'
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
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    exact: true,
  },
  {
    to: '/trending',
    label: '트렌딩',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    exact: false,
  },
  {
    to: '/search',
    label: '탐색',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" strokeLinecap="round" />
      </svg>
    ),
    exact: false,
  },
  {
    to: '/watchlist',
    label: '내 목록',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
      </svg>
    ),
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
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', color: active ? 'var(--accent)' : 'var(--text-4)', transition: 'color 0.2s' }}
          >
            {tab.icon}
            <span style={{ fontSize: 9, letterSpacing: '0.04em', fontFamily: 'Inter, sans-serif' }}>{tab.label}</span>
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

  return (
    <AuthModalContext.Provider value={{ openSignIn: () => setAuthMode('signin'), openSignUp: () => setAuthMode('signup') }}>
      <ToastProvider>
        <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
          <Navbar />
          <main key={pathname} className="page-enter" style={{ paddingTop: isHome ? 0 : 68 }}>
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
