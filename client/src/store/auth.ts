import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { queryClient } from '../queryClient'
import type { Role } from '../constants/roles'
import { isRole } from '../constants/roles'
import type { AuthProfile } from '../types/auth'
import type { Profile } from '../types/database'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const profile = ref<AuthProfile | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const role = computed<Role | null>(() => profile.value?.role ?? null)
  const businessId = computed(() => profile.value?.business_id ?? null)

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

  const clearAuthState = () => {
    user.value = null
    session.value = null
    profile.value = null
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
          const { useBusinessStore } = await import('./business')
          const businessStore = useBusinessStore()
          await businessStore.loadBusiness(profile.value?.business_id ?? null)
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
            const { useBusinessStore } = await import('./business')
            const businessStore = useBusinessStore()
            await businessStore.loadBusiness(profile.value?.business_id ?? null)
          } catch {
            clearAuthState()
          }
        } else {
          profile.value = null
          const { useBusinessStore } = await import('./business')
          useBusinessStore().clearBusiness()
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
        const { useBusinessStore } = await import('./business')
        const businessStore = useBusinessStore()
        await businessStore.loadBusiness(profile.value?.business_id ?? null)
      }
    } catch (err) {
      clearAuthState()
      throw err
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    if (loading.value) return
    loading.value = true
    try {
      await supabase.auth.signOut()
      queryClient.clear()
      clearAuthState()
      const { useBusinessStore } = await import('./business')
      useBusinessStore().clearBusiness()
    } finally {
      loading.value = false
    }
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
