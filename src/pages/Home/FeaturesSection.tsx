import { useState } from 'react'

const A = 'var(--accent)'

const FEATURES = [
  { icon: (<svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" /></svg>), title: 'Discover Films', desc: '장르, 연도, 국가, 평점으로 필터링하며 수백만 개의 영화를 탐색하세요.' },
  { icon: (<svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" strokeLinejoin="round" /></svg>), title: 'Where to Watch', desc: 'Netflix, Disney+, 왓챠 등 국내외 스트리밍 플랫폼별 제공 여부를 실시간으로 확인하세요.' },
  { icon: (<svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" /></svg>), title: 'Smart Picks', desc: '취향 분석을 바탕으로 한 개인화 추천. 로그를 쌓을수록 더 정교해집니다.' },
  { icon: (<svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" strokeLinejoin="round" /></svg>), title: 'Rate & Review', desc: '별점을 매기고 감상을 기록하세요. 다른 관객의 솔직한 리뷰도 확인할 수 있습니다.' },
]

export default function FeaturesSection() {
  return (
    <section style={{ padding: '80px 20px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', marginBottom: 12, textTransform: 'uppercase' }}>Everything You Need</p>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your Complete Film Experience</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} isLast={i === FEATURES.length - 1} />)}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, isLast }: { feature: typeof FEATURES[0]; isLast: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ padding: '36px 28px', borderRight: isLast ? 'none' : '1px solid var(--border)', backgroundColor: hovered ? 'var(--bg-hover)' : 'transparent', transition: 'background-color 0.3s' }}
    >
      <div style={{ color: A, marginBottom: 20, display: 'inline-block', transition: 'transform 0.3s', transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>{feature.icon}</div>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 10px' }}>{feature.title}</h3>
      <p style={{ color: 'var(--text-3)', fontSize: 13, lineHeight: 1.75, margin: 0 }}>{feature.desc}</p>
    </div>
  )
}
