import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import type { Transaction } from '../types/database'

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
  service: string
  method: string
  amount: number
}

type PaymentRow = {
  id: string
  employee: string
  service: string
  amount: number
  percentage: number
  earnings: number
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

const resolvePeriod = (value: 'month' | 'quarter' | 'year'): PeriodConfig => {
  const today = new Date()
  if (value === 'month') {
    return {
      bucket: 'day',
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
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
  if (bucket === 'day') return normalized.toISOString().slice(0, 10)
  if (bucket === 'month') return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}-01`
  const day = (normalized.getDay() + 6) % 7
  normalized.setDate(normalized.getDate() - day)
  return normalized.toISOString().slice(0, 10)
}

const formatBucketLabel = (date: Date, bucket: 'day' | 'week' | 'month') => {
  if (bucket === 'month') return date.toLocaleDateString('es-ES', { month: 'short' })
  if (bucket === 'week') return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date)
}

const formatMethod = (method: string) => {
  switch (method) {
    case 'cash': return 'Efectivo'
    case 'card': return 'Tarjeta'
    case 'transfer': return 'Transferencia'
    case 'zelle': return 'Zelle'
    case 'pago_movil': return 'Pago Móvil'
    case 'mixed': return 'Mixto'
    default: return method
  }
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
) {
  const periodConfig = computed(() => resolvePeriod(selectedPeriod.value))

  const summaryQueryKey = computed(() =>
    ['financial-summary', businessId.value, selectedPeriod.value] as const
  )

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: summaryQueryKey,
    queryFn: async () => {
      const cfg = periodConfig.value
      const start = cfg.start.toISOString().slice(0, 10)
      const end = cfg.end.toISOString().slice(0, 10)
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
    ['finanzas-transactions', businessId.value, selectedPeriod.value] as const
  )

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: transactionsQueryKey,
    queryFn: async () => {
      const cfg = periodConfig.value
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          paid_at,
          total_amount,
          method,
          employee_percentage,
          appointments (
            client_id,
            service_id,
            employee_id,
            clients ( full_name ),
            services ( name ),
            profiles ( full_name )
          )
        `)
        .eq('business_id', businessId.value!)
        .gte('paid_at', cfg.start.toISOString())
        .lte('paid_at', cfg.end.toISOString())
        .order('paid_at', { ascending: false })

      if (error) throw error

      const raw = (data ?? []) as Array<
        Transaction & {
          appointments?: {
            clients?: { full_name: string | null } | null
            services?: { name: string | null } | null
            profiles?: { full_name: string | null } | null
          } | null
        }
      >

      return raw
    },
    enabled: computed(() => !!businessId.value),
  })

  const rawTransactions = computed(() => transactionsData.value ?? [])

  const transactionsAll = computed<TransactionRow[]>(() =>
    rawTransactions.value.map(row => ({
      id: row.id,
      date: formatDate(row.paid_at),
      client: row.appointments?.clients?.full_name ?? '—',
      service: row.appointments?.services?.name ?? '—',
      method: formatMethod(row.method),
      amount: row.total_amount,
    }))
  )

  const transactions = computed(() => transactionsAll.value.slice(0, 10))

  const employeePayments = computed<PaymentRow[]>(() =>
    rawTransactions.value.map(row => ({
      id: row.id,
      employee: row.appointments?.profiles?.full_name ?? '—',
      service: row.appointments?.services?.name ?? '—',
      amount: row.total_amount,
      percentage: row.employee_percentage ?? 0,
      earnings: row.total_amount * ((row.employee_percentage ?? 0) / 100),
    }))
  )

  const incomeTotal = computed(() =>
    summaryBuckets.value.reduce((acc, row) => acc + row.total_amount, 0)
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

  return {
    summaryBuckets,
    transactions,
    transactionsAll,
    incomeTotal,
    servicesRevenue,
    chartData,
    employeePayments,
    isLoading,
  }
}

export { useFinancialSummary }
