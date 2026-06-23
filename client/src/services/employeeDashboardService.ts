import { formatDate, formatTime } from '../lib/formatters'
import { supabase } from '../lib/supabase'
import { computeServiceEarnings } from '../business/employeeEarnings'
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
  paidAt: string
  clientName: string
  serviceName: string
  totalAmount: number
  exchangeRateUsed: number
  method: string
  currency: 'USD' | 'VES'
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
    .or(`employee_id.eq.${employeeId},assistant_employee_id.eq.${employeeId}`)
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
    date: formatDate(row.start_time),
    time: formatTime(row.start_time),
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
      exchange_rate_used,
      employee_percentage,
      assistant_amount,
      assistant_percentage,
      method,
      payments_breakdown,
      appointments!inner (
        employee_id,
        assistant_employee_id,
        clients ( full_name ),
        services ( name ),
        employee_profile:profiles!appointments_employee_id_fkey ( pay_type, pay_percentage ),
        assistant_profile:profiles!appointments_assistant_employee_id_fkey ( pay_type, pay_percentage )
      )
    `)
    .or(`appointments.employee_id.eq.${employeeId},appointments.assistant_employee_id.eq.${employeeId}`)
    .eq('business_id', businessId)
    .order('paid_at', { ascending: false })

  if (error) throw error

  const raw = (data ?? []) as Array<
    Transaction & {
      assistant_amount?: number | null
      assistant_percentage?: number | null
      method?: string
      payments_breakdown?: any
      appointments?: {
        employee_id?: string
        assistant_employee_id?: string | null
        clients?: { full_name: string | null } | null
        services?: { name: string | null } | null
        employee_profile?: {
          pay_type?: 'salary' | 'percentage' | 'mixed' | null
          pay_percentage?: number | null
        } | null
        assistant_profile?: {
          pay_type?: 'salary' | 'percentage' | 'mixed' | null
          pay_percentage?: number | null
        } | null
      } | null
    }
  >

  return raw.map(row => {
    const totalAmount = Number(row.total_amount)
    const exchangeRateUsed = Number(row.exchange_rate_used ?? 1)
    const method = row.method ?? 'cash'

    const isMixed = method === 'mixed'
    const isVESMethod = ['cash_ves', 'transfer', 'pago_movil'].includes(method)

    let currency: 'USD' | 'VES' = 'USD'
    if (isVESMethod) {
      currency = 'VES'
    } else if (isMixed && row.payments_breakdown) {
      const breakdown = Array.isArray(row.payments_breakdown) ? row.payments_breakdown : []
      const hasVES = breakdown.some((b: any) => b.currency === 'VES')
      if (hasVES) currency = 'VES'
    }
    const isAssistant = row.appointments?.assistant_employee_id != null &&
      row.appointments.assistant_employee_id !== row.appointments.employee_id

    const calc = isAssistant
      ? {
          percentage: Number(row.assistant_percentage ?? 0),
          earnings: Number(row.assistant_amount ?? 0),
        }
      : computeServiceEarnings(
          totalAmount,
          { pay_type: row.appointments?.employee_profile?.pay_type, pay_percentage: row.appointments?.employee_profile?.pay_percentage },
          row.employee_percentage,
        )

    return {
      id: row.id,
      date: formatDate(row.paid_at),
      paidAt: row.paid_at,
      clientName: row.appointments?.clients?.full_name ?? '—',
      serviceName: row.appointments?.services?.name ?? '—',
      totalAmount,
      exchangeRateUsed,
      method,
      currency,
      employeePercentage: calc.percentage,
      employeeEarnings: calc.earnings,
    }
  })
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
