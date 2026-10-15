import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowsLeftRight } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import { Shuffle } from '@phosphor-icons/react/dist/csr/Shuffle'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { FilmStrip } from '@phosphor-icons/react/dist/csr/FilmStrip'
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { X } from '@phosphor-icons/react/dist/csr/X'
import { tmdb, IMG, type MovieBundle } from '../../lib/tmdb'
import './compare.css'

function validId(value: string | null) { return value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null }
function money(value: number) { return value > 0 ? new Intl.NumberFormat('ko-KR', { notation:'compact', maximumFractionDigits:1 }).format(value) + ' 달러' : '정보 없음' }
function duration(value: number) { return value > 0 ? (Math.floor(value/60) ? Math.floor(value/60)+'시간 ' : '') + (value%60 ? value%60+'분' : '') : '정보 없음' }

export default function Compare() {
  const [params, setParams] = useSearchParams()
  const a = validId(params.get('a')), b = validId(params.get('b'))
  const first = useQuery({ queryKey:['compare-movie',a], queryFn:({ signal }) => tmdb.movieBundle(a!,signal), enabled:!!a })
  const second = useQuery({ queryKey:['compare-movie',b], queryFn:({ signal }) => tmdb.movieBundle(b!,signal), enabled:!!b })
  const [randomLoading, setRandomLoading] = useState(false)
  const [randomError, setRandomError] = useState('')
  function select(side:'a'|'b', id:number|null) { const next=new URLSearchParams(params); if(id)next.set(side,String(id));else next.delete(side);setParams(next) }
  async function randomPair() {
    setRandomLoading(true);setRandomError('')
    try {
      const movies=(await tmdb.trending('week')).results
      if(movies.length<2)throw new Error()
      const i=Math.floor(Math.random()*movies.length)
      const rest=movies.filter(m=>m.id!==movies[i].id)
      if(!rest.length)throw new Error()
      setParams({ a:String(movies[i].id),b:String(rest[Math.floor(Math.random()*rest.length)].id) })
    } catch { setRandomError('작품을 고르지 못했습니다. 다시 시도해 주세요.') }
    finally { setRandomLoading(false) }
  }
  const left=first.data, right=second.data
  return <div className="page-shell compare-page">
    <title>작품 비교 - HOVIE</title>
    <div className="page-heading compare-heading"><div><h1>두 작품, 다른 매력.</h1><p>평점부터 러닝타임까지 나란히 놓고 골라보세요.</p></div><button className="button" disabled={randomLoading} onClick={() => void randomPair()}><Shuffle size={18} />{randomLoading?'고르는 중…':'랜덤 비교'}</button></div>
    {randomError && <p role="alert" className="error-message">{randomError}</p>}
    <div className="comparison-stage">
      <FilmSlot side="A" movie={left} loading={first.isFetching && !left} error={first.isError} selected={a} other={b} onSelect={id=>select('a',id)} retry={()=>void first.refetch()} />
      <button className="compare-swap" aria-label="두 작품 자리 바꾸기" disabled={!a&&!b} onClick={()=>{ const next=new URLSearchParams(params);if(b)next.set('a',String(b));else next.delete('a');if(a)next.set('b',String(a));else next.delete('b');setParams(next) }}><ArrowsLeftRight size={21} /></button>
      <FilmSlot side="B" movie={right} loading={second.isFetching && !right} error={second.isError} selected={b} other={a} onSelect={id=>select('b',id)} retry={()=>void second.refetch()} />
    </div>
    {left&&right ? <Comparison a={left} b={right} /> : <section className="compare-start"><FilmStrip size={30} /><div><h2>{a||b?'한 작품을 더 골라주세요':'어떤 두 작품이 궁금한가요?'}</h2><p>영화를 검색하거나 익숙한 두 작품으로 시작해 보세요.</p></div><button className="button" onClick={()=>setParams({a:'157336',b:'27205'})}>인터스텔라 × 인셉션</button></section>}
  </div>
}

