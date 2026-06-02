<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
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
              {{ payInfo.typeLabel }} · {{ payInfo.percentage }}% comisión
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
          <!-- Summary -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Servicios</p>
              <p class="text-xl font-bold text-text mt-0.5">{{ earnings.length }}</p>
            </div>
            <div class="rounded-lg bg-bg-secondary p-3">
              <p class="text-xs text-text-muted uppercase tracking-wider">Total facturado</p>
              <p class="text-xl font-bold text-text mt-0.5">${{ totalBilled }}</p>
            </div>
          </div>

          <!-- Earnings Breakdown -->
          <div class="space-y-2 mb-6">
            <div class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Total facturado en servicios</span>
              <span class="font-medium text-text">${{ totalBilled }}</span>
            </div>
            <div class="flex justify-between py-2 text-sm">
              <span class="text-text-muted">Comisión del empleado</span>
              <span class="font-medium text-text">{{ payInfo?.percentage || 0 }}%</span>
            </div>
            <div class="border-t border-border pt-3 flex justify-between">
              <span class="font-semibold text-text text-base">Total a cobrar</span>
              <span class="font-bold text-primary text-lg">${{ totalEarned }}</span>
            </div>
          </div>

          <!-- Payments Received -->
          <div v-if="payments.length > 0" class="border-t border-border pt-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Pagos realizados</p>
            <div v-for="p in payments" :key="p.id" class="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <div>
                <p class="text-sm font-medium text-text">${{ Number(p.amount).toFixed(2) }}</p>
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
            class="mt-6 w-full rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text flex items-center justify-center gap-2"
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
import { getInitials, formatMethod, formatDate, formatNumber } from '../../lib/formatters'
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
  const typeLabel = type === 'salary' ? 'Sueldo base' : type === 'mixed' ? 'Sueldo + %' : 'Porcentaje'
  return { type, percentage, typeLabel }
})

const initials = computed(() => getInitials(authStore.profile?.full_name))

const { data: earningsData, isLoading: loadingEarnings } = useQuery({
  queryKey: dashboardKeys.earnings(businessId.value, employeeId.value),
  queryFn: () => listEmployeeTransactions(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const earnings = computed(() => earningsData.value ?? [])

const totalBilled = computed(() =>
  formatNumber(earnings.value.reduce((sum, r) => sum + r.totalAmount, 0))
)
const totalEarned = computed(() =>
  earnings.value.reduce((sum, r) => sum + r.employeeEarnings, 0).toFixed(2)
)

const { data: paymentsData } = useQuery({
  queryKey: dashboardKeys.payments(businessId.value, employeeId.value),
  queryFn: () => listEmployeePayments(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const payments = computed(() => paymentsData.value ?? [])

const windowPrint = () => {
  window.print()
}
</script>
