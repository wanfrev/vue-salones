import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'

export async function ensureDefaultLocation(businessId: string): Promise<{ id: string }> {
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

  return loc
}

export async function createInitialStock(
  businessId: string,
  productId: string,
  locationId: string,
  quantity: number,
): Promise<void> {
  const { error } = await mutate.from('inventory_stock').insert({
    business_id: businessId,
    location_id: locationId,
    product_id: productId,
    quantity: Math.max(0, Number(quantity)),
  })

  if (error) {
    console.error('[createInitialStock]', error)
    throw error
  }
}
