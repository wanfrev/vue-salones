import { QueryClient, QueryCache, MutationCache } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { supabase } from './lib/supabase'

const oneDayMs = 24 * 60 * 60 * 1000

const isAuthError = (err: unknown): boolean => {
  if (!err) return false
  const e = err as { status?: number; code?: string; message?: string; name?: string }
  if (e.status === 401 || e.code === '401') return true
  if (e.code === 'PGRST301' || e.code === 'PGRST302') return true
  const msg = (e.message ?? '').toLowerCase()
  return msg.includes('jwt') || msg.includes('invalid refresh token') || msg.includes('refresh token not found') || msg.includes('session expired')
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => {
      if (isAuthError(err)) {
        supabase.auth.signOut().catch(() => {})
        queryClient.clear()
        localStorage.removeItem('salones.query-cache')
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.assign('/')
        }
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (err) => {
      if (isAuthError(err)) {
        supabase.auth.signOut().catch(() => {})
        queryClient.clear()
        localStorage.removeItem('salones.query-cache')
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.assign('/')
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: oneDayMs,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
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
