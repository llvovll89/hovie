import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useAuthModal } from '../../contexts/AuthModalContext'
import { getWatchlist, getWatched } from '../../lib/firebase'
import { tmdb, IMG } from '../../lib/tmdb'
import { mediaKey, dedupeLibrary } from '../../lib/media'
import { encodeList, decodeList, type SharedList } from '../../lib/share'
import { readPreference, savePreference } from '../../lib/preferences'
import { useToast } from '../../hooks/useToast'
import MovieCard from '../../components/ui/MovieCard'
import SkeletonCard from '../../components/ui/SkeletonCard'

export default function Lists() {
  const { hash } = useLocation()
  let list: SharedList | null = null
  if (hash.startsWith('#list=')) { try { list = decodeList(hash.slice(6)) } catch { /* Render an invalid-link state below. */ } }
  if (list) return <SharedView key={hash} list={list} />
  if (hash.startsWith('#list=')) return <div className="page-shell empty-state"><h1>공유 링크를 열 수 없습니다</h1><p>링크가 잘렸거나 올바른 목록 형식이 아닙니다.</p><Link className="button" to="/lists">새 목록 만들기</Link></div>
  return <ListEditor />
}
function SharedView({ list }: { list: SharedList }) {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['shared-list', list.items], queryFn: async () => {
    const rows = []
    for (let i = 0; i < list.items.length; i += 4) {
      const batch = await Promise.allSettled(list.items.slice(i, i + 4).map(async item => {
        if (item.mediaType === 'tv') { const d = await tmdb.tvDetail(item.id); return { ...d, title: d.name, original_title: d.original_name, release_date: d.first_air_date, genre_ids: d.genres.map(g => g.id), adult: false, mediaType: 'tv' as const } }
        const d = await tmdb.detail(item.id); return { ...d, genre_ids: d.genres.map(g => g.id), adult: false, mediaType: 'movie' as const }
      }))
      rows.push(...batch.filter(r => r.status === 'fulfilled').map(r => r.value))
    }
    if (!rows.length) throw new Error('목록을 불러오지 못했습니다.')
    return rows
  } })
  return <div className="page-shell"><title>{(list.title) + " - HOVIE 공유 목록"}</title><meta name="robots" content="noindex" /><div className="page-heading"><div><h1>{list.title}</h1><p>{list.description}</p><p className="helper">공유한 시점의 작품 목록입니다. 개인 감상 기록과 계정 정보는 포함하지 않습니다.</p></div><Link to="/lists" className="button">나도 목록 만들기</Link></div>{isLoading ? <div className="library-grid"><SkeletonCard count={6} /></div> : isError ? <div className="empty-state"><p>작품 정보를 불러오지 못했습니다.</p><button className="button" onClick={() => void refetch()}>다시 시도</button></div> : <><div className="library-grid">{data?.map(m => <MovieCard key={mediaKey(m)} movie={m} />)}</div>{data && data.length < list.items.length && <p role="status">일부 작품 정보를 불러오지 못했습니다. <button className="text-button" onClick={() => void refetch()}>다시 시도</button></p>}</>}</div>
}
function ListEditor() {
  const { user, loading } = useAuth()
  const { openSignIn } = useAuthModal()
  const { showToast } = useToast()
  const [title, setTitle] = useState('함께 보고 싶은 작품')
  const [description, setDescription] = useState('')
  const [selection, setSelection] = useState<string[]>([])
  const [link, setLink] = useState('')
  const [saved, setSaved] = useState<SharedList[]>(() => readPreference('hovie_lists', []))
  const library = useQuery({ queryKey: ['share-library', user?.uid], enabled: !!user, staleTime: 0, queryFn: async () => dedupeLibrary([...(await getWatchlist(user!.uid)), ...(await getWatched(user!.uid))]).filter(m => !m.needsReview) })
  function generate() {
    const items = (library.data ?? []).filter(m => selection.includes(mediaKey(m))).map(m => ({ id: m.id, mediaType: m.mediaType ?? 'movie' as const }))
    const list: SharedList = { version: 1, title: title.trim(), description: description.trim(), items }
    const encoded = encodeList(list); decodeList(encoded)
    const next = [list, ...saved].slice(0, 10); setSaved(next); savePreference('hovie_lists', next)
    setLink(window.location.origin + '/lists#list=' + encoded)
  }
  return <div className="page-shell"><title>공유 목록 만들기 - HOVIE</title><div className="page-heading"><div><h1>취향을 담아 건네보세요</h1><p>내 목록에서 최대 24편을 골라 공유 링크를 만듭니다.</p></div></div>
    <div className="share-editor"><section><label className="field">목록 제목<input maxLength={60} value={title} onChange={e => { setTitle(e.target.value); setLink('') }} /></label><label className="field">한 줄 소개<textarea rows={3} maxLength={300} value={description} onChange={e => { setDescription(e.target.value); setLink('') }} /></label><p className="helper">링크를 가진 사람은 누구나 작품 목록을 볼 수 있습니다. 만든 링크는 수정·회수되지 않으며, 새로 만들면 별도 목록이 됩니다. 이 기기에 최근 10개 목록을 보관합니다.</p><button className="button primary" style={{ marginTop: 20 }} disabled={!selection.length || !title.trim()} onClick={generate}>공유 링크 만들기</button>{link && <div><a className="share-link" href={link}>공유 목록 열기</a><button className="text-button" onClick={() => { void navigator.clipboard.writeText(link).then(() => showToast('공유 링크를 복사했습니다.')).catch(() => showToast('링크를 열어 주소를 복사해 주세요.', 'error')) }}>링크 복사</button><label className="field">공유 주소<input readOnly value={link} onFocus={e => e.target.select()} /></label></div>}
      {saved.length > 0 && <div style={{ marginTop: 30 }}><h2>이 기기에 보관한 목록</h2>{saved.map((list,i) => <p key={i}><Link to={'/lists#list=' + encodeList(list)}>{list.title} ({list.items.length}편)</Link></p>)}<button className="text-button" onClick={() => { setSaved([]); savePreference('hovie_lists', []) }}>이 기기의 보관 기록 지우기</button></div>}
    </section><section><h2>공유할 작품 {selection.length}/24</h2>{loading || library.isLoading ? <p role="status">목록을 불러오는 중입니다…</p> : !user ? <div className="empty-state"><p>로그인하고 저장한 작품에서 골라보세요.</p><button className="button" onClick={openSignIn}>로그인</button></div> : library.isError ? <p role="alert">목록을 불러오지 못했습니다. <button className="text-button" onClick={() => void library.refetch()}>다시 시도</button></p> : library.data?.length ? <div className="share-choices">{library.data.map(m => <label key={mediaKey(m)} className="share-choice"><input type="checkbox" checked={selection.includes(mediaKey(m))} disabled={!selection.includes(mediaKey(m)) && selection.length >= 24} onChange={e => { setLink(''); setSelection(v => e.target.checked ? [...v, mediaKey(m)] : v.filter(k => k !== mediaKey(m))) }} />{m.poster_path && <img src={IMG.poster(m.poster_path, 'w185')!} alt="" />}<span>{m.title}<small className="helper" style={{ display: 'block' }}>{m.mediaType === 'tv' ? 'TV' : '영화'}</small></span></label>)}</div> : <div className="empty-state"><p>공유할 작품을 내 목록에 먼저 저장해 주세요.</p><Link className="button" to="/search">작품 탐색</Link></div>}</section></div>
  </div>
}
