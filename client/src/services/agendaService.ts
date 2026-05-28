import { supabase } from '../lib/supabase'
import { mapAppointmentToCita, mapCitaFormToAppointmentInsert } from '../mappers/agendaMapper'
import { findOrCreateClientByPhone } from './clientesService'
import type { AppointmentWithRelations, Service } from '../types/database'
import type { Cita, CitaFormData } from '../types/cita'

const writableSupabase = supabase as any

export const agendaKeys = {
  appointments: (businessId?: string | null) => ['appointments', businessId] as const,
}

export const listCitas = async (
  businessId: string,
  dateRange?: { start: Date; end: Date },
  employeeId?: string | 'all'
): Promise<Cita[]> => {
  let query = supabase
    .from('appointments')
    .select('*, clients(id, full_name, phone, email), services(id, name, duration_minutes, price, color), profiles!appointments_employee_id_fkey(id, full_name, avatar_url)')
    .eq('business_id', businessId)
    .order('start_time')

  if (dateRange) {
    query = query
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString())
  }

  if (employeeId && employeeId !== 'all') {
    query = query.eq('employee_id', employeeId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data as AppointmentWithRelations[]).map(mapAppointmentToCita)
}

export const saveCita = async (
  businessId: string,
  data: CitaFormData & { id?: string; clientPhone?: string },
  createdBy?: string | null
): Promise<Cita> => {
  const serviceId = data.service
  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (serviceError) throw serviceError

  const client = await findOrCreateClientByPhone(businessId, {
    fullName: data.clientName,
    phone: data.clientPhone || data.clientName,
    notes: data.notes,
  })

  const payload = mapCitaFormToAppointmentInsert(
    businessId,
    data,
    service as Service,
    client.id,
    createdBy
  )

  const query = data.id
    ? writableSupabase.from('appointments').update(payload).eq('id', data.id).select('*, clients(id, full_name, phone, email), services(id, name, duration_minutes, price, color), profiles!appointments_employee_id_fkey(id, full_name, avatar_url)').single()
    : writableSupabase.from('appointments').insert(payload).select('*, clients(id, full_name, phone, email), services(id, name, duration_minutes, price, color), profiles!appointments_employee_id_fkey(id, full_name, avatar_url)').single()

  const { data: saved, error } = await query
  if (error) throw error

  return mapAppointmentToCita(saved as AppointmentWithRelations)
}

export const updateCitaStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> => {
  const { error } = await writableSupabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) throw error
}

export const updateAppointmentTime = async (
  id: string,
  startTime: string,
  endTime: string
): Promise<void> => {
  const { error } = await writableSupabase
    .from('appointments')
    .update({ start_time: startTime, end_time: endTime })
    .eq('id', id)

  if (error) throw error
}

export const exportCitasToCsv = (citas: Cita[]) => {
  return [
    ['Cliente', 'Servicio', 'Empleado', 'Fecha', 'Hora', 'Duración', 'Precio', 'Estado'].join(','),
    ...citas.map(cita => [
      cita.clientName,
      cita.service,
      cita.employee,
      cita.date,
      cita.time,
      cita.duration,
      cita.price,
      cita.status,
    ].join(',')),
  ].join('\n')
}
