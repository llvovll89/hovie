import { useState, useEffect } from 'react'
import { tmdb } from '../lib/tmdb'
import type { Movie } from '../types'

export function useTrending() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tmdb
      .trending()
      .then(data => setMovies((data.results as Movie[]).slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { movies, loading }
}
