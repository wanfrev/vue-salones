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

  <!-- Nueva sección: Ingresos desglosados -->
  <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div class="rounded-xl border border-border bg-surface p-4">
      <div class="mb-2">
        <h3 class="text-base font-semibold text-text">Ingresos por Cobros de Citas</h3>
        <p class="text-sm text-text-muted">Total cobrado por servicios (periodo seleccionado)</p>
      </div>
      <div class="text-2xl font-bold text-success">{{ formatUSD(appointmentChargesTotal) }}</div>
      <div class="text-xs text-text-muted">Bs {{ formatVESInline(appointmentChargesTotal) }}</div>

      <div class="mt-4">
        <h4 class="mb-2 text-sm font-medium text-text">Detalle de cobros</h4>
        <div v-if="appointmentIncomeRows.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="py-2 text-left text-xs text-text-muted">Fecha</th>
                <th class="py-2 text-left text-xs text-text-muted">Cliente</th>
                <th class="py-2 text-left text-xs text-text-muted">Empleado</th>
                <th class="py-2 text-left text-xs text-text-muted">Servicio</th>
                <th class="py-2 text-left text-xs text-text-muted">Método</th>
                <th class="py-2 text-right text-xs text-text-muted">Monto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="item in appointmentIncomeRows" :key="item.id" class="text-xs">
                <td class="py-2 whitespace-nowrap text-text-secondary">{{ item.date }}</td>
                <td class="py-2 text-text">{{ item.client }}</td>
                <td class="py-2 text-text">{{ item.employee }}</td>
                <td class="py-2 text-text">{{ item.service }}</td>
                <td class="py-2 text-text-muted">{{ item.method }}</td>
                <td class="py-2 text-right font-medium text-success">{{ formatUSD(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-xs text-text-muted">No hay cobros de citas en este periodo.</p>
        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-theme hover:bg-bg-secondary"
            @click="goToAllRecords('cobros')"
          >
            Ver todos
          </button>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface p-4">
      <div class="mb-2">
        <h3 class="text-base font-semibold text-text">Ventas de Productos</h3>
        <p class="text-sm text-text-muted">Ingresos por venta de productos (periodo seleccionado)</p>
      </div>
      <div class="text-2xl font-bold text-success">{{ formatUSD(productSalesTotal) }}</div>
      <div class="text-xs text-text-muted">Bs {{ formatVESInline(productSalesTotal) }}</div>

      <div v-if="productSalesBreakdown.length" class="mt-3">
        <h4 class="text-sm font-medium text-text mb-2">Productos principales</h4>
        <ul class="space-y-1 text-sm text-text-muted">
          <li v-for="(p, idx) in productSalesBreakdown.slice(0,3)" :key="p.name">{{ idx+1 }}. {{ p.name }} — {{ formatUSD(p.amount) }}</li>
        </ul>
      </div>

      <div class="mt-4">
        <h4 class="mb-2 text-sm font-medium text-text">Detalle de ventas de productos</h4>
        <div v-if="productSalesRows.length" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="py-2 text-left text-xs text-text-muted">Fecha</th>
                <th class="py-2 text-left text-xs text-text-muted">Producto</th>
                <th class="py-2 text-right text-xs text-text-muted">Cantidad</th>
                <th class="py-2 text-right text-xs text-text-muted">Precio</th>
                <th class="py-2 text-right text-xs text-text-muted">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in productSalesRows" :key="row.id" class="text-xs">
                <td class="py-2 whitespace-nowrap text-text-secondary">{{ row.date }}</td>
                <td class="py-2 text-text">{{ row.product }}</td>
                <td class="py-2 text-right text-text">{{ row.quantity }}</td>
                <td class="py-2 text-right text-text">{{ formatUSD(row.unitPrice) }}</td>
                <td class="py-2 text-right font-medium text-success">{{ formatUSD(row.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-xs text-text-muted">No hay ventas de productos en este periodo.</p>
        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary transition-theme hover:bg-bg-secondary"
            @click="goToAllRecords('ventas-productos')"
          >
            Ver todos
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="mb-4">
    <ExpensesSection
      :expenses="expenses"
      :business-id="authStore.businessId"
      @saved="onExpenseSaved"
      @view-all="goToAllRecords('gastos')"
    />
  </div>

  <div class="mb-4">
    <EmployeePaymentsSection
      :employee-payments="summaryCtx.employeePayments.value"
      :payments-made="paymentsCtx.paymentsMade.value"
      :terminology="businessStore.terminology"
      :business-id="authStore.businessId"
      @saved="onPaymentSaved"
      @view-all="goToAllRecords('pagos')"
    />
  </div>

  <div class="rounded-xl border border-border bg-surface p-4">
    <div class="mb-4">
      <div>
        <h3 class="text-base font-semibold text-text">Transacciones Recientes</h3>
        <p class="text-sm text-text-muted">Últimos pagos registrados</p>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Descripción</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Tipo</th>
            <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
            <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="tx in visibleTransactions" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
            <td class="py-3 text-text-secondary whitespace-nowrap">{{ tx.date }}</td>
            <td class="py-3 font-medium text-text">{{ tx.description }}</td>
            <td class="py-3">
              <span :class="['rounded-full px-2 py-0.5 text-xs font-semibold',
                tx.type === 'ingreso' ? 'bg-success/10 text-success' :
                tx.type === 'nomina' ? 'bg-warning/10 text-warning' :
                'bg-danger/10 text-danger'
              ]">
                {{ tx.type === 'ingreso' ? 'Ingreso' : tx.type === 'nomina' ? 'Nómina' : 'Gasto' }}
              </span>
            </td>
            <td class="py-3">
              <span class="text-xs text-text-muted">{{ tx.method }}</span>
            </td>
            <td class="py-3 text-right">
              <div class="font-medium" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'ingreso' ? '' : '-' }}{{ formatUSD(tx.amount) }}
              </div>
              <div class="text-xs text-text-muted">Bs {{ formatVESInline(tx.amount) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="canViewAllTransactions" class="mt-3 flex justify-center">
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-theme hover:bg-bg-secondary"
        @click="goToAllRecords('transacciones')"
      >
        Ver todos
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
const { formatUSD, formatVESInline } = useCurrency()
const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const periods = [
  { label: 'Mes', value: 'month' as const },
  { label: 'Trimestre', value: 'quarter' as const },
  { label: 'Año', value: 'year' as const },
]
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

if (route.query.period === 'quarter' || route.query.period === 'year' || route.query.period === 'month') {
  selectedPeriod.value = route.query.period
}

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

const visibleTransactions = computed(() => summaryCtx.transactions.value.slice(0, 5))

const canViewAllTransactions = computed(() => summaryCtx.transactions.value.length > 5)

const goToAllRecords = (tipo: 'gastos' | 'pagos' | 'transacciones' | 'cobros' | 'ventas-productos') => {
  router.push({
    name: 'admin-finanzas-registros',
    params: { tipo },
    query: { period: selectedPeriod.value },
  })
}

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

// Desglose de ingresos: cobros de citas vs ventas de productos
// Sumamos las transacciones unificadas cuyo tipo es 'ingreso' (pagos de citas)
const appointmentChargesTotal = computed(() =>
  summaryCtx.transactions.value
    .filter(tx => tx.type === 'ingreso')
    .reduce((acc, tx) => acc + Number(tx.amount ?? 0), 0)
)

const productSalesTotal = summaryCtx.productSalesTotal
const productSalesBreakdown = summaryCtx.productSalesBreakdown
const appointmentIncomeRows = computed(() => summaryCtx.appointmentIncomeDetails.value.slice(0, 8))
const productSalesRows = computed(() => summaryCtx.productSalesDetails.value.slice(0, 8))
</script>
