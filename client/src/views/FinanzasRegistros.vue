<template>
  <section class="space-y-4">
    <header class="rounded-xl border border-border bg-surface p-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-primary">Finanzas</p>
          <h1 class="text-xl font-bold text-text">{{ title }}</h1>
          <p class="text-sm text-text-muted">Vista completa de registros del periodo {{ periodLabel }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
            @click="goBack"
          >
            Volver a finanzas
          </button>
        </div>
      </div>
    </header>

    <div v-if="tipo === 'gastos'" class="rounded-xl border border-border bg-surface p-4">
      <h2 class="mb-3 text-base font-semibold text-text">Gastos del periodo</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-subtle">
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Concepto</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Categoría</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="expense in expensesCtx.expenses.value" :key="expense.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
              <td class="py-3 text-text-secondary">{{ expense.date }}</td>
              <td class="py-3 font-medium text-text">{{ expense.name }}</td>
              <td class="py-3 text-text-secondary">{{ expense.category }}</td>
              <td class="py-3 text-right">
                <div class="font-medium text-text">{{ expense.currency === 'VES' ? formatVESEs(expense.originalAmount) : formatUSD(expense.amount) }}</div>
                <div class="text-xs text-text-muted">{{ expense.currency === 'VES' ? formatUSD(expense.amount) : formatVESInline(expense.amount) + ' Bs' }}</div>
              </td>
              <td class="py-3 text-center">
                <button @click="expensesCtx.handleDelete(expense.id)" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-danger/10 hover:text-danger" title="Eliminar gasto">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="expensesCtx.expenses.value.length === 0">
              <td colspan="5" class="py-6 text-center text-sm text-text-muted">No hay gastos para este periodo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="tipo === 'pagos'" class="space-y-4">
      <div class="rounded-xl border border-border bg-surface p-4">
        <h2 class="mb-3 text-base font-semibold text-text">Servicios y comisiones por empleado</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.employee || 'Empleado' }}</th>
                <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.service || 'Servicio' }}</th>
                <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Costo</th>
                <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">% {{ terminology.employee || 'Empleado' }}</th>
                <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Comisión</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="payment in summaryCtx.employeePayments.value" :key="payment.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                <td class="py-3 font-medium text-text">{{ payment.employee }}</td>
                <td class="py-3 text-text-secondary">{{ payment.service }}</td>
                <td class="py-3 text-right">{{ formatUSD(payment.amount) }}</td>
                <td class="py-3 text-right text-text-secondary">{{ payment.percentage }}%</td>
                <td class="py-3 text-right font-semibold text-success">{{ formatUSD(payment.earnings) }}</td>
              </tr>
              <tr v-if="summaryCtx.employeePayments.value.length === 0">
                <td colspan="5" class="py-6 text-center text-sm text-text-muted">No hay servicios con comisión en este periodo.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-surface p-4">
        <h2 class="mb-3 text-base font-semibold text-text">Pagos realizados</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
                <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ terminology.employee || 'Empleado' }}</th>
                <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
              <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="ep in paymentsCtx.paymentsMade.value" :key="ep.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                <td class="py-3 text-text-secondary whitespace-nowrap">{{ ep.paymentDate }}</td>
                <td class="py-3 font-medium text-text">{{ ep.employeeName }}</td>
                <td class="py-3 text-text-secondary">{{ formatMethod(ep.paymentMethod) }}</td>
                <td class="py-3 text-right font-medium text-danger">{{ formatUSD(ep.amount) }}</td>
              </tr>
              <tr v-if="paymentsCtx.paymentsMade.value.length === 0">
                <td colspan="4" class="py-6 text-center text-sm text-text-muted">No hay pagos registrados en este periodo.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="tipo === 'cobros'" class="rounded-xl border border-border bg-surface p-4">
      <h2 class="mb-3 text-base font-semibold text-text">Cobros de citas del periodo</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-subtle">
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Cliente</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Empleado</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Servicio</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="row in summaryCtx.appointmentIncomeDetails.value" :key="row.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
              <td class="py-3 text-text-secondary whitespace-nowrap">{{ row.date }}</td>
              <td class="py-3 font-medium text-text">{{ row.client }}</td>
              <td class="py-3 text-text">{{ row.employee }}</td>
              <td class="py-3 text-text-secondary">{{ row.service }}</td>
              <td class="py-3 text-text-secondary">{{ row.method }}</td>
              <td class="py-3 text-right">
                <template v-if="summaryCtx.editingTransaction.value?.id === row.id">
                  <div class="flex items-center gap-1 justify-end">
                    <input
                      type="number"
                      :value="summaryCtx.editingAmount.value"
                      @input="summaryCtx.editingAmount.value = Number(($event.target as HTMLInputElement).value)"
                      class="w-24 rounded-md border border-border bg-input px-2 py-1 text-right text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0.01"
                      step="0.01"
                    />
                    <button type="button" class="rounded-md bg-success/10 p-1 text-success transition-theme hover:bg-success/20" title="Guardar" @click="summaryCtx.saveEdit()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button type="button" class="rounded-md bg-danger/10 p-1 text-danger transition-theme hover:bg-danger/20" title="Cancelar" @click="summaryCtx.cancelEdit()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </template>
                <span v-else class="font-medium text-success">{{ formatUSD(row.amount) }}</span>
              </td>
              <td class="py-3 text-right">
                <div class="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    class="rounded-md bg-primary/10 p-1.5 text-primary transition-theme hover:bg-primary/20"
                    title="Editar monto"
                    @click="summaryCtx.startEdit(row)"
                    :disabled="summaryCtx.editTransactionMutation.isPending.value || summaryCtx.deleteTransactionMutation.isPending.value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-danger/10 p-1.5 text-danger transition-theme hover:bg-danger/20"
                    title="Eliminar cobro"
                    @click="summaryCtx.confirmDeleteTransaction(row.id)"
                    :disabled="summaryCtx.editTransactionMutation.isPending.value || summaryCtx.deleteTransactionMutation.isPending.value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="summaryCtx.appointmentIncomeDetails.value.length === 0">
              <td colspan="7" class="py-6 text-center text-sm text-text-muted">No hay cobros de citas en este periodo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="tipo === 'ventas-productos'" class="rounded-xl border border-border bg-surface p-4">
      <h2 class="mb-3 text-base font-semibold text-text">Ventas de productos del periodo</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-subtle">
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Producto</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Cantidad</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Precio unitario</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="row in summaryCtx.productSalesDetails.value" :key="row.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
              <td class="py-3 text-text-secondary whitespace-nowrap">{{ row.date }}</td>
              <td class="py-3 font-medium text-text">{{ row.product }}</td>
              <td class="py-3 text-right text-text">{{ row.quantity }}</td>
              <td class="py-3 text-right text-text">{{ formatUSD(row.unitPrice) }}</td>
              <td class="py-3 text-right font-medium text-success">{{ formatUSD(row.total) }}</td>
            </tr>
            <tr v-if="summaryCtx.productSalesDetails.value.length === 0">
              <td colspan="5" class="py-6 text-center text-sm text-text-muted">No hay ventas de productos en este periodo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="rounded-xl border border-border bg-surface p-4">
      <h2 class="mb-3 text-base font-semibold text-text">Transacciones del periodo</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border-subtle">
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Descripción</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Tipo</th>
              <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
              <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="tx in summaryCtx.allTransactions.value" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
              <td class="py-3 text-text-secondary whitespace-nowrap">{{ tx.date }}</td>
              <td class="py-3 font-medium text-text">{{ tx.description }}</td>
              <td class="py-3">
                <span :class="[
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  tx.type === 'ingreso' ? 'bg-success/10 text-success' :
                  tx.type === 'nomina' ? 'bg-warning/10 text-warning' :
                  'bg-danger/10 text-danger'
                ]">
                  {{ tx.type === 'ingreso' ? 'Ingreso' : tx.type === 'nomina' ? 'Nomina' : 'Gasto' }}
                </span>
              </td>
              <td class="py-3 text-text-secondary">{{ tx.method }}</td>
              <td class="py-3 text-right font-medium" :class="tx.type === 'ingreso' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'ingreso' ? '' : '-' }}{{ formatUSD(tx.amount) }}
              </td>
              <td class="py-3 text-right">
                <div v-if="tx.type === 'ingreso'" class="flex items-center gap-1 justify-end">
                  <button
                    type="button"
                    class="rounded-md bg-primary/10 p-1.5 text-primary transition-theme hover:bg-primary/20"
                    title="Editar cobro"
                    @click="() => { const row = summaryCtx.transactionsAll.value.find(r => r.id === tx.id); if (row) summaryCtx.startEdit(row) }"
                    :disabled="summaryCtx.editTransactionMutation.isPending.value || summaryCtx.deleteTransactionMutation.isPending.value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-danger/10 p-1.5 text-danger transition-theme hover:bg-danger/20"
                    title="Eliminar cobro"
                    @click="summaryCtx.confirmDeleteTransaction(tx.id)"
                    :disabled="summaryCtx.editTransactionMutation.isPending.value || summaryCtx.deleteTransactionMutation.isPending.value"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <span v-else class="text-xs text-text-muted">—</span>
              </td>
            </tr>
            <tr v-if="summaryCtx.allTransactions.value.length === 0">
              <td colspan="6" class="py-6 text-center text-sm text-text-muted">No hay transacciones en este periodo.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useBusinessStore } from '../store/business'
