import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePersonDetail } from '../../hooks/usePersonDetail'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import MovieCard from '../../components/ui/MovieCard'
import Spinner from '../../components/ui/Spinner'
import type { Movie, PersonTVCredit } from '../../types'

const A = 'var(--accent)'

const DEPT_LABELS: Record<string, string> = {
  Acting: '배우', Directing: '감독', Writing: '작가',
  Production: '프로듀서', Sound: '음향', Camera: '촬영',
}

function creditToMovie(c: { id: number; title: string; poster_path: string | null; release_date: string; vote_average: number; genre_ids: number[] }): Movie {
  return {
    id: c.id, title: c.title, original_title: c.title,
    poster_path: c.poster_path, backdrop_path: null,
    vote_average: c.vote_average, vote_count: 0,
    release_date: c.release_date, genre_ids: c.genre_ids ?? [],
    overview: '', popularity: 0, adult: false,
  }
}

function tvCreditToMovie(c: PersonTVCredit): Movie {
  return {
    id: c.id, title: c.name, original_title: c.name,
    poster_path: c.poster_path, backdrop_path: null,
    vote_average: c.vote_average, vote_count: 0,
    release_date: c.first_air_date, genre_ids: c.genre_ids ?? [],
    overview: '', popularity: 0, adult: false, mediaType: 'tv',
  }
}

function calcAge(birthday: string, deathday: string | null): number {
  const end = deathday ? new Date(deathday) : new Date()
  const birth = new Date(birthday)
  let age = end.getFullYear() - birth.getFullYear()
  if (end.getMonth() < birth.getMonth() || (end.getMonth() === birth.getMonth() && end.getDate() < birth.getDate())) age--
  return age
}

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const { person, castCredits, crewCredits, tvCastCredits, loading, error } = usePersonDetail(Number(id))
  const [bioExpanded, setBioExpanded] = useState(false)

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}><Spinner size={48} /></div>
  }

  if (error || !person) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <p style={{ color: 'var(--text-3)', fontSize: 16 }}>{error ?? '인물을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 20, background: 'none', border: '1px solid var(--border-4)', color: 'var(--text)', padding: '10px 24px', cursor: 'pointer', fontSize: 12 }}>
          ← 뒤로 가기
        </button>
      </div>
    )
  }

  const profileUrl = person.profile_path ? `https://image.tmdb.org/t/p/w342${person.profile_path}` : null
  const age = person.birthday ? calcAge(person.birthday, person.deathday) : null
  const deptLabel = DEPT_LABELS[person.known_for_department] ?? person.known_for_department

  const bio = person.biography || '인물 정보가 없습니다.'
  const bioLong = bio.length > 500
  const displayBio = bioExpanded || !bioLong ? bio : bio.slice(0, 500) + '...'

  const castMovies = castCredits.map(creditToMovie)
  const crewMovies = crewCredits.map(creditToMovie)
  const tvMovies = tvCastCredits.map(tvCreditToMovie)

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px 80px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ marginBottom: 28, background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          뒤로
        </button>

        {/* Profile header */}
        <div style={{ display: 'flex', gap: isMobile ? 20 : 48, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 56 }}>

          {/* Photo */}
          <div style={{ flexShrink: 0, width: isMobile ? 140 : 200 }}>
            {profileUrl ? (
              <img src={profileUrl} alt={person.name} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 4, boxShadow: '0 12px 40px var(--shadow)', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, borderRadius: 4 }}>👤</div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <p style={{ color: A, fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 8 }}>{deptLabel}</p>
            <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 700, margin: '0 0 20px', lineHeight: 1.2 }}>
              {person.name}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              {person.birthday && (
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 3 }}>생년월일</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{person.birthday}{age !== null ? ` (${age}세)` : ''}</p>
                </div>
              )}
              {person.deathday && (
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 3 }}>사망일</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{person.deathday}</p>
                </div>
              )}
              {person.place_of_birth && (
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 3 }}>출생지</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{person.place_of_birth}</p>
                </div>
              )}
              {castCredits.length > 0 && (
                <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 3 }}>출연작</p>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>{castCredits.length}편</p>
                </div>
              )}
            </div>

            {/* Biography */}
            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.85, margin: '0 0 10px', whiteSpace: 'pre-line' }}>
              {displayBio}
            </p>
            {bioLong && (
              <button
                onClick={() => setBioExpanded(o => !o)}
                style={{ background: 'none', border: 'none', color: A, fontSize: 12, cursor: 'pointer', padding: 0, letterSpacing: '0.06em' }}
              >
                {bioExpanded ? '접기 ↑' : '더 보기 ↓'}
              </button>
            )}
          </div>
        </div>

        {/* Cast filmography */}
        {castMovies.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <p style={{ color: A, fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>Filmography</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                출연 작품 <span style={{ color: 'var(--text-4)', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{castMovies.length}편</span>
              </h2>
            </div>
            <div className="movie-grid-auto">
              {castMovies.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}

        {/* Directing credits */}
        {crewMovies.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <p style={{ color: A, fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>Directed</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                감독 작품 <span style={{ color: 'var(--text-4)', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{crewMovies.length}편</span>
              </h2>
            </div>
            <div className="movie-grid-auto">
              {crewMovies.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}

        {/* TV credits */}
        {tvMovies.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ marginBottom: 24, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <p style={{ color: A, fontSize: 10, letterSpacing: '0.35em', margin: '0 0 6px', textTransform: 'uppercase' }}>TV Series</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                TV 출연작 <span style={{ color: 'var(--text-4)', fontSize: 14, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{tvMovies.length}편</span>
              </h2>
            </div>
            <div className="movie-grid-auto">
              {tvMovies.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
