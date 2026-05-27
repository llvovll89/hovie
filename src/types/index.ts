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
  mediaType?: 'movie' | 'tv'
}

export interface TVShow {
  id: number
  name: string
  original_name: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  first_air_date: string
  genre_ids: number[]
  overview: string
  popularity: number
}

export interface TVSeason {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date: string | null
  poster_path: string | null
  overview: string
}

export interface TVDetail {
  id: number
  name: string
  original_name: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  first_air_date: string
  last_air_date: string
  genres: Genre[]
  overview: string
  tagline: string
  status: string
  number_of_seasons: number
  number_of_episodes: number
  episode_run_time: number[]
  in_production: boolean
  networks: { id: number; name: string; logo_path: string | null }[]
  created_by: { id: number; name: string; profile_path: string | null }[]
  production_countries: { iso_3166_1: string; name: string }[]
  spoken_languages: { name: string; iso_639_1: string }[]
  popularity: number
  seasons: TVSeason[]
}

export interface PersonTVCredit {
  id: number
  name: string
  character?: string
  job?: string
  poster_path: string | null
  first_air_date: string
  vote_average: number
  genre_ids: number[]
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
  belongs_to_collection: { id: number; name: string; poster_path: string | null; backdrop_path: string | null } | null
}

export interface CollectionDetail {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  parts: Movie[]
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
  runtime: '' | '~90' | '90~120' | '120~150' | '150~'
  language: string
}

export interface VideoItem {
  id: string
  key: string
  name: string
  site: string
  type: string
  iso_639_1: string
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface PersonDetail {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  gender: number
  popularity: number
  also_known_as: string[]
}

export interface MovieImage {
  file_path: string
  width: number
  height: number
  aspect_ratio: number
  vote_average: number
  vote_count: number
}

export interface WatchedMovie extends Movie {
  myRating: number
  watchedAt: Date
}

export interface PersonCredit {
  id: number
  title: string
  character?: string
  job?: string
  poster_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

export interface Keyword {
  id: number
  name: string
}

export interface ExternalIds {
  imdb_id: string | null
  instagram_id: string | null
  twitter_id: string | null
}

export interface TMDBReview {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
  url: string
}
