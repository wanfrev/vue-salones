<template>
  <div class="min-h-screen bg-bg">
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
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Stock</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Inventario</h1>
              <p class="hidden text-sm text-text-muted sm:block">Control de existencias por ubicación</p>
            </div>
            <div class="flex items-center gap-2">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { inventarioKeys, listInventario, listInventoryLocations, listInventoryMovements } from '../services/inventarioService'
import Sidebar from '../components/layout/Sidebar.vue'
import type { InventarioItem, InventarioLocation, InventarioMovimiento } from '../types/inventario'

const { logout, authStore } = useAuth()

const isSidebarOpen = ref(false)
const showMovements = ref(false)
const searchQuery = ref('')
const movementSearch = ref('')
const locationFilter = ref('')
const businessId = computed(() => authStore.businessId)

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
