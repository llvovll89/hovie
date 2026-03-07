import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb, IMG } from '../../lib/tmdb'
import Spinner from './Spinner'
import type { Movie } from '../../types'

const A = 'var(--accent)'
const AH = 'var(--accent-hover)'
const AO = 'var(--accent-on)'

const STORAGE_KEY = 'hovie_recent_searches'
const MAX_RECENT = 8

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveRecent(term: string) {
  const list = [term, ...getRecent().filter(t => t !== term)].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
function deleteRecent(term: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getRecent().filter(t => t !== term)))
}
function clearAllRecent() {
  localStorage.removeItem(STORAGE_KEY)
}

interface Props {
  placeholder?: string
  autoFocus?: boolean
  size?: 'sm' | 'lg'
  onClose?: () => void
}

export default function SearchDropdown({ placeholder = '영화 제목을 검색하세요...', autoFocus, size = 'sm', onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [recentOpen, setRecentOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setRecentOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    setRecentOpen(false)
    clearTimeout(timerRef.current)
    if (!value.trim()) { setResults([]); setOpen(false); setLoading(false); return }
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const data = await tmdb.search(value.trim(), 1)
        setResults((data.results as Movie[]).slice(0, 7))
        setOpen(true)
      } catch { /* ignore */ } finally { setLoading(false) }
    }, 280)
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!query.trim()) return
    saveRecent(query.trim())
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setOpen(false); setRecentOpen(false); setQuery(''); onClose?.()
  }

  function handleSelect(movie: Movie) {
    navigate(`/movie/${movie.id}`)
    setOpen(false); setRecentOpen(false); setQuery(''); onClose?.()
  }

  function handleRecentClick(term: string) {
    saveRecent(term)
    navigate(`/search?q=${encodeURIComponent(term)}`)
    setRecentOpen(false); setQuery(''); onClose?.()
  }

  function handleDeleteRecent(e: React.MouseEvent, term: string) {
    e.stopPropagation()
    deleteRecent(term)
    const updated = getRecent()
    setRecent(updated)
    if (updated.length === 0) setRecentOpen(false)
  }

  function handleClearAll() {
    clearAllRecent()
    setRecent([])
    setRecentOpen(false)
  }

  const py = size === 'lg' ? 16 : 11
  const fs = size === 'lg' ? 15 : 14
  const px = size === 'lg' ? 28 : 22

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            autoFocus={autoFocus}
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => {
              setFocused(true)
              const r = getRecent()
              setRecent(r)
              if (!query.trim() && r.length > 0) setRecentOpen(true)
              if (query.trim() && results.length > 0) setOpen(true)
            }}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: `1px solid ${focused ? 'rgba(0,153,255,0.4)' : 'var(--border-3)'}`,
              borderRight: 'none',
              color: 'var(--text)', padding: `${py}px 44px ${py}px 18px`,
              fontSize: fs, outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
            }}
          />
          {loading && <div style={{ position: 'absolute', right: 12, pointerEvents: 'none' }}><Spinner size={14} /></div>}
          {!loading && query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
              style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2 }}>×</button>
          )}
        </div>
        <button type="submit"
          style={{ backgroundColor: A, color: AO, border: 'none', padding: `${py}px ${px}px`, fontSize: 11, letterSpacing: '0.18em', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = AH)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = A)}
        >SEARCH</button>
      </form>

      {/* Recent searches dropdown */}
      {recentOpen && !open && recent.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderTop: 'none', zIndex: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-4)', textTransform: 'uppercase' }}>최근 검색어</span>
            <button
              onMouseDown={e => e.preventDefault()}
              onClick={handleClearAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-4)', fontSize: 11, cursor: 'pointer', padding: '2px 4px', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
            >
              전체 삭제
            </button>
          </div>
          {recent.map(term => (
            <div key={term} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleRecentClick(term)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg width="13" height="13" fill="none" stroke="var(--text-4)" strokeWidth="1.6" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {term}
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={e => handleDeleteRecent(e, term)}
                style={{ padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-4)', fontSize: 14, cursor: 'pointer', lineHeight: 1, transition: 'color 0.2s', flexShrink: 0 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-4)')}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Search results dropdown */}
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-2)', borderTop: 'none', zIndex: 200, maxHeight: 480, overflowY: 'auto' }}>
          {results.map(movie => <DropdownItem key={movie.id} movie={movie} query={query} onClick={() => handleSelect(movie)} />)}
          <button type="button" onClick={() => handleSubmit()}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', background: 'rgba(0,153,255,0.05)', border: 'none', borderTop: '1px solid var(--border)', color: A, fontSize: 12, letterSpacing: '0.08em', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,153,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,153,255,0.05)')}
          >
            <span>"{query}" 전체 검색 결과 보기</span>
            <span style={{ fontSize: 14 }}>→</span>
          </button>
        </div>
      )}
    </div>
  )
}

function DropdownItem({ movie, query, onClick }: { movie: Movie; query: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const poster = IMG.poster(movie.poster_path, 'w185')
  const year = movie.release_date?.split('-')[0]

  function highlight(text: string) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return <span>{text}</span>
    return (
      <span>
        {text.slice(0, idx)}
        <mark style={{ backgroundColor: 'rgba(0,153,255,0.2)', color: A, borderRadius: 2, padding: '0 1px' }}>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </span>
    )
  }

  return (
    <button type="button" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', background: hovered ? 'var(--bg-hover)' : 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s', fontFamily: 'Inter, sans-serif' }}
    >
      <div style={{ width: 36, height: 54, flexShrink: 0, backgroundColor: 'var(--bg-elevated)', overflow: 'hidden', borderRadius: 2 }}>
        {poster ? <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎬</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{highlight(movie.title)}</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {year && <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{year}</span>}
          {movie.vote_average > 0 && <span style={{ fontSize: 11, color: A }}>★ {movie.vote_average.toFixed(1)}</span>}
        </div>
      </div>
    </button>
  )
}
