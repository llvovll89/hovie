import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signInWithGoogle, signOutUser, isFirebaseConfigured } from '../../lib/firebase'
import SearchDropdown from '../ui/SearchDropdown'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

const NAV_ITEMS = [
  { to: '/trending', label: 'TRENDING', desc: '이번 주 인기 영화' },
  { to: '/search',   label: 'DISCOVER', desc: '장르·필터로 탐색' },
  { to: '/watchlist',label: 'MY LIST',  desc: '내 위시리스트' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()

  const isHome = location.pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileMenuOpen(false); setSearchOpen(false) }, [location.pathname, location.search])

  function handleSignIn() {
    if (!isFirebaseConfigured) {
      alert('Firebase 설정 후 로그인이 가능합니다.\n.env 파일에 VITE_FIREBASE_* 값을 입력해 주세요.')
      return
    }
    signInWithGoogle()
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s',
      backgroundColor: transparent ? 'transparent' : 'rgba(0,0,0,0.96)',
      backdropFilter: transparent ? 'none' : 'blur(12px)',
      borderBottom: transparent ? '1px solid transparent' : '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color: '#fff' }}>
            HOV<span style={{ color: A }}>IE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} label={item.label} />)}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => { setSearchOpen(o => !o); setMobileMenuOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: searchOpen ? A : 'rgba(255,255,255,0.6)', padding: 6, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={e => { if (!searchOpen) e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { if (!searchOpen) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          {/* Auth — always visible on desktop */}
          <div className="nav-links" style={{ flex: 'none', gap: 8, justifyContent: 'flex-end' }}>
            {user ? <UserMenu user={user} /> : (
              <button
                onClick={handleSignIn}
                style={{ backgroundColor: A, color: AO, border: 'none', fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, padding: '7px 16px', cursor: 'pointer', transition: 'background-color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
              >
                SIGN IN
              </button>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="nav-mobile-menu"
            onClick={() => { setMobileMenuOpen(o => !o); setSearchOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6, flexDirection: 'column', gap: 5 }}
          >
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: mobileMenuOpen ? A : '#fff', transition: 'all 0.2s', transform: mobileMenuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: '#fff', opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: mobileMenuOpen ? A : '#fff', transition: 'all 0.2s', transform: mobileMenuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(0,0,0,0.98)', padding: '14px 20px' }}>
          <div style={{ maxWidth: 580, margin: '0 auto' }}>
            <SearchDropdown autoFocus placeholder="영화 제목을 입력하세요..." onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(0,0,0,0.98)', padding: '12px 20px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <SearchDropdown placeholder="영화 검색..." onClose={() => setMobileMenuOpen(false)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_ITEMS.map(item => <MobileNavLink key={item.to} to={item.to} label={item.label} desc={item.desc} />)}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />}
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{user.displayName}</span>
                <button onClick={signOutUser} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', fontSize: 10, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.15em' }}>
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button onClick={handleSignIn} style={{ width: '100%', backgroundColor: A, color: AO, border: 'none', padding: '12px', fontSize: 11, letterSpacing: '0.18em', fontWeight: 700, cursor: 'pointer' }}>
                Google로 로그인
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <Link
      to={to}
      style={{ fontSize: 10, letterSpacing: '0.22em', textDecoration: 'none', color: active ? A : 'rgba(255,255,255,0.55)', transition: 'color 0.2s', paddingBottom: 2, borderBottom: `1px solid ${active ? 'rgba(170,255,0,0.5)' : 'transparent'}` }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
    >
      {label}
    </Link>
  )
}

function MobileNavLink({ to, label, desc }: { to: string; label: string; desc: string }) {
  const location = useLocation()
  const active = location.pathname === to || location.pathname.startsWith(to + '/')
  return (
    <Link to={to} style={{ display: 'flex', flexDirection: 'column', padding: '12px 10px', textDecoration: 'none', borderLeft: `2px solid ${active ? A : 'transparent'}`, transition: 'all 0.2s' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.22em', color: active ? A : 'rgba(255,255,255,0.7)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{desc}</span>
    </Link>
  )
}

function UserMenu({ user }: { user: { photoURL: string | null; displayName: string | null; email: string | null } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
        {user.photoURL ? (
          <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${open ? A : 'rgba(170,255,0,0.3)'}`, transition: 'border-color 0.2s' }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: A, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: 13, fontWeight: 700 }}>
            {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
          </div>
        )}
        <svg width="10" height="10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', minWidth: 200, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: '0 0 3px' }}>{user.displayName ?? '사용자'}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ padding: '6px 0' }}>
            <Link to="/watchlist" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'rgba(255,255,255,0.65)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ color: A, fontSize: 14 }}>♡</span> 내 위시리스트
            </Link>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '6px 0' }}>
            <button onClick={() => { signOutUser(); setOpen(false) }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
