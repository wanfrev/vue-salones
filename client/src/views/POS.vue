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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Ventas</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Punto de Venta</h1>
              <p class="hidden text-sm text-text-muted sm:block">Registra pagos y ventas de servicios y productos</p>
            </div>
            <div class="text-xs text-text-muted">
              Tasa: 1 USD = <strong>{{ rateDisplay }}</strong> Bs
            </div>
          </div>
        </header>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- Left: Pending Appointments / Ticket -->
          <div class="lg:col-span-2 space-y-4">
            <!-- Step 1: Select appointment -->
            <div class="rounded-xl border border-border bg-surface p-4">
              <h3 class="text-base font-semibold text-text mb-3">1. Seleccionar cita</h3>
              <div class="relative">
                <input
                  v-model="apptSearch"
                  type="text"
                  placeholder="Buscar cliente..."
                  class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div class="mt-3 space-y-2 max-h-60 overflow-y-auto">
                <button
                  v-for="appt in filteredAppointments"
                  :key="appt.id"
                  @click="selectedAppointment = appt"
                  :class="[
                    'w-full text-left rounded-lg border p-3 transition-theme',
                    selectedAppointment?.id === appt.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-border-strong hover:bg-bg-secondary'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-text">{{ appt.clients?.full_name || 'Cliente' }}</p>
                      <p class="text-xs text-text-muted">{{ appt.services?.name || 'Servicio' }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-text">${{ appt.services?.price || 0 }}</p>
                      <p class="text-xs text-text-muted">{{ formatTime(appt.start_time) }}</p>
                    </div>
                  </div>
                </button>
                <div v-if="filteredAppointments.length === 0" class="py-6 text-center text-sm text-text-muted">
                  No hay citas pendientes de pago.
                </div>
              </div>
            </div>

            <!-- Step 2: Add products -->
            <div v-if="selectedAppointment" class="rounded-xl border border-border bg-surface p-4">
              <h3 class="text-base font-semibold text-text mb-3">2. Agregar productos (opcional)</h3>
              <div class="relative mb-3">
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="Buscar producto para agregar..."
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
                  v-for="product in filteredProducts"
                  :key="product.id"
                  @click="addProductToCart(product)"
                  class="w-full text-left rounded-lg px-3 py-2 text-sm transition-theme hover:bg-bg-secondary flex items-center justify-between"
                >
                  <span class="text-text">{{ product.name }}</span>
                  <span class="text-text-muted whitespace-nowrap">{{ formatDual(product.unit_price) }}</span>
                </button>
                <div v-if="filteredProducts.length === 0 && productSearch" class="py-4 text-center text-sm text-text-muted">
                  Sin resultados
                </div>
              </div>

              <!-- Cart items -->
              <div v-if="cart.length > 0" class="mt-3 border-t border-border-subtle pt-3 space-y-2">
                <div v-for="(item, idx) in cart" :key="idx" class="flex items-center justify-between rounded-lg bg-bg-secondary p-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text truncate">{{ item.productName }}</p>
                    <p class="text-xs text-text-muted">{{ formatDual(item.unitPrice) }} x {{ item.quantity }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <button @click="decrementCartQty(idx)" class="rounded p-0.5 text-text-muted hover:text-text hover:bg-border" :disabled="item.quantity <= 1">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="text-sm font-medium w-6 text-center text-text">{{ item.quantity }}</span>
                      <button @click="incrementCartQty(idx)" class="rounded p-0.5 text-text-muted hover:text-text hover:bg-border">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    <span class="text-sm font-bold text-text w-20 text-right">{{ formatDual(item.unitPrice * item.quantity) }}</span>
                    <button @click="removeFromCart(idx)" class="rounded p-1 text-text-muted hover:text-danger hover:bg-danger/10">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Payment Summary -->
          <div class="space-y-4">
            <div class="rounded-xl border border-border bg-surface p-4 sticky top-6">
              <h3 class="text-base font-semibold text-text mb-4">Resumen de cobro</h3>

              <div v-if="selectedAppointment" class="space-y-3">
                <div class="rounded-lg bg-bg-secondary p-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-text-muted">Servicio</span>
                    <span class="font-medium text-text">{{ selectedAppointment.services?.name || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm mt-1">
                    <span class="text-text-muted">Empleado</span>
                    <span class="font-medium text-text">{{ selectedAppointment.profiles?.full_name || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm mt-1">
                    <span class="text-text-muted">Cliente</span>
                    <span class="font-medium text-text">{{ selectedAppointment.clients?.full_name || '—' }}</span>
                  </div>
                </div>

                <div class="border-t border-border-subtle pt-3 space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-text-muted">Servicio</span>
                    <span class="font-medium text-text">{{ formatDual(Number(selectedAppointment.services?.price || 0)) }}</span>
                  </div>
                  <div v-if="productsTotal > 0" class="flex items-center justify-between text-sm">
                    <span class="text-text-muted">Productos ({{ cart.length }})</span>
                    <span class="font-medium text-text">{{ formatDual(productsTotal) }}</span>
                  </div>
                  <div class="flex items-center justify-between border-t border-border pt-2">
                    <span class="text-base font-bold text-text">Total</span>
                    <span class="text-lg font-bold text-primary">{{ formatDual(grandTotal) }}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-text">Método de pago</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="pm in paymentMethods"
                      :key="pm.value"
                      @click="selectPaymentMethod(pm.value)"
                      :class="[
                        'rounded-lg border p-2 text-sm font-medium transition-theme text-center',
                        paymentMethod === pm.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-text-secondary hover:bg-bg-secondary'
                      ]"
                    >
                      {{ pm.label }}
                    </button>
                  </div>
                </div>

                <!-- Mixed Payment Breakdown -->
                <div v-if="paymentMethod === 'mixed'" class="space-y-2 border-t border-border-subtle pt-3">
                  <label class="block text-sm font-medium text-text">Distribución del pago</label>
                  <div
                    v-for="(split, idx) in paymentsBreakdown"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <select
                      v-model="split.method"
                      class="flex-1 rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text outline-none focus:border-primary"
                    >
                      <option v-for="m in mixedMethods" :key="m.value" :value="m.value">{{ m.label }}</option>
                    </select>
                    <select
                      v-model="split.currency"
                      class="w-16 rounded-lg border border-border bg-surface px-1 py-2 text-xs text-text outline-none focus:border-primary"
                    >
                      <option value="USD">USD</option>
                      <option value="VES">Bs</option>
                    </select>
                    <div class="relative flex-1">
                      <input
                        v-model.number="split.inputAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-full rounded-lg border border-border bg-surface px-2 py-2 text-xs text-text outline-none placeholder:text-text-muted focus:border-primary"
                      />
                    </div>
                    <button
                      v-if="paymentsBreakdown.length > 1"
                      @click="removeSplit(idx)"
                      class="rounded p-1 text-text-muted hover:text-danger hover:bg-danger/10"
                    >
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <button
                      @click="addSplit"
                      class="text-primary hover:text-primary-hover transition-theme font-medium"
                    >
                      + Agregar método
                    </button>
                    <span :class="splitRemaining === 0 ? 'text-success' : 'text-warning'">
                      Restante: {{ formatDual(splitRemaining) }}
                    </span>
                  </div>
                </div>

                <textarea
                  v-model="paymentNotes"
                  placeholder="Notas del pago (opcional)"
                  rows="2"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary"
                ></textarea>

                <button
                  @click="handleProcessPayment"
                  :disabled="isProcessing || !canPay"
                  class="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-text-inverse transition-theme hover:bg-primary-hover disabled:opacity-50"
                >
                  <svg v-if="isProcessing" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isProcessing ? 'Procesando...' : `Cobrar ${formatDual(grandTotal)}` }}
                </button>
              </div>

              <div v-else class="py-8 text-center text-sm text-text-muted">
                <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary mb-3">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p>Selecciona una cita pendiente para cobrar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import { listPendingAppointments, listSaleableProducts, recordSale } from '../services/posService'
import { useThemeStore } from '../store/theme'
import Sidebar from '../components/layout/Sidebar.vue'
import lumaLogoLight from '../assets/Luma.svg'
import lumaLogoDark from '../assets/Luma blanco.svg'
import type { PaymentMethod } from '../types/database'
import type { POSProductItem, PaymentBreakdownItem } from '../types/pos'

const { logout, authStore } = useAuth()
const { exchangeRate, formatDual } = useCurrency()
const { success, error: showError } = useNotification()
const themeStore = useThemeStore()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const lumaLogo = computed(() => (themeStore.isDark ? lumaLogoDark : lumaLogoLight))
const apptSearch = ref('')
const productSearch = ref('')
const selectedAppointment = ref<any>(null)
const paymentMethod = ref<PaymentMethod>('cash')
const paymentNotes = ref('')
const cart = ref<POSProductItem[]>([])
const isProcessing = ref(false)
const paymentsBreakdown = ref<PaymentBreakdownItem[]>([])
const businessId = computed(() => authStore.businessId)

const rateDisplay = computed(() =>
  exchangeRate.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })
)

const paymentMethods = [
  { label: 'Efectivo', value: 'cash' as PaymentMethod },
  { label: 'Tarjeta', value: 'card' as PaymentMethod },
  { label: 'Transferencia', value: 'transfer' as PaymentMethod },
  { label: 'Zelle', value: 'zelle' as PaymentMethod },
  { label: 'Pago Móvil', value: 'pago_movil' as PaymentMethod },
  { label: 'Mixto', value: 'mixed' as PaymentMethod },
  { label: 'Otro', value: 'other' as PaymentMethod },
]

const mixedMethods = [
  { label: 'Efectivo', value: 'cash' as PaymentMethod },
  { label: 'Tarjeta', value: 'card' as PaymentMethod },
  { label: 'Transferencia', value: 'transfer' as PaymentMethod },
  { label: 'Zelle', value: 'zelle' as PaymentMethod },
  { label: 'Pago Móvil', value: 'pago_movil' as PaymentMethod },
]

const selectPaymentMethod = (method: PaymentMethod) => {
  paymentMethod.value = method
  if (method === 'mixed') {
    paymentsBreakdown.value = [{ method: 'cash', inputAmount: grandTotal.value, currency: 'USD', amount: grandTotal.value }]
  } else {
    paymentsBreakdown.value = []
  }
}

const addSplit = () => {
  paymentsBreakdown.value.push({ method: 'cash', inputAmount: 0, currency: 'USD', amount: 0 })
}

const removeSplit = (idx: number) => {
  paymentsBreakdown.value.splice(idx, 1)
}

const splitTotal = computed(() =>
  paymentsBreakdown.value.reduce((sum, s) => {
    const usdAmount = s.currency === 'VES'
      ? (s.inputAmount || 0) / exchangeRate.value
      : (s.inputAmount || 0)
    s.amount = usdAmount
    return sum + usdAmount
  }, 0)
)

const splitRemaining = computed(() =>
  Math.max(0, grandTotal.value - splitTotal.value)
)

const canPay = computed(() => {
  if (grandTotal.value <= 0) return false
  if (paymentMethod.value === 'mixed') {
    return Math.abs(splitTotal.value - grandTotal.value) < 0.01 && paymentsBreakdown.value.length > 0
  }
  return true
})

const { data: appointmentsData } = useQuery({
  queryKey: computed(() => ['pos-pending', businessId.value]),
  queryFn: () => listPendingAppointments(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const { data: productsData } = useQuery({
  queryKey: computed(() => ['pos-products', businessId.value]),
  queryFn: () => listSaleableProducts(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const appointments = computed(() => appointmentsData.value ?? [])
const products = computed(() => productsData.value ?? [])

const filteredAppointments = computed(() => {
  if (!apptSearch.value) return appointments.value
  const q = apptSearch.value.toLowerCase()
  return appointments.value.filter((a: any) =>
    a.clients?.full_name?.toLowerCase().includes(q) ||
    a.clients?.phone?.includes(q)
  )
})

const filteredProducts = computed(() => {
  if (!productSearch.value) return []
  const q = productSearch.value.toLowerCase()
  return products.value.filter((p: any) =>
    p.name.toLowerCase().includes(q)
  ).slice(0, 8)
})

const productsTotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
)

const grandTotal = computed(() => {
  const servicePrice = Number(selectedAppointment.value?.services?.price ?? 0)
  return servicePrice + productsTotal.value
})

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const addProductToCart = (product: any) => {
  const existing = cart.value.find(c => c.productId === product.id)
  if (existing) {
    existing.quantity++
    existing.subtotal = existing.unitPrice * existing.quantity
  } else {
    cart.value.push({
      productId: product.id,
      productName: product.name,
      variantId: null,
      variantName: null,
      quantity: 1,
      unitPrice: Number(product.unit_price),
      unitCost: Number(product.unit_cost),
      locationId: '',
      subtotal: Number(product.unit_price),
    })
  }
  productSearch.value = ''
}

const incrementCartQty = (idx: number) => {
  cart.value[idx].quantity++
  cart.value[idx].subtotal = cart.value[idx].unitPrice * cart.value[idx].quantity
}

const decrementCartQty = (idx: number) => {
  if (cart.value[idx].quantity > 1) {
    cart.value[idx].quantity--
    cart.value[idx].subtotal = cart.value[idx].unitPrice * cart.value[idx].quantity
  }
}

const removeFromCart = (idx: number) => {
  cart.value.splice(idx, 1)
}

const recordPaymentMutation = useMutation({
  mutationFn: (params: {
    appointmentId: string
    amount: number
    method: PaymentMethod
    products: POSProductItem[]
    notes: string
    exchangeRate: number
    paymentsBreakdown: PaymentBreakdownItem[]
  }) => recordSale(params),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
    queryClient.invalidateQueries({ queryKey: ['inventario'] })
  },
})

const handleProcessPayment = async () => {
  if (!selectedAppointment.value) return
  if (grandTotal.value <= 0) {
    showError('El total debe ser mayor a 0')
    return
  }

  isProcessing.value = true
  try {
    let method = paymentMethod.value
    let breakdown = paymentsBreakdown.value

    if (method !== 'mixed') {
      breakdown = [{ method, inputAmount: grandTotal.value, currency: 'USD', amount: grandTotal.value }]
    }

    await recordPaymentMutation.mutateAsync({
      appointmentId: selectedAppointment.value.id,
      amount: grandTotal.value,
      method,
      products: cart.value,
      notes: paymentNotes.value,
      exchangeRate: exchangeRate.value,
      paymentsBreakdown: breakdown,
    })

    success(`Cobro de ${formatDual(grandTotal.value)} registrado correctamente`)
    selectedAppointment.value = null
    cart.value = []
    paymentNotes.value = ''
    paymentMethod.value = 'cash'
    paymentsBreakdown.value = []
  } catch (err) {
    showError('Error al procesar el pago')
    console.error(err)
  } finally {
    isProcessing.value = false
  }
}
</script>
