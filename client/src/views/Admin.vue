<template>
  <div class="min-h-screen bg-bg">
    <!-- Top Header -->
    <header class="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-surface border-b border-border px-4">
      <div class="flex items-center gap-2">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary lg:hidden">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex flex-col">
          <img :src="lumaLogo" alt="Luma" class="-ml-1 h-6 w-auto object-contain" />
          <span class="text-[10px] text-text-muted uppercase tracking-wide">Admin</span>
        </div>
      </div>
      <button @click="logout" class="rounded-lg p-2 text-text-muted transition-theme hover:bg-bg-secondary hover:text-text-secondary">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64">
      <div class="p-4 lg:p-6">
        <!-- Header -->
        <header class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ authStore.terminology.appointment || 'Cita' }}s
              </div>
              <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">
                {{ todayLabel }}
              </h1>
              <p class="text-sm text-text-muted">
                {{ stats.citasHoy }} {{ (authStore.terminology.appointment || 'cita').toLowerCase() }}{{ stats.citasHoy !== 1 ? 's' : '' }} programada{{ stats.citasHoy !== 1 ? 's' : '' }} · ${{ stats.estimadoHoy }} estimado
              </p>
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
                <span>Nueva {{ (authStore.terminology.appointment || 'cita').toLowerCase() }}</span>
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
                <p class="text-xs text-text-muted">{{ authStore.terminology.appointment || 'Cita' }}s hoy</p>
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

        <!-- Agenda Calendar Component -->
         <section class="h-[calc(100vh-260px)] min-h-[400px] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-220px)]">
           <AgendaCalendar
           @event-click="handleEventClick"
           @status-change="handleStatusChange"
           @event-change="handleEventChange"
         />
         </section>
      </div>
    </main>
  </div>

  <!-- Modals -->
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
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { agendaKeys, exportCitasToCsv, listCitas, saveCita, updateCitaStatus, updateAppointmentTime } from '../services/agendaService'
import { equipoKeys, listEquipo } from '../services/equipoService'
import { listServicios, serviciosKeys } from '../services/serviciosService'
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'
import Sidebar from '../components/layout/Sidebar.vue'
import { CitaFormModal } from '../components/modals'
import lumaLogo from '../assets/Luma.svg'
import type { Cita, CitaFormData } from '../types/cita'

const { logout, authStore } = useAuth()
const { success, error: showError } = useNotification()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const citaModalRef = ref<InstanceType<typeof CitaFormModal> | null>(null)
const businessId = computed(() => authStore.businessId)

const todayRange = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
})

const { data: citasData } = useQuery({
  queryKey: computed(() => agendaKeys.appointments(businessId.value)),
  queryFn: () => listCitas(businessId.value!, todayRange.value),
  enabled: computed(() => !!businessId.value),
})

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

const updateStatusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) => updateCitaStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al actualizar el estado de la cita')
  },
})

const updateTimeMutation = useMutation({
  mutationFn: ({ id, start, end }: { id: string; start: string; end: string }) => updateAppointmentTime(id, start, end),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al reagendar la cita')
  },
})

const todayLabel = computed(() => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  const label = now.toLocaleDateString('es-ES', options)
  return label.charAt(0).toUpperCase() + label.slice(1)
})

const stats = computed(() => {
  const hoy = new Date().toISOString().split('T')[0]
  const citasHoy = citas.value.filter(c => c.date === hoy)
  
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
})))

const empleadosList = computed(() => (empleadosData.value ?? []).map(employee => ({
  id: employee.id,
  name: employee.name,
})))

const handleNewCita = () => {
  citaModalRef.value?.open()
}

const handleEventClick = (event: { id: string; title: string; start: Date; end: Date }) => {
  const cita = citas.value.find(c => c.id === event.id)
  if (cita) {
    citaModalRef.value?.open(cita)
  }
}

const handleSaveCita = async (data: CitaFormData & { id?: string; clientPhone?: string }) => {
  await saveCitaMutation.mutateAsync(data)
}

const handleStatusChange = async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) => {
  await updateStatusMutation.mutateAsync({ id, status })
  success(`Estado actualizado a ${status}`)
}

const handleEventChange = async ({ id, start, end }: { id: string; start: string; end: string }) => {
  await updateTimeMutation.mutateAsync({ id, start, end })
  success('Cita reagendada correctamente')
}

const handleExport = () => {
  const hoy = new Date().toISOString().split('T')[0]
  const citasHoy = citas.value.filter(c => c.date === hoy)
  
  const csvContent = exportCitasToCsv(citasHoy)
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `citas-${hoy}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
  
  success('Citas exportadas correctamente')
}
</script>
