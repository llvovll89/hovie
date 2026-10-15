import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import SearchDropdown from './SearchDropdown'
import { tmdb, type MultiResult, type Page } from '../../lib/tmdb'
vi.mock('../../lib/tmdb', () => ({ tmdb: { multiSearch: vi.fn() }, IMG: { poster: (path: string) => path } }))
const movie: MultiResult = { id: 1, media_type:'movie', title:'느린 영화', original_title:'', poster_path:null, backdrop_path:null, vote_average:7, vote_count:20, release_date:'2026-01-01', genre_ids:[], overview:'', popularity:1, adult:false }
const tv: MultiResult = { id: 2, media_type:'tv', name:'빠른 시리즈', original_name:'', poster_path:null, backdrop_path:null, vote_average:8, vote_count:20, first_air_date:'2026-01-01', genre_ids:[], overview:'', popularity:1 }
function Location() { const { pathname, search } = useLocation(); return <output data-testid="location">{pathname + search}</output> }
function setup() { render(<MemoryRouter><SearchDropdown /><Location /></MemoryRouter>); return screen.getByRole('combobox') }
beforeEach(() => { vi.useFakeTimers(); vi.mocked(tmdb.multiSearch).mockReset(); localStorage.clear() })
afterEach(() => vi.useRealTimers())
describe('multi-search autocomplete', () => {
  it('cancels stale requests and routes the current TV result from the keyboard', async () => {
    let resolveOld!: (data: Page<MultiResult>) => void
    let resolveNew!: (data: Page<MultiResult>) => void
    vi.mocked(tmdb.multiSearch).mockImplementationOnce(() => new Promise<Page<MultiResult>>(resolve => { resolveOld = resolve })).mockImplementationOnce(() => new Promise<Page<MultiResult>>(resolve => { resolveNew = resolve }))
    const input=setup()
    fireEvent.change(input,{target:{value:'느린'}})
    await act(async () => { vi.advanceTimersByTime(280) })
    const firstSignal=vi.mocked(tmdb.multiSearch).mock.calls[0][2]!
    fireEvent.change(input,{target:{value:'빠른'}})
    expect(firstSignal.aborted).toBe(true)
    await act(async () => { vi.advanceTimersByTime(280); resolveNew({results:[tv], page:1, total_pages:1, total_results:1}) })
    await act(async () => { resolveOld({results:[movie], page:1, total_pages:1, total_results:1}) })
    expect(screen.getByText('빠른 시리즈')).toBeInTheDocument()
    expect(screen.queryByText('느린 영화')).not.toBeInTheDocument()
    fireEvent.keyDown(input,{key:'ArrowDown'})
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option').id)
    fireEvent.keyDown(input,{key:'Enter'})
    expect(screen.getByTestId('location')).toHaveTextContent('/tv/2')
  })
  it('submits an explicit multi-search and closes suggestions with Escape', () => {
    const input=setup()
    fireEvent.change(input,{target:{value:'한글 검색'}})
    fireEvent.keyDown(input,{key:'Escape'})
    expect(input).toHaveAttribute('aria-expanded','false')
    fireEvent.click(screen.getByRole('button',{name:'검색'}))
    expect(screen.getByTestId('location')).toHaveTextContent('/search?type=all&q=' + encodeURIComponent('한글 검색'))
  })
})
