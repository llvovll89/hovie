import { Link } from 'react-router-dom'

export function MetaTag({ label }: { label: string }) {
  return (
    <span style={{ fontSize: 12, color: 'var(--text-3)', border: '1px solid var(--border-2)', padding: '3px 10px' }}>
      {label}
    </span>
  )
}

export function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', marginBottom: 3, textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{value}</p>
    </div>
  )
}

export function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 18px', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

export function CastCard({ member }: { member: { id: number; name: string; character: string; profile_path: string | null } }) {
  const img = member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : null
  return (
    <Link to={`/person/${member.id}`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
      <div
        style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--bg-elevated)', marginBottom: 6, border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {img ? <img src={img} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>}
      </div>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', margin: '0 0 2px', lineHeight: 1.3 }}>{member.name}</p>
      <p style={{ fontSize: 10, color: 'var(--text-4)', margin: 0, lineHeight: 1.3 }}>{member.character}</p>
    </Link>
  )
}

export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="15" height="15" fill={filled ? 'var(--accent)' : 'none'} stroke={filled ? 'var(--accent)' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="15" height="15" fill="none" stroke="var(--accent)" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="var(--accent)" />
    </svg>
  ) : (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
