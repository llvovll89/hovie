import { Link } from 'react-router-dom'

const A = 'var(--accent)'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '36px 20px', backgroundColor: 'var(--bg)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <Link to="/" style={{ textDecoration: 'none', fontSize: 17, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text)' }}>
          HOV<span style={{ color: A }}>IE</span>
        </Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {['ABOUT', 'PRIVACY', 'TERMS', 'CONTACT'].map(item => (
            <a key={item} href="#" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-4)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
            >{item}</a>
          ))}
        </div>
        <p style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-5)', margin: 0 }}>
          © 2026 HOVIE · Powered by TMDB
        </p>
      </div>
    </footer>
  )
}
