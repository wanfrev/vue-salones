<template>
  <div class="min-h-screen bg-bg">
    <!-- Mobile Header -->
    <header class="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface border-b border-border px-4 lg:hidden">
      <div class="flex items-center gap-3">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary">
          <svg v-if="!isSidebarOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-hover">
          <svg class="h-4 w-4 text-text-inverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span class="font-bold text-text">SalónApp</span>
      </div>
      <button @click="logout" class="rounded-lg p-2 text-text-muted transition-theme hover:bg-bg-secondary hover:text-text-secondary">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 z-20 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64 lg:pt-0">
      <div class="p-4 lg:p-6">
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-sm text-primary mb-0.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Equipo</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Gestión de Equipo</h1>
              <p class="hidden text-sm text-text-muted sm:block">Administra empleados y horarios</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="handleNewEmpleado"
                class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-primary/25 transition-theme hover:bg-primary-hover"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Nuevo Empleado</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalEmpleados }}</p>
                <p class="text-xs text-text-muted">Empleados</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info-light text-info">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ empleadosPorcentaje }}</p>
                <p class="text-xs text-text-muted">Con % definido</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light text-warning">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ empleadosSueldoBase }}</p>
                <p class="text-xs text-text-muted">Con sueldo base</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ empleadosMixto }}</p>
                <p class="text-xs text-text-muted">Sueldo + %</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Grid -->
        <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div v-for="member in team" :key="member.id" class="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-hover text-base font-bold text-text-inverse">
                  {{ getInitials(member.name) }}
                </div>
                <div>
                  <h3 class="font-semibold text-text">{{ member.name }}</h3>
                  <p class="text-xs text-text-muted">{{ member.role }}</p>
                </div>
              </div>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium bg-bg-secondary text-text-muted">{{ member.role }}</span>
            </div>
            
            <div class="mt-4 grid grid-cols-2 gap-2 text-center">
              <div class="rounded-lg bg-bg-secondary p-2">
                <p class="text-sm font-semibold text-text">{{ member.payTypeLabel }}</p>
                <p class="text-xs text-text-muted">Tipo de pago</p>
              </div>
              <div class="rounded-lg bg-bg-secondary p-2">
                <p class="text-sm font-semibold text-text">{{ member.payValueLabel }}</p>
                <p class="text-xs text-text-muted">Condición</p>
              </div>
            </div>
            
            <div class="mt-4 flex gap-2">
              <button 
                @click="handleViewAgenda(member)"
                class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
              >
                Ver Agenda
              </button>
              <button 
                @click="handleEditEmpleado(member)"
                class="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-text-inverse transition-theme hover:bg-primary-hover"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <!-- Team Schedule Overview -->
        <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 class="mb-4 text-base font-semibold text-text">Horarios del Equipo - Hoy</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Empleado</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Entrada</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Salida</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Descanso</th>
                  <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">Citas</th>
                  <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">Disponible</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="schedule in teamSchedule" :key="schedule.id" class="text-sm">
                  <td class="py-3 font-medium text-text">{{ schedule.name }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.start }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.end }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.break }}</td>
                  <td class="py-3 text-center">
                    <span class="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                      {{ schedule.appointments }}
                    </span>
                  </td>
                  <td class="py-3 text-center">
                    <span :class="[
                      'inline-flex h-2 w-2 rounded-full',
                      schedule.available ? 'bg-success' : 'bg-danger'
                    ]"></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modals -->
  <EmpleadoFormModal 
    ref="empleadoModalRef" 
    @save="handleSaveEmpleado" 
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { equipoKeys, listEquipo, saveEmpleado } from '../services/equipoService'
import Sidebar from '../components/layout/Sidebar.vue'
import { EmpleadoFormModal } from '../components/modals'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

const router = useRouter()
const { logout, authStore } = useAuth()
const { info, error: showError } = useNotification()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const empleadoModalRef = ref<InstanceType<typeof EmpleadoFormModal> | null>(null)

const businessId = computed(() => authStore.businessId)

const { data: teamData } = useQuery({
  queryKey: computed(() => equipoKeys.all(businessId.value)),
  queryFn: () => listEquipo(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const team = computed<Empleado[]>(() => teamData.value ?? [])

const teamSchedule = computed(() => team.value
  .filter(member => member.schedule)
  .map(member => ({
    id: member.id,
    name: member.name,
    start: member.schedule?.start ?? '',
    end: member.schedule?.end ?? '',
    break: member.schedule?.break || 'Sin descanso registrado',
    appointments: 0,
    available: true,
  }))
)

const saveEmpleadoMutation = useMutation({
  mutationFn: (data: EmpleadoFormData & { id?: string }) => saveEmpleado(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: equipoKeys.all(businessId.value) })
  },
})

// Stats
const totalEmpleados = computed(() => team.value.length)
const empleadosPorcentaje = computed(() => team.value.filter(e => e.payType === 'percentage' || e.payType === 'mixed').length)
const empleadosSueldoBase = computed(() => team.value.filter(e => e.payType === 'salary' || e.payType === 'mixed').length)
const empleadosMixto = computed(() => team.value.filter(e => e.payType === 'mixed').length)

// Actions
const handleNewEmpleado = () => {
  empleadoModalRef.value?.open()
}

const handleEditEmpleado = (empleado: Empleado) => {
  empleadoModalRef.value?.open(empleado)
}

const handleSaveEmpleado = async (data: EmpleadoFormData & { id?: string }) => {
  try {
    await saveEmpleadoMutation.mutateAsync(data)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'No fue posible guardar el empleado')
  }
}

const handleViewAgenda = (empleado: Empleado) => {
  router.push('/admin')
  info(`Mostrando agenda de ${empleado.name}`)
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>
