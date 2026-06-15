<template>
  <header class="mb-5 lg:mb-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Finanzas</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">Dashboard Financiero</h1>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        <div class="flex rounded-xl border border-border bg-surface p-0.5 sm:p-1 shadow-sm">
          <button v-for="period in periods" :key="period.value"
            @click="selectedPeriod = period.value"
            :class="['rounded-lg px-3 py-1.5 text-xs font-medium transition-theme sm:px-4',
              selectedPeriod === period.value ? 'bg-primary text-text-inverse shadow-sm shadow-primary/20' : 'text-text-secondary hover:text-text hover:bg-bg-secondary'
            ]">{{ period.label }}</button>
        </div>
        <div class="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 shadow-sm">
          <label for="month-picker" class="text-xs font-medium text-text-muted hidden sm:inline">Mes</label>
          <input
            id="month-picker"
            v-model="selectedMonth"
            type="month"
            class="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text outline-none transition-theme focus:border-primary w-28 sm:w-auto"
            @change="selectedPeriod = 'month'"
          />
          <button
            type="button"
            class="rounded-md border border-border px-2 py-1 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text whitespace-nowrap"
            @click="resetToCurrentMonth"
          >
            Ahora
          </button>
        </div>
        <button class="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text hover:border-border-strong self-start sm:self-auto shadow-sm">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>
  </header>

  <div class="mb-5 lg:mb-8">
    <KpiCards
      :income-total="incomeTotal"
      :ves-income-total="vesIncomeTotal"
      :expense-total="expenseTotal"
      :net-total="netTotal"
      :margin="marginTotal"
    >
      <template #exchange-rate>
        <ExchangeRateCard
          :is-editable="rateCtx.isEditable.value"
          :edit-rate-value="rateCtx.editRateValue.value"
          :updating-rate="rateCtx.updatingRate.value"
          :display-rate="rateCtx.displayRate.value"
          @update:edit-rate-value="rateCtx.editRateValue.value = $event"
          @update-rate="rateCtx.handleUpdate"
        />
      </template>
    </KpiCards>
  </div>

  <!-- Transacciones Recientes -->
  <div class="mb-5 rounded-xl border border-border bg-surface shadow-sm">
    <div class="border-b border-border-subtle px-4 sm:px-5 py-3.5 sm:py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-text">Transacciones Recientes</h3>
            <p class="text-xs text-text-muted">Últimos movimientos registrados</p>
          </div>
        </div>
        <button
          v-if="canViewAllTransactions"
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text hover:border-border-strong"
          @click="goToAllRecords('transacciones')"
        >
          Ver todas
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div class="lg:hidden space-y-2 p-4 sm:p-5">
      <div v-for="tx in visibleTransactions" :key="tx.id" class="rounded-lg border border-border-subtle bg-bg-secondary p-3.5 transition-theme hover:bg-bg-secondary/80">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0 flex-1">
            <div class="text-xs text-text-muted">{{ tx.date }}</div>
            <div class="font-medium text-text text-sm mt-0.5 flex items-center gap-1.5">
              <svg v-if="tx.type === 'ingreso'" class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" class="fill-success/10" />
                <path d="M8 4v5M5 8l3 3 3-3" stroke="currentColor" class="text-success" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" class="fill-danger/10" />
                <path d="M8 11V6M5 7l3-3 3 3" stroke="currentColor" class="text-danger" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ tx.description }}
            </div>
          </div>
          <span :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0',
            tx.type === 'ingreso' ? 'bg-success/10 text-success' :
            tx.type === 'nomina' ? 'bg-warning/10 text-warning' :
            'bg-danger/10 text-danger'
          ]">
            {{ tx.type === 'ingreso' ? 'Ingreso' : tx.type === 'nomina' ? 'Nómina' : 'Gasto' }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-text-muted">{{ tx.method }}</span>
          <div class="text-right">
            <div class="font-semibold text-sm tabular-nums whitespace-nowrap" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
              {{ tx.type === 'ingreso' ? '+' : '-' }}{{ tx.type === 'nomina' && tx._currency === 'VES' ? formatVESEs(tx._originalAmount ?? tx.amount) : formatUSD(tx.amount) }}
            </div>
            <div v-if="tx.type === 'nomina' && tx._currency === 'VES'" class="text-xs text-text-muted tabular-nums whitespace-nowrap">{{ formatUSD(tx.amount) }}</div>
            <div v-else class="text-xs text-text-muted tabular-nums whitespace-nowrap">{{ formatVESInline(tx.amount, tx.exchangeRateUsed) }} Bs</div>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto hidden lg:block">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="px-4 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Fecha</th>
            <th class="px-4 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Descripción</th>
            <th class="px-4 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Tipo</th>
            <th class="px-4 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Método</th>
            <th class="px-4 pb-3 pt-2 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary">Monto</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="tx in visibleTransactions" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/30">
            <td class="px-4 py-3.5 text-text-secondary whitespace-nowrap">{{ tx.date }}</td>
            <td class="px-4 py-3.5 font-medium text-text">
              <div class="flex items-center gap-2">
                <svg v-if="tx.type === 'ingreso'" class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" class="fill-success/10" />
                  <path d="M8 4v5M5 8l3 3 3-3" stroke="currentColor" class="text-success" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" class="fill-danger/10" />
                  <path d="M8 11V6M5 7l3-3 3 3" stroke="currentColor" class="text-danger" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ tx.description }}
              </div>
            </td>
            <td class="px-4 py-3.5">
              <span :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold',
                tx.type === 'ingreso' ? 'bg-success/10 text-success' :
                tx.type === 'nomina' ? 'bg-warning/10 text-warning' :
                'bg-danger/10 text-danger'
              ]">
                {{ tx.type === 'ingreso' ? 'Ingreso' : tx.type === 'nomina' ? 'Nómina' : 'Gasto' }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <span class="inline-flex items-center rounded-md bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">{{ tx.method }}</span>
            </td>
            <td class="px-4 py-3.5 text-right">
              <div class="font-semibold tabular-nums whitespace-nowrap" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'ingreso' ? '+' : '-' }}{{ tx.type === 'nomina' && tx._currency === 'VES' ? formatVESEs(tx._originalAmount ?? tx.amount) : formatUSD(tx.amount) }}
              </div>
              <div class="text-xs text-text-muted tabular-nums whitespace-nowrap">{{ formatVESInline(tx.amount, tx.exchangeRateUsed) }} Bs</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Gastos del Mes -->
  <div class="mb-5 lg:mb-6">
    <ExpensesSection
      :expenses="expenses"
      :business-id="authStore.businessId"
      :is-loading="expensesCtx.isLoading.value"
      :error="expensesCtx.queryError.value ? (expensesCtx.queryError.value as Error).message : null"
      @saved="onExpenseSaved"
      @view-all="goToAllRecords('gastos')"
    />
  </div>

  <!-- Income Breakdown -->
  </template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQueryClient } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'

