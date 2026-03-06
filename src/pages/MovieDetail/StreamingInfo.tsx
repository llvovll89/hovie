import type { WatchProviderResult } from '../../types'

const REGION_LABELS: Record<string, string> = {
  KR: '🇰🇷 한국',
  US: '🇺🇸 미국',
  JP: '🇯🇵 일본',
  GB: '🇬🇧 영국',
}

interface Props {
  providers: WatchProviderResult | null
  region: string | null
}

export default function StreamingInfo({ providers, region }: Props) {
  if (!providers) {
    return (
      <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          스트리밍 정보가 없습니다.
        </p>
      </div>
    )
  }

  const sections = [
    { label: '구독', items: providers.flatrate },
    { label: '렌탈', items: providers.rent },
    { label: '구매', items: providers.buy },
  ].filter(s => s.items && s.items.length > 0)

  if (sections.length === 0) {
    return (
      <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          현재 이용 가능한 서비스가 없습니다.
        </p>
      </div>
    )
  }

  const regionLabel = region ? (REGION_LABELS[region] ?? region) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {regionLabel && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          기준 국가: {regionLabel}
        </p>
      )}

      {sections.map(section => (
        <div key={section.label}>
          <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase' }}>
            {section.label}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {section.items!.map(provider => (
              <ProviderBadge
                key={provider.provider_id}
                name={provider.provider_name}
                logoPath={provider.logo_path}
                link={providers.link}
              />
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', margin: 0 }}>
        JustWatch via TMDB
      </p>
    </div>
  )
}

function ProviderBadge({ name, logoPath, link }: { name: string; logoPath: string; link: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
    >
      <img
        src={`https://image.tmdb.org/t/p/w92${logoPath}`}
        alt={name}
        style={{
          width: 48,
          height: 48,
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'transform 0.2s, border-color 0.2s',
          display: 'block',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
          e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      />
      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 56, lineHeight: 1.3 }}>
        {name}
      </span>
    </a>
  )
}
