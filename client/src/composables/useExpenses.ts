import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from './useNotification'
import { useCurrency } from './useCurrency'
import { expensesKeys, listExpenses, saveExpense, deleteExpense, type ExpenseFormData, type ExpenseRow } from '../services/expensesService'

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
  selectedPeriod?: import('vue').Ref<PeriodValue>,
  selectedMonth?: import('vue').Ref<string>,
) {
  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()
  const { exchangeRate } = useCurrency()

  const periodDates = computed(() => {
    if (!selectedPeriod) return { start: '', end: '' }
    return resolvePeriodDates(selectedPeriod.value, selectedMonth?.value)
  })

  const queryKey = computed(() =>
    expensesKeys.filtered(businessId.value, periodDates.value.start, periodDates.value.end)
  )

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey,
    queryFn: () => listExpenses(businessId.value!, periodDates.value.start, periodDates.value.end),
    enabled: computed(() => !!businessId.value && !!selectedPeriod),
  })

  const expenses = computed(() => data.value ?? [])
  const expenseTotal = computed(() => expenses.value.reduce((acc, row) => acc + row.amount, 0))

  const saveMutation = useMutation({
    mutationFn: (formData: ExpenseFormData & { id?: string }) => {
      if (!businessId.value) throw new Error('No hay negocio activo')
      return saveExpense(businessId.value, formData, exchangeRate.value)
    },
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expensesKeys.all(businessId.value) })
      queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
      success('Gasto eliminado correctamente')
    },
    onError: (err: unknown) => {
      showError(err instanceof Error ? err.message : 'Error al eliminar el gasto')
    },
  })

  const showExpenseModal = ref(false)
  const editingExpenseId = ref<string | null>(null)
  const expenseForm = ref<ExpenseFormData>({
    name: '',
    category: 'General',
    amount: 0,
    currency: 'USD',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const saveError = ref('')

  const resetForm = () => {
    expenseForm.value = {
      name: '',
      category: 'General',
      amount: 0,
      currency: 'USD',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    editingExpenseId.value = null
    saveError.value = ''
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
      amount: expense.originalAmount,
      currency: expense.currency,
      date: expense.date,
      notes: expense.notes,
    }
    saveError.value = ''
    showExpenseModal.value = true
  }

  const closeModal = () => {
    showExpenseModal.value = false
    resetForm()
  }

  const handleSave = async () => {
    if (saveMutation.isPending.value) return
    saveError.value = ''
    try {
      await saveMutation.mutateAsync({ ...expenseForm.value, id: editingExpenseId.value ?? undefined })
    } catch (err) {
      saveError.value = err instanceof Error ? err.message : 'Error al guardar el gasto'
      throw err
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(id)
    }
  }

  return {
    expenses,
    expenseTotal,
    isLoading,
    isError,
    queryError,
    saveMutation,
    deleteMutation,
    saveError,
    showExpenseModal,
    editingExpenseId,
    expenseForm,
    openNew,
    openEdit,
    closeModal,
    handleSave,
    handleDelete,
  }
}
