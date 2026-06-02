<template>
  <header class="mb-4 lg:mb-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs text-primary mb-1">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium uppercase tracking-wider">Finanzas</span>
        </div>
        <h1 class="text-xl font-bold text-text lg:text-2xl">Dashboard Financiero</h1>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-xl border border-border bg-surface p-1">
          <button v-for="period in periods" :key="period.value"
            @click="selectedPeriod = period.value"
            :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
              selectedPeriod === period.value ? 'bg-primary text-text-inverse' : 'text-text-secondary hover:bg-bg-secondary'
            ]">{{ period.label }}</button>
        </div>
        <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>
  </header>

  <ExchangeRateCard
    :is-editable="rateCtx.isEditable.value"
    :edit-rate-value="rateCtx.editRateValue.value"
    :updating-rate="rateCtx.updatingRate.value"
    :display-rate="rateCtx.displayRate.value"
    @update:edit-rate-value="rateCtx.editRateValue.value = $event"
    @update-rate="rateCtx.handleUpdate"
  />

  <KpiCards
    :income-total="incomeTotal"
    :expense-total="expenseTotal"
    :net-total="netTotal"
    :margin="marginTotal"
  />

  <div class="mb-4">
    <FinancialCharts
      :chart-data="summaryCtx.chartData.value"
      :services-revenue="summaryCtx.servicesRevenue.value"
      :income-total="incomeTotal"
    />
  </div>

  <div class="mb-4">
    <ExpensesSection
      :expenses="expenses"
      :business-id="authStore.businessId"
      @saved="onExpenseSaved"
    />
  </div>

  <div class="mb-4">
    <EmployeePaymentsSection
      :employee-payments="summaryCtx.employeePayments.value"
      :payments-made="paymentsCtx.paymentsMade.value"
      :terminology="businessStore.terminology"
      :business-id="authStore.businessId"
      @saved="onPaymentSaved"
    />
  </div>

  <div class="rounded-xl border border-border bg-surface p-4">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-text">Transacciones Recientes</h3>
        <p class="text-sm text-text-muted">Últimos pagos registrados</p>
      </div>
      <button class="text-sm text-primary hover:text-primary-hover transition-theme">Ver todas</button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ businessStore.terminology.client || 'Cliente' }}</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ businessStore.terminology.service || 'Servicio' }}</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="tx in summaryCtx.transactions.value" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
            <td class="py-3 text-text-secondary whitespace-nowrap">{{ tx.date }}</td>
            <td class="py-3 font-medium text-text">{{ tx.client }}</td>
            <td class="py-3 text-text-secondary">{{ tx.service }}</td>
            <td class="py-3">
              <span :class="['rounded-full px-2 py-0.5 text-xs',
                tx.method === 'Efectivo' ? 'bg-success/10 text-success' :
                tx.method === 'Tarjeta' ? 'bg-primary/10 text-primary' :
                tx.method === 'Transferencia' ? 'bg-info/10 text-info' :
                tx.method === 'Zelle' ? 'bg-warning/10 text-warning' :
                tx.method === 'Pago Móvil' ? 'bg-info/10 text-info' :
                tx.method === 'Mixto' ? 'bg-primary/10 text-primary' : 'bg-bg-secondary text-text-muted'
              ]">{{ tx.method }}</span>
            </td>
            <td class="py-3 text-right">
              <div class="font-medium text-text">{{ formatUSD(tx.amount) }}</div>
              <div class="text-xs text-text-muted">Bs {{ formatVESInline(tx.amount) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useBusinessStore } from '../store/business'
import { useFinancialSummary } from '../composables/useFinancialSummary'
import { useExpenses } from '../composables/useExpenses'
import { useEmployeePayments } from '../composables/useEmployeePayments'
import { useExchangeRate } from '../composables/useExchangeRate'
import ExchangeRateCard from '../components/finanzas/ExchangeRateCard.vue'
import KpiCards from '../components/finanzas/KpiCards.vue'
import FinancialCharts from '../components/finanzas/FinancialCharts.vue'
import ExpensesSection from '../components/finanzas/ExpensesSection.vue'
import EmployeePaymentsSection from '../components/finanzas/EmployeePaymentsSection.vue'
import { expensesKeys } from '../services/expensesService'
import { employeePaymentKeys } from '../services/employeePaymentsService'

const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { formatUSD, formatVESInline } = useCurrency()
const queryClient = useQueryClient()

const periods = [
  { label: 'Mes', value: 'month' as const },
  { label: 'Trimestre', value: 'quarter' as const },
  { label: 'Año', value: 'year' as const },
]
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

const businessId = computed(() => authStore.businessId)

const expensesCtx = useExpenses(businessId, selectedPeriod)
const expenses = expensesCtx.expenses

const summaryCtx = useFinancialSummary(businessId, selectedPeriod, expenses)
const paymentsCtx = useEmployeePayments(businessId)
const rateCtx = useExchangeRate()

const incomeTotal = summaryCtx.incomeTotal
const expenseTotal = expensesCtx.expenseTotal
const netTotal = computed(() => incomeTotal.value - expenseTotal.value)
const marginTotal = computed(() => (incomeTotal.value > 0 ? (netTotal.value / incomeTotal.value) * 100 : 0))

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: expensesKeys.all(businessId.value) })
  queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
  queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-transactions', businessId.value] })
}

const onExpenseSaved = () => invalidateAll()
const onPaymentSaved = () => {
  queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
}
</script>
