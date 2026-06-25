import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import { listBranches } from '../services/branchesService'
import type { Business, Terminology, Branch } from '../types/database'

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

function branchStorageKey(businessId: string): string {
  return `luma_selected_branch_${businessId}`
}

export const useBusinessStore = defineStore('business', () => {
  const business = ref<Business | null>(null)
  const loading = ref(false)
  const branches = ref<Branch[]>([])
  const selectedBranchId = ref<string | null>(null)
  const branchesLoading = ref(false)

  const nicheType = computed(() => business.value?.niche_type ?? 'salon')
  const terminology = computed(() => business.value?.terminology ?? DEFAULT_TERMINOLOGY)
  const jobTitles = computed(() => business.value?.job_titles ?? [])
  const serviceCategories = computed(() => business.value?.service_categories ?? [])
  const features = computed(() => ({ ...DEFAULT_FEATURES, ...(business.value as any)?.features }))
  const hasFeature = (key: FeatureKey): boolean => features.value[key]
  const isMultiBranch = computed(() => features.value.multi_branch)

  const currentBranch = computed(() =>
    selectedBranchId.value ? branches.value.find(b => b.id === selectedBranchId.value) ?? null : null
  )

  const currentBranchId = computed(() => {
    if (!isMultiBranch.value) return null
    return selectedBranchId.value ?? null
  })

  const loadBusiness = async (nextBusinessId: string | null) => {
    if (!nextBusinessId) {
      business.value = null
      branches.value = []
      selectedBranchId.value = null
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

      if ((data as any).deleted_at) {
        business.value = null
        throw new Error('El negocio ha sido dado de baja.')
      }

      business.value = data as Business

      // Load branches and restore saved selection
      await loadBranches(nextBusinessId)
    } finally {
      loading.value = false
    }
  }

  const loadBranches = async (businessId: string) => {
    if (!businessId || !isMultiBranch.value) {
      branches.value = []
      selectedBranchId.value = null
      return
    }

    branchesLoading.value = true
    try {
      const list = await listBranches(businessId)
      branches.value = list as Branch[]

      // Restore saved branch selection or default to default branch
      const saved = localStorage.getItem(branchStorageKey(businessId))
      if (saved && branches.value.some(b => b.id === saved)) {
        selectedBranchId.value = saved
      } else {
        const def = branches.value.find(b => b.is_default) ?? branches.value[0] ?? null
        selectedBranchId.value = def?.id ?? null
      }
    } catch {
      branches.value = []
      selectedBranchId.value = null
    } finally {
      branchesLoading.value = false
    }
  }

  const setBranch = (branchId: string | null) => {
    selectedBranchId.value = branchId
    if (business.value?.id && branchId) {
      localStorage.setItem(branchStorageKey(business.value.id), branchId)
    } else if (business.value?.id) {
      localStorage.removeItem(branchStorageKey(business.value.id))
    }
  }

  const clearBusiness = () => {
    business.value = null
    branches.value = []
    selectedBranchId.value = null
  }

  const updateBusiness = (partial: Partial<Business>) => {
    if (business.value) {
      Object.assign(business.value, partial)
    }
  }

  return {
    business,
    loading,
    branches,
    branchesLoading,
    selectedBranchId,
    currentBranch,
    currentBranchId,
    nicheType,
    terminology,
    jobTitles,
    serviceCategories,
    isMultiBranch,
    features,
    hasFeature,
    loadBusiness,
    loadBranches,
    setBranch,
    clearBusiness,
    updateBusiness,
  }
})
