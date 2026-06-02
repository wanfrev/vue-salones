import { supabase } from '../lib/supabase'
import type { Transaction, EmployeePayment } from '../types/database'

export const dashboardKeys = {
  appointments: (businessId?: string | null, employeeId?: string | null) => ['employee-appointments', businessId, employeeId] as const,
  earnings: (businessId?: string | null, employeeId?: string | null) => ['employee-earnings', businessId, employeeId] as const,
  payments: (businessId?: string | null, employeeId?: string | null) => ['employee-payments', businessId, employeeId] as const,
  history: (businessId?: string | null, employeeId?: string | null) => ['employee-history', businessId, employeeId] as const,
}

export interface EmployeeAppointmentRecord {
  id: string
  date: string
  time: string
  clientName: string
  serviceName: string
  servicePrice: number
  status: string
  paymentStatus: string
}

export interface EmployeeEarningRecord {
  id: string
  date: string
  clientName: string
  serviceName: string
  totalAmount: number
  employeePercentage: number
  employeeEarnings: number
}

export const listEmployeeAppointments = async (
  businessId: string,
  employeeId: string
): Promise<EmployeeAppointmentRecord[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      clients ( full_name ),
      services ( name, price )
    `)
    .eq('business_id', businessId)
    .eq('employee_id', employeeId)
    .in('status', ['confirmed', 'completed', 'cancelled', 'no_show'])
    .order('start_time', { ascending: false })
    .limit(100)

  if (error) throw error

  type ApptRow = {
    id: string; start_time: string; end_time: string; status: string; payment_status: string
    clients: { full_name: string } | null; services: { name: string; price: number } | null
  }
  return (data ?? []).map((row: ApptRow) => ({
    id: row.id,
    date: new Date(row.start_time).toLocaleDateString('es-ES'),
    time: new Date(row.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    clientName: row.clients?.full_name ?? '—',
    serviceName: row.services?.name ?? '—',
    servicePrice: Number(row.services?.price ?? 0),
    status: row.status,
    paymentStatus: row.payment_status,
  }))
}

export const listEmployeeTransactions = async (
  businessId: string,
  employeeId: string
): Promise<EmployeeEarningRecord[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      paid_at,
      total_amount,
      employee_percentage,
      appointments!inner (
        employee_id,
        clients ( full_name ),
        services ( name )
      )
    `)
    .eq('appointments.employee_id', employeeId)
    .eq('business_id', businessId)
    .order('paid_at', { ascending: false })

  if (error) throw error

  const raw = (data ?? []) as Array<
    Transaction & {
      appointments?: {
        clients?: { full_name: string | null } | null
        services?: { name: string | null } | null
      } | null
    }
  >

  return raw.map(row => ({
    id: row.id,
    date: new Date(row.paid_at).toLocaleDateString('es-ES'),
    clientName: row.appointments?.clients?.full_name ?? '—',
    serviceName: row.appointments?.services?.name ?? '—',
    totalAmount: Number(row.total_amount),
    employeePercentage: Number(row.employee_percentage ?? 0),
    employeeEarnings: Number(row.total_amount) * (Number(row.employee_percentage ?? 0) / 100),
  }))
}

export const listEmployeePayments = async (
  businessId: string,
  employeeId: string
): Promise<EmployeePayment[]> => {
  const { data, error } = await supabase
    .from('employee_payments')
    .select('*')
    .eq('business_id', businessId)
    .eq('employee_id', employeeId)
    .order('payment_date', { ascending: false })

  if (error) throw error
  return (data ?? []) as EmployeePayment[]
}
