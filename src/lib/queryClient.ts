import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 영화/TV 상세 정보는 자주 변하지 않으므로 10분 캐시
      staleTime: 10 * 60 * 1000,
      // GC는 30분 뒤 (탭 이동 후 빠른 복귀 지원)
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      // 네트워크 복구 시 자동 재요청
      refetchOnReconnect: true,
    },
  },
})
