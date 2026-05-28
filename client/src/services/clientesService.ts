import { supabase } from '../lib/supabase'
import { mapClienteFormToClientInsert, mapClientToCliente } from '../mappers/clientesMapper'
import type { Client } from '../types/database'
import type { Cliente, ClienteFormData } from '../types/cliente'

const writableSupabase = supabase as any

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

  const priceMap = new Map<string, number>()
  for (const svc of services || []) {
    priceMap.set((svc as any).id, Number((svc as any).price ?? 0))
  }

  const statsByClient = new Map<string, { lastVisit?: string; totalAppointments: number; totalSpent: number }>()

  for (const appt of appointments || []) {
    const clientId = (appt as any).client_id as string
    const startTime = (appt as any).start_time as string
    const serviceId = (appt as any).service_id as string
    const price = priceMap.get(serviceId) ?? 0

    const current = statsByClient.get(clientId) || { totalAppointments: 0, totalSpent: 0 }
    current.totalAppointments += 1
    current.totalSpent += price

    const date = startTime.split('T')[0]
    if (!current.lastVisit || new Date(date) > new Date(current.lastVisit)) {
      current.lastVisit = date
    }
    statsByClient.set(clientId, current)
  }

  return clients.map(client => mapClientToCliente(client, statsByClient.get(client.id)))
}

export const saveCliente = async (
  businessId: string,
  data: ClienteFormData & { id?: string }
): Promise<Cliente> => {
  const payload = mapClienteFormToClientInsert(businessId, data)

  const query = data.id
    ? writableSupabase.from('clients').update(payload).eq('id', data.id).select('*').single()
    : writableSupabase.from('clients').insert(payload).select('*').single()

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

export const findOrCreateClientByPhone = async (
  businessId: string,
  input: { fullName: string; phone: string; email?: string | null; notes?: string | null }
): Promise<Client> => {
  const { data, error } = await writableSupabase
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
