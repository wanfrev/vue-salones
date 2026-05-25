import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Role } from '../constants/roles'
import { isRole } from '../constants/roles'
import type { AuthProfile } from '../types/auth'
import type { Business, Profile, Terminology } from '../types/database'

const DEFAULT_TERMINOLOGY: Terminology = {
  client: 'Cliente',
  employee: 'Empleado',
  service: 'Servicio',
  appointment: 'Cita',
  staff: 'Personal',
  pet: 'Mascota',
  owner: 'Dueno',
  breed: 'Raza',
  weight: 'Peso',
  vaccines: 'Vacunas',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<AuthProfile | null>(null)
  const business = ref<Business | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const role = computed<Role | null>(() => profile.value?.role ?? null)
  const businessId = computed(() => profile.value?.business_id ?? null)
  const nicheType = computed(() => business.value?.niche_type ?? 'salon')
  const terminology = computed(() => business.value?.terminology ?? DEFAULT_TERMINOLOGY)

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, business_id, full_name, role, phone, avatar_url, active')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      profile.value = null
      throw error
    }

    if (!data) {
      profile.value = null
      throw new Error('Perfil de usuario no encontrado. Contacta al administrador.')
    }

    const authProfile = data as Profile

    if (!isRole(authProfile.role)) {
      profile.value = null
      throw new Error('El perfil no tiene un rol válido.')
    }

    if (!authProfile.active) {
      profile.value = null
      throw new Error('El usuario está inactivo.')
    }

    profile.value = {
      id: authProfile.id,
      business_id: authProfile.business_id,
      full_name: authProfile.full_name,
      role: authProfile.role,
      phone: authProfile.phone,
      avatar_url: authProfile.avatar_url,
    }
  }

  const loadBusiness = async (nextBusinessId: string | null) => {
    if (!nextBusinessId) {
      business.value = null
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, phone, address, timezone, currency, ves_exchange_rate, niche_type, theme_config, terminology, active')
      .eq('id', nextBusinessId)
      .single()

    if (error) {
      business.value = null
      throw error
    }

    business.value = data as Business
  }

  const clearAuthState = () => {
    user.value = null
    session.value = null
    profile.value = null
    business.value = null
  }

  const initialize = async () => {
    if (initialized.value) return

    loading.value = true

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      session.value = data.session
      user.value = data.session?.user ?? null

      if (user.value) {
        try {
          await loadProfile(user.value.id)
          await loadBusiness(profile.value?.business_id ?? null)
        } catch {
          clearAuthState()
          await supabase.auth.signOut()
        }
      }

      supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, nextSession: Session | null) => {
        session.value = nextSession
        user.value = nextSession?.user ?? null

        if (user.value) {
          try {
            await loadProfile(user.value.id)
            await loadBusiness(profile.value?.business_id ?? null)
          } catch {
            clearAuthState()
          }
        } else {
          profile.value = null
          business.value = null
        }
      })
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      session.value = data.session
      user.value = data.user

      if (data.user) {
        await loadProfile(data.user.id)
        await loadBusiness(profile.value?.business_id ?? null)
      }
    } catch (err) {
      clearAuthState()
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      await supabase.auth.signOut()
      clearAuthState()
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    profile,
    business,
    initialized,
    loading,
    isAuthenticated,
    role,
    businessId,
    nicheType,
    terminology,
    initialize,
    signIn,
    signOut,
  }
})
