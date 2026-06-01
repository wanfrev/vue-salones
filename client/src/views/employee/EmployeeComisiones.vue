<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-border bg-surface p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Servicios realizados</p>
          <p class="mt-1 text-2xl font-bold text-text">{{ earnings.length }}</p>
        </div>
        <div class="rounded-xl border border-border bg-surface p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Total facturado</p>
          <p class="mt-1 text-2xl font-bold text-text">${{ totalBilled }}</p>
        </div>
        <div class="rounded-xl border border-border bg-surface p-4">
          <p class="text-xs font-medium uppercase tracking-wider text-text-muted">Tus ganancias</p>
          <p class="mt-1 text-2xl font-bold text-primary">${{ totalEarned }}</p>
          <p v-if="payInfo" class="mt-0.5 text-xs text-text-muted">
            Comisión: {{ payInfo.percentage }}%
          </p>
        </div>
      </div>

      <!-- Earnings Table -->
      <div class="overflow-hidden rounded-xl border border-border bg-surface">
        <div class="border-b border-border bg-bg-secondary px-4 py-3">
          <h3 class="text-sm font-semibold text-text">Detalle de ganancias</h3>
        </div>

        <div v-if="loadingEarnings" class="flex items-center justify-center py-8">
          <svg class="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>

        <div v-else-if="earnings.length === 0" class="p-8 text-center text-sm text-text-muted">
          Aún no tienes transacciones registradas.
        </div>

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-bg-secondary">
              <th class="px-4 py-2.5 text-left font-medium text-text-muted">Fecha</th>
              <th class="px-4 py-2.5 text-left font-medium text-text-muted">Cliente</th>
              <th class="px-4 py-2.5 text-left font-medium text-text-muted">Servicio</th>
              <th class="px-4 py-2.5 text-right font-medium text-text-muted">Total</th>
              <th class="px-4 py-2.5 text-right font-medium text-text-muted">%</th>
              <th class="px-4 py-2.5 text-right font-medium text-text-muted">Ganancia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in earnings" :key="row.id" class="transition-colors hover:bg-bg-secondary/50">
              <td class="px-4 py-2.5 text-text-secondary">{{ row.date }}</td>
              <td class="px-4 py-2.5 font-medium text-text">{{ row.clientName }}</td>
              <td class="px-4 py-2.5 text-text-secondary">{{ row.serviceName }}</td>
              <td class="px-4 py-2.5 text-right text-text">${{ row.totalAmount }}</td>
              <td class="px-4 py-2.5 text-right text-text-secondary">{{ row.employeePercentage }}%</td>
              <td class="px-4 py-2.5 text-right font-semibold text-success">${{ row.employeeEarnings.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment Records -->
      <div v-if="payments.length > 0" class="overflow-hidden rounded-xl border border-border bg-surface">
        <div class="border-b border-border bg-bg-secondary px-4 py-3">
          <h3 class="text-sm font-semibold text-text">Pagos recibidos</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-bg-secondary">
              <th class="px-4 py-2.5 text-left font-medium text-text-muted">Fecha</th>
              <th class="px-4 py-2.5 text-right font-medium text-text-muted">Monto</th>
              <th class="px-4 py-2.5 text-left font-medium text-text-muted">Método</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="p in payments" :key="p.id" class="transition-colors hover:bg-bg-secondary/50">
              <td class="px-4 py-2.5 text-text-secondary">{{ new Date(p.payment_date).toLocaleDateString('es-ES') }}</td>
              <td class="px-4 py-2.5 text-right font-semibold text-text">${{ Number(p.amount).toFixed(2) }}</td>
              <td class="px-4 py-2.5 text-text-secondary capitalize">{{ p.payment_method }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAuthStore } from '../../store/auth'
import { listEmployeeTransactions, listEmployeePayments } from '../../services/employeeDashboardService'
import AppLayout from '../../components/layout/AppLayout.vue'

const authStore = useAuthStore()
const businessId = computed(() => authStore.businessId)
const employeeId = computed(() => authStore.profile?.id ?? '')

const payInfo = computed(() => {
  const profile = authStore.profile
  if (!profile) return null
  const type = (profile as any).pay_type ?? 'percentage'
  const percentage = Number((profile as any).pay_percentage ?? 50)
  const typeLabel = type === 'salary' ? 'Sueldo base' : type === 'mixed' ? 'Sueldo + %' : 'Porcentaje'
  return { type, percentage, typeLabel }
})

const { data: earningsData, isLoading: loadingEarnings } = useQuery({
  queryKey: ['employee-earnings', businessId, employeeId],
  queryFn: () => listEmployeeTransactions(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const earnings = computed(() => earningsData.value ?? [])

const totalBilled = computed(() =>
  earnings.value.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()
)
const totalEarned = computed(() =>
  earnings.value.reduce((sum, r) => sum + r.employeeEarnings, 0).toFixed(2)
)

const { data: paymentsData } = useQuery({
  queryKey: ['employee-payments', businessId, employeeId],
  queryFn: () => listEmployeePayments(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const payments = computed(() => paymentsData.value ?? [])
</script>
