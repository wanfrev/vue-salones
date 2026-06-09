<template>
  <header class="mb-5 lg:mb-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Catálogo</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">{{ businessStore.terminology.service || 'Servicio' }}s</h1>
      </div>
      <button
        @click="handleNewServicio"
        class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Nuevo {{ businessStore.terminology.service || 'Servicio' }}</span>
      </button>
    </div>
  </header>

  <!-- Stats -->
  <div class="mb-5 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-8 lg:grid-cols-4">
    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-primary/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-primary/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ totalServicios }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Activos</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-success/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-success/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ totalCategorias }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Categorías</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-warning/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-warning/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ totalCitasMes }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Citas del Mes</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-info/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-info/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ formatUSD(precioPromedioNumerico) }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Precio Promedio</p>
          <p class="text-xs text-text-muted">Bs {{ formatVESInline(precioPromedioNumerico) }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Category Tabs -->
  <div class="mb-5 flex overflow-x-auto rounded-xl border border-border bg-surface p-1 shadow-sm scrollbar-hide">
    <div
      v-for="cat in categories"
      :key="cat.id"
      :class="[
        'group/category flex flex-1 items-center gap-1 rounded-lg px-1 py-1 transition-theme',
        activeCategory === cat.id
          ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20'
          : 'text-text-secondary hover:bg-bg-secondary'
      ]"
    >
      <button
        @click="activeCategory = cat.id"
        class="min-w-0 flex-1 whitespace-nowrap rounded-md px-2 py-1 text-sm font-medium text-center"
      >
        {{ cat.name }}
      </button>

      <div v-if="cat.id !== 'all'" class="flex items-center gap-0.5 opacity-100 transition-theme sm:opacity-0 sm:group-hover/category:opacity-100">
        <button
          @click.stop="openRenameCategoryModal(cat.id)"
          type="button"
          class="rounded-md p-1 transition-theme hover:bg-black/10"
          title="Editar categoría"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="openDeleteCategoryModal(cat.id)"
          type="button"
          class="rounded-md p-1 transition-theme hover:bg-black/10"
          title="Eliminar categoría"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Services Grid -->
  <div class="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div
      v-for="service in filteredServices"
      :key="service.id"
      class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme hover:shadow-md hover:border-border-strong sm:p-5"
    >
      <div class="flex items-start justify-between">
        <div :class="['flex h-10 w-10 items-center justify-center rounded-lg transition-theme group-hover:scale-105', service.iconBg]">
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
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            @click="handleDeleteServicio(service)"
            class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-danger"
            title="Eliminar servicio"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-3 sm:mt-4">
        <h3 class="font-semibold text-text">{{ service.name }}</h3>
        <p class="text-xs text-text-muted mt-0.5">{{ service.description }}</p>
      </div>

      <div class="mt-3 sm:mt-4 flex items-center justify-between">
        <div>
          <span class="text-lg font-bold text-text tabular-nums">${{ service.price }}</span>
          <span class="block text-xs text-text-muted tabular-nums">Bs {{ formatVESInline(service.price) }}</span>
          <span class="text-xs text-text-muted">{{ service.duration }} min</span>
        </div>
        <span :class="[
          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
          service.status === 'Activo' ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-muted'
        ]">
          <span :class="['h-1.5 w-1.5 rounded-full mr-1.5', service.status === 'Activo' ? 'bg-success' : 'bg-text-muted/40']"></span>
          {{ service.status }}
        </span>
      </div>

      <div class="mt-3 sm:mt-4 border-t border-border-subtle pt-3 sm:pt-4">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-muted">{{ service.citasMes }} {{ (businessStore.terminology.appointment || 'cita').toLowerCase() }}s este mes</span>
          <span class="font-semibold text-success tabular-nums">{{ formatUSD(service.ingresos) }} ingresos</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-if="filteredServices.length === 0" class="mt-10 flex flex-col items-center justify-center text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
      <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h3 class="mt-4 text-lg font-medium text-text">No hay servicios</h3>
    <p class="mt-1 text-sm text-text-muted">No se encontraron servicios en esta categoría.</p>
  </div>

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
    :loading="deleteServicioMutation?.isPending.value ?? false"
    @close="isDeleteModalOpen = false"
    @confirm="confirmDelete"
    @cancel="isDeleteModalOpen = false"
  >
    <p class="text-sm text-text-secondary">
      ¿Estás seguro de que deseas eliminar <strong>{{ servicioToDelete?.name }}</strong>?
      Este servicio será eliminado permanentemente del catálogo.
    </p>
  </ModalBase>

  <ModalBase
    :is-open="isRenameCategoryModalOpen"
    title="Editar categoría"
    subtitle="Actualiza el nombre de la categoría"
    icon="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    size="sm"
    confirm-text="Guardar"
    cancel-text="Cancelar"
    :loading="isUpdatingCategory"
    @close="closeRenameCategoryModal"
    @confirm="confirmRenameCategory"
    @cancel="closeRenameCategoryModal"
  >
    <label class="mb-2 block text-sm font-medium text-text" for="new-category-name">Nombre</label>
    <input
      id="new-category-name"
      v-model="newCategoryName"
      type="text"
      class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary"
      placeholder="Nombre de la categoría"
    />
  </ModalBase>

  <ModalBase
    :is-open="isDeleteCategoryModalOpen"
    title="Eliminar categoría"
    subtitle="Sus servicios se moverán a otra categoría"
    icon="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    variant="danger"
    size="sm"
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    :loading="isUpdatingCategory"
    @close="closeDeleteCategoryModal"
    @confirm="confirmDeleteCategory"
    @cancel="closeDeleteCategoryModal"
  >
    <p class="mb-3 text-sm text-text-secondary">
      La categoría <strong>{{ categoryToDelete }}</strong> será eliminada.
    </p>
    <label class="mb-2 block text-sm font-medium text-text" for="replacement-category">Mover servicios a</label>
    <select
      id="replacement-category"
      v-model="replacementCategory"
      class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary"
    >
      <option
        v-for="cat in deleteCategoryOptions"
        :key="cat.id"
        :value="cat.id"
      >
        {{ cat.name }}
      </option>
    </select>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useCrud } from '../composables/useCrud'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import {
  deleteBusinessCategory,
  deleteServicio,
  listServicios,
  renameBusinessCategory,
  saveServicio,
  serviciosKeys,
} from '../services/serviciosService'
import { useBusinessStore } from '../store/business'
import { ServicioFormModal } from '../components/modals'
import { ModalBase } from '../components/common'
import type { Servicio, ServicioFormData } from '../types/servicio'

