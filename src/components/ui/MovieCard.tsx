import { memo } from 'react'
import { Link } from 'react-router-dom'
import { FilmSlate } from '@phosphor-icons/react/dist/csr/FilmSlate'
import { Star } from '@phosphor-icons/react/dist/csr/Star'
import { IMG } from '../../lib/tmdb'
import { mediaHref } from '../../lib/media'
import type { Movie } from '../../types'
interface Props { movie: Movie; rank?: number }
const MovieCard = memo(function MovieCard({ movie, rank }: Props) {
  return <Link className="movie-card" to={mediaHref(movie)}>
    <div className="movie-poster">{movie.poster_path ? <img src={IMG.poster(movie.poster_path, 'w342')!} alt="" loading="lazy" decoding="async" width="342" height="513" /> : <div className="poster-empty"><FilmSlate size={36} /><span>포스터 없음</span></div>}<span className="poster-open">작품 살펴보기</span></div>
    <div className="movie-caption"><h3>{rank && <span className="movie-rank">{rank}</span>}{movie.title}</h3><div className="movie-meta"><span>{movie.mediaType === 'tv' ? 'TV' : '영화'}</span><span>{movie.release_date?.slice(0, 4) || '연도 미정'}</span>{movie.vote_average > 0 && <span className="movie-score"><Star weight="fill" size={12} aria-label="평점" />{movie.vote_average.toFixed(1)}</span>}</div></div>
  </Link>
})
export default MovieCard
