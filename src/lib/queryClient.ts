import { QueryClient } from '@tanstack/react-query'
import { TMDBError } from './tmdb'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 영화/TV 상세 정보는 자주 변하지 않으므로 10분 캐시
      staleTime: 10 * 60 * 1000,
      // GC는 30분 뒤 (탭 이동 후 빠른 복귀 지원)
      gcTime: 30 * 60 * 1000,
      retry: (count, error) => count < 2 && (!(error instanceof TMDBError) || error.status === 429 || error.status >= 500),
      retryDelay: (attempt, error) => error instanceof TMDBError && error.retryAfter ? error.retryAfter * 1000 : Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      // 네트워크 복구 시 자동 재요청
      refetchOnReconnect: true,
    },
  },
})
