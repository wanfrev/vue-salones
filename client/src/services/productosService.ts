import { supabase } from '../lib/supabase'
import { mapProductToProducto, mapProductoFormToProductInsert } from '../mappers/productosMapper'
import type { Product, ProductCategory } from '../types/database'
import type { Producto, ProductoFormData } from '../types/producto'

const writableSupabase = supabase as any

export const productosKeys = {
  all: (businessId?: string | null) => ['productos', businessId] as const,
  categories: (businessId?: string | null) => ['productos-categories', businessId] as const,
}

export const listProductCategories = async (businessId: string): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) throw error
  return (data ?? []) as ProductCategory[]
}

export const listProductos = async (businessId: string): Promise<Producto[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) throw error

  const { data: categories } = await supabase
    .from('product_categories')
    .select('id, name')
    .eq('business_id', businessId)

  const catMap = new Map<string, string>()
  for (const cat of (categories ?? []) as ProductCategory[]) {
    catMap.set(cat.id, cat.name)
  }

  const { data: stock } = await supabase
    .from('inventory_stock')
    .select('product_id, quantity')
    .eq('business_id', businessId)

  const stockMap = new Map<string, number>()
  for (const s of (stock ?? []) as Array<{ product_id: string; quantity: number }>) {
    stockMap.set(s.product_id, (stockMap.get(s.product_id) ?? 0) + Number(s.quantity))
  }

  return (products as Product[]).map(p =>
    mapProductToProducto(p, catMap.get(p.category_id ?? ''), stockMap.get(p.id) ?? 0)
  )
}

export const saveProducto = async (
  businessId: string,
  data: ProductoFormData & { id?: string }
): Promise<Producto> => {
  const { initialStock, ...formData } = data
  const payload = mapProductoFormToProductInsert(businessId, formData)

  const isNew = !data.id
  const query = isNew
    ? writableSupabase.from('products').insert(payload).select('*').single()
    : writableSupabase.from('products').update(payload).eq('id', data.id).select('*').single()

  const { data: saved, error } = await query
  if (error) throw error

  // Auto-create inventory stock record at default location for new products
  if (isNew) {
    let { data: defaultLoc } = await supabase
      .from('inventory_locations')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_default', true)
      .maybeSingle()

    if (!defaultLoc) {
      const { data: firstLoc } = await supabase
        .from('inventory_locations')
        .select('id')
        .eq('business_id', businessId)
        .limit(1)
        .maybeSingle()
      defaultLoc = firstLoc
    }

    if (!defaultLoc) {
      const { data: newLoc } = await writableSupabase
        .from('inventory_locations')
        .insert({
          business_id: businessId,
          name: 'Principal',
          is_default: true,
        })
        .select('id')
        .single()
      defaultLoc = newLoc
    }

    if (defaultLoc) {
      await writableSupabase.from('inventory_stock').insert({
        business_id: businessId,
        location_id: defaultLoc.id,
        product_id: saved.id,
        quantity: Math.max(0, Number(initialStock ?? 0)),
      })
    }
  }

  return mapProductToProducto(saved as Product)
}

export const createProductCategory = async (businessId: string, name: string): Promise<ProductCategory> => {
  const { data, error } = await writableSupabase
    .from('product_categories')
    .insert({ business_id: businessId, name: name.trim() })
    .select('*')
    .single()

  if (error) throw error
  return data as ProductCategory
}

export const deleteProducto = async (id: string): Promise<void> => {
  const { error } = await writableSupabase
    .from('products')
    .update({ active: false })
    .eq('id', id)

  if (error) throw error
}
