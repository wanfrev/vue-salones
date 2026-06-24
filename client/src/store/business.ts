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

const DEFAULT_FEATURES = {
  pos: true,
  inventario: true,
  productos: true,
  proveedores: true,
  multi_branch: false,
}

export type FeatureKey = keyof typeof DEFAULT_FEATURES

export const useBusinessStore = defineStore('business', () => {
  const business = ref<Business | null>(null)
  const loading = ref(false)

  const nicheType = computed(() => business.value?.niche_type ?? 'salon')
  const terminology = computed(() => business.value?.terminology ?? DEFAULT_TERMINOLOGY)
  const jobTitles = computed(() => business.value?.job_titles ?? [])
  const serviceCategories = computed(() => business.value?.service_categories ?? [])
  const features = computed(() => ({ ...DEFAULT_FEATURES, ...(business.value as any)?.features }))
  const hasFeature = (key: FeatureKey): boolean => features.value[key]
  const isMultiBranch = computed(() => features.value.multi_branch)

  const loadBusiness = async (nextBusinessId: string | null) => {
    if (!nextBusinessId) {
      business.value = null
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, phone, address, timezone, currency, ves_exchange_rate, niche_type, theme_config, terminology, job_titles, service_categories, active, features')
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
      Object.assign(business.value, partial)
    }
  }

  return {
    business,
    loading,
    nicheType,
    terminology,
    jobTitles,
    serviceCategories,
    isMultiBranch,
    features,
    hasFeature,
    loadBusiness,
    clearBusiness,
    updateBusiness,
  }
})
