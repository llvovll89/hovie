import { useState, useEffect, useRef, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { X } from '@phosphor-icons/react/dist/csr/X'
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/csr/ClockCounterClockwise'
import { FilmSlate } from '@phosphor-icons/react/dist/csr/FilmSlate'
import { User } from '@phosphor-icons/react/dist/csr/User'
import { tmdb, IMG, type MultiResult } from '../../lib/tmdb'
import { readPreference, savePreference } from '../../lib/preferences'
interface Props { placeholder?: string; autoFocus?: boolean; size?: 'sm' | 'lg'; onClose?: () => void }
function resultInfo(item: MultiResult) {
  return item.media_type === 'person' ? { title: item.name, path: '/person/' + item.id, image: item.profile_path, type: '인물' } : item.media_type === 'tv' ? { title: item.name, path: '/tv/' + item.id, image: item.poster_path, type: 'TV' } : { title: item.title, path: '/movie/' + item.id, image: item.poster_path, type: '영화' }
}
export default function SearchDropdown({ placeholder = '영화, TV, 배우를 검색하세요', autoFocus, size = 'sm', onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MultiResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(-1)
  const [recent, setRecent] = useState<string[]>(() => readPreference<string[]>('hovie_recent_searches', []).filter(v => typeof v === 'string').slice(0, 8))
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const id = useId()
  useEffect(() => {
    if (!query.trim()) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      tmdb.multiSearch(query.trim(), 1, controller.signal).then(data => { if (!controller.signal.aborted) { setResults(data.results.slice(0, 7)); setError(false); setLoading(false) } }).catch(() => { if (!controller.signal.aborted) { setError(true); setLoading(false) } })
    }, 280)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query])
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  const remember = (value: string) => { const next = [value, ...recent.filter(r => r !== value)].slice(0, 8); setRecent(next); savePreference('hovie_recent_searches', next) }
  const submit = (value = query) => { if (!value.trim()) return; remember(value.trim()); navigate('/search?type=all&q=' + encodeURIComponent(value.trim())); setOpen(false); setQuery(''); onClose?.() }
  const choose = (item: MultiResult) => { remember(query); navigate(resultInfo(item).path); setOpen(false); setQuery(''); onClose?.() }
  const options = query.trim() ? results : recent
  return <div ref={root} className={'search-box ' + (size === 'lg' ? 'search-box-lg' : '')}>
    <form onSubmit={e => { e.preventDefault(); submit() }} className="search-form" role="search">
      <label className="sr-only" htmlFor={id}>영화·TV·인물 검색</label>
      <MagnifyingGlass size={21} aria-hidden="true" />
      <input id={id} ref={input} autoFocus={autoFocus} value={query} placeholder={placeholder} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={id + '-list'} aria-activedescendant={open && active >= 0 ? id + '-option-' + active : undefined}
        onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setResults([]); setLoading(!!e.target.value.trim()); setError(false); setActive(-1); setOpen(true) }}
        onKeyDown={e => {
          if (e.key === 'Escape') { setOpen(false); setActive(-1) }
          if (options.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setOpen(true); setActive(i => Math.max(0, Math.min(options.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))) }
          if (e.key === 'Enter' && open && active >= 0 && options[active]) { e.preventDefault(); const item = options[active]; if (typeof item === 'string') submit(item); else choose(item) }
        }} />
      {query && <button type="button" className="icon-button" aria-label="검색어 지우기" onClick={() => { setQuery(''); setResults([]); setLoading(false); setActive(-1); input.current?.focus() }}><X size={18} /></button>}
      <button className="button primary" type="submit">검색</button>
    </form>
    {open && (query.trim() || recent.length > 0) && <div className="search-popover">
      {!query.trim() && <div className="search-popover-header"><span>최근 검색</span><button type="button" className="text-button" onClick={() => { setRecent([]); savePreference('hovie_recent_searches', []) }}>전체 삭제</button></div>}
      <ul role="listbox" id={id + '-list'} aria-label="검색 제안">
        {options.map((item, index) => {
          const info = typeof item === 'string' ? null : resultInfo(item)
          return <li role="option" aria-selected={index === active} id={id + '-option-' + index} key={typeof item === 'string' ? item : item.media_type + item.id} onMouseDown={e => e.preventDefault()}>
            <button type="button" className={'search-option ' + (index === active ? 'selected' : '')} onClick={() => typeof item === 'string' ? submit(item) : choose(item)}>
              {info?.image ? <img src={IMG.poster(info.image, 'w185')!} alt="" /> : info ? info.type === '인물' ? <User size={24} /> : <FilmSlate size={24} /> : <ClockCounterClockwise size={22} />}
              <span>{info?.title ?? String(item)}</span>{info && <small>{info.type}</small>}
            </button>
          </li>
        })}
      </ul>
      {loading && <p role="status">검색 중입니다…</p>}
      {error && <p role="alert">검색 제안을 불러오지 못했습니다. 검색 버튼으로 다시 시도하세요.</p>}
      {!loading && !error && query.trim() && !results.length && <p>검색 제안이 없습니다. 다른 제목이나 이름을 입력하세요.</p>}
      {query.trim() && <button type="button" className="search-option search-all" onClick={() => submit()}>전체 검색 결과 보기</button>}
    </div>}
  </div>
}
