import { useNavigate } from 'react-router-dom'
import SearchDropdown from '../../components/ui/SearchDropdown'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-surface) 60%, var(--bg) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,153,255,0.06) 0%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,153,255,0.1), transparent)' }} />
      <div style={{ position: 'absolute', top: '70%', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,153,255,0.1), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 860, padding: '0 20px', marginTop: 64, width: '100%' }}>
        <p style={{ color: A, fontSize: 10, letterSpacing: '0.45em', marginBottom: 28, textTransform: 'uppercase' }}>
          ✦ &nbsp; Welcome to Hovie &nbsp; ✦
        </p>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(40px, 9vw, 88px)', fontWeight: 700, lineHeight: 1.05, margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          Where Cinema<br />
          <span style={{ color: A }}>Meets Elegance</span>
        </h1>

        <p style={{ color: 'var(--text-3)', fontSize: 17, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.75 }}>
          영화를 발견하고, 스트리밍 정보를 확인하고,<br />나만의 취향에 맞는 추천을 받으세요.
        </p>

        <div style={{ maxWidth: 560, margin: '0 auto 36px' }}>
          <SearchDropdown size="lg" placeholder="영화 제목을 검색하세요..." />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40 }}>
          {[{ label: 'Action', id: 28 }, { label: 'Drama', id: 18 }, { label: 'Thriller', id: 53 }, { label: 'Sci-Fi', id: 878 }, { label: 'Horror', id: 27 }].map(g => (
            <button key={g.id} onClick={() => navigate(`/search?genre=${g.id}`)}
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-2)', color: 'var(--text-3)', fontSize: 10, letterSpacing: '0.18em', padding: '7px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = A; e.currentTarget.style.borderColor = 'rgba(0,153,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
            >{g.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-4)', fontSize: 12 }}>
          <span>2M+ 영화</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--border-2)', display: 'inline-block' }} />
          <span>실시간 스트리밍 정보</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'var(--border-2)', display: 'inline-block' }} />
          <span>AI 추천 · 리뷰</span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-4)' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.35em' }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--text-2), transparent)' }} />
      </div>
    </section>
  )
}
