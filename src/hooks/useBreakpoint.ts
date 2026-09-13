import { useSyncExternalStore } from 'react'

const QUERIES = {
  isMobile: '(max-width: 767px)',
  isTablet: '(max-width: 1023px)',
} as const

function subscribe(query: string, onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    onChange => subscribe(query, onChange),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useBreakpoint() {
  const isMobile = useMediaQuery(QUERIES.isMobile)
  const isTablet = useMediaQuery(QUERIES.isTablet)
  return { isMobile, isTablet }
}
