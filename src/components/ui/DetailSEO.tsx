import { useLocation } from 'react-router-dom'
import { IMG } from '../../lib/tmdb'
export default function DetailSEO({ type, title, overview, poster, date, rating, votes }: { type: 'Movie' | 'TVSeries'; title: string; overview: string; poster: string | null; date: string; rating: number; votes: number }) {
  const { pathname } = useLocation()
  const url = 'https://hovie.vercel.app' + pathname
  const schema = { '@context': 'https://schema.org', '@type': type, name: title, description: overview, image: IMG.poster(poster), url, ...(date ? { datePublished: date } : {}), ...(votes > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, ratingCount: votes, bestRating: 10, worstRating: 0 } } : {}) }
  return <><link rel="canonical" href={url} /><meta property="og:url" content={url} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /></>
}
