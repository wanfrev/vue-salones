<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <div class="flex items-center gap-2 mb-3">
      <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
      <h3 class="text-base font-semibold text-text">1. Venta rapida</h3>
    </div>

    <div class="relative mb-3">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar producto y vender..."
        class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div v-if="!selected" class="max-h-40 overflow-y-auto space-y-1">
      <button
        v-for="product in displayedProducts"
        :key="product.id"
        @click="selectProduct(product)"
        :disabled="Number(product.available_qty ?? 0) <= 0"
        class="w-full text-left rounded-lg px-3 py-2 text-sm transition-theme hover:bg-bg-secondary flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div>
          <span class="text-text">{{ product.name }}</span>
          <p class="text-xs text-text-muted">Disponible: {{ Number(product.available_qty ?? 0) }}</p>
        </div>
        <span class="text-text-muted whitespace-nowrap">{{ formatDual(product.unit_price) }}</span>
      </button>
      <div v-if="displayedProducts.length === 0 && search" class="py-4 text-center text-sm text-text-muted">
        Sin resultados
      </div>
    </div>

    <div v-else class="space-y-3 rounded-lg bg-bg-secondary p-3">
      <h4 class="text-xs font-semibold uppercase tracking-wider text-text-muted">2. Resumen de cobro</h4>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-text">{{ selected.name }}</p>
          <p class="text-xs text-text-muted">Stock disponible: {{ selected.available_qty ?? 0 }}</p>
        </div>
        <button
          @click="cancelSelection"
          class="rounded p-1 text-text-muted hover:text-danger hover:bg-danger/10 transition-theme"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-text-muted mb-1">Cantidad</label>
          <input
            v-model.number="quantity"
            type="number" min="1"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-text-muted mb-1">Precio unitario ($)</label>
          <input
            v-model.number="unitPrice"
            type="number" min="0" step="0.01"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Notas</label>
        <input
          v-model="notes"
          type="text" placeholder="Opcional"
          class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
        />
      </div>

      <div v-if="total > 0" class="text-center">
        <p class="text-sm text-text-muted">Total venta</p>
        <p class="text-lg font-bold text-text">{{ formatDual(total) }}</p>
      </div>

      <button
        @click="handleSell"
        :disabled="isSaving || quantity <= 0 || unitPrice <= 0 || quantity > Number(selected?.available_qty ?? 0)"
        class="w-full flex items-center justify-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-bold text-white transition-theme hover:bg-success/90 disabled:opacity-50"
      >
        <svg v-if="isSaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isSaving ? 'Vendiendo...' : `Vender ${formatDual(total)}` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useCurrency } from '../../composables/useCurrency'
import { useNotification } from '../../composables/useNotification'
import { posKeys } from '../../services/posService'
import { sellProduct, inventarioKeys } from '../../services/inventarioService'

const props = defineProps<{
  products: any[]
  businessId: string
}>()

const { formatDual } = useCurrency()
const { success, error: showError } = useNotification()
const queryClient = useQueryClient()

const search = ref('')
const selected = ref<any>(null)
const quantity = ref(1)
const unitPrice = ref(0)
const notes = ref('')

const displayedProducts = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return []
  return props.products.filter((p: any) =>
    p.name.toLowerCase().includes(q)
  ).slice(0, 8)
})

const total = computed(() =>
  quantity.value > 0 && unitPrice.value > 0 ? quantity.value * unitPrice.value : 0
)

const sellMutation = useMutation({
  mutationFn: () =>
    sellProduct(props.businessId, selected.value!.id, quantity.value, notes.value, null, unitPrice.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: inventarioKeys.all(props.businessId) })
    queryClient.invalidateQueries({ queryKey: inventarioKeys.movements(props.businessId) })
    queryClient.invalidateQueries({ queryKey: posKeys.products(props.businessId) })
    success('Venta registrada correctamente')
    cancelSelection()
  },
  onError: (err) => {
    showError((err as any)?.message ?? 'Error al registrar la venta')
  },
})

const isSaving = sellMutation.isPending

const selectProduct = (product: any) => {
  selected.value = product
  quantity.value = 1
  unitPrice.value = Number(product.unit_price)
  notes.value = ''
  search.value = ''
}

const cancelSelection = () => {
  selected.value = null
  quantity.value = 1
  unitPrice.value = 0
  notes.value = ''
}

const handleSell = () => {
  if (!selected.value || quantity.value <= 0 || unitPrice.value <= 0) return
  if (quantity.value > Number(selected.value.available_qty ?? 0)) {
    showError('La cantidad supera el stock disponible')
    return
  }
  sellMutation.mutate()
}
</script>
