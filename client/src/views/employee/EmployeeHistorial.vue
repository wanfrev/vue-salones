<template>
  <AppLayout>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-text">Servicios realizados</h2>
          <p class="text-sm text-text-muted">Historial de servicios que has completado</p>
        </div>
        <span class="text-sm font-medium text-text-muted">{{ historyAppointments.length }} servicios</span>
      </div>

      <div v-if="loadingHistory" class="flex items-center justify-center py-12">
        <svg class="h-6 w-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      <div v-else-if="historyAppointments.length === 0" class="rounded-lg border border-border bg-surface p-8 text-center">
        <p class="text-sm text-text-muted">Aún no tienes servicios realizados.</p>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-border bg-surface">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-bg-secondary">
              <th class="px-4 py-3 text-left font-medium text-text-muted">Fecha</th>
              <th class="px-4 py-3 text-left font-medium text-text-muted">Cliente</th>
              <th class="px-4 py-3 text-left font-medium text-text-muted">Servicio</th>
              <th class="px-4 py-3 text-right font-medium text-text-muted">Precio</th>
              <th class="px-4 py-3 text-center font-medium text-text-muted">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="appt in historyAppointments" :key="appt.id" class="transition-colors hover:bg-bg-secondary/50">
              <td class="px-4 py-3 text-text">
                <span class="block text-sm">{{ appt.date }}</span>
                <span class="block text-xs text-text-muted">{{ appt.time }}</span>
              </td>
              <td class="px-4 py-3 font-medium text-text">{{ appt.clientName }}</td>
              <td class="px-4 py-3 text-text-secondary">{{ appt.serviceName }}</td>
              <td class="px-4 py-3 text-right font-medium text-text">${{ appt.servicePrice }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  :class="[
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    statusStyles[appt.status] || statusStyles.confirmed
                  ]"
                >
                  {{ statusLabels[appt.status] || 'Confirmada' }}
                </span>
              </td>
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
import { listEmployeeAppointments } from '../../services/employeeDashboardService'
import AppLayout from '../../components/layout/AppLayout.vue'

const authStore = useAuthStore()
const businessId = computed(() => authStore.businessId)
const employeeId = computed(() => authStore.profile?.id ?? '')

const { data: historyData, isLoading: loadingHistory } = useQuery({
  queryKey: ['employee-history', businessId, employeeId],
  queryFn: () => listEmployeeAppointments(businessId.value!, employeeId.value!),
  enabled: computed(() => !!businessId.value && !!employeeId.value),
})
const historyAppointments = computed(() => historyData.value ?? [])

const statusStyles: Record<string, string> = {
  confirmed: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  paid: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger/10 text-danger',
}
const statusLabels: Record<string, string> = {
  confirmed: 'Confirmada',
  completed: 'Completada',
  paid: 'Pagada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
}
</script>
