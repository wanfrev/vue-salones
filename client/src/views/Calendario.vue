<template>
  <section class="h-[calc(100vh-120px)] min-h-[500px]">
    <AgendaCalendar
      @event-click="handleEventClick"
      @status-change="handleStatusChange"
      @event-change="handleEventChange"
      @slot-select="handleSlotSelect"
    />
  </section>

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
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { equipoKeys, listEquipo } from '../services/equipoService'
import { listServicios, serviciosKeys } from '../services/serviciosService'
import { useAppointmentMutations } from '../composables/useAppointmentMutations'
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'
import { toISODate, dateToHHmm } from '../lib/formatters'
import { CitaFormModal } from '../components/modals'
import type { Cita } from '../types/cita'

const { authStore } = useAuth()
useNotification()

const citaModalRef = ref<InstanceType<typeof CitaFormModal> | null>(null)
const businessId = computed(() => authStore.businessId)

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

const serviciosList = computed(() => (serviciosData.value ?? []).map(service => ({
  id: service.id,
  name: service.name,
  price: service.price,
  duration: service.duration,
})))

const empleadosList = computed(() => (empleadosData.value ?? []).map(employee => ({
  id: employee.id,
  name: employee.name,
})))

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
</script>
