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
    @delete="handleDeleteCita"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import { useBusinessStore } from '../../store/business'
import { useAppointmentMutations } from '../../composables/useAppointmentMutations'
import { listServicios, serviciosKeys } from '../../services/serviciosService'
import { listEquipo, equipoKeys } from '../../services/equipoService'
import AppLayout from '../../components/layout/AppLayout.vue'
import AgendaCalendar from '../../components/agenda/AgendaCalendar.vue'
import { toISODate, dateToHHmm } from '../../lib/formatters'
import { CitaFormModal } from '../../components/modals'
import type { Cita } from '../../types/cita'

const authStore = useAuthStore()
const businessStore = useBusinessStore()
useNotification()

const t = computed(() => businessStore.terminology)
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
  const date = toISODate(start)
  const time = dateToHHmm(start)
  citaModalRef.value?.open({ id: '', clientName: '', service: '', employee: '', date, time, duration: 30, price: 0, status: 'confirmed' })
}

const handleEventClick = (event: { id: string; title: string; start: Date; end: Date; citaData?: Cita }) => {
  if (event.citaData) {
    citaModalRef.value?.open(event.citaData)
  }
}

const {
  handleSaveCita,
  handleStatusChange,
  handleEventChange,
  handleDeleteCita,
} = useAppointmentMutations({
  businessId,
  createdBy: computed(() => authStore.profile?.id),
  modalRef: citaModalRef,
})
</script>
