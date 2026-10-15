import type { IncomingMessage, ServerResponse } from 'node:http'
import process from 'node:process'

export function escapeHTML(value: string) { return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!)) }
export function previewHTML(data: { title: string; description: string; image: string; url: string; type: 'movie' | 'tv' }) {
  const title = escapeHTML(data.title + ' - HOVIE'), description = escapeHTML(data.description), image = escapeHTML(data.image), url = escapeHTML(data.url)
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><meta name="description" content="' + description + '"><link rel="canonical" href="' + url + '"><meta property="og:title" content="' + title + '"><meta property="og:description" content="' + description + '"><meta property="og:image" content="' + image + '"><meta property="og:url" content="' + url + '"><meta property="og:type" content="' + (data.type === 'movie' ? 'video.movie' : 'video.tv_show') + '"><meta property="og:site_name" content="HOVIE"><meta name="twitter:card" content="summary_large_image"></head><body><h1>' + title + '</h1><p>' + description + '</p><a href="' + url + '">HOVIE에서 작품 보기</a></body></html>'
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'https://hovie.vercel.app')
  const type = url.searchParams.get('type'), id = url.searchParams.get('id')
  if (!['movie','tv'].includes(type ?? '') || !/^\d+$/.test(id ?? '') || Number(id) < 1) { res.statusCode = 400; res.end('Invalid content'); return }
  const token = process.env.TMDB_READ_ACCESS_TOKEN ?? process.env.VITE_MOVIE_API_KEY
  if (!token) { res.statusCode = 503; res.end('Preview temporarily unavailable'); return }
  try {
    const response = await fetch('https://api.themoviedb.org/3/' + type + '/' + id + '?language=ko-KR', { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(8000) })
    if (!response.ok) { res.statusCode = response.status === 404 ? 404 : 503; res.end('Preview temporarily unavailable'); return }
    const item = await response.json() as { title?: string; name?: string; overview?: string; backdrop_path?: string; poster_path?: string }
    res.setHeader('Content-Type','text/html; charset=utf-8')
    res.setHeader('Vary','User-Agent')
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400')
    res.setHeader('X-Content-Type-Options','nosniff')
    res.end(previewHTML({ title: item.title ?? item.name ?? 'HOVIE', description: item.overview?.slice(0,300) ?? '작품 정보와 시청 서비스를 확인하세요.', image: item.backdrop_path ? 'https://image.tmdb.org/t/p/w1280' + item.backdrop_path : item.poster_path ? 'https://image.tmdb.org/t/p/w500' + item.poster_path : 'https://hovie.vercel.app/icon-512.png', url: 'https://hovie.vercel.app/' + type + '/' + id, type: type as 'movie' | 'tv' }))
  } catch { res.statusCode = 503; res.end('Preview temporarily unavailable') }
}
