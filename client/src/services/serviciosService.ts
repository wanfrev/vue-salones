import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { mapServiceToServicio, mapServicioFormToServiceInsert } from '../mappers/serviciosMapper'
import type { Service } from '../types/database'
import type { Servicio, ServicioFormData } from '../types/servicio'

export const serviciosKeys = {
  all: (businessId?: string | null) => ['servicios', businessId] as const,
}

export const listServicios = async (businessId: string): Promise<Servicio[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('name')

  if (error) throw error

  return (data as Service[]).map(service => mapServiceToServicio(service))
}

export const listActiveDbServices = async (businessId: string): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('active', true)
    .order('name')

  if (error) throw error
  return data as Service[]
}

export const saveServicio = async (
  businessId: string,
  data: ServicioFormData & { id?: string }
): Promise<Servicio> => {
  const payload = mapServicioFormToServiceInsert(businessId, data)

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
