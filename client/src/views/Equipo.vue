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
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">{{ authStore.terminology.employee || 'Empleado' }}s</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Gestión de {{ (authStore.terminology.employee || 'Empleado').toLowerCase() }}s</h1>
            </div>
            <button
              @click="handleNewEmpleado"
              class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span class="hidden sm:inline">Nuevo {{ authStore.terminology.employee || 'Empleado' }}</span>
            </button>
          </div>
        </header>

        <!-- Stats -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ totalEmpleados }}</p>
                <p class="text-xs text-text-muted">{{ authStore.terminology.employee || 'Empleado' }}s</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                <svg class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ empleadosPorcentaje }}</p>
                <p class="text-xs text-text-muted">Con % definido</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <svg class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">{{ empleadosSueldoBase }}</p>
                <p class="text-xs text-text-muted">Con sueldo base</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div
            v-for="member in team"
            :key="member.id"
            class="group rounded-xl border border-border bg-surface p-4 transition-theme hover:border-border-strong"
          >
            <div class="flex items-start gap-3">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {{ getInitials(member.name) }}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-text">{{ member.name }}</h3>
                <p class="text-xs text-text-muted">{{ member.role }}</p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2 text-center">
              <div class="rounded-lg bg-bg-secondary/50 p-2">
                <p class="text-sm font-semibold text-text">{{ member.payTypeLabel }}</p>
                <p class="text-xs text-text-muted">Tipo de pago</p>
              </div>
              <div class="rounded-lg bg-bg-secondary/50 p-2">
                <p class="text-sm font-semibold text-text">{{ member.payValueLabel }}</p>
                <p class="text-xs text-text-muted">Condición</p>
              </div>
            </div>

            <div class="mt-4 flex gap-2">
              <button
                @click="handleViewAgenda(member)"
                class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text"
              >
                Ver Agenda
              </button>
              <button
                @click="handleEditEmpleado(member)"
                class="flex-1 rounded-lg border border-border bg-surface py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        <!-- Team Schedule Overview -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-4">
            <h3 class="text-base font-semibold text-text">Horarios del Equipo - Hoy</h3>
            <p class="text-sm text-text-muted">Entrada, salida y disponibilidad</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.employee || 'Empleado' }}</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Entrada</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Salida</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Descanso</th>
                  <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.appointment || 'Cita' }}s</th>
                  <th class="pb-3 text-center text-xs font-semibold uppercase text-text-muted">Disponible</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="schedule in teamSchedule" :key="schedule.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                  <td class="py-3 font-medium text-text">{{ schedule.name }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.start }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.end }}</td>
                  <td class="py-3 text-text-secondary">{{ schedule.break }}</td>
                  <td class="py-3 text-center">
                    <span class="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
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
    @delete="handleDeleteEmpleado"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { deleteEmpleado, equipoKeys, listEquipo, saveEmpleado } from '../services/equipoService'
import { useThemeStore } from '../store/theme'
import Sidebar from '../components/layout/Sidebar.vue'
import { EmpleadoFormModal } from '../components/modals'
import lumaLogoLight from '../assets/Luma.svg'
import lumaLogoDark from '../assets/Luma blanco.svg'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

const router = useRouter()
const { logout, authStore } = useAuth()
const { success, info, error: showError } = useNotification()
const themeStore = useThemeStore()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const empleadoModalRef = ref<InstanceType<typeof EmpleadoFormModal> | null>(null)
const lumaLogo = computed(() => (themeStore.isDark ? lumaLogoDark : lumaLogoLight))

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
  mutationFn: (data: EmpleadoFormData & { id?: string }) => saveEmpleado(data, businessId.value!),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: equipoKeys.all(businessId.value) })
    empleadoModalRef.value?.close()
    success('Empleado guardado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al guardar el empleado')
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

const deleteEmpleadoMutation = useMutation({
  mutationFn: (profileId: string) => deleteEmpleado(profileId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: equipoKeys.all(businessId.value) })
    empleadoModalRef.value?.close()
    success('Empleado eliminado correctamente')
  },
  onError: (err) => {
    showError(err instanceof Error ? err.message : 'Error al eliminar el empleado')
  },
})

const handleDeleteEmpleado = (empleadoId: string) => {
  deleteEmpleadoMutation.mutate(empleadoId)
}

const handleViewAgenda = (empleado: Empleado) => {
  router.push('/admin')
  info(`Mostrando agenda de ${empleado.name}`)
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>
