import { computed, watch, ref } from 'vue'
import { useQuery, useQueryClient, useMutation } from '@tanstack/vue-query'
import { useNotification } from './useNotification'
import { formatMethod, formatDate } from '../lib/formatters'
import { supabase } from '../lib/supabase'
import { updateTransaction, deleteTransaction } from '../services/posService'
import type { Transaction, EmployeePayment, Expense, PaymentMethod } from '../types/database'
import type { PaymentBreakdownItem } from '../types/pos'

const toYmd = (d: Date) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export type UnifiedTransaction = {
  id: string
  date: string
  description: string
  method: string
  amount: number
  type: 'ingreso' | 'nomina' | 'gasto'
  exchangeRateUsed?: number
  breakdownLabel?: string
  _currency?: 'USD' | 'VES'
  _originalAmount?: number
}

export type EmployeeEarningSummary = {
  employeeId: string
  employeeName: string
  payType: 'salary' | 'percentage' | 'mixed' | 'unknown'
  payPercentage: number
  baseSalary: number
  commissionTotal: number
  totalEarned: number
}

type SummaryBucket = {
  bucket: string
  appointments: number
  total_amount: number
  local_amount: number
  employee_amount: number
}

type TransactionRow = {
  id: string
  date: string
  client: string
  employee: string
  service: string
  method: string
  rawMethod: PaymentMethod
  amount: number
  exchangeRateUsed: number
  breakdownLabel: string
  breakdown: PaymentBreakdownItem[] | null
}

export type ProductSaleDetail = {
  id: string
  date: string
  product: string
  quantity: number
  unitPrice: number
  total: number
}

type PaymentRow = {
  id: string
  employee: string
  service: string
  amount: number
  percentage: number
  earnings: number
}

type EmployeeCompProfile = {
  pay_type?: 'salary' | 'percentage' | 'mixed' | null
  pay_percentage?: number | null
  base_salary?: number | null
}

const computeServiceEarnings = (
  totalAmount: number,
  profile?: EmployeeCompProfile | null,
  fallbackPercentage?: number | null
) => {
  const payType = profile?.pay_type ?? 'percentage'
  const configuredPercentage = Number(profile?.pay_percentage ?? fallbackPercentage ?? 0)

  if (payType === 'salary') {
    return { percentage: 0, earnings: 0 }
  }

  const normalizedPercentage = Math.max(0, configuredPercentage)
  return {
    percentage: normalizedPercentage,
    earnings: totalAmount * (normalizedPercentage / 100),
  }
}

export type ServiceRevenue = {
  name: string
  amount: number
  percentage: number
}

export type ChartBar = {
  label: string
  income: number
  expense: number
}

type PeriodConfig = {
  bucket: 'day' | 'week' | 'month'
  start: Date
  end: Date
}

const resolvePeriod = (value: 'month' | 'quarter' | 'year', monthKey?: string): PeriodConfig => {
  const parseMonthKey = (key?: string) => {
    if (!key) return null
    const match = key.match(/^(\d{4})-(\d{2})$/)
    if (!match) return null
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) return null
    return { year, month }
  }

  const today = new Date()
  if (value === 'month') {
    const parsed = parseMonthKey(monthKey)
    const monthDate = parsed ? new Date(parsed.year, parsed.month, 1) : today
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    const isCurrentMonth = monthStart.getFullYear() === today.getFullYear() && monthStart.getMonth() === today.getMonth()

    return {
      bucket: 'day',
      start: monthStart,
      end: isCurrentMonth ? today : monthEnd,
    }
  }
  if (value === 'quarter') {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
    return {
      bucket: 'week',
      start: new Date(today.getFullYear(), quarterStartMonth, 1),
      end: today,
    }
  }
  return {
    bucket: 'month',
    start: new Date(today.getFullYear(), 0, 1),
    end: today,
  }
}

const normalizeBucketKey = (date: Date, bucket: 'day' | 'week' | 'month') => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  if (bucket === 'day') return toYmd(normalized)
  if (bucket === 'month') return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}-01`
  const day = (normalized.getDay() + 6) % 7
  normalized.setDate(normalized.getDate() - day)
  return toYmd(normalized)
}

const formatBucketLabel = (date: Date, bucket: 'day' | 'week' | 'month') => {
  if (bucket === 'month') {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`
  }
  return formatDate(date)
}

