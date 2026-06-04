import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'

export async function getDefaultLocation(businessId: string): Promise<string> {
  let { data: loc } = await supabase
    .from('inventory_locations')
    .select('id')
    .eq('business_id', businessId)
    .eq('is_default', true)
    .maybeSingle()

  if (!loc) {
    const { data: firstLoc } = await supabase
      .from('inventory_locations')
      .select('id')
      .eq('business_id', businessId)
      .limit(1)
      .maybeSingle()
    loc = firstLoc
  }

  if (!loc) {
    const { data: newLoc } = await mutate
      .from('inventory_locations')
      .insert({ business_id: businessId, name: 'Principal', is_default: true })
      .select('id')
      .single()
    loc = newLoc
  }

  return loc.id
}

export function validateSaleQuantity(quantity: number, availableQty: number): void {
  if (quantity <= 0) throw new Error('La cantidad debe ser mayor a 0')
  if (quantity > availableQty) throw new Error('Stock insuficiente')
}

export function validateAdjustQuantity(quantity: number): void {
  if (quantity === 0) throw new Error('La cantidad de ajuste no puede ser 0')
}

export function movementTypeForAdjust(quantity: number): 'purchase' | 'adjustment' {
  return quantity > 0 ? 'purchase' : 'adjustment'
}

export async function getStockRecord(
  businessId: string,
  productId: string,
  locationId: string,
  variantId?: string | null,
) {
  let query = supabase
    .from('inventory_stock')
    .select('id, quantity')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('location_id', locationId)

  if (variantId) {
    query = query.eq('variant_id', variantId)
  } else {
    query = query.is('variant_id', null)
  }

  return query.maybeSingle()
}

export async function updateStockQuantity(stockId: string, newQuantity: number): Promise<void> {
  const { error } = await mutate
    .from('inventory_stock')
    .update({ quantity: newQuantity })
    .eq('id', stockId)
  if (error) throw error
}

export async function insertStockRecord(
  businessId: string,
  productId: string,
  locationId: string,
  quantity: number,
  variantId?: string | null,
): Promise<void> {
  const { error } = await mutate
    .from('inventory_stock')
    .insert({
      business_id: businessId,
      location_id: locationId,
      product_id: productId,
      variant_id: variantId ?? null,
      quantity,
    })
  if (error) throw error
}

export async function recordMovement(
  businessId: string,
  params: {
    locationId: string
    productId: string
    variantId?: string | null
    movementType: string
    quantity: number
    notes: string
    unitCost?: number
  },
): Promise<void> {
  const supabaseUser = mutate.auth?.currentUser
  const { error } = await mutate
    .from('inventory_movements')
    .insert({
      business_id: businessId,
      location_id: params.locationId,
      product_id: params.productId,
      variant_id: params.variantId ?? null,
      movement_type: params.movementType,
      quantity: params.quantity,
      unit_cost: params.unitCost ?? 0,
      notes: params.notes,
      created_by: supabaseUser?.id ?? null,
    })
  if (error) throw error
}
