<template>
  <AdminLayout>
        <!-- Header -->
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Catálogo</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">{{ businessStore.terminology.service || 'Servicio' }}s</h1>
            </div>
            <button
              @click="handleNewServicio"
              class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="hidden sm:inline">Nuevo {{ businessStore.terminology.service || 'Servicio' }}</span>
            </button>
          </div>
        </header>

        <!-- Stats -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalServicios }}</p>
                <p class="text-xs text-text-muted">{{ businessStore.terminology.service || 'Servicio' }}s Activos</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalCategorias }}</p>
                <p class="text-xs text-text-muted">Categorías</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <svg class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalCitasMes }}</p>
                <p class="text-xs text-text-muted">{{ businessStore.terminology.appointment || 'Cita' }}s Este Mes</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                <svg class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ formatUSD(precioPromedioNumerico) }}</p>
                <p class="text-xs text-text-muted">Bs {{ formatVESInline(precioPromedioNumerico) }}</p>
                <p class="text-xs text-text-muted">Precio Promedio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="mb-4 flex rounded-xl border border-border bg-surface p-1">
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="activeCategory = cat.id"
            :class="[
              'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-theme',
              activeCategory === cat.id
                ? 'bg-primary text-text-inverse'
                : 'text-text-secondary hover:bg-bg-secondary'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="group rounded-xl border border-border bg-surface p-4 transition-theme hover:border-border-strong"
          >
            <div class="flex items-start justify-between">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', service.iconBg]">
                <svg class="h-5 w-5" :class="service.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
                </svg>
              </div>
              <div class="flex gap-1 opacity-0 transition-theme group-hover:opacity-100">
                <button
                  @click="handleEditServicio(service)"
                  class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary"
                  title="Editar servicio"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click="handleDeleteServicio(service)"
                  class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-danger"
                  title="Eliminar servicio"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="mt-3">
              <h3 class="font-semibold text-text">{{ service.name }}</h3>
              <p class="text-xs text-text-muted">{{ service.description }}</p>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <div>
                <span class="text-lg font-bold text-text">${{ service.price }}</span>
                <span class="block text-xs text-text-muted">Bs {{ formatVESInline(service.price) }}</span>
                <span class="text-xs text-text-muted">{{ service.duration }} min</span>
              </div>
              <span :class="[
                'rounded-full px-2 py-1 text-xs font-medium',
                service.status === 'Activo' ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-muted'
              ]">
                {{ service.status }}
              </span>
            </div>

            <div class="mt-3 border-t border-border-subtle pt-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-text-muted">{{ service.citasMes }} {{ (businessStore.terminology.appointment || 'cita').toLowerCase() }}s este mes</span>
                <span class="font-medium text-success">{{ formatUSD(service.ingresos) }} ingresos</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredServices.length === 0" class="mt-8 text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
            <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-text">No hay servicios</h3>
          <p class="mt-1 text-sm text-text-muted">No se encontraron servicios en esta categoría.</p>
        </div>
  </AdminLayout>

  <!-- Modals -->
  <ServicioFormModal
    ref="servicioModalRef"
    :is-saving="saveServicioMutation.isPending.value"
    @save="handleSaveServicio"
  />

  <!-- Confirm Delete Modal -->
  <ModalBase
    :is-open="isDeleteModalOpen"
    :title="`Eliminar ${businessStore.terminology.service || 'Servicio'}`"
    subtitle="Esta acción no se puede deshacer"
    icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    variant="danger"
    size="sm"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    @close="isDeleteModalOpen = false"
    @confirm="confirmDelete"
    @cancel="isDeleteModalOpen = false"
  >
    <p class="text-sm text-text-secondary">
      ¿Estás seguro de que deseas eliminar <strong>{{ servicioToDelete?.name }}</strong>?
      Este servicio será eliminado permanentemente del catálogo.
    </p>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCrud } from '../composables/useCrud'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import { deleteServicio, listServicios, saveServicio, serviciosKeys } from '../services/serviciosService'
import { useBusinessStore } from '../store/business'
import AdminLayout from '../components/layout/AdminLayout.vue'
import { ServicioFormModal } from '../components/modals'
import { ModalBase } from '../components/common'
import type { Servicio, ServicioFormData } from '../types/servicio'

const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { formatVESInline, formatUSD } = useCurrency()
useNotification()
const activeCategory = ref('all')
const servicioModalRef = ref<InstanceType<typeof ServicioFormModal> | null>(null)

// Delete modal state
const isDeleteModalOpen = ref(false)
const servicioToDelete = ref<Servicio | null>(null)
const businessId = computed(() => authStore.businessId)

const categories = computed(() => {
  const list = servicios.value.map(service => service.category).filter(Boolean)
  const unique = Array.from(new Set(list))
  return [{ id: 'all', name: 'Todos' }, ...unique.map(cat => ({ id: cat, name: cat }))]
})

const {
  items: servicios,
  saveMutation: saveServicioMutation,
  handleSave: handleSaveServicio,
} = useCrud<Servicio, ServicioFormData>({
  businessId,
  queryKey: (id) => serviciosKeys.all(id),
  queryFn: (id) => listServicios(id),
  saveFn: (id, data) => saveServicio(id, data),
  deleteFn: (id) => deleteServicio(id),
  entityName: 'Servicio',
  modalRef: servicioModalRef,
})

// Stats
const totalServicios = computed(() => servicios.value.filter(s => s.status === 'Activo').length)
const totalCategorias = computed(() => categories.value.length - 1) // Exclude 'all'
const totalCitasMes = computed(() => servicios.value.reduce((sum, s) => sum + s.citasMes, 0))
const precioPromedioNumerico = computed(() => {
  if (servicios.value.length === 0) return 0
  const total = servicios.value.reduce((sum, s) => sum + s.price, 0)
  return Math.round(total / servicios.value.length)
})

const filteredServices = computed(() => {
  if (activeCategory.value === 'all') return servicios.value
  return servicios.value.filter(s => s.category === activeCategory.value)
})

// Actions
const handleNewServicio = () => {
  servicioModalRef.value?.open()
}

const handleEditServicio = (servicio: Servicio) => {
  servicioModalRef.value?.open(servicio)
}

const handleDeleteServicio = (servicio: Servicio) => {
  servicioToDelete.value = servicio
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (servicioToDelete.value) {
    // TODO: wire delete mutation when needed
    console.warn('delete not wired from useCrud')
    isDeleteModalOpen.value = false
    servicioToDelete.value = null
  }
}
</script>