function formatBreakdownLabel(breakdown: PaymentBreakdownItem[] | null | undefined): string {
  if (!breakdown || !Array.isArray(breakdown) || breakdown.length <= 1) return ''
  return breakdown.map(p => {
    const methodName = formatMethod(p.method)
    const amount = p.currency === 'VES'
      ? `${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p.inputAmount)} Bs`
      : `$${p.inputAmount.toFixed(2)}`
    return `${methodName} ${amount}`
  }).join(' / ')
}



function buildExpenseBuckets(rows: { date: string; amount: number }[], bucket: 'day' | 'week' | 'month') {
  const map = new Map<string, number>()
  for (const row of rows) {
    const key = normalizeBucketKey(new Date(row.date), bucket)
    map.set(key, (map.get(key) ?? 0) + row.amount)
  }
  return map
}

function useFinancialSummary(
  businessId: import('vue').Ref<string | null>,
  selectedPeriod: import('vue').Ref<'month' | 'quarter' | 'year'>,
  expenses: import('vue').Ref<{ date: string; amount: number }[]>,
  selectedMonth?: import('vue').Ref<string>,
) {
  const queryClient = useQueryClient()
  const periodConfig = computed(() => resolvePeriod(selectedPeriod.value, selectedMonth?.value))

  // Keep Finanzas in sync across sessions/devices (e.g. POS on another browser/device).
  watch(
    businessId,
    (id, _prev, onCleanup) => {
      if (!id) return

      const channel = supabase
        .channel(`finanzas-live-${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventory_movements', filter: `business_id=eq.${id}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['finanzas-product-sales', id] })
            queryClient.invalidateQueries({ queryKey: ['financial-summary', id] })
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `business_id=eq.${id}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['finanzas-transactions', id] })
            queryClient.invalidateQueries({ queryKey: ['financial-summary', id] })
          },
        )
        .subscribe()

      onCleanup(() => {
        supabase.removeChannel(channel)
      })
    },
    { immediate: true },
  )

  const summaryQueryKey = computed(() =>
    ['financial-summary', businessId.value, selectedPeriod.value, selectedMonth?.value ?? null] as const
  )

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: summaryQueryKey,
    queryFn: async () => {
      const cfg = periodConfig.value
      const start = toYmd(cfg.start)
      const end = toYmd(cfg.end)
      const { data, error } = await supabase.rpc('financial_summary', {
        p_business_id: businessId.value!,
        p_period_start: start,
        p_period_end: end,
        p_period: cfg.bucket,
      })
      if (error) throw error
      return (data ?? []) as SummaryBucket[]
    },
    enabled: computed(() => !!businessId.value),
  })

  const summaryBuckets = computed(() => summaryData.value ?? [])

  const transactionsQueryKey = computed(() =>
    ['finanzas-transactions', businessId.value, selectedPeriod.value, selectedMonth?.value ?? null] as const
  )

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: transactionsQueryKey,
    queryFn: async () => {
      const cfg = periodConfig.value
      const endExclusive = new Date(cfg.end)
      endExclusive.setDate(endExclusive.getDate() + 1)
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          paid_at,
          created_at,
          total_amount,
          method,
          employee_percentage,
          exchange_rate_used,
          payments_breakdown,
          appointments (
            client_id,
            service_id,
            employee_id,
            clients ( full_name ),
            services ( name ),
            employee_profile:profiles!appointments_employee_id_fkey ( full_name, pay_type, pay_percentage, base_salary )
          )
        `)
        .eq('business_id', businessId.value!)
        // Use created_at as fallback because some payments may not set paid_at
        .gte('created_at', cfg.start.toISOString())
        .lt('created_at', endExclusive.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const raw = (data ?? []) as Array<
        Transaction & {
          exchange_rate_used?: number | null
          appointments?: {
            client_id: string | null
            service_id: string | null
            employee_id: string | null
            clients?: { full_name: string | null } | null
            services?: { name: string | null } | null
            employee_profile?: {
              full_name: string | null
              pay_type?: 'salary' | 'percentage' | 'mixed' | null
              pay_percentage?: number | null
              base_salary?: number | null
            } | null
          } | null
        }
      >

      return raw
    },
    enabled: computed(() => !!businessId.value),
  })

  const rawTransactions = computed(() => transactionsData.value ?? [])

  // Employee payments query for same period
  const { data: rawEmployeePayments } = useQuery({
    queryKey: computed(() => ['finanzas-employee-payments', businessId.value, selectedPeriod.value, selectedMonth?.value ?? null]),
    queryFn: async () => {
      const cfg = periodConfig.value
      const { data, error } = await supabase
        .from('employee_payments')
        .select('id, amount, payment_method, payment_date, employee_profile:profiles!employee_payments_employee_id_fkey(full_name)')
        .eq('business_id', businessId.value!)
        .gte('payment_date', toYmd(cfg.start))
        .lte('payment_date', toYmd(cfg.end))
        .order('payment_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as Array<EmployeePayment & { employee_profile?: { full_name: string } | null }>
    },
    enabled: computed(() => !!businessId.value),
  })

  // Expenses query for same period
  const { data: rawExpenses } = useQuery({
    queryKey: computed(() => ['finanzas-expenses', businessId.value, selectedPeriod.value, selectedMonth?.value ?? null]),
    queryFn: async () => {
      const cfg = periodConfig.value
      const { data, error } = await supabase
        .from('expenses')
        .select('id, name, amount, expense_date')
        .eq('business_id', businessId.value!)
        .gte('expense_date', toYmd(cfg.start))
        .lte('expense_date', toYmd(cfg.end))
        .order('expense_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as Expense[]
    },
    enabled: computed(() => !!businessId.value),
  })

  // Product sales (inventory movements with movement_type = 'sale') for the same period
  const { data: rawInventoryMovements } = useQuery({
    queryKey: computed(() => ['finanzas-product-sales', businessId.value, selectedPeriod.value, selectedMonth?.value ?? null]),
    queryFn: async () => {
      const cfg = periodConfig.value
      const endExclusive = new Date(cfg.end)
      endExclusive.setDate(endExclusive.getDate() + 1)
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('product_id, variant_id, movement_type, quantity, unit_cost, exchange_rate_used, created_at, products ( name )')
        .eq('business_id', businessId.value!)
        .eq('movement_type', 'sale')
        .gte('created_at', cfg.start.toISOString())
        .lt('created_at', endExclusive.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as Array<any>
    },
    enabled: computed(() => !!businessId.value),
  })

  const transactionsAll = computed<TransactionRow[]>(() =>
    rawTransactions.value.map(row => {
      const breakdown = (row as any).payments_breakdown as PaymentBreakdownItem[] | null
      const breakdownLabel = formatBreakdownLabel(breakdown)
      return {
        id: row.id,
        date: formatDate(row.paid_at ?? row.created_at),
        client: row.appointments?.clients?.full_name ?? '—',
        employee: row.appointments?.employee_profile?.full_name ?? '—',
        service: row.appointments?.services?.name ?? '—',
        method: breakdownLabel || formatMethod(row.method),
        rawMethod: row.method as PaymentMethod,
        amount: row.total_amount,
        exchangeRateUsed: row.exchange_rate_used ?? 1,
        breakdownLabel,
        breakdown,
      }
    })
  )

  const appointmentIncomeDetails = computed(() => transactionsAll.value)

  // Compute product sales totals from inventory movements (movement_type = 'sale')
  const productSalesTotal = computed(() => {
    const rows = rawInventoryMovements.value ?? []
    return rows.reduce((acc: number, r: any) => {
      const qty = Math.abs(Number(r.quantity ?? 0))
      const price = Number(r.unit_cost ?? 0)
      return acc + qty * price
    }, 0)
  })

  const vesProductSalesTotal = computed(() => {
    const rows = rawInventoryMovements.value ?? []
    return rows.reduce((acc: number, r: any) => {
      const qty = Math.abs(Number(r.quantity ?? 0))
      const price = Number(r.unit_cost ?? 0)
      const rate = Number(r.exchange_rate_used ?? 1)
      return acc + qty * price * rate
    }, 0)
  })

  const productSalesBreakdown = computed(() => {
    const rows = rawInventoryMovements.value ?? []
    const map = new Map<string, number>()
    for (const r of rows) {
      const name = r.products?.name ?? 'Sin producto'
      const amount = Math.abs(Number(r.quantity ?? 0)) * Number(r.unit_cost ?? 0)
      map.set(name, (map.get(name) ?? 0) + amount)
    }
    return [...map.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount)
  })

  const productSalesDetails = computed<ProductSaleDetail[]>(() => {
    const rows = rawInventoryMovements.value ?? []
    return rows.map((r: any, idx: number) => {
      const quantity = Math.abs(Number(r.quantity ?? 0))
      const unitPrice = Number(r.unit_cost ?? 0)
      return {
        id: `${r.product_id ?? 'product'}-${r.created_at ?? idx}-${idx}`,
        date: formatDate(r.created_at),
        product: r.products?.name ?? 'Sin producto',
        quantity,
        unitPrice,
        total: quantity * unitPrice,
      }
    })
  })

  const unifiedTransactions = computed<UnifiedTransaction[]>(() => {
    const result: Array<UnifiedTransaction & { sortDate: string }> = []

    // Appointment payments (income)
    for (const tx of rawTransactions.value) {
      const breakdown = (tx as any).payments_breakdown as PaymentBreakdownItem[] | null
      const breakdownLabel = formatBreakdownLabel(breakdown)
      result.push({
        id: tx.id,
        date: formatDate(tx.paid_at ?? tx.created_at),
        description: (tx.appointments?.clients?.full_name ?? '—') + ' · ' + (tx.appointments?.services?.name ?? '—'),
        method: breakdownLabel || formatMethod(tx.method),
        amount: tx.total_amount,
        type: 'ingreso',
        exchangeRateUsed: tx.exchange_rate_used ?? 1,
        breakdownLabel,
        sortDate: tx.paid_at ?? tx.created_at,
      })
    }

    // Employee payments (nomina)
    const empPayments = rawEmployeePayments.value ?? []
    for (const ep of empPayments) {
      let epCurrency: 'USD' | 'VES' = 'USD'
      let epOriginalAmount = Number(ep.amount)
      const epNotes = (ep.notes ?? '')
      const vesMatch = epNotes.match(/^\[VES:(\d+(?:\.\d+)?)\]/)
      if (vesMatch) {
        epCurrency = 'VES'
        epOriginalAmount = Number(vesMatch[1])
      }
      const usdMatch = !vesMatch && epNotes.match(/^\[USD:(\d+(?:\.\d+)?)\]/)
      if (usdMatch) {
        epCurrency = 'USD'
        epOriginalAmount = Number(usdMatch[1])
      }
      result.push({
        id: 'ep-' + ep.id,
        date: formatDate(ep.payment_date),
        description: 'Pago a ' + (ep.employee_profile?.full_name ?? 'empleado'),
        method: formatMethod(ep.payment_method),
        amount: ep.amount,
        type: 'nomina',
        sortDate: ep.payment_date,
        _currency: epCurrency,
        _originalAmount: epOriginalAmount,
      })
    }

    // Expenses (gastos)
    const expenses = rawExpenses.value ?? []
    for (const ex of expenses) {
      result.push({
        id: 'ex-' + ex.id,
        date: formatDate(ex.expense_date),
        description: ex.name,
        method: '—',
        amount: ex.amount,
        type: 'gasto',
        sortDate: ex.expense_date,
      })
    }

    result.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    return result.map(({ sortDate: _sortDate, ...tx }) => tx)
  })

  const transactions = computed(() => unifiedTransactions.value)

  const employeePayments = computed<PaymentRow[]>(() =>
    rawTransactions.value.map(row => {
      const calc = computeServiceEarnings(
        Number(row.total_amount ?? 0),
        row.appointments?.employee_profile,
        row.employee_percentage,
      )

      return {
        id: row.id,
        employee: row.appointments?.employee_profile?.full_name ?? '—',
        service: row.appointments?.services?.name ?? '—',
        amount: row.total_amount,
        percentage: calc.percentage,
        earnings: calc.earnings,
      }
    })
  )

  const employeeEarningsByEmployee = computed<EmployeeEarningSummary[]>(() => {
    const map = new Map<string, {
      employeeName: string
      payType: string
      payPercentage: number
      baseSalary: number
      commissionTotal: number
    }>()

    for (const tx of rawTransactions.value) {
      const profile = tx.appointments?.employee_profile
      if (!profile) continue
      const id = tx.appointments?.employee_id ?? ''
      if (!id) continue

      if (!map.has(id)) {
        const profileFromTx = profile as EmployeeCompProfile
        const pt = profileFromTx.pay_type ?? 'percentage'
        map.set(id, {
          employeeName: profile.full_name ?? '—',
          payType: pt,
          payPercentage: pt === 'salary' ? 0 : Number(profileFromTx.pay_percentage ?? 0),
          baseSalary: pt === 'percentage' ? 0 : Number(profileFromTx.base_salary ?? 0),
          commissionTotal: 0,
        })
      }

      const entry = map.get(id)!
      const calc = computeServiceEarnings(
        Number(tx.total_amount ?? 0),
        profile,
        tx.employee_percentage,
      )
      entry.commissionTotal += calc.earnings
    }

    return [...map.entries()].map(([employeeId, data]) => ({
      employeeId,
      employeeName: data.employeeName,
      payType: data.payType as EmployeeEarningSummary['payType'],
      payPercentage: data.payPercentage,
      baseSalary: data.baseSalary,
      commissionTotal: data.commissionTotal,
      totalEarned: data.baseSalary + data.commissionTotal,
    }))
  })

  const incomeTotal = computed(() =>
    summaryBuckets.value.reduce((acc, row) => acc + row.total_amount, 0)
  )

  const vesIncomeTotal = computed(() =>
    rawTransactions.value.reduce((acc, tx) => acc + (tx.total_amount * (tx.exchange_rate_used ?? 1)), 0)
  )

  const servicesRevenue = computed<ServiceRevenue[]>(() => {
    const totals = new Map<string, number>()
    for (const tx of transactionsAll.value) {
      const key = tx.service || 'Sin servicio'
      totals.set(key, (totals.get(key) ?? 0) + tx.amount)
    }
    const total = incomeTotal.value
    return [...totals.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const chartData = computed<ChartBar[]>(() => {
    const cfg = periodConfig.value
    const expenseBuckets = buildExpenseBuckets(expenses.value, cfg.bucket)
    const entries = summaryBuckets.value.map(row => {
      const bucketKey = normalizeBucketKey(new Date(row.bucket), cfg.bucket)
      const expenseValue = expenseBuckets.get(bucketKey) ?? 0
      return {
        label: formatBucketLabel(new Date(row.bucket), cfg.bucket),
        incomeValue: row.total_amount,
        expenseValue,
      }
    })

    const maxValue = Math.max(1, ...entries.map(item => Math.max(item.incomeValue, item.expenseValue)))
    return entries.map(item => ({
      label: item.label,
      income: Math.max(4, Math.round((item.incomeValue / maxValue) * 140)),
      expense: Math.max(4, Math.round((item.expenseValue / maxValue) * 140)),
    }))
  })

  const isLoading = computed(() => isSummaryLoading.value || isTransactionsLoading.value)

  const { success: notify, error: showError } = useNotification()

  const editTransactionMutation = useMutation({
    mutationFn: (params: {
      transactionId: string
      amount?: number
      method?: PaymentMethod
      notes?: string
      exchangeRate?: number
      paymentsBreakdown?: PaymentBreakdownItem[]
    }) => updateTransaction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finanzas-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
      queryClient.invalidateQueries({ queryKey: ['finanzas-employee-payments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
      notify('Cobro actualizado correctamente')
    },
    onError: (err: unknown) => {
      showError(err instanceof Error ? err.message : 'Error al actualizar el cobro')
    },
  })

  const deleteTransactionMutation = useMutation({
    mutationFn: (params: { transactionId: string }) => deleteTransaction(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finanzas-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
      queryClient.invalidateQueries({ queryKey: ['finanzas-employee-payments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['pos-pending'] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['finanzas-product-sales'] })
      notify('Cobro eliminado correctamente')
    },
    onError: (err: unknown) => {
      showError(err instanceof Error ? err.message : 'Error al eliminar el cobro')
    },
  })

  const showEditModal = ref(false)
  const editingTransaction = ref<TransactionRow | null>(null)
  const editingAmount = ref(0)
  const editingMethod = ref<PaymentMethod>('cash')
  const editingBreakdown = ref<PaymentBreakdownItem[]>([])

  const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card', label: 'Tarjeta' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'zelle', label: 'Zelle' },
    { value: 'pago_movil', label: 'Pago Móvil' },
    { value: 'mixed', label: 'Mixto' },
    { value: 'other', label: 'Otro' },
  ]

  const isEditingMixed = computed(() => editingMethod.value === 'mixed')

  const editingTotalAmount = computed(() => {
    if (editingMethod.value === 'mixed') {
      return editingBreakdown.value.reduce((sum, item) => sum + item.amount, 0)
    }
    return editingAmount.value
  })

  const startEdit = (tx: TransactionRow) => {
    editingTransaction.value = tx
    editingAmount.value = tx.amount
    editingMethod.value = tx.rawMethod

    if (tx.breakdown && tx.breakdown.length > 0) {
      editingBreakdown.value = tx.breakdown.map(item => ({ ...item }))
    } else {
      editingBreakdown.value = tx.rawMethod !== 'mixed'
        ? []
        : [{ method: 'cash' as PaymentMethod, inputAmount: tx.amount, currency: 'USD' as const, amount: tx.amount }]
    }

    showEditModal.value = true
  }

  const cancelEdit = () => {
    showEditModal.value = false
    editingTransaction.value = null
    editingAmount.value = 0
    editingMethod.value = 'cash'
    editingBreakdown.value = []
  }

  const setEditingMethod = (method: PaymentMethod) => {
    editingMethod.value = method
    if (method === 'mixed' && editingBreakdown.value.length === 0) {
      editingBreakdown.value = [{ method: 'cash' as PaymentMethod, inputAmount: editingAmount.value, currency: 'USD' as const, amount: editingAmount.value }]
    }
    if (method !== 'mixed') {
      editingAmount.value = editingTotalAmount.value
    }
  }

  const updateBreakdownItem = (index: number, field: 'method' | 'amount', value: PaymentMethod | number) => {
    const items = [...editingBreakdown.value]
    if (field === 'method') {
      items[index] = { ...items[index], method: value as PaymentMethod }
    } else {
      const numValue = value as number
      items[index] = { ...items[index], inputAmount: numValue, amount: numValue }
    }
    editingBreakdown.value = items
  }

  const addBreakdownItem = () => {
    editingBreakdown.value = [...editingBreakdown.value, { method: 'cash' as PaymentMethod, inputAmount: 0, currency: 'USD' as const, amount: 0 }]
  }

  const removeBreakdownItem = (index: number) => {
    editingBreakdown.value = editingBreakdown.value.filter((_, i) => i !== index)
    if (editingBreakdown.value.length <= 1 && editingMethod.value === 'mixed') {
      editingMethod.value = editingBreakdown.value[0]?.method ?? 'cash'
    }
  }

  const saveEdit = () => {
    if (!editingTransaction.value) return
    const total = editingTotalAmount.value
    if (total <= 0) {
      showError('El monto debe ser mayor a 0')
      return
    }

    const effectiveMethod: PaymentMethod = editingBreakdown.value.length > 1
      ? 'mixed'
      : editingMethod.value

    const breakdown = effectiveMethod === 'mixed' && editingBreakdown.value.length > 0
      ? editingBreakdown.value.map(item => ({
          method: item.method,
          inputAmount: item.amount,
          currency: item.currency,
          amount: item.amount,
        }))
      : undefined

    editTransactionMutation.mutate({
      transactionId: editingTransaction.value.id,
      amount: total,
      method: effectiveMethod,
      paymentsBreakdown: breakdown as PaymentBreakdownItem[] | undefined,
    })
    cancelEdit()
  }

  const confirmDeleteTransaction = (txId: string) => {
    if (window.confirm('¿Eliminar este cobro?\n\nSe revertirá el inventario si aplica. Esta acción no se puede deshacer.')) {
      deleteTransactionMutation.mutate({ transactionId: txId })
    }
  }

  return {
    summaryBuckets,
    transactions,
    allTransactions: unifiedTransactions,
    transactionsAll,
    incomeTotal,
    vesIncomeTotal,
    servicesRevenue,
    chartData,
    employeePayments,
    employeeEarningsByEmployee,
    appointmentIncomeDetails,
    productSalesTotal,
    vesProductSalesTotal,
    productSalesBreakdown,
    productSalesDetails,
    isLoading,
    editTransactionMutation,
    deleteTransactionMutation,
    showEditModal,
    editingTransaction,
    editingAmount,
    editingMethod,
    editingBreakdown,
    isEditingMixed,
    editingTotalAmount,
    paymentMethodOptions,
    startEdit,
    cancelEdit,
    setEditingMethod,
    updateBreakdownItem,
    addBreakdownItem,
    removeBreakdownItem,
    saveEdit,
    confirmDeleteTransaction,
  }
}

export { useFinancialSummary }
