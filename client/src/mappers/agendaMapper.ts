import type { AppointmentWithRelations, Service } from '../types/database'
import type { Cita, CitaFormData } from '../types/cita'

const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10)
const toTimeInput = (iso: string) => new Date(iso).toISOString().slice(11, 16)

export const mapAppointmentToCita = (appointment: AppointmentWithRelations): Cita => {
  const service = appointment.services
  const employee = appointment.profiles
  const client = appointment.clients
  const normalizedStatus = appointment.status === 'no_show' ? 'cancelled' : appointment.status
  const statusLabel = normalizedStatus === 'confirmed'
    ? 'Confirmada'
    : normalizedStatus === 'pending'
      ? 'Pendiente'
      : normalizedStatus === 'cancelled'
        ? 'Cancelada'
        : 'Completada'

  const statusColor = normalizedStatus === 'confirmed'
    ? 'var(--color-primary)'
    : normalizedStatus === 'pending'
      ? 'var(--color-warning)'
      : normalizedStatus === 'cancelled'
        ? 'var(--color-danger)'
        : 'var(--color-text-secondary)'

  return {
    id: appointment.id,
    clientId: appointment.client_id,
    clientName: client?.full_name ?? 'Cliente',
    serviceId: appointment.service_id,
    service: service?.name ?? 'Servicio',
    employeeId: appointment.employee_id,
    employee: employee?.full_name ?? 'Empleado',
    date: toDateInput(appointment.start_time),
    time: toTimeInput(appointment.start_time),
    duration: service?.duration_minutes ?? Math.round((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 60000),
    price: Number(service?.price ?? 0),
    status: normalizedStatus,
    statusLabel,
    statusColor,
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

  return {
    business_id: businessId,
    client_id: clientId,
    employee_id: data.employee,
    service_id: data.service,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: data.status,
    payment_status: 'unpaid' as const,
    internal_notes: data.notes.trim() || null,
    source: 'internal' as const,
    created_by: createdBy ?? null,
  }
}
