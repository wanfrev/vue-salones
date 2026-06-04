import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { handleDbError } from '../lib/errors'
import type { EmployeePayment, Profile } from '../types/database'

export const employeePaymentKeys = {
  all: (businessId?: string | null) => ['employee-payments', businessId] as const,
}

export interface EmployeePaymentRecord {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  paymentMethod: string
  notes: string | null
  paymentDate: string
}

export const listEmployeePayments = async (businessId: string): Promise<EmployeePaymentRecord[]> => {
  const { data, error } = await supabase
    .from('employee_payments')
    .select('*, profiles!inner(full_name)')
    .eq('business_id', businessId)
    .order('payment_date', { ascending: false })

  if (error) handleDbError(error, 'Error al cargar pagos de empleados')

  const raw = (data ?? []) as Array<
    EmployeePayment & {
      profiles?: { full_name: string } | null
    }
  >

  return raw.map(row => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.profiles?.full_name ?? '—',
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    notes: row.notes,
    paymentDate: row.payment_date,
  }))
}

export const createEmployeePayment = async (
  businessId: string,
  employeeId: string,
  amount: number,
  paymentMethod: string,
  notes: string,
  paymentDate: string,
): Promise<void> => {
  let userId: string | null = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    userId = session?.user?.id ?? null
  } catch {
    // Session not available, proceed without created_by
  }

  const { error } = await mutate
    .from('employee_payments')
    .insert({
      business_id: businessId,
      employee_id: employeeId,
      amount,
      payment_method: paymentMethod,
      notes: notes || null,
      payment_date: paymentDate,
      created_by: userId,
    })

  if (error) {
    handleDbError(error, 'Error al registrar el pago del empleado')
    throw error
  }
}

export interface EmployeeBalance {
  employeeId: string
  employeeName: string
  payType: 'salary' | 'percentage' | 'mixed' | null
  payPercentage: number
  baseSalary: number
  totalEarned: number
  totalPaid: number
  pendingBalance: number
}

export const getEmployeeBalance = async (
  businessId: string,
  employeeId: string
): Promise<EmployeeBalance> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, pay_type, pay_percentage, base_salary')
    .eq('id', employeeId)
    .single()

  if (!profile) throw new Error('Empleado no encontrado')

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('business_id', businessId)
    .eq('employee_id', employeeId)

  const appointmentIds = (appointments ?? []).map((a: any) => a.id)

  let totalEarned = 0
  if (appointmentIds.length > 0) {
    const { data: txData } = await supabase
      .from('transactions')
      .select('employee_amount')
      .eq('business_id', businessId)
      .in('appointment_id', appointmentIds)

    const rawTx = (txData ?? []) as Array<{ employee_amount: number }>
    totalEarned = rawTx.reduce((sum, t) => sum + Number(t.employee_amount), 0)
  }

  const { data: paymentsData } = await supabase
    .from('employee_payments')
    .select('amount')
    .eq('business_id', businessId)
    .eq('employee_id', employeeId)

  const rawP = (paymentsData ?? []) as Array<{ amount: number }>
  const totalPaid = rawP.reduce((sum, p) => sum + Number(p.amount), 0)

  const p = profile as any
  return {
    employeeId: p.id,
    employeeName: p.full_name,
    payType: p.pay_type ?? null,
    payPercentage: Number(p.pay_percentage ?? 0),
    baseSalary: Number(p.base_salary ?? 0),
    totalEarned,
    totalPaid,
    pendingBalance: Math.max(0, totalEarned - totalPaid),
  }
}
