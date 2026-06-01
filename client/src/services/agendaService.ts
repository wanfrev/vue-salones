import { supabase } from '../lib/supabase'
import { mapAppointmentToCita, mapCitaFormToAppointmentInsert, mapServiceItemToAppointmentInsert } from '../mappers/agendaMapper'
import { findOrCreateClientByPhone } from './clientesService'
import type { AppointmentWithRelations, Service } from '../types/database'
import type { Cita, CitaFormData } from '../types/cita'

const writableSupabase = supabase as any
const EMPLOYEE_OVERLAP_CONSTRAINT = 'appointments_no_employee_overlap'

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

type SupabaseErrorLike = {
  code?: string
  message?: string
  details?: string
  hint?: string
}

const isEmployeeOverlapError = (error: unknown): error is SupabaseErrorLike => {
  if (!error || typeof error !== 'object') return false
  const candidate = error as SupabaseErrorLike
  const message = candidate.message ?? ''
  const details = candidate.details ?? ''
  return candidate.code === '23P01' ||
    message.includes(EMPLOYEE_OVERLAP_CONSTRAINT) ||
    details.includes(EMPLOYEE_OVERLAP_CONSTRAINT)
}

const mapAgendaWriteError = (error: unknown, action: 'guardar' | 'reagendar') => {
  if (isEmployeeOverlapError(error)) {
    return new Error(`No se puede ${action} la cita: el empleado ya tiene otra cita en ese horario.`)
  }

  if (error instanceof Error) return error
  return new Error(`Error al ${action} la cita`)
}

export const agendaKeys = {
  appointments: (businessId?: string | null) => ['appointments', businessId] as const,
}

const APPOINTMENT_SELECT = '*, clients(id, full_name, phone, email), services(id, name, duration_minutes, price, color), profiles!appointments_employee_id_fkey(id, full_name, avatar_url)'

export const listCitas = async (
  businessId: string,
  dateRange?: { start: Date; end: Date },
  employeeId?: string | 'all'
): Promise<Cita[]> => {
  let query = supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
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

  let clientId: string
  if (data.clientId) {
    clientId = data.clientId
  } else {
    const client = await findOrCreateClientByPhone(businessId, {
      fullName: data.clientName,
      phone: data.clientPhone || data.clientName,
      notes: data.notes,
    })
    clientId = client.id
  }

  // Single service (no extras) — backward compatible path
  if (!data.extraServices || data.extraServices.length === 0) {
    const payload = mapCitaFormToAppointmentInsert(
      businessId,
      data,
      service as Service,
      clientId,
      createdBy
    )

    const query = data.id
      ? writableSupabase.from('appointments').update(payload).eq('id', data.id).select(APPOINTMENT_SELECT).single()
      : writableSupabase.from('appointments').insert(payload).select(APPOINTMENT_SELECT).single()

    const { data: saved, error } = await query
    if (error) throw mapAgendaWriteError(error, 'guardar')

    return mapAppointmentToCita(saved as AppointmentWithRelations)
  }

  // Multi-service (grouped) path
  const groupId = generateId()

  // Fetch all services for extra rows
  const extraServiceIds = data.extraServices.map(e => e.serviceId)
  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select('*')
    .in('id', [serviceId, ...extraServiceIds])

  if (servicesError) throw servicesError
  const servicesMap = new Map((servicesData as Service[]).map(s => [s.id, s]))

  const inserts = []

  // Primary service
  inserts.push(mapServiceItemToAppointmentInsert(
    businessId,
    { serviceId: data.service, employeeId: data.employee, duration: data.duration, price: data.price },
    clientId,
    data.date,
    data.time,
    data.status,
    data.notes,
    groupId,
    createdBy,
    servicesMap.get(data.service) as Service
  ))

  // Extra services
  for (const extra of data.extraServices) {
    inserts.push(mapServiceItemToAppointmentInsert(
      businessId,
      extra,
      clientId,
      data.date,
      data.time,
      data.status,
      data.notes,
      groupId,
      createdBy,
      servicesMap.get(extra.serviceId) as Service
    ))
  }

  const { data: saved, error: insertError } = await writableSupabase
    .from('appointments')
    .insert(inserts)
    .select(APPOINTMENT_SELECT)

  if (insertError) throw mapAgendaWriteError(insertError, 'guardar')

  const results = (saved as AppointmentWithRelations[])

  // Group appointments under the first one for the primary return value
  // Include group info in the extended props
  const primary = results.find(r => r.service_id === serviceId && r.employee_id === data.employee) ?? results[0]
  return mapAppointmentToCita(primary)
}

export const updateCitaStatus = async (
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid'
): Promise<void> => {
  const statusPayload = status === 'paid'
    ? { status: 'completed' as const, payment_status: 'paid' as const }
    : { status, payment_status: 'unpaid' as const }

  const { error } = await writableSupabase
    .from('appointments')
    .update(statusPayload)
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

  if (error) throw mapAgendaWriteError(error, 'reagendar')
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
