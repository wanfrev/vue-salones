import { supabase } from '../lib/supabase'
import type { Expense } from '../types/database'

export const expensesKeys = {
  all: (businessId?: string | null) => ['expenses', businessId] as const,
  filtered: (businessId?: string | null, start?: string, end?: string) => ['expenses', businessId, start, end] as const,
}

export type ExpenseRow = {
  id: string
  date: string
  name: string
  category: string
  amount: number
}

export type ExpenseFormData = {
  name: string
  category: string
  amount: number
  date: string
  notes: string
}

export const listExpenses = async (businessId: string, startDate: string, endDate: string): Promise<ExpenseRow[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, name, category, amount, expense_date')
    .eq('business_id', businessId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false })

  if (error) throw error
  const raw = (data ?? []) as Expense[]
  return raw.map(row => ({
    id: row.id,
    date: row.expense_date,
    name: row.name,
    category: row.category,
    amount: row.amount,
  }))
}

export const saveExpense = async (
  businessId: string,
  data: ExpenseFormData & { id?: string }
): Promise<void> => {
  if (data.id) {
    const { error } = await supabase
      .from('expenses')
      .update({
        name: data.name,
        category: data.category,
        amount: data.amount,
        expense_date: data.date,
        notes: data.notes || null,
      })
      .eq('id', data.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('expenses').insert({
      business_id: businessId,
      name: data.name,
      category: data.category,
      amount: data.amount,
      expense_date: data.date,
      notes: data.notes || null,
    })
    if (error) throw error
  }
}