const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { formatVESInline, formatUSD } = useCurrency()
const queryClient = useQueryClient()
const { success, error: showError, warning } = useNotification()
const activeCategory = ref('all')
const servicioModalRef = ref<InstanceType<typeof ServicioFormModal> | null>(null)

// Delete modal state
const isDeleteModalOpen = ref(false)
const servicioToDelete = ref<Servicio | null>(null)
const businessId = computed(() => authStore.businessId)
const isUpdatingCategory = ref(false)

const isRenameCategoryModalOpen = ref(false)
const categoryToEdit = ref('')
const newCategoryName = ref('')

const isDeleteCategoryModalOpen = ref(false)
const categoryToDelete = ref('')
const replacementCategory = ref('')

const categories = computed(() => {
  const list = servicios.value.map(service => service.category).filter(Boolean)
  const unique = Array.from(new Set(list))
  return [{ id: 'all', name: 'Todos' }, ...unique.map(cat => ({ id: cat, name: cat }))]
})

const {
  items: servicios,
  saveMutation: saveServicioMutation,
  handleSave: handleSaveServicio,
  deleteMutation: deleteServicioMutation,
} = useCrud<Servicio, ServicioFormData>({
  businessId,
  queryKey: (id) => serviciosKeys.all(id),
  queryFn: (id) => listServicios(id),
  saveFn: (id, data) => saveServicio(id, data),
  deleteFn: (id) => deleteServicio(id),
  entityName: 'Servicio',
  modalRef: servicioModalRef,
  extraInvalidations: [
    () => ['appointments'],
    () => ['pos-pending'],
  ],
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

const deleteCategoryOptions = computed(() =>
  categories.value.filter((item) => item.id !== 'all' && item.id !== categoryToDelete.value)
)

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
  if (servicioToDelete.value && deleteServicioMutation) {
    try {
      await deleteServicioMutation.mutateAsync(servicioToDelete.value.id)
    } catch {
      // Error handled by useCrud onError
    } finally {
      isDeleteModalOpen.value = false
      servicioToDelete.value = null
    }
  }
}

const openRenameCategoryModal = (currentCategory: string) => {
  categoryToEdit.value = currentCategory
  newCategoryName.value = currentCategory
  isRenameCategoryModalOpen.value = true
}

const closeRenameCategoryModal = () => {
  isRenameCategoryModalOpen.value = false
  categoryToEdit.value = ''
  newCategoryName.value = ''
}

const confirmRenameCategory = async () => {
  const businessIdValue = businessId.value
  if (!businessIdValue) return

  const currentCategory = categoryToEdit.value
  const nextCategory = newCategoryName.value.trim()
  if (!currentCategory || !nextCategory || nextCategory === currentCategory) {
    closeRenameCategoryModal()
    return
  }

  try {
    isUpdatingCategory.value = true
    const updated = await renameBusinessCategory(businessIdValue, currentCategory, nextCategory)
    businessStore.updateBusiness({ service_categories: updated })
    await queryClient.invalidateQueries({ queryKey: serviciosKeys.all(businessIdValue) })
    activeCategory.value = nextCategory
    closeRenameCategoryModal()
    success('Categoría actualizada')
  } catch (err) {
    console.error(err)
    showError('No se pudo actualizar la categoría')
  } finally {
    isUpdatingCategory.value = false
  }
}

const openDeleteCategoryModal = (category: string) => {
  categoryToDelete.value = category
  const defaultReplacement = categories.value.find((item) => item.id !== 'all' && item.id !== category)?.id
  replacementCategory.value = defaultReplacement ?? ''

  if (!replacementCategory.value) {
    warning('Debe existir al menos otra categoría para poder eliminarla')
    return
  }

  isDeleteCategoryModalOpen.value = true
}

const closeDeleteCategoryModal = () => {
  isDeleteCategoryModalOpen.value = false
  categoryToDelete.value = ''
  replacementCategory.value = ''
}

const confirmDeleteCategory = async () => {
  const businessIdValue = businessId.value
  if (!businessIdValue) return

  const category = categoryToDelete.value
  const replacement = replacementCategory.value
  if (!category || !replacement) {
    closeDeleteCategoryModal()
    return
  }

  try {
    isUpdatingCategory.value = true
    const updated = await deleteBusinessCategory(businessIdValue, category, replacement)
    businessStore.updateBusiness({ service_categories: updated })
    await queryClient.invalidateQueries({ queryKey: serviciosKeys.all(businessIdValue) })
    if (activeCategory.value === category) activeCategory.value = replacement
    closeDeleteCategoryModal()
    success('Categoría eliminada')
  } catch (err) {
    console.error(err)
    showError('No se pudo eliminar la categoría')
  } finally {
    isUpdatingCategory.value = false
  }
}
</script>
