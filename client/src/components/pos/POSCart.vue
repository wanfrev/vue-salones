<template>
  <div class="rounded-xl border border-border bg-surface p-4">
    <h3 class="text-base font-semibold text-text mb-3">2. Agregar productos (opcional)</h3>
    <div class="relative mb-3">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar producto..."
        class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
      <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
    <div class="max-h-40 overflow-y-auto space-y-1">
      <button
        v-for="product in displayedProducts"
        :key="product.id"
        @click="addProduct(product)"
        :disabled="Number(product.available_qty ?? 0) <= 0"
        class="w-full text-left rounded-lg px-3 py-2 text-sm transition-theme hover:bg-bg-secondary flex items-center justify-between disabled:cursor-not-allowed disabled:opacity-50"
      >
        <div>
          <span class="text-text">{{ product.name }}</span>
          <p class="text-xs text-text-muted">Disponible: {{ Number(product.available_qty ?? 0) }}</p>
        </div>
        <span class="text-text-muted whitespace-nowrap">{{ formatDual(product.unit_price) }}</span>
      </button>
      <div v-if="displayedProducts.length === 0" class="py-4 text-center text-sm text-text-muted">
        {{ search ? 'Sin resultados' : 'No hay productos disponibles' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{
  products: any[]
}>()

const emit = defineEmits<{
  'add-product': [product: any]
}>()

const { formatDual } = useCurrency()
const search = ref('')

const displayedProducts = computed(() => {
  if (!search.value) return props.products.slice(0, 8)
  const q = search.value.toLowerCase()
  return props.products.filter((p: any) =>
    p.name.toLowerCase().includes(q)
  ).slice(0, 8)
})

const addProduct = (product: any) => {
  emit('add-product', product)
  search.value = ''
}
</script>