function FilmSlot({ side,movie,loading,error,selected,other,onSelect,retry }:{side:'A'|'B';movie?:MovieBundle;loading:boolean;error:boolean;selected:number|null;other:number|null;onSelect:(id:number|null)=>void;retry:()=>void}) {
  const id=useId(), wrapper=useRef<HTMLDivElement>(null), input=useRef<HTMLInputElement>(null)
  const [query,setQuery]=useState(''),[debounced,setDebounced]=useState(''),[open,setOpen]=useState(false),[active,setActive]=useState(-1)
  useEffect(()=>{const timer=setTimeout(()=>setDebounced(query.trim()),250);return()=>clearTimeout(timer)},[query])
  const search=useQuery({queryKey:['compare-search',debounced],queryFn:({signal})=>tmdb.search(debounced,1,signal),enabled:open&&debounced.length>=2})
  const results=debounced===query.trim()?(search.data?.results??[]).slice(0,6):[]
  const visible=open&&query.trim().length>=2
  useEffect(()=>{
    if(!open)return
    function outside(e:PointerEvent){if(!wrapper.current?.contains(e.target as Node))setOpen(false)}
    document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)
  },[open])
  function pick(movieId:number){if(movieId===other)return;onSelect(movieId);setQuery('');setDebounced('');setOpen(false);setActive(-1);input.current?.focus()}
  const poster=movie?.poster_path ? IMG.poster(movie.poster_path,'w342') : null
  return <section className={'compare-film compare-side-'+side} aria-label={'작품 '+side}>
    <div className="compare-picker" ref={wrapper} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node|null))setOpen(false)}}><span className="compare-letter" aria-hidden="true">{side}</span><MagnifyingGlass size={19} aria-hidden="true" />
      <input ref={input} id={id} aria-label={'작품 '+side+' 검색'} role="combobox" aria-autocomplete="list" aria-expanded={visible} aria-controls={visible?id+'-results':undefined} aria-activedescendant={visible&&active>=0&&results[active]?id+'-result-'+active:undefined} autoComplete="off" placeholder={movie?'다른 영화로 바꾸기':'영화 제목으로 검색'} value={query} onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(-1)}} onKeyDown={e=>{
        if(e.key==='Escape'){setOpen(false);return}
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();setOpen(true);setActive(v=>results.length?(v+(e.key==='ArrowDown'?1:-1)+results.length)%results.length:-1)}
        if(e.key==='Enter'&&visible&&active>=0&&results[active]){e.preventDefault();pick(results[active].id)}
      }} />
      {selected&&<button className="icon-button compare-clear" aria-label={'작품 '+side+' 선택 해제'} onClick={()=>onSelect(null)}><X size={16} /></button>}
      {visible&&<div className="compare-suggestions"><div role="listbox" id={id+'-results'} aria-label={'작품 '+side+' 검색 결과'}>{debounced===query.trim()&&results.map((m,i)=><div role="option" aria-selected={active===i} aria-disabled={m.id===other} id={id+'-result-'+i} key={m.id} className={'compare-suggestion '+(i===active?'active':'')} onPointerMove={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(m.id)}>{m.poster_path?<img src={IMG.poster(m.poster_path,'w185')!} alt="" />:<FilmStrip size={24} />}<span><strong>{m.title}</strong><small>{m.id===other?'이미 선택한 작품':m.release_date?.slice(0,4)||'개봉일 미정'}</small></span>{m.vote_count>0&&<small>★ {m.vote_average.toFixed(1)}</small>}</div>)}</div>
        {debounced!==query.trim()||search.isFetching?<p role="status">검색 중…</p>:search.isError?<p role="alert">검색하지 못했습니다. <button className="text-button" onClick={()=>void search.refetch()}>다시 시도</button></p>:!results.length?<p role="status">검색 결과가 없습니다.</p>:null}
      </div>}
    </div>
    {loading?<div className="compare-film-loading" role="status"><div className="skeleton" /><p>작품을 불러오는 중…</p></div>:error?<div className="compare-film-empty" role="alert"><FilmStrip size={36} /><h2>작품을 불러오지 못했습니다</h2><button className="button" onClick={retry}>다시 시도</button></div>:movie?<>
      <div className="compare-film-art">{movie.backdrop_path&&<img className="compare-backdrop" src={IMG.backdrop(movie.backdrop_path,'w780')!} alt="" />}<div className="compare-art-scrim" />{poster?<img className="compare-poster" src={poster} alt={movie.title+' 포스터'} width="120" height="180" />:<div className="compare-poster-placeholder"><FilmStrip size={38} /></div>}<span className="compare-art-tag">{movie.release_date?.slice(0,4)||'개봉일 미정'}</span></div>
      <div className="compare-film-info"><div className="compare-title-row"><h2>{movie.title}</h2><Link className="icon-button" to={'/movie/'+movie.id} aria-label={movie.title+' 상세 보기'}><ArrowUpRight size={21} /></Link></div><p className="compare-original">{movie.original_title}</p><div className="compare-genre-tags">{movie.genres.slice(0,3).map(g=><span key={g.id}>{g.name}</span>)}</div><p className="compare-synopsis">{movie.overview||'등록된 줄거리가 없습니다.'}</p></div>
    </>:<div className="compare-film-empty"><div className="compare-empty-poster"><FilmStrip size={36} /></div><h2>{side==='A'?'첫 번째 작품':'두 번째 작품'}</h2><p>위 검색창에서 비교할 영화를 골라주세요.</p></div>}
  </section>
}

