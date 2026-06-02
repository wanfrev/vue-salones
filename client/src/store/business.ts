import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import type { Business, Terminology } from '../types/database'

const DEFAULT_TERMINOLOGY: Terminology = {
  client: 'Cliente',
  employee: 'Empleado',
  service: 'Servicio',
  appointment: 'Cita',
  staff: 'Personal',
  pet: 'Mascota',
  owner: 'Dueño',
  breed: 'Raza',
  weight: 'Peso',
  vaccines: 'Vacunas',
}

export const useBusinessStore = defineStore('business', () => {
  const business = ref<Business | null>(null)
  const loading = ref(false)

  const nicheType = computed(() => business.value?.niche_type ?? 'salon')
  const terminology = computed(() => business.value?.terminology ?? DEFAULT_TERMINOLOGY)
  const jobTitles = computed(() => business.value?.job_titles ?? [])
  const serviceCategories = computed(() => business.value?.service_categories ?? [])

  const loadBusiness = async (nextBusinessId: string | null) => {
    if (!nextBusinessId) {
      business.value = null
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, phone, address, timezone, currency, ves_exchange_rate, niche_type, theme_config, terminology, job_titles, service_categories, active')
        .eq('id', nextBusinessId)
        .single()

      if (error) throw error

      if (data.deleted_at) {
        business.value = null
        throw new Error('El negocio ha sido dado de baja.')
      }

      business.value = data as Business
    } finally {
      loading.value = false
    }
  }

  const clearBusiness = () => {
    business.value = null
  }

  const updateBusiness = (partial: Partial<Business>) => {
    if (business.value) {
      business.value = { ...business.value, ...partial }
    }
  }

  return {
    business,
    loading,
    nicheType,
    terminology,
    jobTitles,
    serviceCategories,
    loadBusiness,
    clearBusiness,
    updateBusiness,
  }
})
