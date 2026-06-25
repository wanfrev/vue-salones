import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { mapServiceToServicio, mapServicioFormToServiceInsert } from '../mappers/serviciosMapper'
import type { Service } from '../types/database'
import type { UpdateFor } from '../types/helpers'
import type { Servicio, ServicioFormData } from '../types/servicio'

export const serviciosKeys = {
  all: (businessId?: string | null, branchId?: string | null) => ['servicios', businessId, branchId] as const,
}

export const listServicios = async (businessId: string, branchId?: string | null): Promise<Servicio[]> => {
  let query = supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data, error } = await query

  if (error) throw error

  return (data as Service[]).map(service => mapServiceToServicio(service))
}

export const listActiveDbServices = async (businessId: string, branchId?: string | null): Promise<Service[]> => {
  let query = supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('name')

  if (branchId) {
    query = query.eq('branch_id', branchId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Service[]
}

export const saveServicio = async (
  businessId: string,
  data: ServicioFormData & { id?: string },
  branchId?: string | null
): Promise<Servicio> => {
  const payload = { ...mapServicioFormToServiceInsert(businessId, data), branch_id: branchId ?? null }

  const query = data.id
    ? mutate.from('services').update(payload).eq('id', data.id).select('*').single()
    : mutate.from('services').insert(payload).select('*').single()

  const { data: saved, error } = await query
  if (error) throw error

  return mapServiceToServicio(saved as Service)
}

export const deleteServicio = async (id: string): Promise<void> => {
  const { error } = await mutate
    .from('services')
    .update({ active: false })
    .eq('id', id)

  if (error) throw error
}

async function getBusinessServiceCategories(businessId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('businesses')
    .select('service_categories')
    .eq('id', businessId)
    .single()

  if (error) throw error
  return (data?.service_categories ?? []) as string[]
}

async function updateBusinessServiceCategories(businessId: string, categories: string[]): Promise<string[]> {
  const { error } = await mutate
    .from('businesses')
    .update({ service_categories: categories } satisfies Partial<UpdateFor<'businesses'>>)
    .eq('id', businessId)

  if (error) throw error
  return categories
}

export const renameBusinessCategory = async (
  businessId: string,
  fromCategory: string,
  toCategory: string
): Promise<string[]> => {
  const nextName = toCategory.trim()
  if (!fromCategory.trim() || !nextName || fromCategory === nextName) {
    return getBusinessServiceCategories(businessId)
  }

  const { error: updateServicesError } = await mutate
    .from('services')
    .update({ category: nextName })
    .eq('business_id', businessId)
    .eq('category', fromCategory)

  if (updateServicesError) throw updateServicesError

  const currentCategories = await getBusinessServiceCategories(businessId)
  const withoutOld = currentCategories.filter((cat) => cat !== fromCategory)
  const withNew = withoutOld.includes(nextName) ? withoutOld : [...withoutOld, nextName]

  return updateBusinessServiceCategories(businessId, withNew)
}

export const deleteBusinessCategory = async (
  businessId: string,
  categoryToDelete: string,
  replacementCategory: string
): Promise<string[]> => {
  const category = categoryToDelete.trim()
  const replacement = replacementCategory.trim()

  if (!category || !replacement || category === replacement) {
    return getBusinessServiceCategories(businessId)
  }

  const { error: updateServicesError } = await mutate
    .from('services')
    .update({ category: replacement })
    .eq('business_id', businessId)
    .eq('category', category)

  if (updateServicesError) throw updateServicesError

  const currentCategories = await getBusinessServiceCategories(businessId)
  const withoutDeleted = currentCategories.filter((cat) => cat !== category)
  const withReplacement = withoutDeleted.includes(replacement)
    ? withoutDeleted
    : [...withoutDeleted, replacement]

  return updateBusinessServiceCategories(businessId, withReplacement)
}
