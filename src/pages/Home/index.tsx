import { useNavigate } from 'react-router-dom'
import Hero from './Hero'
import TrendingSection from './TrendingSection'
import FeaturesSection from './FeaturesSection'
import { useAuthModal } from '../../contexts/AuthModalContext'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

export default function Home() {
  const { openSignUp } = useAuthModal()
  const navigate = useNavigate()
  return (
    <>
      <Hero />
      <TrendingSection />
      <FeaturesSection />
      <section style={{ padding: '100px 20px', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,153,255,0.04) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', marginBottom: 18, textTransform: 'uppercase' }}>Join Hovie</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20 }}>
            Start Your Film<br />Journey Today
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: 16, marginBottom: 44, lineHeight: 1.7 }}>
            무료로 가입하고 나만의 시네마 경험을 시작하세요.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <button onClick={openSignUp} style={{ backgroundColor: A, color: AO, border: 'none', padding: '14px 36px', fontSize: 11, letterSpacing: '0.2em', fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
            >무료 계정 만들기</button>
            <button onClick={() => navigate('/search')} style={{ background: 'none', border: '1px solid var(--border-4)', color: 'var(--text)', padding: '14px 36px', fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-4)')}
            >영화 탐색하기</button>
          </div>
        </div>
      </section>
    </>
  )
}
