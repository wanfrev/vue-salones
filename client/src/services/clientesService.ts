import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { clienteFormSchema } from '../lib/validation'
import { computeClientStats } from '../business/clientStats'
import { mapClienteFormToClientInsert, mapClientToCliente } from '../mappers/clientesMapper'
import type { Client, Appointment, Service } from '../types/database'
import type { Cliente, ClienteFormData } from '../types/cliente'

export const clientesKeys = {
  all: (businessId?: string | null) => ['clientes', businessId] as const,
}

export const listClientes = async (businessId: string): Promise<Cliente[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const clients = data as Client[]

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('client_id, start_time, service_id')
    .eq('business_id', businessId)

  if (apptError) throw apptError

  const { data: services, error: svcError } = await supabase
    .from('services')
    .select('id, price')
    .eq('business_id', businessId)

  if (svcError) throw svcError

  const statsByClient = computeClientStats(
    (services ?? []) as Service[],
    (appointments ?? []) as Appointment[],
  )

  return clients.map(client => mapClientToCliente(client, statsByClient.get(client.id)))
}

export const saveCliente = async (
  businessId: string,
  data: ClienteFormData & { id?: string }
): Promise<Cliente> => {
  const parsed = clienteFormSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join('. '))
  }

  const payload = mapClienteFormToClientInsert(businessId, parsed.data)

  const query = data.id
    ? mutate.from('clients').update(payload).eq('id', data.id).select('*').single()
    : mutate.from('clients').insert(payload).select('*').single()

  const { data: saved, error } = await query
  if (error) throw error

  return mapClientToCliente(saved as Client)
}

export const getClienteById = async (id: string): Promise<Cliente> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  return mapClientToCliente(data as Client)
}

export const deleteCliente = async (clientId: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) throw error
}

export const searchClients = async (
  businessId: string,
  query: string
): Promise<Pick<Client, 'id' | 'full_name' | 'phone'>[]> => {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('clients')
    .select('id, full_name, phone')
    .eq('business_id', businessId)
    .ilike('full_name', `%${query}%`)
    .order('full_name')
    .limit(10)

  if (error) throw error
  return (data ?? []) as Pick<Client, 'id' | 'full_name' | 'phone'>[]
}

export const findOrCreateClientByPhone = async (
  businessId: string,
  input: { fullName: string; phone: string; email?: string | null; notes?: string | null }
): Promise<Client> => {
  const { data, error } = await mutate
    .from('clients')
    .upsert(
      {
        business_id: businessId,
        full_name: input.fullName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        notes: input.notes?.trim() || null,
      },
      { onConflict: 'business_id,phone' }
    )
    .select('*')
    .single()

  if (error) throw error
  return data as Client
}
