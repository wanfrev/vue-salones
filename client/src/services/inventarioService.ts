import { supabase } from '../lib/supabase'
import type { InventoryLocation, InventoryStock, InventoryMovement } from '../types/database'
import type { InventarioItem, InventarioLocation, InventarioMovimiento } from '../types/inventario'

export const inventarioKeys = {
  all: (businessId?: string | null) => ['inventario', businessId] as const,
  locations: (businessId?: string | null) => ['inventario-locations', businessId] as const,
  movements: (businessId?: string | null) => ['inventario-movements', businessId] as const,
}

export const listInventoryLocations = async (businessId: string): Promise<InventarioLocation[]> => {
  const { data, error } = await supabase
    .from('inventory_locations')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) throw error
  return ((data ?? []) as InventoryLocation[]).map(loc => ({
    id: loc.id,
    name: loc.name,
    isDefault: loc.is_default,
    active: loc.active,
  }))
}

export const listInventario = async (businessId: string): Promise<InventarioItem[]> => {
  const { data: stock, error } = await supabase
    .from('inventory_stock')
    .select('*, products!inner(name, sku, unit_cost, unit_price, reorder_point), inventory_locations!inner(name)')
    .eq('business_id', businessId)

  if (error) throw error

  const raw = (stock ?? []) as Array<
    InventoryStock & {
      products?: { name: string; sku: string | null; unit_cost: number; unit_price: number; reorder_point: number } | null
      inventory_locations?: { name: string } | null
    }
  >

  const productIds = [...new Set(raw.map(r => r.product_id))]
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, product_id, name')
    .eq('active', true)
    .in('product_id', productIds.length ? productIds : [null])

  const variantMap = new Map<string, { product_id: string; name: string }>()
  for (const v of (variants ?? []) as Array<{ id: string; product_id: string; name: string }>) {
    variantMap.set(v.id, v)
  }

  return raw.map(row => ({
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name ?? '',
    productSku: row.products?.sku ?? '',
    variantId: row.variant_id,
    variantName: row.variant_id ? variantMap.get(row.variant_id)?.name ?? null : null,
    locationId: row.location_id,
    locationName: row.inventory_locations?.name ?? '',
    quantity: Number(row.quantity),
    reservedQty: Number(row.reserved_qty),
    availableQty: Number(row.quantity) - Number(row.reserved_qty),
    reorderPoint: Number(row.products?.reorder_point ?? 0),
    unitCost: Number(row.products?.unit_cost ?? 0),
    unitPrice: Number(row.products?.unit_price ?? 0),
  }))
}

export const listInventoryMovements = async (
  businessId: string,
  productId?: string
): Promise<InventarioMovimiento[]> => {
  let query = supabase
    .from('inventory_movements')
    .select('*, inventory_locations!inner(name), products!inner(name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (productId) {
    query = (query as any).eq('product_id', productId)
  }

  const { data, error } = await query

  if (error) throw error

  const raw = (data ?? []) as Array<
    InventoryMovement & {
      inventory_locations?: { name: string } | null
      products?: { name: string } | null
    }
  >

  const productIds = [...new Set(raw.map(r => r.product_id))]
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, name')
    .in('product_id', productIds.length ? productIds : [null])

  const variantMap = new Map<string, string>()
  for (const v of (variants ?? []) as Array<{ id: string; name: string }>) {
    variantMap.set(v.id, v.name)
  }

  return raw.map(row => ({
    id: row.id,
    locationId: row.location_id,
    locationName: row.inventory_locations?.name ?? '',
    productId: row.product_id,
    productName: row.products?.name ?? '',
    variantId: row.variant_id,
    variantName: row.variant_id ? variantMap.get(row.variant_id) ?? null : null,
    movementType: row.movement_type,
    quantity: Number(row.quantity),
    unitCost: Number(row.unit_cost),
    referenceType: row.reference_type,
    referenceId: row.reference_id,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }))
}

export const adjustInventory = async (
  businessId: string,
  productId: string,
  locationId: string,
  quantity: number,
  notes: string,
  variantId?: string | null
): Promise<void> => {
  const writable = supabase as any

  let stockQuery = supabase
    .from('inventory_stock')
    .select('id, quantity')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('location_id', locationId)

  if (variantId) {
    stockQuery = stockQuery.eq('variant_id', variantId)
  } else {
    stockQuery = stockQuery.is('variant_id', null)
  }

  const { data: existing } = await stockQuery.maybeSingle()

  if (existing) {
    const { error } = await writable
      .from('inventory_stock')
      .update({ quantity: Number(existing.quantity) + quantity })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    const { error } = await writable
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

  const movementType = quantity > 0 ? 'purchase' : 'adjustment'

  const supabaseUser = (supabase as any).auth?.currentUser
  const { error: movError } = await writable
    .from('inventory_movements')
    .insert({
      business_id: businessId,
      location_id: locationId,
      product_id: productId,
      variant_id: variantId ?? null,
      movement_type: movementType,
      quantity,
      notes,
      created_by: supabaseUser?.id ?? null,
    })

  if (movError) throw movError
}

export const sellProduct = async (
  businessId: string,
  productId: string,
  locationId: string,
  quantity: number,
  notes: string,
  variantId?: string | null,
  unitPrice?: number,
): Promise<void> => {
  if (quantity <= 0) throw new Error('La cantidad debe ser mayor a 0')

  const writable = supabase as any

  let stockQuery = supabase
    .from('inventory_stock')
    .select('id, quantity')
    .eq('business_id', businessId)
    .eq('product_id', productId)
    .eq('location_id', locationId)

  if (variantId) {
    stockQuery = stockQuery.eq('variant_id', variantId)
  } else {
    stockQuery = stockQuery.is('variant_id', null)
  }

  const { data: existing } = await stockQuery.maybeSingle()

  if (!existing) throw new Error('No hay stock de este producto')

  const newQty = Number(existing.quantity) - quantity
  if (newQty < 0) throw new Error('Stock insuficiente')

  const { error } = await writable
    .from('inventory_stock')
    .update({ quantity: newQty })
    .eq('id', existing.id)

  if (error) throw error

  const supabaseUser = (supabase as any).auth?.currentUser
  const { error: movError } = await writable
    .from('inventory_movements')
    .insert({
      business_id: businessId,
      location_id: locationId,
      product_id: productId,
      variant_id: variantId ?? null,
      movement_type: 'sale',
      quantity: -quantity,
      unit_cost: unitPrice ?? 0,
      notes: notes || 'Venta directa',
      created_by: supabaseUser?.id ?? null,
    })

  if (movError) throw movError
}
