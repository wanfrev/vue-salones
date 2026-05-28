<template>
  <div class="min-h-screen bg-bg">
    <header class="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface border-b border-border px-4">
      <div class="flex items-center gap-3">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary lg:hidden">
          <svg v-if="!isSidebarOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex flex-col">
          <img :src="lumaLogo" alt="Luma" class="-ml-1 h-6 w-auto object-contain" />
          <span class="text-[10px] text-text-muted uppercase tracking-wide">Admin</span>
        </div>
      </div>
      <button @click="logout" class="rounded-lg p-2 text-text-muted transition-theme hover:bg-bg-secondary hover:text-text-secondary">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64">
      <div class="p-4 lg:p-6">
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Inventario</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Productos</h1>
              <p class="hidden text-sm text-text-muted sm:block">Gestiona los productos y artículos del salón</p>
            </div>
            <button
              @click="handleNewProducto"
              class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span class="hidden sm:inline">Nuevo producto</span>
            </button>
          </div>
        </header>

        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalProductos }}</p>
                <p class="text-xs text-text-muted">Productos Activos</p>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ stockBajo }}</p>
                <p class="text-xs text-text-muted">Stock Bajo</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                <svg class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ formatUSD(valorInventarioNumerico) }}</p>
                <p class="text-xs text-text-muted">Bs {{ formatVESInline(valorInventarioNumerico) }}</p>
                <p class="text-xs text-text-muted">Valor en Stock</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1 max-w-md">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar producto por nombre o SKU..."
              class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div class="flex rounded-xl border border-border bg-surface p-1">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
                activeTab === tab.value
                  ? 'bg-primary text-text-inverse'
                  : 'text-text-secondary hover:bg-bg-secondary'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-surface overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Producto</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">SKU</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Categoría</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Costo</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Precio</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Stock</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Estado</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="producto in filteredProductos" :key="producto.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <span class="font-medium text-text">{{ producto.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-text-muted font-mono text-xs">{{ producto.sku || '—' }}</td>
                  <td class="px-4 py-3 text-text-secondary">{{ producto.categoryName || '—' }}</td>
                  <td class="px-4 py-3 text-right">
                    <span class="text-text">${{ producto.unitCost.toFixed(2) }}</span>
                    <span class="block text-xs text-text-muted">Bs {{ formatVESInline(producto.unitCost) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right font-medium">
                    <span class="text-text">${{ producto.unitPrice.toFixed(2) }}</span>
                    <span class="block text-xs text-text-muted">Bs {{ formatVESInline(producto.unitPrice) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <span :class="[
                      'font-medium tabular-nums',
                      producto.stockTotal <= producto.reorderPoint ? 'text-danger' : 'text-text'
                    ]">
                      {{ producto.stockTotal }}
                    </span>
                    <span class="text-xs text-text-muted"> {{ producto.unit }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="[
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      producto.status === 'Activo' ? 'bg-success/10 text-success' : 'bg-bg-secondary text-text-muted'
                    ]">
                      {{ producto.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="handleEditProducto(producto)"
                        class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary"
                        title="Editar producto"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        @click="handleDeleteProducto(producto)"
                        class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-danger"
                        title="Desactivar producto"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredProductos.length === 0" class="py-12 text-center">
            <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
              <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-text">No hay productos</h3>
            <p class="mt-1 text-sm text-text-muted">Agrega tu primer producto al inventario.</p>
          </div>
        </div>
      </div>
    </main>

    <ProductoFormModal
      ref="productoModalRef"
      :is-saving="saveProductoMutation.isPending.value"
      @save="handleSaveProducto"
    />

    <ModalBase
      :is-open="isDeleteModalOpen"
      title="Desactivar producto"
      subtitle="Esta acción no se puede deshacer"
      icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      variant="danger"
      size="sm"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @close="isDeleteModalOpen = false"
      @confirm="confirmDelete"
      @cancel="isDeleteModalOpen = false"
    >
      <p class="text-sm text-text-secondary">
        ¿Estás seguro de que deseas desactivar <strong>{{ productoToDelete?.name }}</strong>?
        El producto dejará de estar disponible en el inventario.
      </p>
    </ModalBase>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import { deleteProducto, listProductos, productosKeys, saveProducto } from '../services/productosService'
import { useThemeStore } from '../store/theme'
import Sidebar from '../components/layout/Sidebar.vue'
import { ProductoFormModal } from '../components/modals'
import { ModalBase } from '../components/common'
import lumaLogoLight from '../assets/Luma.svg'
import lumaLogoDark from '../assets/Luma blanco.svg'
import type { Producto, ProductoFormData } from '../types/producto'

const { logout, authStore } = useAuth()
const { formatUSD, formatVESInline } = useCurrency()
const { success, error: showError, warning } = useNotification()
const themeStore = useThemeStore()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const lumaLogo = computed(() => (themeStore.isDark ? lumaLogoDark : lumaLogoLight))
const activeTab = ref('todos')
const searchQuery = ref('')
const productoModalRef = ref<InstanceType<typeof ProductoFormModal> | null>(null)
const isDeleteModalOpen = ref(false)
const productoToDelete = ref<Producto | null>(null)
const businessId = computed(() => authStore.businessId)

const tabs = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activos' },
  { label: 'Inactivos', value: 'inactivos' },
]

const { data: productosData } = useQuery({
  queryKey: computed(() => productosKeys.all(businessId.value)),
  queryFn: () => listProductos(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const productos = computed<Producto[]>(() => productosData.value ?? [])

const saveProductoMutation = useMutation({
  mutationFn: (data: ProductoFormData & { id?: string }) => saveProducto(businessId.value!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productosKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: ['inventario', businessId.value] })
    queryClient.invalidateQueries({ queryKey: ['inventario-locations', businessId.value] })
    productoModalRef.value?.close()
    success('Producto guardado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al guardar el producto')
  },
})

const deleteProductoMutation = useMutation({
  mutationFn: (id: string) => deleteProducto(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productosKeys.all(businessId.value) })
  },
})

const totalProductos = computed(() => productos.value.filter(p => p.status === 'Activo').length)
const totalCategorias = computed(() => {
  const cats = new Set(productos.value.map(p => p.categoryName).filter(Boolean))
  return cats.size
})
const stockBajo = computed(() => productos.value.filter(p => p.stockTotal <= p.reorderPoint && p.status === 'Activo').length)
const valorInventarioNumerico = computed(() => {
  return productos.value.reduce((sum, p) => sum + p.unitCost * p.stockTotal, 0)
})

const filteredProductos = computed(() => {
  let result = productos.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
  }
  if (activeTab.value === 'activos') result = result.filter(p => p.status === 'Activo')
  if (activeTab.value === 'inactivos') result = result.filter(p => p.status === 'Inactivo')
  return result
})

const handleNewProducto = () => {
  productoModalRef.value?.open()
}

const handleEditProducto = (producto: Producto) => {
  productoModalRef.value?.open(producto)
}

const handleSaveProducto = async (data: ProductoFormData & { id?: string }) => {
  try {
    await saveProductoMutation.mutateAsync(data)
  } catch {
    // Error is handled by mutation's onError
  }
}

const handleDeleteProducto = (producto: Producto) => {
  productoToDelete.value = producto
  isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
  if (productoToDelete.value) {
    await deleteProductoMutation.mutateAsync(productoToDelete.value.id)
    warning(`Producto "${productoToDelete.value.name}" desactivado`)
    isDeleteModalOpen.value = false
    productoToDelete.value = null
  }
}
</script>
