import { ref, computed } from 'vue'
import { useAuth } from './useAuth'
import { listLocationsWithStock } from '../services/posService'
import type { POSProductItem } from '../types/pos'

export function usePOSCart() {
  const { authStore } = useAuth()
  const cart = ref<POSProductItem[]>([])
  const productSearch = ref('')

  const productsTotal = computed(() =>
    cart.value.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  )

  const addProduct = async (product: any) => {
    const existing = cart.value.find(c => c.productId === product.id)
    if (existing) {
      existing.quantity++
      existing.subtotal = existing.unitPrice * existing.quantity
    } else {
      let locationId = ''
      if (authStore.businessId) {
        try {
          const locations = await listLocationsWithStock(authStore.businessId, product.id)
          if (locations.length > 0) {
            locationId = (locations[0] as any).location_id || (locations[0] as any).inventory_locations?.id || ''
          }
        } catch {
          // Location lookup failed, proceed without
        }
      }
      cart.value.push({
        productId: product.id,
        productName: product.name,
        variantId: null,
        variantName: null,
        quantity: 1,
        unitPrice: Number(product.unit_price),
        unitCost: Number(product.unit_cost),
        locationId,
        subtotal: Number(product.unit_price),
      })
    }
    productSearch.value = ''
  }

  const incrementQty = (idx: number) => {
    cart.value[idx].quantity++
    cart.value[idx].subtotal = cart.value[idx].unitPrice * cart.value[idx].quantity
  }

  const decrementQty = (idx: number) => {
    if (cart.value[idx].quantity > 1) {
      cart.value[idx].quantity--
      cart.value[idx].subtotal = cart.value[idx].unitPrice * cart.value[idx].quantity
    }
  }

  const removeItem = (idx: number) => {
    cart.value.splice(idx, 1)
  }

  const clearCart = () => {
    cart.value = []
    productSearch.value = ''
  }

  return {
    cart,
    productSearch,
    productsTotal,
    addProduct,
    incrementQty,
    decrementQty,
    removeItem,
    clearCart,
  }
}
