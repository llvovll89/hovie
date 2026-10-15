import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { getWatchlist } from '../../lib/firebase'
import { tmdb } from '../../lib/tmdb'
import { mediaKey } from '../../lib/media'
import { readPreference } from '../../lib/preferences'
import { selectTonight, type PickCandidate } from '../../lib/tonight'
import ProviderPicker from '../../components/ui/ProviderPicker'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'

export default function Tonight() {
  const { user, loading } = useAuth()
  const { openSignIn } = useAuthModal()
  const [minutes, setMinutes] = useState(120)
  const [providers, setProviders] = useState(() => readPreference<string>('hovie_providers_movie', ''))
  const [offset, setOffset] = useState(0)
  const result = useQuery({ queryKey: ['tonight', user?.uid], enabled: !!user, staleTime: 0, queryFn: async () => {
    const list = (await getWatchlist(user!.uid)).filter(m => !m.needsReview)
    const candidates: PickCandidate[] = []; let failures = 0
    const recent = list.slice(0,30)
    for (let i=0; i<recent.length; i+=4) {
      await Promise.all(recent.slice(i,i+4).map(async movie => {
        const type = movie.mediaType ?? 'movie'
        const [detail, watch] = await Promise.allSettled([type === 'tv' ? tmdb.tvDetail(movie.id) : tmdb.detail(movie.id), type === 'tv' ? tmdb.tvWatchProviders(movie.id) : tmdb.watchProviders(movie.id)])
        if (detail.status === 'rejected' || watch.status === 'rejected') failures++
        const data = detail.status === 'fulfilled' ? detail.value : null
        const runtime = data && ('runtime' in data ? data.runtime : data.episode_run_time[0]) || null
        candidates.push({ movie, runtime, providers: watch.status === 'fulfilled' ? watch.value.results.KR?.flatrate?.map(p => p.provider_id) ?? [] : [], providerKnown: watch.status === 'fulfilled' })
      }))
    }
    return { candidates, failures, total: list.length }
  } })
  const picks = selectTonight(result.data?.candidates ?? [], minutes, providers.split('|').filter(Boolean).map(Number), offset)
  return <div className="page-shell"><title>오늘 볼 작품 - HOVIE</title><div className="page-heading"><div><h1>오늘은 이 중에서 한 편</h1><p>보고 싶은 목록에서 남은 시간과 한국 구독 서비스에 맞춰 골라드립니다.</p></div></div>
    <div className="pick-controls"><label className="field">얼마나 여유가 있나요?<select value={minutes} onChange={e => { setMinutes(Number(e.target.value)); setOffset(0) }}><option value={90}>90분</option><option value={120}>2시간</option><option value={180}>3시간</option><option value={0}>시간 제한 없음</option></select></label><div><p className="helper">TV는 한 회의 길이로 고릅니다. 상영시간이 없는 작품은 시간 제한이 있을 때 제외합니다.</p></div></div><details><summary>시청 서비스 고르기</summary><ProviderPicker type="movie" value={providers} onChange={v => { setProviders(v); setOffset(0) }} /><button className="text-button" onClick={() => setProviders('')}>서비스 조건 지우기</button></details>
    {loading || (user && result.isLoading) ? <div className="pick-grid"><SkeletonCard count={3} /></div> : !user ? <div className="empty-state"><h2>내 목록에서 다음 작품을 찾아보세요</h2><p>로그인 후 보고 싶은 작품을 저장하면 여기서 골라드립니다.</p><button className="button primary" onClick={openSignIn}>로그인</button></div> : result.isError ? <div className="empty-state" role="alert"><h2>목록을 불러오지 못했습니다</h2><button className="button" onClick={() => void result.refetch()}>다시 시도</button></div> : <>
      <p className="helper">{result.data?.total && result.data.total > 30 ? '최근 저장한 30편을 기준으로 고릅니다.' : '저장한 작품 중 TMDB 평점이 높은 순서로 골랐습니다.'}</p>{result.data?.failures ? <p role="status">일부 정보를 확인하지 못했습니다. 확인되지 않은 작품은 조건에 따라 제외될 수 있습니다. <button className="text-button" onClick={() => void result.refetch()}>다시 확인</button></p> : null}
      {picks.length ? <><div className="pick-grid">{picks.map(p => <article key={mediaKey(p.movie)}><MovieCard movie={p.movie} /><p className="pick-reason">{p.runtime ? (p.movie.mediaType === 'tv' ? '한 회 ' : '') + p.runtime + '분' : '상영시간 미등록'}{providers ? ' / 선택한 서비스에서 제공' : ''}</p></article>)}</div><button className="button" style={{ marginTop: 24 }} onClick={() => setOffset(v => v + 3)}>다른 작품 고르기</button></> : <div className="empty-state"><h2>조건에 맞는 작품이 없습니다</h2><p>시간이나 서비스 조건을 넓히거나, 보고 싶은 작품을 더 저장해 보세요.</p><div className="action-row" style={{ justifyContent: 'center' }}><button className="button" onClick={() => { setMinutes(0); setProviders('') }}>조건 초기화</button><Link className="button primary" to="/search">작품 탐색</Link></div></div>}
    </>}
  </div>
}
