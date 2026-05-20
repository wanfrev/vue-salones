import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Role } from '../constants/roles'
import { isRole } from '../constants/roles'
import type { AuthProfile } from '../types/auth'
import type { Business, Profile, ThemeConfig, Terminology } from '../types/database'

const DEFAULT_THEME: ThemeConfig = {
  primary: '#2F4156',
  secondary: '#567CB0',
}

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
  const themeConfig = computed(() => business.value?.theme_config ?? DEFAULT_THEME)
  const terminology = computed(() => business.value?.terminology ?? DEFAULT_TERMINOLOGY)

  const applyThemeConfig = (config: ThemeConfig) => {
    const html = document.documentElement
    html.style.setProperty('--color-primary', config.primary)
    html.style.setProperty('--color-primary-hover', config.primary)
    html.style.setProperty('--color-primary-light', `${config.primary}1A`)
    html.style.setProperty('--color-primary-dark', config.primary)
    html.style.setProperty('--color-info', config.secondary)
    html.style.setProperty('--color-info-light', `${config.secondary}1A`)
  }

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, business_id, full_name, role, phone, avatar_url, active')
      .eq('id', userId)
      .single()

    if (error) {
      profile.value = null
      throw error
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
      applyThemeConfig(DEFAULT_THEME)
      return
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, phone, address, timezone, currency, niche_type, theme_config, terminology, active')
      .eq('id', nextBusinessId)
      .single()

    if (error) {
      business.value = null
      throw error
    }

    business.value = data as Business
    applyThemeConfig(business.value.theme_config ?? DEFAULT_THEME)
  }

  const clearAuthState = () => {
    user.value = null
    session.value = null
    profile.value = null
    business.value = null
    applyThemeConfig(DEFAULT_THEME)
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
        await loadProfile(user.value.id)
        await loadBusiness(profile.value?.business_id ?? null)
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
          applyThemeConfig(DEFAULT_THEME)
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
    themeConfig,
    terminology,
    initialize,
    signIn,
    signOut,
  }
})
