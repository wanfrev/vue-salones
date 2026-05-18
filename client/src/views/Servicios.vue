<template>
  <div class="min-h-screen bg-bg">
    <!-- Mobile Header -->
    <header class="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface border-b border-border px-4 lg:hidden">
      <div class="flex items-center gap-3">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary">
          <svg v-if="!isSidebarOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-hover">
          <svg class="h-4 w-4 text-text-inverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span class="font-bold text-text">SalónApp</span>
      </div>
      <button @click="logout" class="rounded-lg p-2 text-text-muted transition-theme hover:bg-bg-secondary hover:text-text-secondary">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 z-20 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64 lg:pt-0">
      <div class="p-4 lg:p-6">
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-sm text-primary mb-0.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Catálogo</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Servicios</h1>
              <p class="hidden text-sm text-text-muted sm:block">Gestiona tu menú de servicios</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="handleNewServicio"
                class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-primary/25 transition-theme hover:bg-primary-hover"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo Servicio</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalServicios }}</p>
                <p class="text-xs text-text-muted">Servicios Activos</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalCategorias }}</p>
                <p class="text-xs text-text-muted">Categorías</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light text-warning">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalCitasMes }}</p>
                <p class="text-xs text-text-muted">Citas Este Mes</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info-light text-info">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">${{ precioPromedio }}</p>
                <p class="text-xs text-text-muted">Precio Promedio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="mb-4 flex flex-wrap gap-2">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            :class="[
              'rounded-full px-4 py-2 text-sm font-medium transition-theme',
              activeCategory === cat.id 
                ? 'bg-primary text-text-inverse shadow-md' 
                : 'bg-surface text-text-secondary hover:bg-bg-secondary border border-border'
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
            class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme hover:shadow-md"
          >
            <div class="flex items-start justify-between">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', service.iconBg]">
                <svg class="h-5 w-5" :class="service.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
                </svg>
              </div>
              <div class="flex gap-1">
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
                <span class="text-xs text-text-muted"> / {{ service.duration }} min</span>
              </div>
              <span :class="[
                'rounded-full px-2 py-1 text-xs font-medium',
                service.status === 'Activo' ? 'bg-success-light text-success' : 'bg-bg-secondary text-text-muted'
              ]">
                {{ service.status }}
              </span>
            </div>
            
            <div class="mt-3 border-t border-border-subtle pt-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-text-muted">{{ service.citasMes }} citas este mes</span>
                <span class="font-medium text-success">${{ service.ingresos }} ingresos</span>
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
      </div>
    </main>
  </div>

  <!-- Modals -->
  <ServicioFormModal 
    ref="servicioModalRef" 
    @save="handleSaveServicio" 
  />

  <!-- Confirm Delete Modal -->
  <ModalBase
    :is-open="isDeleteModalOpen"
    title="Eliminar Servicio"
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { deleteServicio, listServicios, saveServicio, serviciosKeys } from '../services/serviciosService'
import Sidebar from '../components/layout/Sidebar.vue'
import { ServicioFormModal } from '../components/modals'
import { ModalBase } from '../components/common'
import type { Servicio, ServicioFormData } from '../types/servicio'

const { logout, authStore } = useAuth()
const { warning } = useNotification()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const activeCategory = ref('all')
const servicioModalRef = ref<InstanceType<typeof ServicioFormModal> | null>(null)

// Delete modal state
const isDeleteModalOpen = ref(false)
const servicioToDelete = ref<Servicio | null>(null)
const businessId = computed(() => authStore.businessId)

const categories = computed(() => {
  const list = services.value.map(service => service.category).filter(Boolean)
  const unique = Array.from(new Set(list))
  return [{ id: 'all', name: 'Todos' }, ...unique.map(cat => ({ id: cat, name: cat }))]
})

const { data: servicesData } = useQuery({
  queryKey: computed(() => serviciosKeys.all(businessId.value)),
  queryFn: () => listServicios(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const services = computed<Servicio[]>(() => servicesData.value ?? [])

const saveServicioMutation = useMutation({
  mutationFn: (data: ServicioFormData & { id?: string }) => saveServicio(businessId.value!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: serviciosKeys.all(businessId.value) })
  },
})

const deleteServicioMutation = useMutation({
  mutationFn: (id: string) => deleteServicio(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: serviciosKeys.all(businessId.value) })
  },
})

// Stats
const totalServicios = computed(() => services.value.filter(s => s.status === 'Activo').length)
const totalCategorias = computed(() => categories.value.length - 1) // Exclude 'all'
const totalCitasMes = computed(() => services.value.reduce((sum, s) => sum + s.citasMes, 0))
const precioPromedio = computed(() => {
  if (services.value.length === 0) return 0
  const total = services.value.reduce((sum, s) => sum + s.price, 0)
  return Math.round(total / services.value.length)
})

const filteredServices = computed(() => {
  if (activeCategory.value === 'all') return services.value
  return services.value.filter(s => s.category === activeCategory.value)
})

// Actions
const handleNewServicio = () => {
  servicioModalRef.value?.open()
}

const handleEditServicio = (servicio: Servicio) => {
  servicioModalRef.value?.open(servicio)
}

const handleSaveServicio = async (data: ServicioFormData & { id?: string }) => {
  await saveServicioMutation.mutateAsync(data)
}

const handleDeleteServicio = (servicio: Servicio) => {
  servicioToDelete.value = servicio
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (servicioToDelete.value) {
    await deleteServicioMutation.mutateAsync(servicioToDelete.value.id)
    warning(`Servicio "${servicioToDelete.value.name}" desactivado`)
    isDeleteModalOpen.value = false
    servicioToDelete.value = null
  }
}
</script>
