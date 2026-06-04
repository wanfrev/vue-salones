import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { ensureDefaultLocation, createInitialStock } from '../business/productWorkflow'
import { mapProductToProducto, mapProductoFormToProductInsert } from '../mappers/productosMapper'
import type { Product, ProductCategory } from '../types/database'
import type { Producto, ProductoFormData } from '../types/producto'

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
    ? mutate.from('products').insert(payload).select('*').single()
    : mutate.from('products').update(payload).eq('id', data.id).select('*').single()

  const { data: saved, error } = await query
  if (error) throw error

  if (isNew) {
    const loc = await ensureDefaultLocation(businessId)
    await createInitialStock(businessId, saved.id, loc.id, Number(initialStock ?? 0))
  }

  return mapProductToProducto(saved as Product)
}

export const createProductCategory = async (businessId: string, name: string): Promise<ProductCategory> => {
  const { data, error } = await mutate
    .from('product_categories')
    .insert({ business_id: businessId, name: name.trim() })
    .select('*')
    .single()

  if (error) throw error
  return data as ProductCategory
}

export const deleteProducto = async (id: string): Promise<void> => {
  const { error } = await mutate
    .from('products')
    .update({ active: false })
    .eq('id', id)

  if (error) throw error
}

export const deleteProductoPermanently = async (id: string): Promise<void> => {
  const { error } = await mutate
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}
