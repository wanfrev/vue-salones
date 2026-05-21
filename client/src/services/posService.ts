import { supabase } from '../lib/supabase'
import type { PaymentMethod } from '../types/database'
import type { POSProductItem, PaymentBreakdownItem } from '../types/pos'

export const recordSale = async (params: {
  appointmentId: string
  amount: number
  method: PaymentMethod
  products?: POSProductItem[]
  notes?: string
  exchangeRate: number
  paymentsBreakdown: PaymentBreakdownItem[]
}): Promise<string> => {
  const productsJson = (params.products ?? []).map(p => ({
    product_id: p.productId,
    variant_id: p.variantId,
    quantity: p.quantity,
    location_id: p.locationId,
    unit_cost: p.unitCost,
  }))

  const { data, error } = await supabase.rpc('record_sale', {
    p_appointment_id: params.appointmentId,
    p_amount: params.amount,
    p_method: params.method,
    p_products: JSON.stringify(productsJson),
    p_notes: params.notes ?? null,
    p_exchange_rate: params.exchangeRate,
    p_payments_breakdown: JSON.stringify(params.paymentsBreakdown),
  })

  if (error) throw error
  return data as string
}

export const listPendingAppointments = async (businessId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      clients ( id, full_name, phone ),
      services ( id, name, duration_minutes, price ),
      profiles ( id, full_name )
    `)
    .eq('business_id', businessId)
    .in('status', ['confirmed', 'completed'])
    .neq('payment_status', 'paid')
    .order('start_time', { ascending: false })
    .limit(20)

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

export const listLocationsWithStock = async (businessId: string, productId: string) => {
  const { data, error } = await supabase
    .from('inventory_stock')
    .select('*, inventory_locations!inner(id, name)')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .gt('quantity', 0)

  if (error) throw error
  return data ?? []
}
