import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { handleDbError } from '../lib/errors'
import type { EmployeePayment } from '../types/database'

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
