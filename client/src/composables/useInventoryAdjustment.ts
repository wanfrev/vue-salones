import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'
import { adjustInventory, inventarioKeys } from '../services/inventarioService'
import type { InventarioItem } from '../types/inventario'

export function useInventoryAdjustment() {
  const { authStore } = useAuth()
  const { success, error: showError } = useNotification()
  const queryClient = useQueryClient()
  const businessId = authStore.businessId

  const adjustModalOpen = ref(false)
  const adjustItem = ref<InventarioItem | null>(null)
  const adjustQuantity = ref(0)
  const adjustNotes = ref('')

  const adjustMutation = useMutation({
    mutationFn: (params: { productId: string; locationId: string; quantity: number; notes: string; variantId?: string | null }) =>
      adjustInventory(businessId!, params.productId, params.locationId, params.quantity, params.notes, params.variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventarioKeys.all(businessId) })
      queryClient.invalidateQueries({ queryKey: inventarioKeys.movements(businessId) })
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

  return {
    adjustModalOpen,
    adjustItem,
    adjustQuantity,
    adjustNotes,
    adjustMutation,
    openAdjustModal,
    closeAdjustModal,
    confirmAdjust,
  }
}
