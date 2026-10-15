import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { getEpisodeProgress } from '../../lib/firebase'
export default function SeasonProgress({ showId, season, episodes }: { showId: number; season: number; episodes: { episode_number: number; air_date: string | null }[] }) {
  const { user } = useAuth()
  const { openSignIn } = useAuthModal()
  const result = useQuery({ queryKey: ['episodes', user?.uid, showId, season], queryFn: () => getEpisodeProgress(user!.uid, showId, season), enabled: !!user, staleTime: 0 })
  if (!user) return <div className="season-progress"><button className="text-button" onClick={openSignIn}>로그인하고 회차 기록</button></div>
  if (result.isError) return <div className="season-progress" role="alert"><button className="text-button" onClick={() => void result.refetch()}>회차 기록 다시 불러오기</button></div>
  const watched = result.data ?? []
  const today = new Date().toLocaleDateString('en-CA', { timeZone:'Asia/Seoul' })
  const next = episodes.find(e => !watched.includes(e.episode_number) && (!e.air_date || e.air_date <= today))
  return <div className="season-progress" aria-live="polite"><span>{result.isLoading ? '기록 확인 중…' : episodes.filter(e => watched.includes(e.episode_number)).length + '/' + episodes.length + '회 시청'}</span>{!result.isLoading && <span>{next ? '다음에 볼 회차: ' + next.episode_number + '회' : '공개된 회차를 모두 봤습니다'}</span>}</div>
}
