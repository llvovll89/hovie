import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOutUser } from '../../lib/firebase'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { useTheme } from '../../contexts/ThemeContext'
import SearchDropdown from '../ui/SearchDropdown'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

const NAV_ITEMS = [
  { to: '/trending', label: 'TRENDING', desc: '이번 주 인기 영화' },
  { to: '/upcoming', label: 'UPCOMING', desc: '개봉 예정작' },
  { to: '/compare',  label: 'COMPARE',  desc: '영화 비교' },
  { to: '/search',   label: 'DISCOVER', desc: '장르·필터로 탐색' },
  { to: '/watchlist',label: 'MY LIST',  desc: '내 위시리스트' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const location = useLocation()
  const { openSignIn, openSignUp } = useAuthModal()
  const { theme, toggleTheme } = useTheme()

  const isHome = location.pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileMenuOpen(false); setSearchOpen(false) }, [location.pathname, location.search])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s',
      backgroundColor: transparent ? 'transparent' : 'var(--nav-bg)',
      backdropFilter: transparent ? 'none' : 'blur(12px)',
      borderBottom: transparent ? '1px solid transparent' : '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text)' }}>
            HOV<span style={{ color: A }}>IE</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} label={item.label} />)}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 6, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-2)')}
          >
            {theme === 'dark' ? (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => { setSearchOpen(o => !o); setMobileMenuOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: searchOpen ? A : 'var(--text-2)', padding: 6, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
            onMouseEnter={e => { if (!searchOpen) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (!searchOpen) e.currentTarget.style.color = 'var(--text-2)' }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>

          {/* Auth — desktop */}
          <div className="nav-links" style={{ flex: 'none', gap: 8, justifyContent: 'flex-end' }}>
            {user ? <UserMenu user={user} /> : (
              <>
                <button
                  onClick={openSignIn}
                  style={{ background: 'none', border: '1px solid var(--border-4)', color: 'var(--text-2)', fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-2)'; e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-4)'; e.currentTarget.style.color = 'var(--text-2)' }}
                >SIGN IN</button>
                <button
                  onClick={openSignUp}
                  style={{ backgroundColor: A, color: AO, border: 'none', fontSize: 10, letterSpacing: '0.18em', fontWeight: 700, padding: '7px 16px', cursor: 'pointer', transition: 'background-color 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
                >SIGN UP</button>
              </>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="nav-mobile-menu"
            onClick={() => { setMobileMenuOpen(o => !o); setSearchOpen(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 6, flexDirection: 'column', gap: 5 }}
          >
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: mobileMenuOpen ? A : 'var(--text)', transition: 'all 0.2s', transform: mobileMenuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: 'var(--text)', opacity: mobileMenuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <span style={{ display: 'block', width: 22, height: 1.5, backgroundColor: mobileMenuOpen ? A : 'var(--text)', transition: 'all 0.2s', transform: mobileMenuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--nav-panel)', padding: '14px 20px' }}>
          <div style={{ maxWidth: 580, margin: '0 auto' }}>
            <SearchDropdown autoFocus placeholder="영화 제목을 입력하세요..." onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--nav-panel)', padding: '12px 20px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <SearchDropdown placeholder="영화 검색..." onClose={() => setMobileMenuOpen(false)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_ITEMS.map(item => <MobileNavLink key={item.to} to={item.to} label={item.label} desc={item.desc} />)}
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {/* Theme toggle in mobile */}
            <button onClick={toggleTheme}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', color: 'var(--text-2)', padding: '10px 0', cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em', marginBottom: 10 }}
            >
              {theme === 'dark'
                ? <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" /></svg>
                : <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              }
              {theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            </button>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />}
                  <span style={{ fontSize: 13, color: 'var(--text-2)', flex: 1 }}>{user.displayName}</span>
                  <button onClick={signOutUser} style={{ background: 'none', border: '1px solid var(--border-4)', color: 'var(--text-3)', fontSize: 10, padding: '5px 12px', cursor: 'pointer', letterSpacing: '0.15em' }}>
                    SIGN OUT
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link to="/watchlist" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontSize: 11, letterSpacing: '0.08em', textDecoration: 'none', transition: 'all 0.2s', minWidth: 90 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.color = A }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
                  >
                    <span>♡</span> 위시리스트
                  </Link>
                  <Link to="/watched" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontSize: 11, letterSpacing: '0.08em', textDecoration: 'none', transition: 'all 0.2s', minWidth: 90 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.color = A }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
                  >
                    <span>👁</span> 시청 완료
                  </Link>
                  <Link to="/stats" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontSize: 11, letterSpacing: '0.08em', textDecoration: 'none', transition: 'all 0.2s', minWidth: 90 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.color = A }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-3)' }}
                  >
                    <span>📊</span> 통계
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={openSignIn} style={{ flex: 1, background: 'none', border: '1px solid var(--border-4)', color: 'var(--text)', padding: '11px', fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, cursor: 'pointer' }}>
                  SIGN IN
                </button>
                <button onClick={openSignUp} style={{ flex: 1, backgroundColor: A, color: AO, border: 'none', padding: '11px', fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, cursor: 'pointer' }}>
                  SIGN UP
                </button>
              </div>
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
      style={{ fontSize: 10, letterSpacing: '0.22em', textDecoration: 'none', color: active ? A : 'var(--text-2)', transition: 'color 0.2s', paddingBottom: 2, borderBottom: `1px solid ${active ? 'rgba(0,153,255,0.5)' : 'transparent'}` }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)' }}
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
      <span style={{ fontSize: 11, letterSpacing: '0.22em', color: active ? A : 'var(--text-2)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{desc}</span>
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
          <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${open ? A : 'rgba(0,153,255,0.3)'}`, transition: 'border-color 0.2s' }} />
        ) : (
          <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: A, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-on)', fontSize: 13, fontWeight: 700 }}>
            {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
          </div>
        )}
        <svg width="10" height="10" fill="none" stroke="var(--text-4)" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-2)', minWidth: 200, zIndex: 200, boxShadow: `0 8px 32px var(--shadow)` }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', margin: '0 0 3px' }}>{user.displayName ?? '사용자'}</p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>{user.email}</p>
          </div>
          <div style={{ padding: '6px 0' }}>
            <Link to="/watchlist" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'var(--text-2)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ color: A, fontSize: 14 }}>♡</span> 내 위시리스트
            </Link>
            <Link to="/watched" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'var(--text-2)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ color: A, fontSize: 14 }}>👁</span> 시청 완료
            </Link>
            <Link to="/stats" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', textDecoration: 'none', color: 'var(--text-2)', fontSize: 13, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ color: A, fontSize: 14 }}>📊</span> 시청 통계
            </Link>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
            <button onClick={() => { signOutUser(); setOpen(false) }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
