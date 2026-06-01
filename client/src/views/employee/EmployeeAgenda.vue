<template>
  <AppLayout>
    <template #header-actions>
      <button
        @click="handleNewCita"
        class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Nueva {{ t.appointment?.toLowerCase() || 'cita' }}</span>
      </button>
    </template>

    <div class="h-[calc(100vh-120px)] min-h-[500px]">
      <AgendaCalendar
        @event-click="handleEventClick"
        @status-change="handleStatusChange"
        @event-change="handleEventChange"
        @slot-select="handleSlotSelect"
      />
    </div>
  </AppLayout>

  <CitaFormModal
    ref="citaModalRef"
    :servicios="serviciosList"
    :empleados="empleadosList"
    @save="handleSaveCita"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import { saveCita, updateCitaStatus, updateAppointmentTime } from '../../services/agendaService'
import { listServicios, serviciosKeys } from '../../services/serviciosService'
import { listEquipo, equipoKeys } from '../../services/equipoService'
import type { CitaFormData } from '../../types/cita'
import AppLayout from '../../components/layout/AppLayout.vue'
import AgendaCalendar from '../../components/agenda/AgendaCalendar.vue'
import { CitaFormModal } from '../../components/modals'

const authStore = useAuthStore()
const { success, error: showError } = useNotification()
const queryClient = useQueryClient()

const t = computed(() => authStore.terminology)
const businessId = computed(() => authStore.businessId)

const citaModalRef = ref<InstanceType<typeof CitaFormModal> | null>(null)

const { data: serviciosData } = useQuery({
  queryKey: computed(() => serviciosKeys.all(businessId.value)),
  queryFn: () => listServicios(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const { data: empleadosData } = useQuery({
  queryKey: computed(() => equipoKeys.all(businessId.value)),
  queryFn: () => listEquipo(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const serviciosList = computed(() => (serviciosData.value ?? []).map(s => ({
  id: s.id, name: s.name, price: s.price, duration: s.duration,
})))

const empleadosList = computed(() => (empleadosData.value ?? []).map(e => ({
  id: e.id, name: e.name,
})))

const handleNewCita = () => {
  citaModalRef.value?.open()
}

const handleSlotSelect = ({ start }: { start: Date }) => {
  const date = start.toISOString().split('T')[0]
  const time = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  citaModalRef.value?.open({ id: '', clientName: '', service: '', employee: '', date, time, duration: 30, price: 0, status: 'confirmed' })
}

const handleEventClick = () => {}

const handleEventChange = async ({ id, start, end }: { id: string; start: string; end: string }) => {
  try {
    await updateAppointmentTime(id, start, end)
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    success('Cita reagendada correctamente')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al reagendar')
  }
}

const handleStatusChange = async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'paid' }) => {
  const labels: Record<string, string> = {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    paid: 'Pagada',
  }
  try {
    await updateCitaStatus(id, status)
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    success(`Estado actualizado a ${labels[status] || status}`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al actualizar estado')
  }
}

const saveCitaMutation = useMutation({
  mutationFn: (data: CitaFormData & { id?: string; clientPhone?: string }) => saveCita(
    businessId.value!,
    data,
    authStore.profile?.id
  ),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
    citaModalRef.value?.close()
    citaModalRef.value?.onSaveComplete()
    success('Cita guardada correctamente')
  },
  onError: (err) => {
    citaModalRef.value?.onSaveComplete()
    showError(err instanceof Error ? err.message : 'Error al guardar la cita')
  },
})

const handleSaveCita = async (data: CitaFormData & { id?: string; clientPhone?: string }) => {
  await saveCitaMutation.mutateAsync(data)
}
</script>
