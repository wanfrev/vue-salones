<template>
  <header class="mb-4 lg:mb-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs text-primary mb-1">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span class="font-medium uppercase tracking-wider">Stock</span>
        </div>
        <h1 class="text-2xl font-bold text-text lg:text-3xl">Inventario</h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="handleNewProducto"
          class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="hidden sm:inline">Nuevo producto</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Sub-tabs: Stock / Movimientos / Historial de Ventas -->
  <div class="mb-4 flex gap-2">
    <button
      @click="activeTab = 'stock'"
      :class="[
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
        activeTab === 'stock'
          ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20'
          : 'border border-border bg-surface text-text-secondary hover:bg-bg-secondary hover:text-text'
      ]"
    >
      Stock
    </button>
    <button
      @click="activeTab = 'movements'"
      :class="[
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
        activeTab === 'movements'
          ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20'
          : 'border border-border bg-surface text-text-secondary hover:bg-bg-secondary hover:text-text'
      ]"
    >
      Movimientos
    </button>
    <button
      @click="activeTab = 'sales-history'"
      :class="[
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
        activeTab === 'sales-history'
          ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20'
          : 'border border-border bg-surface text-text-secondary hover:bg-bg-secondary hover:text-text'
      ]"
    >
      Historial de Ventas
    </button>
  </div>

  <!-- Tab: Stock -->
  <div v-if="activeTab === 'stock'" class="space-y-4">
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
    </div>

    <div class="lg:hidden space-y-3 mb-4">
      <div v-for="item in filteredInventario" :key="item.id" class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:shadow-md">
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="font-medium text-text">{{ item.productName }}</p>
            <p class="text-xs text-text-muted font-mono">{{ item.productSku || '—' }}</p>
          </div>
          <span class="text-sm text-text-secondary">{{ item.variantName || '—' }}</span>
        </div>
        <div class="grid grid-cols-3 gap-3 mb-3 text-sm">
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-text-muted mb-0.5">Stock</p>
            <p class="font-medium tabular-nums" :class="item.quantity <= item.reorderPoint ? 'text-danger' : 'text-text'">{{ item.quantity }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-text-muted mb-0.5">Reservado</p>
            <p class="tabular-nums text-text-muted">{{ item.reservedQty }}</p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wider text-text-muted mb-0.5">Disponible</p>
            <p class="font-medium tabular-nums" :class="item.availableQty > 0 ? 'text-success' : 'text-danger'">{{ item.availableQty }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-sm text-text tabular-nums">${{ (item.quantity * item.unitCost).toFixed(2) }}</p>
          <button @click.stop="openAdjustModal(item)" class="rounded-lg bg-bg-secondary px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-border-subtle hover:shadow-sm">Ajustar</button>
        </div>
      </div>
      <div v-if="filteredInventario.length === 0" class="py-16 text-center">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
          <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-text">Sin existencias</h3>
        <p class="mt-1 text-sm text-text-muted">No hay productos registrados en el inventario.</p>
      </div>
    </div>

    <div class="hidden lg:block rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-bg-secondary/50">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Producto</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Variante</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Stock</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Reservado</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Disponible</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Valor</th>
              <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="item in filteredInventario" :key="item.id" class="text-sm transition-all duration-200 hover:bg-bg-secondary/50">
              <td class="px-4 py-3">
                <div>
                  <p class="font-medium text-text">{{ item.productName }}</p>
                  <p class="text-xs text-text-muted font-mono">{{ item.productSku || '—' }}</p>
                </div>
              </td>
              <td class="px-4 py-3 text-text-secondary">{{ item.variantName || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <span :class="['font-medium tabular-nums', item.quantity <= item.reorderPoint ? 'text-danger' : 'text-text']">
                  {{ item.quantity }}
                </span>
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-text-muted">{{ item.reservedQty }}</td>
              <td class="px-4 py-3 text-right font-medium tabular-nums" :class="item.availableQty > 0 ? 'text-success' : 'text-danger'">
                {{ item.availableQty }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-text">${{ (item.quantity * item.unitCost).toFixed(2) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="openAdjustModal(item)"
                    class="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-bg-secondary hover:shadow-sm"
                  >
                    Ajustar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredInventario.length === 0" class="py-16 text-center">
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

  <!-- Tab: Movimientos -->
  <div v-if="activeTab === 'movements'" class="space-y-4">
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

    <div class="lg:hidden space-y-3 mb-4">
      <div v-for="mov in filteredMovements" :key="mov.id" class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:shadow-md">
        <div class="flex items-start justify-between mb-2">
          <div>
            <p class="text-xs text-text-muted">{{ formatDateTime(mov.createdAt) }}</p>
            <p class="font-medium text-text">{{ mov.productName }} <span v-if="mov.variantName" class="text-xs text-text-muted">({{ mov.variantName }})</span></p>
          </div>
          <span :class="[
            'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            mov.movementType === 'purchase' ? 'bg-success/10 text-success' :
            mov.movementType === 'sale' ? 'bg-primary/10 text-primary' :
            mov.movementType === 'adjustment' ? 'bg-warning/10 text-warning' :
            'bg-info/10 text-info'
          ]">
            <span :class="[
              'h-1.5 w-1.5 rounded-full',
              mov.movementType === 'purchase' ? 'bg-success' :
              mov.movementType === 'sale' ? 'bg-primary' :
              mov.movementType === 'adjustment' ? 'bg-warning' :
              'bg-info'
            ]" />
            {{ formatMovementType(mov.movementType) }}
          </span>
        </div>
        <div class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-4">
            <span class="font-medium tabular-nums" :class="mov.quantity < 0 ? 'text-danger' : 'text-success'">{{ mov.quantity > 0 ? '+' : '' }}{{ mov.quantity }}</span>
            <span class="text-text-muted">Costo: <span class="text-text tabular-nums">${{ mov.unitCost.toFixed(2) }}</span></span>
          </div>
          <span class="text-xs text-text-muted truncate max-w-28 text-right">{{ mov.notes || '—' }}</span>
        </div>
      </div>
      <div v-if="filteredMovements.length === 0" class="py-16 text-center">
        <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
          <svg class="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-text">Sin movimientos</h3>
        <p class="mt-1 text-sm text-text-muted">No hay movimientos registrados.</p>
      </div>
    </div>

    <div class="hidden lg:block rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-bg-secondary/50">
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Producto</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Tipo</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Cantidad</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Costo</th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Notas</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="mov in filteredMovements" :key="mov.id" class="text-sm transition-all duration-200 hover:bg-bg-secondary/50">
              <td class="px-4 py-3 text-text-muted whitespace-nowrap">{{ formatDateTime(mov.createdAt) }}</td>
              <td class="px-4 py-3">
                <span class="font-medium text-text">{{ mov.productName }}</span>
                <span v-if="mov.variantName" class="text-xs text-text-muted ml-1">({{ mov.variantName }})</span>
              </td>
              <td class="px-4 py-3">
                <span :class="[
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  mov.movementType === 'purchase' ? 'bg-success/10 text-success' :
                  mov.movementType === 'sale' ? 'bg-primary/10 text-primary' :
                  mov.movementType === 'adjustment' ? 'bg-warning/10 text-warning' :
                  'bg-info/10 text-info'
                ]">
                  <span :class="[
                    'h-1.5 w-1.5 rounded-full',
                    mov.movementType === 'purchase' ? 'bg-success' :
                    mov.movementType === 'sale' ? 'bg-primary' :
                    mov.movementType === 'adjustment' ? 'bg-warning' :
                    'bg-info'
                  ]" />
                  {{ formatMovementType(mov.movementType) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium tabular-nums" :class="mov.quantity < 0 ? 'text-danger' : 'text-success'">
                {{ mov.quantity > 0 ? '+' : '' }}{{ mov.quantity }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-text">${{ mov.unitCost.toFixed(2) }}</td>
              <td class="px-4 py-3 text-text-muted max-w-40 truncate">{{ mov.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredMovements.length === 0" class="py-16 text-center">
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

  <!-- Tab: Historial de Ventas -->
  <div v-if="activeTab === 'sales-history'" class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-text">Ventas de Productos</h2>
        <p class="text-xs text-text-muted">Ingresos por venta de productos</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-xl border border-border bg-surface p-0.5 sm:p-1 shadow-sm">
          <button v-for="period in salesPeriods" :key="period.value"
            @click="salesSelectedPeriod = period.value"
            :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-theme sm:px-4',
              salesSelectedPeriod === period.value ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
            ]">{{ period.label }}</button>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 shadow-sm">
          <label for="sales-month-picker" class="text-xs font-medium text-text-muted hidden sm:inline">Mes</label>
          <input
            id="sales-month-picker"
            v-model="salesSelectedMonth"
            type="month"
            class="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text outline-none transition-theme focus:border-primary w-28 sm:w-auto"
            @change="salesSelectedPeriod = 'month'"
          />
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface shadow-sm">
      <div class="flex items-center gap-3 border-b border-border-subtle bg-gradient-to-r from-info/[0.03] to-transparent px-4 sm:px-5 py-3 sm:py-3.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-text">Historial de Ventas</h3>
          <p class="text-xs text-text-secondary">Ventas de productos del período</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-bold text-info whitespace-nowrap">{{ formatUSD(salesTotal) }}</div>
          <div class="text-[11px] text-text-muted font-medium">{{ salesRows.length }} ventas</div>
        </div>
      </div>

      <div class="p-4 sm:p-5">
        <div v-if="salesRows.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Fecha</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Producto</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Cant.</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Precio</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in salesRows" :key="row.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-3 py-3 whitespace-nowrap text-text-secondary">{{ row.date }}</td>
                <td class="px-3 py-3 font-medium text-text">{{ row.product }}</td>
                <td class="px-3 py-3 text-right tabular-nums text-text-secondary">{{ row.quantity }}</td>
                <td class="px-3 py-3 text-right tabular-nums text-text-secondary whitespace-nowrap hidden sm:table-cell">{{ formatUSD(row.unitPrice) }}</td>
                <td class="px-3 py-3 text-right font-semibold text-info tabular-nums whitespace-nowrap">{{ formatUSD(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay ventas en este período</p>
        </div>
      </div>
    </div>
  </div>

  <StockAdjustModal
    :is-open="adjustModalOpen"
    :item="adjustItem"
    :is-loading="adjustMutation.isPending.value"
    v-model:quantity="adjustQuantity"
    v-model:notes="adjustNotes"
    @close="closeAdjustModal"
    @confirm="confirmAdjust"
  />

  <ProductoFormModal
    ref="productoModalRef"
    :is-saving="saveProductoMutation.isPending.value"
    @save="handleSaveProducto"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { formatDateTime } from '../lib/formatters'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import { useInventoryAdjustment } from '../composables/useInventoryAdjustment'
import { useFinancialSummary } from '../composables/useFinancialSummary'
import { inventarioKeys, listInventario, listInventoryMovements } from '../services/inventarioService'
import { productosKeys, saveProducto } from '../services/productosService'
import { posKeys } from '../services/posService'
import StockAdjustModal from '../components/inventario/StockAdjustModal.vue'
import ProductoFormModal from '../components/modals/ProductoFormModal.vue'

import type { ProductoFormData } from '../types/producto'

const { authStore } = useAuth()
const { success, error: showError } = useNotification()
const queryClient = useQueryClient()
const { formatUSD } = useCurrency()

const {
  adjustModalOpen,
  adjustItem,
  adjustQuantity,
  adjustNotes,
  adjustMutation,
  openAdjustModal,
  closeAdjustModal,
  confirmAdjust,
} = useInventoryAdjustment()

const activeTab = ref<'stock' | 'movements' | 'sales-history'>('stock')
const searchQuery = ref('')
const movementSearch = ref('')
const businessId = computed(() => authStore.businessId)
const productoModalRef = ref<InstanceType<typeof ProductoFormModal> | null>(null)

// --- Stock ---
const { data: inventarioData } = useQuery({
  queryKey: computed(() => inventarioKeys.all(businessId.value)),
  queryFn: () => listInventario(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const inventario = computed(() => inventarioData.value ?? [])

const filteredInventario = computed(() => {
  if (!searchQuery.value) return inventario.value
  const q = searchQuery.value.toLowerCase()
  return inventario.value.filter(i => i.productName.toLowerCase().includes(q) || i.productSku.toLowerCase().includes(q))
})

// --- Movimientos ---
const { data: movementsData } = useQuery({
  queryKey: computed(() => inventarioKeys.movements(businessId.value)),
  queryFn: () => listInventoryMovements(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const movements = computed(() => movementsData.value ?? [])

const filteredMovements = computed(() => {
  if (!movementSearch.value) return movements.value
  const q = movementSearch.value.toLowerCase()
  return movements.value.filter(m =>
    m.productName.toLowerCase().includes(q) || m.notes?.toLowerCase().includes(q)
  )
})

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

// --- Producto form modal ---
const saveProductoMutation = useMutation({
  mutationFn: (data: ProductoFormData & { id?: string }) => saveProducto(businessId.value!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: productosKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all(businessId.value) })
    queryClient.invalidateQueries({ queryKey: posKeys.products(businessId.value) })
    productoModalRef.value?.close()
    success('Producto guardado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al guardar el producto')
  },
})

const handleNewProducto = () => {
  productoModalRef.value?.open(undefined, { defaultSellable: false })
}

const handleSaveProducto = async (data: ProductoFormData & { id?: string }) => {
  try {
    await saveProductoMutation.mutateAsync(data)
  } catch { /* handled by mutation onError */ }
}

// --- Historial de Ventas ---
const salesPeriods = [
  { label: 'Mes', value: 'month' as const },
  { label: 'Trimestre', value: 'quarter' as const },
  { label: 'Año', value: 'year' as const },
]
const salesSelectedPeriod = ref<'month' | 'quarter' | 'year'>('month')
const now = new Date()
const salesSelectedMonth = ref<string>(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const salesSummaryCtx = useFinancialSummary(
  businessId,
  salesSelectedPeriod,
  ref([]),
  salesSelectedMonth,
)

const salesRows = computed(() => salesSummaryCtx.productSalesDetails.value)
const salesTotal = computed(() =>
  salesSummaryCtx.productSalesDetails.value.reduce((acc, row) => acc + Number(row.total ?? 0), 0)
)
</script>
