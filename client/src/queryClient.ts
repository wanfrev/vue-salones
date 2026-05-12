import { QueryClient } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const oneDayMs = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: oneDayMs,
      retry: 1,
      refetchOnWindowFocus: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
})

if (typeof window !== 'undefined' && window.localStorage) {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: 'salones.query-cache',
    throttleTime: 1000,
  })

  persistQueryClient({
    queryClient,
    persister,
    maxAge: oneDayMs,
  })
}
