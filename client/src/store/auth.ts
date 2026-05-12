import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User } from '@supabase/supabase-js'
import type { Role } from '../constants/roles'
import type { AuthProfile } from '../types/auth'

// ============================================================
// MODO MOCK/OFFLINE — No requiere Supabase configurado.
// Para reactivar la autenticación real, restaurar los imports
// de supabase e isRole y reemplazar el cuerpo del store.
// ============================================================

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>({ id: 'mock-id', email: 'admin@demo.com' } as any)
  const session = ref<Session | null>({ access_token: 'mock-token', user: {} } as any)
  const profile = ref<AuthProfile | null>({
    id: 'mock-id',
    business_id: '00000000-0000-0000-0000-000000000001',
    full_name: 'Admin de Prueba (Offline)',
    role: 'admin',
    phone: null,
    avatar_url: null,
  })
  const initialized = ref(true)
  const loading = ref(false)

  const isAuthenticated = computed(() => true)
  const role = computed<Role | null>(() => profile.value?.role ?? null)
  const businessId = computed(() => profile.value?.business_id ?? null)

  const initialize = async () => {
    initialized.value = true
  }

  const signIn = async (_email: string, _password: string) => {
    loading.value = true
    await new Promise(r => setTimeout(r, 300))
    loading.value = false
  }

  const signOut = async () => {
    // No-op en modo mock
  }

  return {
    user,
    session,
    profile,
    initialized,
    loading,
    isAuthenticated,
    role,
    businessId,
    initialize,
    signIn,
    signOut,
  }
})
