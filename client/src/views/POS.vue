<template>
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
      <div class="flex items-center gap-3">
        <button
          @click="refreshAppointments"
          class="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
          title="Refrescar citas pendientes"
        >
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refrescar
        </button>
        <div class="text-xs text-text-muted">
          Tasa: 1 USD = <strong>{{ rateDisplay }}</strong> Bs
        </div>
      </div>
    </div>
  </header>

  <div v-if="queryError" class="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
    Error al cargar citas: {{ queryError }}
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-4">
      <POSAppointmentSelector
        :appointments="appointments"
        :selected-id="selectedAppointment?.id ?? null"
        @select="onSelectAppointment"
      />

      <POSCart
        v-if="selectedAppointment"
        :products="products"
        @add-product="cartCtx.addProduct"
      />
    </div>

    <div class="space-y-4">
      <POSPaymentPanel
        :selected-appointment="selectedAppointment"
        :cart="cartCtx.cart.value"
        :service-price="Number(selectedAppointment?.services?.price ?? 0)"
        :products-total="cartCtx.productsTotal.value"
        :cart-count="cartCtx.cart.value.length"
        :grand-total="grandTotal"
        :payment-method="paymentCtx.paymentMethod.value"
        :payment-methods="paymentCtx.paymentMethods"
        :mixed-methods="paymentCtx.mixedMethods"
        :payments-breakdown="paymentCtx.paymentsBreakdown.value"
        :split-remaining="splitRemaining"
        :is-processing="paymentCtx.isProcessing.value"
        :can-pay="canPay"
        :notes="paymentCtx.paymentNotes.value"
        @select-method="paymentCtx.selectMethod"
        @add-split="paymentCtx.addSplit"
        @remove-split="paymentCtx.removeSplit"
        @update:notes="paymentCtx.paymentNotes.value = $event"
        @process-payment="handleProcessPayment"
        @increment-qty="cartCtx.incrementQty"
        @decrement-qty="cartCtx.decrementQty"
        @remove-item="cartCtx.removeItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import { listPendingAppointments, listSaleableProducts, posKeys } from '../services/posService'
import { usePOSCart } from '../composables/usePOSCart'
import { usePOSPayment } from '../composables/usePOSPayment'
import POSAppointmentSelector from '../components/pos/POSAppointmentSelector.vue'
import POSCart from '../components/pos/POSCart.vue'
import POSPaymentPanel from '../components/pos/POSPaymentPanel.vue'

const { authStore } = useAuth()
const { exchangeRate, formatDual } = useCurrency()
const { error: showError } = useNotification()
const queryClient = useQueryClient()
const businessId = computed(() => authStore.businessId)

const cartCtx = usePOSCart()
const paymentCtx = usePOSPayment()

const selectedAppointment = ref<any>(null)
const queryError = ref<string | null>(null)

const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
  queryKey: computed(() => posKeys.pending(businessId.value)),
  queryFn: async () => {
    try {
      queryError.value = null
      return await listPendingAppointments(businessId.value!)
    } catch (err) {
      const msg = (err as any)?.message ?? (err as any)?.error_description ?? String(err)
      queryError.value = msg
      showError(`Error al cargar citas: ${msg}`)
      return []
    }
  },
  enabled: computed(() => !!businessId.value),
})
const { data: productsData } = useQuery({
  queryKey: computed(() => posKeys.products(businessId.value)),
  queryFn: () => listSaleableProducts(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const refreshAppointments = () => {
  queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
}

const appointments = computed(() => appointmentsData.value ?? [])
const products = computed(() => productsData.value ?? [])

const rateDisplay = computed(() =>
  exchangeRate.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })
)

const grandTotal = computed(() =>
  Number(selectedAppointment.value?.services?.price ?? 0) + cartCtx.productsTotal.value
)

const splitRemaining = computed(() =>
  paymentCtx.paymentMethod.value === 'mixed'
    ? Math.max(0, grandTotal.value - paymentCtx.paymentsBreakdown.value.reduce((sum: number, s: any) => {
        const usd = s.currency === 'VES' ? (s.inputAmount || 0) / exchangeRate.value : (s.inputAmount || 0)
        return sum + usd
      }, 0))
    : 0
)

const canPay = computed(() => {
  if (grandTotal.value <= 0) return false
  if (paymentCtx.paymentMethod.value === 'mixed') {
    const total = paymentCtx.paymentsBreakdown.value.reduce((sum: number, s: any) => {
      const usd = s.currency === 'VES' ? (s.inputAmount || 0) / exchangeRate.value : (s.inputAmount || 0)
      return sum + usd
    }, 0)
    return Math.abs(total - grandTotal.value) < 0.01 && paymentCtx.paymentsBreakdown.value.length > 0
  }
  return true
})

const onSelectAppointment = (appt: any) => {
  selectedAppointment.value = appt
}

const handleProcessPayment = async () => {
  if (!selectedAppointment.value) return
  const ok = await paymentCtx.processPayment(
    selectedAppointment.value.id,
    grandTotal.value,
    cartCtx.cart.value,
    exchangeRate.value,
    formatDual,
  )
  if (ok) {
    selectedAppointment.value = null
    cartCtx.clearCart()
    paymentCtx.reset()
    queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
  }
}
</script>