import { Link } from 'react-router-dom'

const A = 'var(--accent)'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '36px 20px', backgroundColor: '#000' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <Link to="/" style={{ textDecoration: 'none', fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, letterSpacing: '0.2em', color: '#fff' }}>
          HOV<span style={{ color: A }}>IE</span>
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {['ABOUT', 'PRIVACY', 'TERMS', 'CONTACT'].map(item => (
            <a key={item} href="#" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >{item}</a>
          ))}
        </div>
        <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.18)', margin: 0 }}>
          © 2026 HOVIE · Powered by TMDB
        </p>
      </div>
    </footer>
  )
}
