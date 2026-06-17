import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { getDefaultLocation } from './inventarioService'
import type { PaymentMethod } from '../types/database'
import type { POSProductItem, PaymentBreakdownItem } from '../types/pos'

export const posKeys = {
  pending: (businessId?: string | null) => ['pos-pending', businessId] as const,
  products: (businessId?: string | null) => ['pos-products', businessId] as const,
}

export const recordSale = async (params: {
  appointmentId: string
  amount: number
  method: PaymentMethod
  products?: POSProductItem[]
  notes?: string
  exchangeRate: number
  paymentsBreakdown: PaymentBreakdownItem[]
  businessId: string
}): Promise<string> => {
  const products = params.products ?? []
  const locationId = products.length > 0 ? await getDefaultLocation(params.businessId) : null

  if (products.length > 0 && locationId) {
    const productIds = [...new Set(products.map(p => p.productId))]
    const { data: stockRows, error: stockError } = await supabase
      .from('inventory_stock')
      .select('product_id, variant_id, quantity, reserved_qty')
      .eq('business_id', params.businessId)
      .eq('location_id', locationId)
      .in('product_id', productIds)

    if (stockError) throw stockError

    const availableByKey = new Map<string, number>()
    for (const row of (stockRows ?? []) as Array<{ product_id: string; variant_id: string | null; quantity: number; reserved_qty: number }>) {
      const key = `${row.product_id}::${row.variant_id ?? 'null'}`
      const available = Number(row.quantity) - Number(row.reserved_qty)
      availableByKey.set(key, Math.max(0, available))
    }

    for (const product of products) {
      const key = `${product.productId}::${product.variantId ?? 'null'}`
      const available = availableByKey.get(key) ?? 0
      if (product.quantity > available) {
        throw new Error(`Stock insuficiente para ${product.productName}. Disponible: ${available}`)
      }
    }
  }

  const productsPayload = products.map(p => ({
    product_id: p.productId,
    variant_id: p.variantId,
    quantity: p.quantity,
    location_id: locationId,
    unit_cost: p.unitCost,
  }))

  const rpcPayload = {
    p_appointment_id: params.appointmentId,
    p_amount: params.amount,
    p_method: params.method,
    p_products: productsPayload,
    p_notes: params.notes ?? null,
    p_exchange_rate: params.exchangeRate,
    p_payments_breakdown: params.paymentsBreakdown,
  }

  const { data, error } = await supabase.rpc('record_sale', rpcPayload)

  if (error && error.code === 'PGRST202') {
    // Backward compatibility for DBs that still expose the legacy 5-arg signature.
    const legacy = await supabase.rpc('record_sale', {
      p_appointment_id: params.appointmentId,
      p_amount: params.amount,
      p_method: params.method,
      p_products: productsPayload,
      p_notes: params.notes ?? null,
    })
    if (legacy.error) throw legacy.error
    return legacy.data as string
  }

  if (error) throw error
  return data as string
}

export const updateTransaction = async (params: {
  transactionId: string
  amount?: number
  method?: PaymentMethod
  notes?: string
  exchangeRate?: number
  paymentsBreakdown?: PaymentBreakdownItem[]
}): Promise<void> => {
  const { error } = await supabase.rpc('update_transaction', {
    p_transaction_id: params.transactionId,
    p_amount: params.amount ?? null,
    p_method: params.method ?? null,
    p_notes: params.notes ?? null,
    p_exchange_rate: params.exchangeRate ?? null,
  })
  if (error) throw error

  if (params.paymentsBreakdown) {
    const { error: bdError } = await mutate
      .from('transactions')
      .update({ payments_breakdown: params.paymentsBreakdown })
      .eq('id', params.transactionId)
    if (bdError) throw bdError
  }
}

export const deleteTransaction = async (params: {
  transactionId: string
}): Promise<void> => {
  const { error } = await supabase.rpc('delete_transaction', {
    p_transaction_id: params.transactionId,
  })
  if (error) throw error
}

export const listPendingAppointments = async (businessId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, clients(id, full_name, phone), services(id, name, duration_minutes, price), profiles!appointments_employee_id_fkey(id, full_name)')
    .eq('business_id', businessId)
    .in('status', ['confirmed', 'completed', 'pending'])
    .neq('payment_status', 'paid')
    .order('start_time', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

export const listSaleableProducts = async (businessId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .eq('is_sellable', true)
    .order('name')

  if (error) throw error

  const products = data ?? []
  const productIds = products.map((p: any) => p.id)
  if (productIds.length === 0) return []

  const { data: stockRows, error: stockError } = await supabase
    .from('inventory_stock')
    .select('product_id, quantity, reserved_qty')
    .eq('business_id', businessId)
    .in('product_id', productIds)

  if (stockError) throw stockError

  const availableByProduct = new Map<string, number>()
  for (const row of (stockRows ?? []) as Array<{ product_id: string; quantity: number; reserved_qty: number }>) {
    const current = availableByProduct.get(row.product_id) ?? 0
    const available = Number(row.quantity) - Number(row.reserved_qty)
    availableByProduct.set(row.product_id, current + available)
  }

  return products.map((product: any) => ({
    ...product,
    available_qty: Math.max(0, availableByProduct.get(product.id) ?? 0),
  }))
}