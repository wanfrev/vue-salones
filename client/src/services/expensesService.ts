import { supabase } from '../lib/supabase'
import { mutate } from '../lib/typedSupabase'
import { handleDbError } from '../lib/errors'
import { expenseFormSchema } from '../lib/validation'
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
  currency: 'USD' | 'VES'
  originalAmount: number
  notes: string
}

export type ExpenseFormData = {
  name: string
  category: string
  amount: number
  currency: 'USD' | 'VES'
  date: string
  notes: string
}

export const listExpenses = async (businessId: string, startDate: string, endDate: string): Promise<ExpenseRow[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, name, category, amount, expense_date, notes')
    .eq('business_id', businessId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false })

  if (error) throw error
  const raw = (data ?? []) as Expense[]
  return raw.map(row => {
    let currency: 'USD' | 'VES' = 'USD'
    let originalAmount = row.amount
    let cleanNotes = (row.notes ?? '')

    const match = cleanNotes.match(/^\[(VES):(\d+(?:\.\d+)?)\]\s?(.*)/s)
    if (match) {
      currency = 'VES'
      originalAmount = Number(match[2])
      cleanNotes = match[3] || ''
    }

    return {
      id: row.id,
      date: row.expense_date,
      name: row.name,
      category: row.category,
      amount: row.amount,
      currency,
      originalAmount,
      notes: cleanNotes,
    }
  })
}

export const saveExpense = async (
  businessId: string,
  data: ExpenseFormData & { id?: string },
  exchangeRate?: number,
): Promise<void> => {
  const parsed = expenseFormSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map(e => e.message).join('. '))
  }

  const isVES = parsed.data.currency === 'VES'
  const rate = isVES && exchangeRate && exchangeRate > 0 ? exchangeRate : 1
  const usdAmount = isVES ? parsed.data.amount / rate : parsed.data.amount

  let notesContent = parsed.data.notes || ''
  if (isVES) {
    notesContent = `[VES:${parsed.data.amount}]` + (notesContent ? ' ' + notesContent : '')
  }

  if (data.id) {
    const { error } = await mutate
      .from('expenses')
      .update({
        name: parsed.data.name,
        category: parsed.data.category,
        amount: Math.round(usdAmount * 100) / 100,
        expense_date: parsed.data.date,
        notes: notesContent || null,
      })
      .eq('id', data.id)
    if (error) handleDbError(error, 'Error al actualizar el gasto')
  } else {
    const { error } = await mutate.from('expenses').insert({
      business_id: businessId,
      name: parsed.data.name,
      category: parsed.data.category,
      amount: Math.round(usdAmount * 100) / 100,
      expense_date: parsed.data.date,
      notes: notesContent || null,
    })
    if (error) handleDbError(error, 'Error al guardar el gasto')
  }
}
