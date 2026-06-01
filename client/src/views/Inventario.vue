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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Stock</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Inventario</h1>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="handleNewProducto"
                class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span class="hidden sm:inline">Nuevo producto</span>
              </button>
              <button
                @click="showMovements = !showMovements"
                class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                {{ showMovements ? 'Ver stock' : 'Movimientos' }}
              </button>
            </div>
          </div>
        </header>

        <div v-if="!showMovements" class="space-y-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 max-w-md">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar en inventario..."
                class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div class="flex gap-2">
              <select
                v-model="locationFilter"
                class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary"
              >
                <option value="">Todas las ubicaciones</option>
                <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
              </select>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border">
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Producto</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Variante</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Ubicación</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Stock</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Reservado</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Disponible</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Valor</th>
                    <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle">
                  <tr v-for="item in filteredInventario" :key="item.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                    <td class="px-4 py-3">
                      <div>
                        <p class="font-medium text-text">{{ item.productName }}</p>
                        <p class="text-xs text-text-muted font-mono">{{ item.productSku || '—' }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-text-secondary">{{ item.variantName || '—' }}</td>
                    <td class="px-4 py-3 text-text-secondary">{{ item.locationName }}</td>
                    <td class="px-4 py-3 text-right">
                      <span :class="['font-medium tabular-nums', item.quantity <= item.reorderPoint ? 'text-danger' : 'text-text']">
                        {{ item.quantity }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-text-muted">{{ item.reservedQty }}</td>
                    <td class="px-4 py-3 text-right font-medium" :class="item.availableQty > 0 ? 'text-success' : 'text-danger'">
                      {{ item.availableQty }}
                    </td>
                    <td class="px-4 py-3 text-right text-text">${{ (item.quantity * item.unitCost).toFixed(2) }}</td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <button
                          @click="openAdjustModal(item)"
                          class="rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
                        >
                          Ajustar
                        </button>
                        <button
                          @click="openSaleModal(item)"
                          class="rounded-lg px-2 py-1 text-xs font-medium text-success transition-theme hover:bg-success/10"
                        >
                          Vender
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="filteredInventario.length === 0" class="py-12 text-center">
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
                <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-text">Sin existencias</h3>
              <p class="mt-1 text-sm text-text-muted">No hay productos registrados en el inventario.</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div class="relative flex-1 max-w-md">
              <input
                v-model="movementSearch"
                type="text"
                placeholder="Buscar en movimientos..."
                class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border">
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Fecha</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Producto</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Tipo</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Cantidad</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Costo</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Ubicación</th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Notas</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle">
                  <tr v-for="mov in filteredMovements" :key="mov.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                    <td class="px-4 py-3 text-text-muted whitespace-nowrap">{{ formatDate(mov.createdAt) }}</td>
                    <td class="px-4 py-3">
                      <span class="font-medium text-text">{{ mov.productName }}</span>
                      <span v-if="mov.variantName" class="text-xs text-text-muted ml-1">({{ mov.variantName }})</span>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="[
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        mov.movementType === 'purchase' ? 'bg-success/10 text-success' :
                        mov.movementType === 'sale' ? 'bg-primary/10 text-primary' :
                        mov.movementType === 'adjustment' ? 'bg-warning/10 text-warning' :
                        'bg-info/10 text-info'
                      ]">{{ formatMovementType(mov.movementType) }}</span>
                    </td>
                    <td class="px-4 py-3 text-right font-medium" :class="mov.quantity < 0 ? 'text-danger' : 'text-success'">
                      {{ mov.quantity > 0 ? '+' : '' }}{{ mov.quantity }}
                    </td>
                    <td class="px-4 py-3 text-right text-text">${{ mov.unitCost.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-text-secondary">{{ mov.locationName }}</td>
                    <td class="px-4 py-3 text-text-muted max-w-40 truncate">{{ mov.notes || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="filteredMovements.length === 0" class="py-12 text-center">
              <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
                <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-text">Sin movimientos</h3>
              <p class="mt-1 text-sm text-text-muted">No hay movimientos registrados.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- Adjust Stock Modal -->
    <ModalBase
      :is-open="adjustModalOpen"
      title="Ajustar stock"
      subtitle="Agrega o reduce la cantidad disponible"
      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      size="sm"
      confirm-text="Guardar ajuste"
      :is-confirm-disabled="adjustQuantity === 0"
      @close="closeAdjustModal"
      @confirm="confirmAdjust"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-bg-secondary p-3">
          <p class="text-sm font-medium text-text">{{ adjustItem?.productName }}</p>
          <p class="text-xs text-text-muted">{{ adjustItem?.locationName }} · Actual: {{ adjustItem?.quantity }}</p>
        </div>
        <FormInput
          v-model.number="adjustQuantity"
          label="Cantidad a ajustar"
          type="number"
          placeholder="Ej: 5 o -3"
          prefix-icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
        <p class="text-xs text-text-muted">Usa valores positivos para agregar stock, negativos para reducir.</p>
        <FormInput
          v-model="adjustNotes"
          label="Motivo del ajuste"
          placeholder="Ej: Compra nueva, producto dañado..."
          prefix-icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </div>
    </ModalBase>

    <!-- Sale Modal -->
    <ModalBase
      :is-open="saleModalOpen"
      title="Registrar venta"
      subtitle="Descuenta del inventario por venta al cliente"
      icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
      size="sm"
      confirm-text="Registrar venta"
      :is-confirm-disabled="saleQuantity <= 0"
      @close="closeSaleModal"
      @confirm="confirmSale"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-bg-secondary p-3">
          <p class="text-sm font-medium text-text">{{ saleItem?.productName }}</p>
          <p v-if="saleItem?.variantName" class="text-xs text-text-muted">{{ saleItem.variantName }}</p>
          <p class="text-xs text-text-muted">{{ saleItem?.locationName }} · Disponible: {{ saleItem?.availableQty }}</p>
        </div>
        <FormInput
          v-model.number="saleQuantity"
          label="Cantidad vendida"
          type="number"
          min="1"
          :max="saleItem?.availableQty ?? 1"
          placeholder="1"
          prefix-icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
        <FormInput
          v-model.number="saleUnitPrice"
          label="Precio unitario ($)"
          type="number"
          min="0"
          step="0.01"
          :placeholder="String(saleItem?.unitPrice ?? '0.00')"
          prefix-icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <FormInput
          v-model="saleNotes"
          label="Notas"
          placeholder="Opcional"
          prefix-icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
        <div v-if="saleQuantity > 0 && saleUnitPrice > 0" class="rounded-lg bg-bg-secondary p-3 text-center">
          <p class="text-sm text-text-muted">Total de la venta</p>
          <p class="text-xl font-bold text-text">${{ (saleQuantity * saleUnitPrice).toFixed(2) }}</p>
        </div>
      </div>
    </ModalBase>

    <ProductoFormModal
      ref="productoModalRef"
      :is-saving="saveProductoMutation.isPending.value"
      @save="handleSaveProducto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { adjustInventory, sellProduct, inventarioKeys, listInventario, listInventoryLocations, listInventoryMovements } from '../services/inventarioService'
import { productosKeys, saveProducto } from '../services/productosService'
import { useThemeStore } from '../store/theme'
import Sidebar from '../components/layout/Sidebar.vue'
import { ProductoFormModal } from '../components/modals'
import { ModalBase } from '../components/common'
import { FormInput } from '../components/forms'
import lumaLogoLight from '../assets/Luma.svg'
import lumaLogoDark from '../assets/Luma blanco.svg'
import type { InventarioItem, InventarioLocation, InventarioMovimiento } from '../types/inventario'
import type { Producto, ProductoFormData } from '../types/producto'

const { logout, authStore } = useAuth()
const { success, error: showError } = useNotification()
const themeStore = useThemeStore()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const lumaLogo = computed(() => (themeStore.isDark ? lumaLogoDark : lumaLogoLight))
const showMovements = ref(false)
const searchQuery = ref('')
const movementSearch = ref('')
const locationFilter = ref('')
const businessId = computed(() => authStore.businessId)
const productoModalRef = ref<InstanceType<typeof ProductoFormModal> | null>(null)

const { data: locationsData } = useQuery({
  queryKey: computed(() => inventarioKeys.locations(businessId.value)),
  queryFn: () => listInventoryLocations(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const { data: inventarioData } = useQuery({
  queryKey: computed(() => inventarioKeys.all(businessId.value)),
  queryFn: () => listInventario(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const { data: movementsData } = useQuery({
  queryKey: computed(() => inventarioKeys.movements(businessId.value)),
  queryFn: () => listInventoryMovements(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const locations = computed<InventarioLocation[]>(() => locationsData.value ?? [])
const inventario = computed<InventarioItem[]>(() => inventarioData.value ?? [])
const movements = computed<InventarioMovimiento[]>(() => movementsData.value ?? [])

const filteredInventario = computed(() => {
  let result = inventario.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.productName.toLowerCase().includes(q) || i.productSku.toLowerCase().includes(q))
  }
  if (locationFilter.value) {
    result = result.filter(i => i.locationId === locationFilter.value)
  }
  return result
})

const filteredMovements = computed(() => {
  if (!movementSearch.value) return movements.value
  const q = movementSearch.value.toLowerCase()
  return movements.value.filter(m =>
    m.productName.toLowerCase().includes(q) || m.notes?.toLowerCase().includes(q)
  )
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Adjust stock modal
const adjustModalOpen = ref(false)
const adjustItem = ref<InventarioItem | null>(null)
const adjustQuantity = ref(0)
const adjustNotes = ref('')

const adjustMutation = useMutation({
  mutationFn: (params: { productId: string; locationId: string; quantity: number; notes: string; variantId?: string | null }) =>
    adjustInventory(businessId.value!, params.productId, params.locationId, params.quantity, params.notes, params.variantId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.movements(businessId.value) })
    closeAdjustModal()
    success('Stock ajustado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al ajustar el stock')
  },
})

const openAdjustModal = (item: InventarioItem) => {
  adjustItem.value = item
  adjustQuantity.value = 0
  adjustNotes.value = ''
  adjustModalOpen.value = true
}

const closeAdjustModal = () => {
  adjustModalOpen.value = false
  adjustItem.value = null
  adjustQuantity.value = 0
  adjustNotes.value = ''
}

const confirmAdjust = async () => {
  if (!adjustItem.value || adjustQuantity.value === 0) return
  await adjustMutation.mutateAsync({
    productId: adjustItem.value.productId,
    locationId: adjustItem.value.locationId,
    quantity: adjustQuantity.value,
    notes: adjustNotes.value,
    variantId: adjustItem.value.variantId,
  })
}

// Sale modal
const saleModalOpen = ref(false)
const saleItem = ref<InventarioItem | null>(null)
const saleQuantity = ref(0)
const saleUnitPrice = ref(0)
const saleNotes = ref('')

const saleMutation = useMutation({
  mutationFn: (params: { productId: string; locationId: string; quantity: number; notes: string; unitPrice: number; variantId?: string | null }) =>
    sellProduct(businessId.value!, params.productId, params.locationId, params.quantity, params.notes, params.variantId, params.unitPrice),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.movements(businessId.value) })
    closeSaleModal()
    success('Venta registrada correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al registrar la venta')
  },
})

const openSaleModal = (item: InventarioItem) => {
  saleItem.value = item
  saleQuantity.value = 1
  saleUnitPrice.value = item.unitPrice
  saleNotes.value = ''
  saleModalOpen.value = true
}

const closeSaleModal = () => {
  saleModalOpen.value = false
  saleItem.value = null
  saleQuantity.value = 0
  saleUnitPrice.value = 0
  saleNotes.value = ''
}

const confirmSale = async () => {
  if (!saleItem.value || saleQuantity.value <= 0) return
  if (saleQuantity.value > (saleItem.value.availableQty)) {
    showError('Stock insuficiente para esta venta')
    return
  }
  await saleMutation.mutateAsync({
    productId: saleItem.value.productId,
    locationId: saleItem.value.locationId,
    quantity: saleQuantity.value,
    notes: saleNotes.value,
    unitPrice: saleUnitPrice.value,
    variantId: saleItem.value.variantId,
  })
}

const saveProductoMutation = useMutation({
  mutationFn: (data: ProductoFormData & { id?: string }) => saveProducto(businessId.value!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productosKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.locations(businessId.value) })
    productoModalRef.value?.close()
    success('Producto guardado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al guardar el producto')
  },
})

const handleNewProducto = () => {
  productoModalRef.value?.open()
}

const handleSaveProducto = async (data: ProductoFormData & { id?: string }) => {
  try {
    await saveProductoMutation.mutateAsync(data)
  } catch { /* handled by mutation onError */ }
}

const formatMovementType = (type: string) => {
  const map: Record<string, string> = {
    purchase: 'Compra',
    sale: 'Venta',
    adjustment: 'Ajuste',
    transfer_in: 'Transferencia (entrada)',
    transfer_out: 'Transferencia (salida)',
    return: 'Devolución',
    consumption: 'Consumo',
  }
  return map[type] ?? type
}
</script>