import { useFinancialSummary } from '../composables/useFinancialSummary'
import { useExpenses } from '../composables/useExpenses'
import { useEmployeePayments } from '../composables/useEmployeePayments'
import { formatMethod } from '../lib/formatters'

type PeriodValue = 'month' | 'quarter' | 'year'
type TipoRegistros = 'gastos' | 'pagos' | 'transacciones' | 'cobros' | 'ventas-productos'

const route = useRoute()
const router = useRouter()
const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { formatUSD, formatVESInline, formatVESEs } = useCurrency()
const terminology = businessStore.terminology

const selectedPeriod = ref<PeriodValue>('month')
const selectedMonth = ref<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)

watch(
  () => route.query.period,
  (value) => {
    if (value === 'quarter' || value === 'year' || value === 'month') {
      selectedPeriod.value = value
      return
    }
    selectedPeriod.value = 'month'
  },
  { immediate: true },
)

watch(
  () => route.query.month,
  (value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
      selectedMonth.value = value
    }
  },
  { immediate: true },
)

const tipo = computed<TipoRegistros>(() => {
  const raw = route.params.tipo
  if (raw === 'gastos' || raw === 'pagos' || raw === 'transacciones' || raw === 'cobros' || raw === 'ventas-productos') return raw
  return 'transacciones'
})

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
const summaryCtx = useFinancialSummary(businessId, selectedPeriod, expensesCtx.expenses, selectedMonth)
const paymentsCtx = useEmployeePayments(businessId, periodDates)

const title = computed(() => {
  if (tipo.value === 'gastos') return 'Todos los gastos'
  if (tipo.value === 'pagos') return 'Todos los pagos a empleados'
  if (tipo.value === 'cobros') return 'Todos los cobros de citas'
  if (tipo.value === 'ventas-productos') return 'Todas las ventas de productos'
  return 'Todas las transacciones'
})

const periodLabel = computed(() => {
  if (selectedPeriod.value === 'quarter') return 'trimestral'
  if (selectedPeriod.value === 'year') return 'anual'
  return `mensual (${selectedMonth.value})`
})

const goBack = () => {
  router.push({
    name: 'admin-finanzas',
    query: { period: selectedPeriod.value, month: selectedMonth.value },
  })
}
</script>
