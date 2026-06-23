<template>
  <AppLayout>
    <div id="recibo-content" class="max-w-2xl mx-auto">
      <div class="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <!-- Header -->
        <div class="text-center border-b border-border pb-6 mb-6">
          <h2 class="text-xl font-bold text-text">{{ businessName || 'Salón' }}</h2>
          <p class="text-sm text-text-muted mt-1">Recibo de pago</p>
        </div>

        <!-- Employee Info -->
        <div class="flex items-center gap-4 mb-6">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {{ initials }}
          </div>
          <div>
            <p class="font-semibold text-text text-lg">{{ authStore.profile?.full_name }}</p>
            <p v-if="payInfo" class="text-sm text-text-muted">
              {{ payInfo.typeLabel }}
              <template v-if="payInfo.type === 'percentage'"> · {{ payInfo.percentage }}% comisión</template>
              <template v-else-if="payInfo.type === 'mixed'"> · {{ payInfo.percentage }}% comisión + ${{ payInfo.baseSalary.toFixed(2) }} base</template>
              <template v-else-if="payInfo.type === 'salary'"> · ${{ payInfo.baseSalary.toFixed(2) }} mensual</template>
            </p>
          </div>
        </div>

        <div v-if="loadingEarnings" class="flex items-center justify-center py-8">
          <svg class="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <template v-else>
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Servicios</p>
              <p class="text-xl font-bold text-text mt-0.5">{{ earnings.length }}</p>
            </div>
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Total facturado</p>
              <p class="text-xl font-bold text-text mt-0.5">${{ totalBilled }}</p>
              <p class="text-xs text-text-muted mt-0.5">{{ totalBilledVES }}</p>
            </div>
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Monto pagado</p>
              <p class="text-xl font-bold text-success mt-0.5">${{ totalPaidFormatted }}</p>
              <p class="text-xs text-text-muted mt-0.5">{{ totalPaidVES }}</p>
            </div>
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Total a cobrar</p>
              <p class="text-xl font-bold text-primary mt-0.5">${{ totalEarned }}</p>
              <p class="text-xs text-text-muted mt-0.5">{{ totalEarnedVES }}</p>
            </div>
          </div>

          <!-- Earnings Breakdown Table -->
          <div v-if="earningsWithVES.length > 0" class="mb-6">
            <div class="border-b border-border pb-2 mb-3">
              <h3 class="text-sm font-semibold text-text">Desglose de ganancias</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border">
                    <th class="py-2 pr-2 text-left font-medium text-text-muted whitespace-nowrap">Fecha</th>
                    <th class="py-2 pr-2 text-left font-medium text-text-muted">Servicio</th>
                    <th class="py-2 px-2 text-right font-medium text-text-muted">Total</th>
                    <th class="py-2 px-2 text-right font-medium text-text-muted">Total Bs</th>
                    <th class="py-2 px-2 text-center font-medium text-text-muted whitespace-nowrap">Moneda</th>
                    <th class="py-2 px-2 text-center font-medium text-text-muted">%</th>
                    <th class="py-2 pl-2 text-right font-medium text-text-muted">Ganancia</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="row in earningsWithVES" :key="row.id">
                    <td class="py-2 pr-2 text-text-secondary whitespace-nowrap">{{ formatDate(row.paidAt) }}</td>
                    <td class="py-2 pr-2 text-text">{{ row.serviceName }}</td>
                    <td class="py-2 px-2 text-right text-text-secondary">${{ row.totalAmount.toFixed(2) }}</td>
                    <td class="py-2 px-2 text-right text-text-secondary">{{ formatVESEs(row.vesTotal) }}</td>
                    <td class="py-2 px-2 text-center">
                      <span v-if="row.currency === 'VES'" class="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                        Bs @ {{ row.exchangeRateUsed.toFixed(2) }}
                      </span>
                      <span v-else class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        USD
                      </span>
                    </td>
                    <td class="py-2 px-2 text-center text-text-secondary">{{ row.employeePercentage }}%</td>
                    <td class="py-2 pl-2 text-right font-semibold text-success">
                      <div>${{ row.employeeEarnings.toFixed(2) }}</div>
                      <div class="text-xs text-text-muted font-normal">{{ formatVESEs(row.vesEarnings) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals -->
          <div class="space-y-2 mb-6">
            <div class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Total facturado en servicios</span>
              <div class="text-right">
                <span class="font-medium text-text">${{ totalBilled }}</span>
                <p class="text-xs text-text-muted">{{ totalBilledVES }}</p>
              </div>
            </div>
            <div v-if="payInfo && payInfo.baseSalary > 0" class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Sueldo base</span>
              <div class="text-right">
                <span class="font-medium text-text">${{ payInfo.baseSalary.toFixed(2) }}</span>
                <p class="text-xs text-text-muted">{{ formatVES(payInfo.baseSalary) }}</p>
              </div>
            </div>
            <div v-if="payInfo && payInfo.type !== 'salary'" class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Comisión del empleado</span>
              <span class="font-medium text-text">{{ payInfo.percentage }}%</span>
            </div>
            <div v-if="payInfo && payInfo.type === 'percentage' && earningsWithVES.length > 0" class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Ganancia por comisión</span>
              <div class="text-right">
                <span class="font-medium text-text">${{ totalVariableEarned }}</span>
              </div>
            </div>
            <div class="border-t border-border pt-3 flex justify-between">
              <span class="font-semibold text-text text-base">Total a cobrar</span>
              <div class="text-right">
                <span class="font-bold text-primary text-lg">${{ totalEarned }}</span>
                <p class="text-xs text-text-muted">{{ totalEarnedVES }}</p>
              </div>
            </div>
          </div>

          <!-- Debt Summary -->
          <div class="rounded-lg border border-border bg-bg-secondary p-4 mb-6">
            <h3 class="text-sm font-semibold text-text mb-3">Resumen de deuda</h3>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-text-muted">Total a cobrar</span>
                <div class="text-right">
                  <span class="font-medium text-text">${{ totalEarned }}</span>
                  <p class="text-xs text-text-muted">{{ totalEarnedVES }}</p>
                </div>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-text-muted">Monto pagado</span>
                <div class="text-right">
                  <span class="font-medium text-success">${{ totalPaidFormatted }}</span>
                  <p class="text-xs text-text-muted">{{ totalPaidVES }}</p>
                </div>
              </div>
              <div class="border-t border-border pt-2 flex justify-between">
                <span class="font-semibold text-sm text-text">Deuda pendiente</span>
                <div class="text-right">
                  <span :class="['font-bold text-sm', pendingDebt > 0 ? 'text-danger' : 'text-success']">
                    ${{ pendingDebtFormatted }}
                  </span>
                  <p class="text-xs" :class="pendingDebt > 0 ? 'text-danger/70' : 'text-success/70'">{{ pendingDebtVES }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payments Received -->
          <div v-if="payments.length > 0" class="border-t border-border pt-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Pagos realizados</p>
            <div v-for="p in paymentsWithCurrency" :key="p.id" class="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <div>
                <p class="text-sm font-medium text-text">{{ p.displayAmount }}</p>
                <p class="text-xs text-text-muted">{{ p.displayVES }}</p>
                <p class="text-xs text-text-muted">{{ formatDate(p.payment_date) }} · {{ formatMethod(p.payment_method) }}</p>
              </div>
              <span class="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">Pagado</span>
            </div>
          </div>

          <div v-else class="border-t border-border pt-4 text-center text-sm text-text-muted">
            No hay pagos registrados aún.
          </div>

          <button
            @click="windowPrint"
            class="no-print mt-6 w-full rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text flex items-center justify-center gap-2"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir recibo
          </button>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '../../store/auth'
import { useBusinessStore } from '../../store/business'
import { getInitials, formatMethod, formatDate } from '../../lib/formatters'
import { useCurrency } from '../../composables/useCurrency'
import { dashboardKeys, listEmployeeTransactions, listEmployeePayments } from '../../services/employeeDashboardService'
import AppLayout from '../../components/layout/AppLayout.vue'

const authStore = useAuthStore()
const businessStore = useBusinessStore()
const businessId = computed(() => authStore.businessId)
const employeeId = computed(() => authStore.profile?.id ?? '')
const businessName = computed(() => businessStore.business?.name ?? '')

const payInfo = computed(() => {
  const profile = authStore.profile
  if (!profile) return null
  const type = (profile as any).pay_type ?? 'percentage'
  const percentage = Number((profile as any).pay_percentage ?? 50)
  const baseSalary = Number((profile as any).base_salary ?? 0)
  const typeLabel = type === 'salary' ? 'Sueldo base' : type === 'mixed' ? 'Sueldo + %' : 'Porcentaje'
  return { type, percentage, baseSalary, typeLabel }
})

const initials = computed(() => getInitials(authStore.profile?.full_name))

const { data: earningsData, isLoading: loadingEarnings } = useQuery({
  queryKey: dashboardKeys.earnings(businessId.value, employeeId.value),
  queryFn: () => listEmployeeTransactions(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const earnings = computed(() => earningsData.value ?? [])

const earningsWithVES = computed(() =>
  earnings.value.map(row => {
    const rate = exchangeRate.value
    const isVES = row.currency === 'VES'
    const vesTotal = isVES ? row.totalAmount * row.exchangeRateUsed : row.totalAmount * rate
    const vesEarnings = isVES ? row.employeeEarnings * row.exchangeRateUsed : row.employeeEarnings * rate
    return { ...row, vesTotal, vesEarnings }
  })
)

const totalBilled = computed(() =>
  earnings.value.reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2)
)

const totalBilledVES = computed(() =>
  formatVES(Number(totalBilled.value))
)

const totalVariableEarned = computed(() =>
  earnings.value.reduce((sum, r) => sum + r.employeeEarnings, 0).toFixed(2)
)

const totalEarned = computed(() => {
  const info = payInfo.value
  let total = 0
  for (const r of earnings.value) {
    total += r.employeeEarnings
  }
  if (info && (info.type === 'salary' || info.type === 'mixed')) {
    total += info.baseSalary
  }
  return total.toFixed(2)
})

const totalEarnedVES = computed(() =>
  formatVES(Number(totalEarned.value))
)

const { data: paymentsData } = useQuery({
  queryKey: dashboardKeys.payments(businessId.value, employeeId.value),
  queryFn: () => listEmployeePayments(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const payments = computed(() => paymentsData.value ?? [])
const { formatUSD, formatVES, formatVESEs, exchangeRate } = useCurrency()

const paymentsWithCurrency = computed(() => {
  return (paymentsData.value ?? []).map((p: any) => {
    let currency: 'USD' | 'VES' = 'USD'
    let originalAmount = Number(p.amount)
    const notes = p.notes ?? ''
    const vesMatch = notes.match(/^\[VES:(\d+(?:\.\d+)?)\]/)
    if (vesMatch) {
      currency = 'VES'
      originalAmount = Number(vesMatch[1])
    }
    const usdMatch = !vesMatch && notes.match(/^\[USD:(\d+(?:\.\d+)?)\]/)
    if (usdMatch) {
      currency = 'USD'
      originalAmount = Number(usdMatch[1])
    }
    const usdAmount = Number(p.amount)
    const displayVES = currency === 'VES' ? formatVESEs(originalAmount) : formatVES(usdAmount)
    const displayAmount = currency === 'VES' ? formatVESEs(originalAmount) : formatUSD(usdAmount)
    return {
      ...p,
      currency,
      originalAmount,
      displayAmount,
      displayVES: currency === 'VES' ? formatUSD(usdAmount) : displayVES,
    }
  })
})

const totalPaid = computed(() =>
  payments.value.reduce((sum, p) => sum + Number(p.amount), 0)
)

const totalPaidFormatted = computed(() => totalPaid.value.toFixed(2))

const pendingDebt = computed(() =>
  Math.max(0, Number(totalEarned.value) - totalPaid.value)
)

const pendingDebtFormatted = computed(() => pendingDebt.value.toFixed(2))

const totalPaidVES = computed(() => formatVES(totalPaid.value))

const pendingDebtVES = computed(() => formatVES(pendingDebt.value))

const windowPrint = () => {
  window.print()
}
</script>

<style scoped>
.no-print {
  /* scoped placeholder - overridden by global @media print */
}
</style>

<style>
@media print {
  @page { size: auto; margin: 10mm; }

  html, body {
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  header, aside, nav, footer {
    display: none !important;
  }

  main {
    margin-left: 0 !important;
    padding-top: 0 !important;
  }

  main > div {
    padding: 0 !important;
  }

  .no-print {
    display: none !important;
  }

  /* Hide mobile overlay */
  .fixed.inset-0 {
    display: none !important;
  }

  /* Hide fixed elements that aren't the receipt */
  .min-h-screen > .fixed {
    display: none !important;
  }
}
</style>
