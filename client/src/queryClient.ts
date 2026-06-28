import { QueryClient, QueryCache, MutationCache } from '@tanstack/vue-query'
import { supabase } from './lib/supabase'

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
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.assign('/')
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
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
