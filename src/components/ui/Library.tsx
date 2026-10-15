import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookmarkSimple } from '@phosphor-icons/react/dist/csr/BookmarkSimple'
import { Checks } from '@phosphor-icons/react/dist/csr/Checks'
import { Trash } from '@phosphor-icons/react/dist/csr/Trash'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { useToast } from '../../hooks/useToast'
import { getWatchlist, getWatched, removeFromWatchlist, removeFromWatched, resolveLegacy } from '../../lib/firebase'
import { mediaKey, type MediaType } from '../../lib/media'
import type { Movie, WatchedMovie } from '../../types'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'

export default function Library({ shelf }: { shelf: 'watchlist' | 'watched' }) {
  const { user, loading: authLoading } = useAuth()
  const { openSignIn } = useAuthModal()
  const { showToast } = useToast()
  const client = useQueryClient()
  const [sort, setSort] = useState('recent')
  const [type, setType] = useState('all')
  const watched = shelf === 'watched'
  const title = watched ? '감상 기록' : '보고 싶은 작품'
  const list = useQuery({ queryKey: ['library', shelf, user?.uid], queryFn: () => watched ? getWatched(user!.uid) : getWatchlist(user!.uid), enabled: !!user, staleTime: 0 })
  const refresh = () => { void client.invalidateQueries({ queryKey: ['library'] }); void client.invalidateQueries({ queryKey: ['recommended'] }); void client.invalidateQueries({ queryKey: ['stats'] }) }
  const mutation = useMutation({ mutationFn: async ({ item, resolve }: { item: Movie; resolve?: MediaType }) => {
    if (resolve) await resolveLegacy(user!.uid, shelf, item.legacyId!, resolve)
    else if (watched) await removeFromWatched(user!.uid, item.id, item.mediaType ?? 'movie')
    else await removeFromWatchlist(user!.uid, item.id, item.mediaType ?? 'movie')
  }, onSuccess: (_, variables) => { refresh(); showToast(variables.resolve ? '기록의 종류를 확인했습니다.' : '목록에서 삭제했습니다.') }, onError: () => showToast('변경하지 못했습니다. 다시 시도해 주세요.', 'error') })
  const items = list.data ?? []
  const resolved = items.filter(m => !m.needsReview && (type === 'all' || (m.mediaType ?? 'movie') === type))
  if (sort === 'rating') resolved.sort((a,b) => ((b as WatchedMovie).myRating ?? b.vote_average) - ((a as WatchedMovie).myRating ?? a.vote_average))
  if (sort === 'title') resolved.sort((a,b) => a.title.localeCompare(b.title, 'ko'))
  const legacy = items.filter(m => m.needsReview)
  return <div className="page-shell">
    <title>{(title) + " - HOVIE"}</title>
    <div className="page-heading"><div><h1>{title}</h1><p>{watched ? '좋았던 장면과 나의 별점을 쌓아보세요.' : '다음에 만나고 싶은 이야기를 모아두세요.'}</p></div>{!watched && <Link className="button primary" to="/tonight">오늘 볼 작품 고르기</Link>}</div>
    <div className="library-tabs"><Link to="/watchlist">보고 싶은 작품</Link><Link to="/watched">감상 기록</Link><Link to="/stats">시청 통계</Link><Link to="/lists">공유 목록 만들기</Link></div>
    {authLoading || (user && list.isLoading) ? <div className="library-grid"><SkeletonCard count={8} /></div> : !user ? <div className="empty-state">{watched ? <Checks size={42} /> : <BookmarkSimple size={42} />}<h2>로그인하고 나만의 목록을 만들어보세요</h2><p>영화와 TV를 저장하고 다른 기기에서도 이어서 볼 수 있습니다.</p><button className="button primary" onClick={openSignIn}>로그인</button></div> : list.isError ? <div role="alert" className="empty-state"><h2>목록을 불러오지 못했습니다</h2><button className="button" onClick={() => void list.refetch()}>다시 시도</button></div> : <>
      {legacy.length > 0 && <section style={{ marginBottom: 35 }}><h2>예전 기록의 종류를 확인해 주세요</h2><p className="helper">예전 버전에서는 영화·TV 종류를 저장하지 않았습니다. 상세 정보를 확인한 뒤 선택해 주세요. 원본은 백업으로 보존됩니다.</p><div className="library-grid" style={{ marginTop: 20 }}>{legacy.map(item => <article key={item.legacyId} className="legacy-entry"><h3>{item.title}</h3><p>{item.release_date?.slice(0,4)} / {item.original_title}</p><div className="action-row"><a href={'/movie/' + item.id} target="_blank" rel="noopener noreferrer">영화 정보 확인</a><a href={'/tv/' + item.id} target="_blank" rel="noopener noreferrer">TV 정보 확인</a></div><div className="action-row" style={{ marginTop: 16 }}>{(['movie','tv'] as const).map(t => <button key={t} className="button" disabled={mutation.isPending} onClick={() => mutation.mutate({ item, resolve: t })}>{t === 'movie' ? '영화로 복구' : 'TV로 복구'}</button>)}</div></article>)}</div></section>}
      <div className="library-toolbar"><div className="segmented">{[['all','전체'],['movie','영화'],['tv','TV']].map(([v,l]) => <button aria-pressed={type === v} className={type === v ? 'selected' : ''} key={v} onClick={() => setType(v)}>{l}</button>)}</div><label className="field"><span className="sr-only">목록 정렬</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">최근 저장순</option><option value="rating">{watched ? '내 별점순' : 'TMDB 평점순'}</option><option value="title">제목순</option></select></label><span className="helper">{resolved.length}편</span></div>
      {resolved.length ? <div className="library-grid">{resolved.map(item => <div className="library-item" key={mediaKey(item)}><MovieCard movie={item} />{watched && <p className="library-rating">내 별점 {(item as WatchedMovie).myRating ? '★'.repeat((item as WatchedMovie).myRating) : '미평가'}</p>}<button className="text-button remove-entry" disabled={mutation.isPending} onClick={() => mutation.mutate({ item })} aria-label={item.title + ' 목록에서 삭제'}><Trash size={15} />목록에서 삭제</button></div>)}</div> : <div className="empty-state"><h2>아직 저장한 작품이 없습니다</h2><p>작품 상세에서 저장하거나 감상 기록을 남겨보세요.</p><Link className="button" to="/search">작품 탐색</Link></div>}
    </>}
  </div>
}
