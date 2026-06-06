<template>
        <!-- Header -->
        <header class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ businessStore.terminology.appointment || 'Cita' }}s
              </div>
              <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">
                {{ todayLabel }}
              </h1>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="handleExport"
                class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:border-border-strong"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="hidden sm:inline">Exportar</span>
              </button>
              <button 
                @click="handleNewCita"
                class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nueva {{ (businessStore.terminology.appointment || 'cita').toLowerCase() }}</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <section class="mb-4 grid grid-cols-2 gap-2 lg:mb-4 lg:grid-cols-4 lg:gap-3">
          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ stats.citasHoy }}</p>
                <p class="text-xs text-text-muted">{{ businessStore.terminology.appointment || 'Cita' }}s hoy</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ stats.pendientes }}</p>
                <p class="text-xs text-text-muted">Pendientes</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ stats.confirmadas }}</p>
                <p class="text-xs text-text-muted">Confirmadas</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">${{ stats.estimadoHoy }}</p>
                <p class="text-xs text-text-muted">Estimado</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Agenda List -->
        <section class="mb-4">
          <header class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-base font-bold text-text lg:text-lg">{{ (businessStore.terminology.appointment || 'Cita') }}s</h2>
              <p v-if="citas.length > 0" class="text-xs text-text-muted">{{ citas.length }} {{ (businessStore.terminology.appointment || 'cita').toLowerCase() }}{{ citas.length !== 1 ? 's' : '' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="date"
                :value="toISODate(selectedDate)"
                @change="selectedDate = new Date(($event.target as HTMLInputElement).value + 'T12:00:00')"
                class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                v-if="!isToday"
                @click="goToToday"
                class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:border-border-strong"
              >
                Hoy
              </button>
            </div>
          </header>

          <AgendaListView
            :citas="citas"
            :loading="isLoading"
            :t="(businessStore.terminology.appointment || 'cita').toLowerCase()"
            @edit="handleEditCita"
            @delete="handleDeleteCita"
          />
        </section>

  <!-- Modals -->
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
import { downloadCsv } from '../lib/csv'
import { exportCitasToCsv, listCitas, agendaKeys } from '../services/agendaService'
import { equipoKeys, listEquipo } from '../services/equipoService'
import { listServicios, serviciosKeys } from '../services/serviciosService'
import { useBusinessStore } from '../store/business'
import { useAppointmentMutations } from '../composables/useAppointmentMutations'
import { toISODate } from '../lib/formatters'
import { CitaFormModal } from '../components/modals'
import AgendaListView from '../components/agenda/AgendaListView.vue'
import type { Cita } from '../types/cita'

const { authStore } = useAuth()
const { success } = useNotification()
const businessStore = useBusinessStore()

const citaModalRef = ref<InstanceType<typeof CitaFormModal> | null>(null)
const editingCita = ref<Cita | null>(null)
const businessId = computed(() => authStore.businessId)

const selectedDate = ref<Date>(new Date())

const dateRange = computed(() => {
  const start = new Date(selectedDate.value)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
})

const { data: citasData, isLoading } = useQuery({
  queryKey: computed(() => [...agendaKeys.appointments(businessId.value), toISODate(selectedDate.value)]),
  queryFn: () => listCitas(businessId.value!, dateRange.value),
  enabled: computed(() => !!businessId.value),
})

const goToToday = () => {
  selectedDate.value = new Date()
}

const citas = computed<Cita[]>(() => citasData.value ?? [])

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
  handleDeleteCita,
} = useAppointmentMutations({
  businessId,
  createdBy: computed(() => authStore.profile?.id),
  modalRef: citaModalRef,
})

const todayLabel = computed(() => {
  const d = selectedDate.value
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}-${mm}-${yy}`
})

const isToday = computed(() => toISODate(selectedDate.value) === toISODate(new Date()))

const stats = computed(() => {
  const filterDate = toISODate(selectedDate.value)
  const citasHoy = citas.value.filter(c => c.date === filterDate)
  
  return {
    citasHoy: citasHoy.length,
    pendientes: citasHoy.filter(c => c.status === 'pending').length,
    confirmadas: citasHoy.filter(c => c.status === 'confirmed').length,
    estimadoHoy: citasHoy
      .filter(c => c.status !== 'cancelled')
      .reduce((sum, c) => sum + c.price, 0)
      .toLocaleString(),
  }
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

const handleNewCita = () => {
  editingCita.value = null
  citaModalRef.value?.open()
}

const handleEditCita = (cita: Cita) => {
  editingCita.value = cita
  citaModalRef.value?.open(cita)
}

const handleExport = () => {
  const dateStr = toISODate(selectedDate.value)
  const citasFiltered = citas.value.filter(c => c.date === dateStr)
  
  const csvContent = exportCitasToCsv(citasFiltered)
  downloadCsv(`citas-${dateStr}.csv`, csvContent)
  success('Citas exportadas correctamente')
}
</script>
