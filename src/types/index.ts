export interface Movie {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genre_ids: number[]
  overview: string
  popularity: number
  adult: boolean
}

export interface MovieDetail {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genres: Genre[]
  overview: string
  tagline: string
  runtime: number
  status: string
  budget: number
  revenue: number
  popularity: number
  production_countries: { iso_3166_1: string; name: string }[]
  spoken_languages: { name: string; iso_639_1: string }[]
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface WatchProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface WatchProviderResult {
  link: string
  flatrate?: WatchProvider[]
  rent?: WatchProvider[]
  buy?: WatchProvider[]
}

export interface Comment {
  id: string
  userId: string
  userEmail: string
  userDisplayName: string
  userPhotoURL: string | null
  movieId: number
  content: string
  rating: number
  createdAt: Date
}

export interface SearchFilters {
  genre: number | null
  year: string
  minRating: number
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'release_date.asc'
}
