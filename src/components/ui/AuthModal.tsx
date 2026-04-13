import { useState } from 'react'
import { signInWithGoogle, signUpWithEmail, signInWithEmail, isFirebaseConfigured } from '../../lib/firebase'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

interface Props {
  mode: 'signin' | 'signup'
  onClose: () => void
  onSwitchMode: (mode: 'signin' | 'signup') => void
}

interface Checks {
  len: boolean
  upper: boolean
  lower: boolean
  num: boolean
  special: boolean
}

function getChecks(pw: string): Checks {
  return {
    len:     pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    num:     /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  }
}

function strengthScore(c: Checks) {
  return [c.len, c.upper, c.lower, c.num, c.special].filter(Boolean).length
}

const STRENGTH_LABEL = ['', '매우 약함', '약함', '보통', '강함', '매우 강함']
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#eab308', '#09f', '#22c55e']

const REQ_ITEMS: { key: keyof Checks; label: string }[] = [
  { key: 'len',     label: '8자 이상' },
  { key: 'upper',   label: '대문자 포함' },
  { key: 'lower',   label: '소문자 포함' },
  { key: 'num',     label: '숫자 포함' },
  { key: 'special', label: '특수문자 포함 (!@#$...)' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-3)',
  color: 'var(--text)',
  padding: '11px 42px 11px 14px',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s',
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  )
}

export default function AuthModal({ mode, onClose, onSwitchMode }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const checks = getChecks(password)
  const score = strengthScore(checks)
  const pwTouched = password.length > 0

  async function handleGoogle() {
    if (!isFirebaseConfigured) {
      setError('Firebase 설정 후 로그인이 가능합니다. .env 파일을 확인해 주세요.')
      return
    }
    try {
      setLoading(true)
      await signInWithGoogle()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFirebaseConfigured) {
      setError('Firebase 설정 후 이용이 가능합니다. .env 파일을 확인해 주세요.')
      return
    }
    setError('')

    if (mode === 'signup') {
      if (!name.trim()) { setError('이름을 입력해 주세요.'); return }
      if (score < 3) { setError('보안을 위해 비밀번호를 더 강하게 설정해 주세요.'); return }
      if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    }

    try {
      setLoading(true)
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name.trim())
      } else {
        await signInWithEmail(email, password)
      }
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '오류가 발생했습니다.'
      if (msg.includes('email-already-in-use')) setError('이미 사용 중인 이메일입니다.')
      else if (msg.includes('weak-password')) setError('비밀번호는 8자 이상이어야 합니다.')
      else if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      else setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 440, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-2)', padding: '40px 36px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close */}
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >×</button>

        {/* Header */}
        <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', marginBottom: 10, textTransform: 'uppercase' }}>
          {mode === 'signup' ? 'Join Hovie' : 'Welcome Back'}
        </p>
        <h2 style={{ fontfontSize: 24, fontWeight: 700, margin: '0 0 28px', color: 'var(--text)' }}>
          {mode === 'signup' ? '무료로 시작하기' : '로그인'}
        </h2>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', color: '#000', border: 'none', padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, transition: 'opacity 0.2s', opacity: loading ? 0.6 : 1 }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.6' : '1' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Google로 {mode === 'signup' ? '가입하기' : '로그인'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-2)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.1em' }}>OR</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-2)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <input
              type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} required
              style={{ ...inputStyle, padding: '11px 14px' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,153,255,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
            />
          )}

          <input
            type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ ...inputStyle, padding: '11px 14px' }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,153,255,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
          />

          {/* Password with eye toggle */}
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder={mode === 'signup' ? '비밀번호 (8자 이상)' : '비밀번호'}
              value={password} onChange={e => setPassword(e.target.value)} required
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,153,255,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
            ><EyeIcon open={showPw} /></button>
          </div>

          {/* Password strength — signup only */}
          {mode === 'signup' && pwTouched && (
            <div style={{ marginTop: -4 }}>
              {/* Strength bar */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= score ? STRENGTH_COLOR[score] : 'var(--border-2)', transition: 'background-color 0.3s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: score > 0 ? STRENGTH_COLOR[score] : 'var(--text-4)', fontWeight: 500 }}>
                  {score > 0 ? STRENGTH_LABEL[score] : '비밀번호를 입력하세요'}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{score}/5</span>
              </div>
              {/* Requirements checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
                {REQ_ITEMS.map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: checks[key] ? '#22c55e' : 'var(--text-4)', flexShrink: 0, lineHeight: 1 }}>
                      {checks[key] ? '✓' : '○'}
                    </span>
                    <span style={{ fontSize: 11, color: checks[key] ? 'var(--text-2)' : 'var(--text-4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm password — signup only */}
          {mode === 'signup' && (
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                value={confirm} onChange={e => setConfirm(e.target.value)} required
                style={{
                  ...inputStyle,
                  borderColor: confirm && confirm !== password ? '#ef4444' : confirm && confirm === password ? '#22c55e' : 'var(--border-3)',
                }}
                onFocus={e => {
                  if (confirm && confirm !== password) return
                  if (confirm && confirm === password) return
                  e.currentTarget.style.borderColor = 'rgba(0,153,255,0.5)'
                }}
                onBlur={e => {
                  if (confirm && confirm !== password) { e.currentTarget.style.borderColor = '#ef4444'; return }
                  if (confirm && confirm === password) { e.currentTarget.style.borderColor = '#22c55e'; return }
                  e.currentTarget.style.borderColor = 'var(--border-3)'
                }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
              ><EyeIcon open={showConfirm} /></button>
              {confirm && (
                <span style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: confirm === password ? '#22c55e' : '#ef4444' }}>
                  {confirm === password ? '✓' : '✗'}
                </span>
              )}
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', backgroundColor: A, color: AO, border: 'none', padding: '13px', fontSize: 11, letterSpacing: '0.2em', fontWeight: 700, cursor: 'pointer', marginTop: 4, transition: 'background-color 0.2s', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = AH }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = A }}
          >
            {loading ? '처리 중...' : mode === 'signup' ? '계정 만들기' : '로그인'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 20, textAlign: 'center' }}>
          {mode === 'signup' ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
          <button onClick={() => onSwitchMode(mode === 'signup' ? 'signin' : 'signup')}
            style={{ background: 'none', border: 'none', color: A, cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}
          >
            {mode === 'signup' ? '로그인' : '무료로 가입하기'}
          </button>
        </p>
      </div>
    </div>
  )
}
