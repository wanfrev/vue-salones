import { supabase } from '../lib/supabase'
import { getDefaultLocation } from '../business/stockRules'
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
    .order('name')

  if (error) throw error
  return data ?? []
}