import { useFinancialSummary } from '../composables/useFinancialSummary'
import { useExpenses } from '../composables/useExpenses'
import { useExchangeRate } from '../composables/useExchangeRate'
import ExchangeRateCard from '../components/finanzas/ExchangeRateCard.vue'
import KpiCards from '../components/finanzas/KpiCards.vue'
import ExpensesSection from '../components/finanzas/ExpensesSection.vue'
import { expensesKeys } from '../services/expensesService'

const { authStore } = useAuth()

const { formatUSD, formatVESInline, formatVESEs } = useCurrency()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const periods = [
  { label: 'Mes', value: 'month' as const },
  { label: 'Trimestre', value: 'quarter' as const },
  { label: 'Año', value: 'year' as const },
]
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

const currentMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const selectedMonth = ref<string>(currentMonthKey())

if (route.query.period === 'quarter' || route.query.period === 'year' || route.query.period === 'month') {
  selectedPeriod.value = route.query.period
}

if (typeof route.query.month === 'string' && /^\d{4}-\d{2}$/.test(route.query.month)) {
  selectedMonth.value = route.query.month
}

const businessId = computed(() => authStore.businessId)

const expensesCtx = useExpenses(businessId, selectedPeriod, selectedMonth)
const expenses = expensesCtx.expenses

const summaryCtx = useFinancialSummary(businessId, selectedPeriod, expenses, selectedMonth)
const rateCtx = useExchangeRate()

const incomeTotal = summaryCtx.incomeTotal
const vesIncomeTotal = summaryCtx.vesIncomeTotal
const expenseTotal = expensesCtx.expenseTotal
const netTotal = computed(() => incomeTotal.value - expenseTotal.value)
const marginTotal = computed(() => (incomeTotal.value > 0 ? (netTotal.value / incomeTotal.value) * 100 : 0))

const visibleTransactions = computed(() => summaryCtx.transactions.value.slice(0, 5))

const canViewAllTransactions = computed(() => summaryCtx.transactions.value.length > 5)

const resetToCurrentMonth = () => {
  selectedPeriod.value = 'month'
  selectedMonth.value = currentMonthKey()
}

const goToAllRecords = (tipo: 'gastos' | 'pagos' | 'transacciones' | 'cobros' | 'ventas-productos') => {
  router.push({
    name: 'admin-finanzas-registros',
    params: { tipo },
    query: { period: selectedPeriod.value, month: selectedMonth.value },
  })
}

const invalidateAll = () => {
  queryClient.invalidateQueries({ queryKey: expensesKeys.all(businessId.value) })
  queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-transactions', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-expenses', businessId.value] })
}

const onExpenseSaved = () => invalidateAll()
</script>
