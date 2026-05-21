import type { PaymentMethod } from './database'

export interface POSProductItem {
  productId: string
  productName: string
  variantId: string | null
  variantName: string | null
  quantity: number
  unitPrice: number
  unitCost: number
  locationId: string
  subtotal: number
}

export interface POSTransaction {
  appointmentId: string
  amount: number
  method: PaymentMethod
  products: POSProductItem[]
  notes: string
}

export interface PaymentBreakdownItem {
  method: PaymentMethod
  inputAmount: number
  currency: 'USD' | 'VES'
  amount: number
}
