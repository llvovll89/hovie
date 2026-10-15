import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { getEpisodeProgress, setEpisodeProgress } from '../../lib/firebase'
export default function EpisodeProgress({ showId, season, episode, airDate }: { showId: number; season: number; episode: number; airDate: string | null }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const client = useQueryClient()
  const key = ['episodes', user?.uid, showId, season]
  const progress = useQuery({ queryKey: key, queryFn: () => getEpisodeProgress(user!.uid, showId, season), enabled: !!user, staleTime: 0 })
  const mutation = useMutation({ mutationFn: (checked: boolean) => setEpisodeProgress(user!.uid, showId, season, episode, checked), onSuccess: () => { void client.invalidateQueries({ queryKey: key }) }, onError: () => showToast('시청 기록을 저장하지 못했습니다. 다시 시도해 주세요.', 'error') })
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  if (airDate && airDate > today) return <p className="helper">방영 예정</p>
  if (!user) return null
  if (progress.isError) return <button className="text-button" onClick={() => void progress.refetch()}>시청 기록 다시 불러오기</button>
  return <label className="episode-check"><input type="checkbox" checked={progress.data?.includes(episode) ?? false} disabled={progress.isLoading || mutation.isPending} onChange={e => mutation.mutate(e.target.checked)} />{mutation.isPending ? '저장 중…' : '이 회차를 봤어요'}</label>
}
