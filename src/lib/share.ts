import type { MediaType } from './media'
export interface SharedList { version: 1; title: string; description: string; items: { id: number; mediaType: MediaType }[] }
export function encodeList(list: SharedList): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(list)))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}
export function decodeList(encoded: string): SharedList {
  if (!encoded || encoded.length > 12000) throw new Error('올바른 공유 링크가 아닙니다.')
  const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0))))
  if (parsed.version !== 1 || typeof parsed.title !== 'string' || !parsed.title.trim() || parsed.title.length > 60 || typeof parsed.description !== 'string' || parsed.description.length > 300 || !Array.isArray(parsed.items) || parsed.items.length < 1 || parsed.items.length > 24 || parsed.items.some((i: { id: number; mediaType: string }) => !i || !Number.isSafeInteger(i.id) || i.id < 1 || !['movie','tv'].includes(i.mediaType))) throw new Error('공유 목록 형식을 확인해 주세요.')
  return parsed as SharedList
}
