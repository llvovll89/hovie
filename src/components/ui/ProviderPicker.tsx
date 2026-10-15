import { useQuery } from '@tanstack/react-query'
import { tmdb, IMG } from '../../lib/tmdb'
import type { MediaType } from '../../lib/media'

export default function ProviderPicker({ type, value, onChange }: { type: MediaType; value: string; onChange: (value: string) => void }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['providers', type, 'KR'], queryFn: ({ signal }) => tmdb.providerList(type, signal), staleTime: 86400000 })
  const selected = value.split('|').filter(Boolean)
  const providers = [...(data?.results ?? [])].sort((a, b) => a.display_priority - b.display_priority)
  if (isLoading) return <div className="skeleton" style={{ height: 52 }} aria-label="시청 서비스 불러오는 중" />
  if (isError) return <p role="alert">시청 서비스를 불러오지 못했습니다. <button type="button" className="text-button" onClick={() => void refetch()}>다시 시도</button></p>
  return <div>
    <div className="provider-scroll">{providers.map(provider => <button type="button" className={'provider-choice ' + (selected.includes(String(provider.provider_id)) ? 'selected' : '')} aria-pressed={selected.includes(String(provider.provider_id))} key={provider.provider_id} onClick={() => onChange(selected.includes(String(provider.provider_id)) ? selected.filter(p => p !== String(provider.provider_id)).join('|') : [...selected, String(provider.provider_id)].join('|'))}>
      <img src={IMG.poster(provider.logo_path, 'w185')!} alt="" loading="lazy" width="32" height="32" /><span>{provider.provider_name}</span>
    </button>)}</div>
    <p className="helper">한국 기준 구독 서비스입니다. 여러 개를 고르면 하나 이상에서 제공하는 작품을 찾습니다.</p>
  </div>
}
