import { supabase } from '../lib/supabase'
import { getDefaultLocation, validateSaleQuantity, movementTypeForAdjust, getStockRecord, updateStockQuantity, insertStockRecord, recordMovement } from '../business/stockRules'
import type { InventoryStock, InventoryMovement } from '../types/database'
import type { InventarioItem, InventarioMovimiento } from '../types/inventario'

export const inventarioKeys = {
  all: (businessId?: string | null) => ['inventario', businessId] as const,
  movements: (businessId?: string | null) => ['inventario-movements', businessId] as const,
}

export const listInventario = async (businessId: string): Promise<InventarioItem[]> => {
  const { data: stock, error } = await supabase
    .from('inventory_stock')
    .select('*, products(name, sku, unit_cost, unit_price, reorder_point)')
    .eq('business_id', businessId)

  if (error) throw error

  const raw = (stock ?? []) as Array<
    InventoryStock & {
      products?: { name: string; sku: string | null; unit_cost: number; unit_price: number; reorder_point: number } | null
    }
  >

  if (raw.length === 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, sku, unit_cost, unit_price, reorder_point')
      .eq('business_id', businessId)
      .eq('active', true)

    type ProductRow = { id: string; name: string; sku: string | null; unit_cost: number; unit_price: number; reorder_point: number }
    return ((products ?? []) as ProductRow[]).map(p => ({
      id: p.id,
      productId: p.id,
      productName: p.name,
      productSku: p.sku ?? '',
      variantId: null,
      variantName: null,
      quantity: 0,
      reservedQty: 0,
      availableQty: 0,
      reorderPoint: Number(p.reorder_point ?? 0),
      unitCost: Number(p.unit_cost ?? 0),
      unitPrice: Number(p.unit_price ?? 0),
    }))
  }

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

  const grouped = new Map<string, {
    stockIds: string[]
    productId: string
    productName: string
    productSku: string
    totalQty: number
    totalReserved: number
    reorderPoint: number
    unitCost: number
    unitPrice: number
    variants: Set<string>
  }>()

  for (const row of raw) {
    const pid = row.product_id
    if (!grouped.has(pid)) {
      grouped.set(pid, {
        stockIds: [],
        productId: pid,
        productName: row.products?.name ?? '',
        productSku: row.products?.sku ?? '',
        totalQty: 0,
        totalReserved: 0,
        reorderPoint: Number(row.products?.reorder_point ?? 0),
        unitCost: Number(row.products?.unit_cost ?? 0),
        unitPrice: Number(row.products?.unit_price ?? 0),
        variants: new Set(),
      })
    }
    const g = grouped.get(pid)!
    g.stockIds.push(row.id)
    g.totalQty += Number(row.quantity)
    g.totalReserved += Number(row.reserved_qty)
    if (row.variant_id) g.variants.add(row.variant_id)
  }

  return [...grouped.values()].map(g => {
    const firstVariantId = g.variants.values().next().value ?? null
    return {
      id: g.stockIds[0],
      productId: g.productId,
      productName: g.productName,
      productSku: g.productSku,
      variantId: firstVariantId,
      variantName: firstVariantId ? variantMap.get(firstVariantId)?.name ?? null : null,
      quantity: g.totalQty,
      reservedQty: g.totalReserved,
      availableQty: g.totalQty - g.totalReserved,
      reorderPoint: g.reorderPoint,
      unitCost: g.unitCost,
      unitPrice: g.unitPrice,
    }
  })
}

export const listInventoryMovements = async (
  businessId: string,
  productId?: string
): Promise<InventarioMovimiento[]> => {
  let query = supabase
    .from('inventory_movements')
    .select('*, products!inner(name)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (productId) {
    query = query.eq('product_id', productId)
  }

  const { data, error } = await query

  if (error) throw error

  const raw = (data ?? []) as Array<
    InventoryMovement & {
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
  quantity: number,
  notes: string,
  variantId?: string | null
): Promise<void> => {
  const locationId = await getDefaultLocation(businessId)
  const existing = await getStockRecord(businessId, productId, locationId, variantId)

  if (existing?.data) {
    await updateStockQuantity(existing.data.id, Number(existing.data.quantity) + quantity)
  } else {
    await insertStockRecord(businessId, productId, locationId, quantity, variantId)
  }

  await recordMovement(businessId, {
    locationId,
    productId,
    variantId,
    movementType: movementTypeForAdjust(quantity),
    quantity,
    notes,
  })
}

export const sellProduct = async (
  businessId: string,
  productId: string,
  quantity: number,
  notes: string,
  variantId?: string | null,
  unitPrice?: number,
): Promise<void> => {
  const locationId = await getDefaultLocation(businessId)
  const existing = await getStockRecord(businessId, productId, locationId, variantId)

  if (!existing?.data) throw new Error('No hay stock de este producto')

  const currentQty = Number(existing.data.quantity)
  validateSaleQuantity(quantity, currentQty)

  const newQty = currentQty - quantity
  await updateStockQuantity(existing.data.id, newQty)

  await recordMovement(businessId, {
    locationId,
    productId,
    variantId,
    movementType: 'sale',
    quantity: -quantity,
    notes: notes || 'Venta directa',
    unitCost: unitPrice,
  })
}