function Comparison({a,b}:{a:MovieBundle;b:MovieBundle}) {
  const rated=a.vote_count>0&&b.vote_count>0
  const ratingGap=Math.abs(a.vote_average-b.vote_average)
  const runtimeGap=Math.abs(a.runtime-b.runtime)
  const sameGenres=a.genres.filter(g=>b.genres.some(other=>other.id===g.id))
  return <div className="comparison-results">
    <div className="comparison-section-heading"><div><h2>차이를 한눈에</h2><p>색상은 위 작품의 A·B 표시와 연결됩니다.</p></div><div className="compare-legend"><span><i className="series-A" />A</span><span><i className="series-B" />B</span></div></div>
    <div className="compare-highlights">
      <section className="compare-rating-panel"><div className="compare-metric-heading"><h3>관객 평점</h3><span>TMDB / 10점</span></div><div className="compare-rings">{[a,b].map((m,i)=><div key={i} className={'compare-score compare-side-'+(i?'B':'A')}><div className="compare-ring"><svg viewBox="0 0 112 112" aria-hidden="true"><circle className="ring-track" cx="56" cy="56" r="48" /><circle className="ring-value" cx="56" cy="56" r="48" pathLength="100" strokeDasharray={(m.vote_count>0?m.vote_average*10:0)+' 100'} /></svg><strong>{m.vote_count>0?m.vote_average.toFixed(1):'미평가'}</strong></div><span><b>{i?'B':'A'}</b> {m.title}</span><small>{m.vote_count.toLocaleString()}명 평가</small></div>)}</div><p className="compare-insight">{rated?(ratingGap<0.05?'두 작품의 평균 평점이 같습니다.':(a.vote_average>b.vote_average?'A':'B')+' 작품의 평점이 '+ratingGap.toFixed(1)+'점 높아요.'):'평가 데이터가 충분하지 않습니다.'}</p></section>
      <section className="compare-runtime-panel"><div className="compare-metric-heading"><h3>러닝타임</h3><span>작품 한 편 기준</span></div><BarPair a={a.runtime} b={b.runtime} format={duration} /><p className="compare-insight">{a.runtime>0&&b.runtime>0?(runtimeGap?(a.runtime<b.runtime?'A':'B')+' 작품을 '+runtimeGap+'분 더 가볍게 볼 수 있어요.':'두 작품의 러닝타임이 같습니다.'):'러닝타임 정보가 없는 작품이 있습니다.'}</p><div className="compare-common"><h3>함께 가진 장르</h3><div className="compare-genre-tags">{sameGenres.length?sameGenres.map(g=><span key={g.id}>{g.name}</span>):<p>겹치는 장르가 없는 두 작품이에요.</p>}</div></div></section>
    </div>
    <section className="compare-finance"><div className="comparison-section-heading"><div><h2>숫자로 보는 규모</h2><p>각 항목의 두 작품 중 큰 값을 기준으로 막대를 표시합니다.</p></div></div><div className="compare-finance-grid"><div><h3>제작 예산</h3><BarPair a={a.budget} b={b.budget} format={money} /></div><div><h3>전 세계 흥행 수익</h3><BarPair a={a.revenue} b={b.revenue} format={money} /></div></div><p className="helper">금액은 TMDB에 등록된 미국 달러 기준입니다. 0으로 등록된 금액은 정보 없음으로 표시하며, 흥행 수익은 순이익을 뜻하지 않습니다.</p></section>
    <details className="compare-extra"><summary>인기 지수와 수익 배수 더 보기</summary><div className="compare-finance-grid"><div><h3>TMDB 인기 지수</h3><BarPair a={a.popularity} b={b.popularity} format={v=>v>0?v.toFixed(1):'정보 없음'} /></div><div><h3>예산 대비 흥행 수익</h3><BarPair a={a.budget>0&&a.revenue>0?a.revenue/a.budget:0} b={b.budget>0&&b.revenue>0?b.revenue/b.budget:0} format={v=>v>0?v.toFixed(1)+'배':'정보 없음'} /></div></div><p className="helper">수익 배수는 전 세계 흥행 수익을 제작 예산으로 나눈 값이며 순이익률이 아닙니다.</p></details>
    <section className="compare-credits"><div className="comparison-section-heading"><div><h2>이야기를 만든 사람들</h2></div></div><div className="compare-credits-grid">{[a,b].map((m,i)=><div key={i} className={'compare-side-'+(i?'B':'A')}><div className="compare-credit-title"><span className="compare-letter">{i?'B':'A'}</span><strong>{m.title}</strong></div><p className="compare-production">제작 국가: {m.production_countries.map(c=>c.name).join(', ')||'정보 없음'}</p><p className="compare-director"><span>감독</span> {m.credits?.crew.filter(c=>c.job==='Director').map(c=>c.name).join(', ')||'정보 없음'}</p><div className="compare-cast">{m.credits?.cast.slice(0,3).map(c=><Link key={c.id} to={'/person/'+c.id}>{c.profile_path?<img src={IMG.poster(c.profile_path,'w185')!} alt="" width="48" height="48" />:<span className="cast-placeholder"><FilmStrip size={22} /></span>}<span><strong>{c.name}</strong><small>{c.character}</small></span></Link>)}{!m.credits?.cast.length&&<p className="helper">등록된 출연진이 없습니다.</p>}</div></div>)}</div></section>
    <p className="compare-footnote">평점과 흥행 수치만으로 작품의 완성도나 취향을 판단할 수는 없습니다. 마음이 가는 이야기를 골라보세요.</p>
  </div>
}
function BarPair({a,b,format}:{a:number;b:number;format:(v:number)=>string}) {
  const max=Math.max(a,b,1)
  return <div className="compare-bar-pair">{[a,b].map((value,i)=><div className={'compare-bar-row compare-side-'+(i?'B':'A')} key={i}><div className="compare-bar-label"><span className="compare-letter">{i?'B':'A'}</span><strong>{format(value)}</strong></div><div className="compare-bar-track" aria-hidden="true"><div style={{width:(value>0?value/max*100:0)+'%'}} /></div></div>)}</div>
}
