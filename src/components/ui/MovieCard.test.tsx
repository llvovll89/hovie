import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MovieCard from './MovieCard'
import type { Movie } from '../../types'

const baseMovie: Movie = {
  id: 42,
  title: '더 러너',
  original_title: 'The Runner',
  poster_path: '/poster.jpg',
  backdrop_path: null,
  vote_average: 7.5,
  vote_count: 100,
  release_date: '2026-03-01',
  genre_ids: [],
  overview: '',
  popularity: 1,
  adult: false,
}

function renderCard(movie: Movie, rank?: number) {
  return render(
    <MemoryRouter>
      <MovieCard movie={movie} rank={rank} />
    </MemoryRouter>
  )
}

describe('MovieCard', () => {
  it('renders as a link to the movie detail page (keyboard accessible)', () => {
    renderCard(baseMovie)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/movie/42')
  })

  it('links to the TV detail page for TV items', () => {
    renderCard({ ...baseMovie, mediaType: 'tv' })
    expect(screen.getByRole('link')).toHaveAttribute('href', '/tv/42')
  })

  it('shows a poster-less fallback when poster_path is missing', () => {
    renderCard({ ...baseMovie, poster_path: null })
    expect(screen.getByText('포스터 없음')).toBeInTheDocument()
  })

  it('shows a rank badge when rank is provided', () => {
    renderCard(baseMovie, 3)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
