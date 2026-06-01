import type { AppointmentWithRelations, Service } from '../types/database'
import type { Cita, CitaFormData, CitaFormServiceItem } from '../types/cita'

const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10)
const toTimeInput = (iso: string) => new Date(iso).toISOString().slice(11, 16)

const mapStatus = (appointment: { status: string; payment_status: string }) => {
  if (appointment.payment_status === 'paid') return 'paid' as const
  if (appointment.status === 'no_show') return 'cancelled' as const
  if (appointment.status === 'completed') return 'confirmed' as const
  return appointment.status as 'pending' | 'confirmed'
}

const statusLabelMap: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  paid: 'Pagada',
}

const statusColorMap: Record<string, string> = {
  confirmed: 'var(--color-primary)',
  pending: 'var(--color-warning)',
  cancelled: 'var(--color-danger)',
  paid: 'var(--color-success)',
}

export const mapAppointmentToCita = (appointment: AppointmentWithRelations): Cita => {
  const service = appointment.services
  const employee = appointment.profiles
  const client = appointment.clients
  const normalizedStatus = mapStatus(appointment)

  return {
    id: appointment.id,
    clientId: appointment.client_id,
    clientName: client?.full_name ?? 'Cliente',
    serviceId: appointment.service_id,
    service: service?.name ?? 'Servicio',
    employeeId: appointment.employee_id,
    employee: employee?.full_name ?? 'Empleado',
    groupId: appointment.group_id ?? undefined,
    date: toDateInput(appointment.start_time),
    time: toTimeInput(appointment.start_time),
    duration: service?.duration_minutes ?? Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 60000),
    price: Number(service?.price ?? 0),
    status: normalizedStatus,
    paymentStatus: appointment.payment_status,
    statusLabel: statusLabelMap[normalizedStatus] ?? 'Confirmada',
    statusColor: statusColorMap[normalizedStatus] ?? 'var(--color-primary)',
    notes: appointment.internal_notes ?? '',
  }
}

export const mapCitaFormToAppointmentInsert = (
  businessId: string,
  data: CitaFormData,
  service: Service,
  clientId: string,
  createdBy?: string | null
) => {
  const startTime = new Date(`${data.date}T${data.time}:00`)
  const endTime = new Date(startTime.getTime() + service.duration_minutes * 60 * 1000)

  const isPaidStatus = data.status === 'paid'
  const appointmentStatus = isPaidStatus ? 'completed' : data.status

  return {
    business_id: businessId,
    client_id: clientId,
    employee_id: data.employee,
    service_id: data.service,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: appointmentStatus,
    payment_status: isPaidStatus ? 'paid' as const : 'unpaid' as const,
    internal_notes: data.notes.trim() || null,
    source: 'internal' as const,
    created_by: createdBy ?? null,
  }
}

export const mapServiceItemToAppointmentInsert = (
  businessId: string,
  item: CitaFormServiceItem,
  clientId: string,
  date: string,
  time: string,
  status: CitaFormData['status'],
  notes: string,
  groupId: string,
  createdBy?: string | null,
  service?: Service
) => {
  const startTime = new Date(`${date}T${time}:00`)
  const duration = service?.duration_minutes ?? item.duration
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

  const isPaidStatus = status === 'paid'
  const appointmentStatus = isPaidStatus ? 'completed' : status

  return {
    business_id: businessId,
    client_id: clientId,
    employee_id: item.employeeId,
    service_id: item.serviceId,
    group_id: groupId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: appointmentStatus,
    payment_status: isPaidStatus ? 'paid' as const : 'unpaid' as const,
    internal_notes: notes.trim() || null,
    source: 'internal' as const,
    created_by: createdBy ?? null,
  }
}
