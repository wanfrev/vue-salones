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
    <ExchangeRateCard
      :is-editable="rateCtx.isEditable.value"
      :edit-rate-value="rateCtx.editRateValue.value"
      :updating-rate="rateCtx.updatingRate.value"
      :display-rate="rateCtx.displayRate.value"
      @update:edit-rate-value="rateCtx.editRateValue.value = $event"
      @update-rate="rateCtx.handleUpdate"
    />
  </div>

  <div class="mb-5 lg:mb-8">
    <KpiCards
      :income-total="incomeTotal"
      :ves-income-total="vesIncomeTotal"
      :expense-total="expenseTotal"
      :net-total="netTotal"
      :margin="marginTotal"
    />
  </div>

  <!-- Income Breakdown -->
  <div class="mb-5 grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
    <div class="group flex flex-col rounded-xl border border-border bg-surface shadow-sm transition-theme hover:shadow-md hover:border-border-strong">
      <div class="flex items-center gap-3 border-b border-border-subtle bg-gradient-to-r from-success/[0.03] to-transparent px-4 sm:px-5 py-3.5 sm:py-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-text">Cobros de Citas</h3>
          <p class="text-xs text-text-muted">Ingresos por servicios del período</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-bold text-success">{{ formatUSD(appointmentChargesTotal) }}</div>
          <div class="text-[11px] text-text-muted">{{ formatVESEs(vesIncomeTotal) }}</div>
        </div>
      </div>

      <div class="p-4 sm:p-5">
        <div v-if="appointmentIncomeRows.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Fecha</th>
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Cliente</th>
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Empleado</th>
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Servicio</th>
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Método</th>
                <th class="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="item in appointmentIncomeRows" :key="item.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-2 py-2.5 whitespace-nowrap text-text-muted">{{ item.date }}</td>
                <td class="px-2 py-2.5 font-medium text-text">{{ item.client }}</td>
                <td class="px-2 py-2.5 text-text-secondary hidden sm:table-cell">{{ item.employee }}</td>
                <td class="px-2 py-2.5 text-text-secondary hidden sm:table-cell">{{ item.service }}</td>
                <td class="px-2 py-2.5">
                  <span class="inline-flex items-center rounded-md bg-bg-secondary px-2 py-0.5 text-[11px] font-medium text-text-muted">{{ item.method }}</span>
                </td>
                <td class="px-2 py-2.5 text-right font-semibold text-success tabular-nums">{{ formatUSD(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center py-8 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay cobros en este período</p>
        </div>
        <div class="mt-3 flex justify-end pt-1">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-theme hover:bg-primary/5 hover:border-primary/30"
            @click="goToAllRecords('cobros')"
          >
            Ver todos
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="group flex flex-col rounded-xl border border-border bg-surface shadow-sm transition-theme hover:shadow-md hover:border-border-strong">
      <div class="flex items-center gap-3 border-b border-border-subtle bg-gradient-to-r from-info/[0.03] to-transparent px-4 sm:px-5 py-3.5 sm:py-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-text">Ventas de Productos</h3>
          <p class="text-xs text-text-muted">Ingresos por venta de productos del período</p>
        </div>
        <div class="text-right shrink-0">
          <div class="text-lg font-bold text-info">{{ formatUSD(productSalesTotal) }}</div>
          <div class="text-[11px] text-text-muted">{{ formatVESEs(vesProductSalesTotal) }}</div>
        </div>
      </div>

      <div class="p-4 sm:p-5">
        <div v-if="productSalesRows.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Fecha</th>
                <th class="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted">Producto</th>
                <th class="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">Cant.</th>
                <th class="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted hidden sm:table-cell">Precio</th>
                <th class="px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-text-muted">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in productSalesRows" :key="row.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-2 py-2.5 whitespace-nowrap text-text-muted">{{ row.date }}</td>
                <td class="px-2 py-2.5 font-medium text-text">{{ row.product }}</td>
                <td class="px-2 py-2.5 text-right tabular-nums text-text-secondary">{{ row.quantity }}</td>
                <td class="px-2 py-2.5 text-right tabular-nums text-text-secondary hidden sm:table-cell">{{ formatUSD(row.unitPrice) }}</td>
                <td class="px-2 py-2.5 text-right font-semibold text-info tabular-nums">{{ formatUSD(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center py-8 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay ventas en este período</p>
        </div>
        <div v-if="productSalesBreakdown.length" class="mt-3 rounded-lg bg-bg-secondary p-3">
          <p class="text-xs font-medium text-text-muted mb-1.5">Productos principales</p>
          <div class="space-y-1">
            <div v-for="(p, idx) in productSalesBreakdown.slice(0,3)" :key="p.name" class="flex items-center justify-between text-xs">
              <span class="text-text-secondary truncate">
                <span class="font-medium text-text-muted">{{ idx + 1 }}.</span> {{ p.name }}
              </span>
              <span class="font-medium text-info tabular-nums shrink-0 ml-2">{{ formatUSD(p.amount) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-3 flex justify-end pt-1">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-theme hover:bg-primary/5 hover:border-primary/30"
            @click="goToAllRecords('ventas-productos')"
          >
            Ver todos
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

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

  <div class="mb-5 lg:mb-6">
    <EmployeePaymentsSection
      :employee-payments="summaryCtx.employeePayments.value"
      :employee-earnings-by-employee="summaryCtx.employeeEarningsByEmployee.value"
      :payments-made="paymentsCtx.paymentsMade.value"
      :terminology="businessStore.terminology"
      :business-id="authStore.businessId"
      @saved="onPaymentSaved"
      @view-all="goToAllRecords('pagos')"
    />
  </div>

  <div class="rounded-xl border border-border bg-surface shadow-sm">
    <div class="border-b border-border-subtle px-4 sm:px-5 py-3.5 sm:py-4">
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
    </div>

    <div class="lg:hidden space-y-2 p-4 sm:p-5">
      <div v-for="tx in visibleTransactions" :key="tx.id" class="rounded-lg border border-border-subtle bg-bg-secondary p-3.5 transition-theme hover:bg-bg-secondary/80">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0 flex-1">
            <div class="text-xs text-text-muted">{{ tx.date }}</div>
            <div class="font-medium text-text text-sm mt-0.5">{{ tx.description }}</div>
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
            <div class="font-semibold text-sm tabular-nums" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
              {{ tx.type === 'ingreso' ? '+' : '-' }}{{ tx.type === 'nomina' && tx._currency === 'VES' ? formatVESEs(tx._originalAmount ?? tx.amount) : formatUSD(tx.amount) }}
            </div>
            <div v-if="tx.type === 'nomina' && tx._currency === 'VES'" class="text-xs text-text-muted tabular-nums">{{ formatUSD(tx.amount) }}</div>
            <div v-else class="text-xs text-text-muted tabular-nums">{{ formatVESInline(tx.amount, tx.exchangeRateUsed) }} Bs</div>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto hidden lg:block">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Fecha</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Descripción</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Tipo</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Método</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">Monto</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="tx in visibleTransactions" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/30">
            <td class="px-4 sm:px-5 py-3 text-text-secondary whitespace-nowrap">{{ tx.date }}</td>
            <td class="px-4 sm:px-5 py-3 font-medium text-text">{{ tx.description }}</td>
            <td class="px-4 sm:px-5 py-3">
              <span :class="['rounded-full px-2.5 py-0.5 text-xs font-semibold',
                tx.type === 'ingreso' ? 'bg-success/10 text-success' :
                tx.type === 'nomina' ? 'bg-warning/10 text-warning' :
                'bg-danger/10 text-danger'
              ]">
                {{ tx.type === 'ingreso' ? 'Ingreso' : tx.type === 'nomina' ? 'Nómina' : 'Gasto' }}
              </span>
            </td>
            <td class="px-4 sm:px-5 py-3">
              <span class="inline-flex items-center rounded-md bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-muted">{{ tx.method }}</span>
            </td>
            <td class="px-4 sm:px-5 py-3 text-right">
              <div class="font-semibold tabular-nums" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'ingreso' ? '+' : '-' }}{{ tx.type === 'nomina' && tx._currency === 'VES' ? formatVESEs(tx._originalAmount ?? tx.amount) : formatUSD(tx.amount) }}
              </div>
              <div v-if="tx.type === 'nomina' && tx._currency === 'VES'" class="text-xs text-text-muted tabular-nums">{{ formatUSD(tx.amount) }}</div>
              <div v-else class="text-xs text-text-muted tabular-nums">{{ formatVESInline(tx.amount, tx.exchangeRateUsed) }} Bs</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="canViewAllTransactions" class="border-t border-border-subtle px-4 sm:px-5 py-3 flex justify-center">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-theme hover:bg-primary/5 hover:border-primary/30"
        @click="goToAllRecords('transacciones')"
      >
        Ver todas las transacciones
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import ExpensesSection from '../components/finanzas/ExpensesSection.vue'
import EmployeePaymentsSection from '../components/finanzas/EmployeePaymentsSection.vue'
import { expensesKeys } from '../services/expensesService'
import { employeePaymentKeys } from '../services/employeePaymentsService'

const { authStore } = useAuth()
const businessStore = useBusinessStore()
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

const periodDates = computed(() => {
  const monthMatch = selectedMonth.value.match(/^(\d{4})-(\d{2})$/)
  const today = new Date()

  const toYmd = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  if (selectedPeriod.value === 'month' && monthMatch) {
    const year = Number(monthMatch[1])
    const monthIndex = Number(monthMatch[2]) - 1
    const start = new Date(year, monthIndex, 1)
    const endOfMonth = new Date(year, monthIndex + 1, 0)
    const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth()
    return {
      start: toYmd(start),
      end: toYmd(isCurrentMonth ? today : endOfMonth),
    }
  }

  if (selectedPeriod.value === 'quarter') {
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
})

const expensesCtx = useExpenses(businessId, selectedPeriod, selectedMonth)
const expenses = expensesCtx.expenses

const summaryCtx = useFinancialSummary(businessId, selectedPeriod, expenses, selectedMonth)
const paymentsCtx = useEmployeePayments(businessId, periodDates)
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
  queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
  queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-transactions', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-expenses', businessId.value] })
  queryClient.invalidateQueries({ queryKey: ['finanzas-employee-payments', businessId.value] })
}

const onExpenseSaved = () => invalidateAll()
const onPaymentSaved = () => {
  queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
}

const appointmentChargesTotal = computed(() =>
  summaryCtx.transactions.value
    .filter(tx => tx.type === 'ingreso')
    .reduce((acc, tx) => acc + Number(tx.amount ?? 0), 0)
)

const productSalesTotal = summaryCtx.productSalesTotal
const vesProductSalesTotal = summaryCtx.vesProductSalesTotal
const productSalesBreakdown = summaryCtx.productSalesBreakdown
const appointmentIncomeRows = computed(() => summaryCtx.appointmentIncomeDetails.value.slice(0, 8))
const productSalesRows = computed(() => summaryCtx.productSalesDetails.value.slice(0, 8))
</script>
