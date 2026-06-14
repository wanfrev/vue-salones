import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { createMockClient } from './mock/mockClient'

const IS_MOCK = import.meta.env.VITE_USE_LOCAL_MOCK === 'true'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

const fetchWithTimeout: typeof fetch = (url, opts) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeoutId))
}

const realSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

export const supabase = IS_MOCK ? createMockClient() : realSupabase
