import { ref, computed } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { recordSale } from '../services/posService'
import type { PaymentMethod } from '../types/database'
import type { POSProductItem, PaymentBreakdownItem } from '../types/pos'

export function usePOSPayment() {
  const { authStore } = useAuth()
  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()
  const businessId = computed(() => authStore.businessId)

  const paymentMethod = ref<PaymentMethod>('cash')
  const paymentNotes = ref('')
  const isProcessing = ref(false)
  const paymentsBreakdown = ref<PaymentBreakdownItem[]>([])

  const paymentMethods = [
    { label: 'Efectivo', value: 'cash' as PaymentMethod },
    { label: 'Tarjeta', value: 'card' as PaymentMethod },
    { label: 'Transferencia', value: 'transfer' as PaymentMethod },
    { label: 'Zelle', value: 'zelle' as PaymentMethod },
    { label: 'Pago Móvil', value: 'pago_movil' as PaymentMethod },
    { label: 'Mixto', value: 'mixed' as PaymentMethod },
    { label: 'Otro', value: 'other' as PaymentMethod },
  ]

  const mixedMethods = paymentMethods.filter(m => m.value !== 'mixed')

  const selectMethod = (method: PaymentMethod) => {
    paymentMethod.value = method
    if (method === 'mixed') {
      paymentsBreakdown.value = [{ method: 'cash', inputAmount: 0, currency: 'USD', amount: 0 }]
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

  const recordMutation = useMutation({
    mutationFn: (params: {
      appointmentId: string
      amount: number
      method: PaymentMethod
      products: POSProductItem[]
      notes: string
      exchangeRate: number
      paymentsBreakdown: PaymentBreakdownItem[]
    }) => recordSale({ ...params, businessId: businessId.value! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['finanzas-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
    },
  })

  const processPayment = async (
    appointmentId: string,
    grandTotal: number,
    products: POSProductItem[],
    exchangeRate: number,
    formatDual: (n: number) => string,
  ) => {
    if (grandTotal <= 0) {
      showError('El total debe ser mayor a 0')
      return false
    }

    isProcessing.value = true
    try {
      let breakdown = paymentsBreakdown.value
      if (paymentMethod.value !== 'mixed') {
        breakdown = [{ method: paymentMethod.value, inputAmount: grandTotal, currency: 'USD', amount: grandTotal }]
      }

      await recordMutation.mutateAsync({
        appointmentId,
        amount: grandTotal,
        method: paymentMethod.value,
        products,
        notes: paymentNotes.value,
        exchangeRate,
        paymentsBreakdown: breakdown,
      })

      success(`Cobro de ${formatDual(grandTotal)} registrado correctamente`)
      return true
    } catch (err) {
      showError('Error al procesar el pago')
      console.error(err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  const reset = () => {
    paymentMethod.value = 'cash'
    paymentNotes.value = ''
    paymentsBreakdown.value = []
  }

  return {
    paymentMethod,
    paymentNotes,
    isProcessing,
    paymentsBreakdown,
    paymentMethods,
    mixedMethods,
    selectMethod,
    addSplit,
    removeSplit,
    processPayment,
    reset,
  }
}
