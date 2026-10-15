import { useState } from 'react'
import type { WatchProviderResult } from '../../types'
import { IMG } from '../../lib/tmdb'
const LABELS: Record<string,string> = { KR: '한국', US: '미국', JP: '일본', GB: '영국' }
interface Props { providers?: WatchProviderResult | null; region?: string | null; countries?: Record<string, WatchProviderResult> }
export default function StreamingInfo({ providers, region = 'KR', countries }: Props) {
  const [country, setCountry] = useState('KR')
  const available = countries ?? (providers && region ? { [region]: providers } : {})
  const data = available[country]
  const sections = [{ label:'구독으로 시청', items:data?.flatrate }, { label:'무료', items:data?.free }, { label:'광고 포함', items:data?.ads }, { label:'대여', items:data?.rent }, { label:'구매', items:data?.buy }].filter(s => s.items?.length)
  return <section className="streaming-panel" aria-label="시청 서비스">
    <div className="streaming-top"><h2>어디서 볼 수 있나요?</h2><label>기준 국가<select value={country} onChange={e => setCountry(e.target.value)}>{['KR', ...Object.keys(available).filter(k => k !== 'KR').sort()].map(k => <option key={k} value={k}>{LABELS[k] ?? k}</option>)}</select></label></div>
    {country !== 'KR' && <p className="helper">한국 제공 정보가 아닙니다. {LABELS[country] ?? country} 기준입니다.</p>}
    {sections.length ? sections.map(section => <div key={section.label}><p className="streaming-section-label">{section.label}</p><div className="streaming-services">{section.items!.map(p => <div key={p.provider_id} className="streaming-service"><img src={IMG.poster(p.logo_path, 'w185')!} alt="" loading="lazy" width={35} height={35} /><span>{p.provider_name}</span></div>)}</div></div>) : <p className="helper">{LABELS[country] ?? country} 제공 정보를 찾지 못했습니다. 실제 제공 여부는 서비스에서 확인해 주세요.</p>}
    {data?.link && <a href={data.link} target="_blank" rel="noopener noreferrer" className="button" style={{ marginTop: 20 }}>시청 서비스 확인</a>}
    <p className="streaming-source">제공 정보: <a href="https://www.justwatch.com/kr" target="_blank" rel="noopener noreferrer">JustWatch</a> via TMDB. 제공 여부·요금은 변경될 수 있습니다.</p>
  </section>
}
