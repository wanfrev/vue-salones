import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from './useNotification'
import { expensesKeys, listExpenses, saveExpense, type ExpenseFormData, type ExpenseRow } from '../services/expensesService'

type PeriodValue = 'month' | 'quarter' | 'year'

function resolvePeriodDates(value: PeriodValue, monthKey?: string) {
  const parseMonthKey = (key?: string) => {
    if (!key) return null
    const match = key.match(/^(\d{4})-(\d{2})$/)
    if (!match) return null
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) return null
    return { year, month }
  }

  const toYmd = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const today = new Date()
  if (value === 'month') {
    const parsed = parseMonthKey(monthKey)
    const monthDate = parsed ? new Date(parsed.year, parsed.month, 1) : today
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    const isCurrentMonth = monthStart.getFullYear() === today.getFullYear() && monthStart.getMonth() === today.getMonth()

    return {
      start: toYmd(monthStart),
      end: toYmd(isCurrentMonth ? today : monthEnd),
    }
  }
  if (value === 'quarter') {
    const quarterStart = Math.floor(today.getMonth() / 3) * 3
    return {
      start: toYmd(new Date(today.getFullYear(), quarterStart, 1)),
      end: toYmd(today),
    }
  }
  return {
    start: toYmd(new Date(today.getFullYear(), 0, 1)),
    end: toYmd(today),
  }
}

export function useExpenses(
  businessId: import('vue').Ref<string | null>,
  selectedPeriod: import('vue').Ref<PeriodValue>,
  selectedMonth?: import('vue').Ref<string>,
) {
  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()

  const periodDates = computed(() => resolvePeriodDates(selectedPeriod.value, selectedMonth?.value))

  const queryKey = computed(() =>
    expensesKeys.filtered(businessId.value, periodDates.value.start, periodDates.value.end)
  )

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listExpenses(businessId.value!, periodDates.value.start, periodDates.value.end),
    enabled: computed(() => !!businessId.value),
  })

  const expenses = computed(() => data.value ?? [])
  const expenseTotal = computed(() => expenses.value.reduce((acc, row) => acc + row.amount, 0))

  const saveMutation = useMutation({
    mutationFn: (formData: ExpenseFormData & { id?: string }) =>
      saveExpense(businessId.value!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.all(businessId.value) })
      queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
      queryClient.invalidateQueries({ queryKey: ['finanzas-transactions', businessId.value] })
      success('Gasto guardado correctamente')
      closeModal()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al guardar el gasto')
    },
  })

  const showExpenseModal = ref(false)
  const editingExpenseId = ref<string | null>(null)
  const expenseForm = ref<ExpenseFormData>({
    name: '',
    category: 'General',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const resetForm = () => {
    expenseForm.value = {
      name: '',
      category: 'General',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    editingExpenseId.value = null
  }

  const openNew = () => {
    resetForm()
    showExpenseModal.value = true
  }

  const openEdit = (expense: ExpenseRow) => {
    editingExpenseId.value = expense.id
    expenseForm.value = {
      name: expense.name,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      notes: '',
    }
    showExpenseModal.value = true
  }

  const closeModal = () => {
    showExpenseModal.value = false
    resetForm()
  }

  const handleSave = () => {
    saveMutation.mutate({ ...expenseForm.value, id: editingExpenseId.value ?? undefined })
  }

  return {
    expenses,
    expenseTotal,
    isLoading,
    saveMutation,
    showExpenseModal,
    editingExpenseId,
    expenseForm,
    openNew,
    openEdit,
    closeModal,
    handleSave,
  }
}
