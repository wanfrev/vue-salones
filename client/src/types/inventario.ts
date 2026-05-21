export interface InventarioItem {
  id: string
  productId: string
  productName: string
  productSku: string
  variantId: string | null
  variantName: string | null
  locationId: string
  locationName: string
  quantity: number
  reservedQty: number
  availableQty: number
  reorderPoint: number
  unitCost: number
  unitPrice: number
}

export interface InventarioLocation {
  id: string
  name: string
  isDefault: boolean
  active: boolean
}

export interface InventarioMovimiento {
  id: string
  locationId: string
  locationName: string
  productId: string
  productName: string
  variantId: string | null
  variantName: string | null
  movementType: string
  quantity: number
  unitCost: number
  referenceType: string | null
  referenceId: string | null
  notes: string | null
  createdBy: string | null
  createdAt: string
}
