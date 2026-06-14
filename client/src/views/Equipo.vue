<template>
  <header class="mb-5 lg:mb-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{{ businessStore.terminology.employee || 'Empleado' }}s</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">Gestión de {{ (businessStore.terminology.employee || 'Empleado').toLowerCase() }}s</h1>
      </div>
      <button
        @click="handleNewEmpleado"
        class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>Nuevo {{ businessStore.terminology.employee || 'Empleado' }}</span>
      </button>
    </div>
  </header>

  <!-- Stats -->
  <div class="mb-5 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-8 lg:grid-cols-4">
    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-primary/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-primary/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ totalEmpleados }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Total</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-info/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-info/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosPorcentaje }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Con %</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-warning/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-warning/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosSueldoBase }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Sueldo base</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-success/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-success/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosMixto }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Sueldo + %</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Team Grid -->
  <div class="mb-4 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div
      v-for="member in visibleTeam"
      :key="member.id"
      class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme hover:shadow-md hover:border-border-strong sm:p-5"
    >
      <div class="flex items-start gap-3">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-sm font-bold text-primary transition-theme group-hover:scale-105 group-hover:shadow-sm">
          {{ getInitials(member.name) }}
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <h3 class="font-semibold text-text">{{ member.name }}</h3>
          <p class="text-xs text-text-muted">{{ member.role }}</p>
          <p v-if="member.email" class="text-xs text-text-muted truncate mt-0.5">{{ member.email }}</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <div class="rounded-lg bg-gradient-to-br from-bg-secondary/80 to-bg-secondary/40 p-2.5 text-center">
          <p class="text-sm font-semibold text-text">{{ member.payTypeLabel }}</p>
          <p class="text-xs text-text-muted">Tipo de pago</p>
        </div>
        <div class="rounded-lg bg-gradient-to-br from-bg-secondary/80 to-bg-secondary/40 p-2.5 text-center">
          <p class="text-sm font-semibold text-text">{{ member.payValueLabel }}</p>
          <p class="text-xs text-text-muted">Condición</p>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button
          @click="handleViewAgenda(member)"
          class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        >
          Ver Agenda
        </button>
        <button
          @click="handleEditEmpleado(member)"
          class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text hover:border-border-strong"
        >
          Editar
        </button>
      </div>
    </div>
  </div>

  <div v-if="hasMoreThanDefault" class="mb-5 flex justify-center">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-theme hover:bg-primary/5 hover:border-primary/30"
      @click="showAll = !showAll"
    >
      <svg class="h-4 w-4" :class="showAll ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {{ showAll ? 'Ver menos' : 'Ver todos (' + team.length + ')' }}
    </button>
  </div>

  <!-- Team Schedule Overview -->
  <div class="rounded-xl border border-border bg-surface shadow-sm">
    <div class="border-b border-border-subtle px-4 sm:px-5 py-3.5 sm:py-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-text">Horarios del Equipo</h3>
          <p class="text-xs text-text-muted">Entrada, salida y disponibilidad de hoy</p>
        </div>
      </div>
    </div>

    <div class="lg:hidden space-y-2 p-4 sm:p-5">
      <div
        v-for="schedule in teamSchedule"
        :key="schedule.id"
        class="rounded-lg border border-border-subtle bg-bg-secondary/50 p-3.5 transition-theme hover:bg-bg-secondary/80"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {{ getInitials(schedule.name) }}
            </div>
            <span class="font-medium text-text text-sm">{{ schedule.name }}</span>
          </div>
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              schedule.available
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            ]"
          >
            <span :class="['h-1.5 w-1.5 rounded-full', schedule.available ? 'bg-success' : 'bg-danger']"></span>
            {{ schedule.available ? 'Disponible' : 'No disponible' }}
          </span>
        </div>
        <div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-secondary">
          <span class="tabular-nums">Entrada: <strong class="text-text">{{ schedule.start }}</strong></span>
          <span class="tabular-nums">Salida: <strong class="text-text">{{ schedule.end }}</strong></span>
          <span class="tabular-nums">Descanso: <strong class="text-text">{{ schedule.break }}</strong></span>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto hidden lg:block">
      <table class="w-full">
        <thead>
          <tr class="border-b border-border-subtle">
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{{ businessStore.terminology.employee || 'Empleado' }}</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Entrada</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Salida</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Descanso</th>
            <th class="px-4 sm:px-5 pb-3 pt-2 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border-subtle">
          <tr v-for="schedule in teamSchedule" :key="schedule.id" class="text-sm transition-theme hover:bg-bg-secondary/30">
            <td class="px-4 sm:px-5 py-3 font-medium text-text">{{ schedule.name }}</td>
            <td class="px-4 sm:px-5 py-3 tabular-nums text-text-secondary">{{ schedule.start }}</td>
            <td class="px-4 sm:px-5 py-3 tabular-nums text-text-secondary">{{ schedule.end }}</td>
            <td class="px-4 sm:px-5 py-3 text-text-secondary">{{ schedule.break }}</td>
            <td class="px-4 sm:px-5 py-3 text-center">
              <span :class="[
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                schedule.available
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              ]">
                <span :class="['h-1.5 w-1.5 rounded-full', schedule.available ? 'bg-success' : 'bg-danger']"></span>
                {{ schedule.available ? 'Disponible' : 'No disponible' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modals -->
  <EmpleadoFormModal
    ref="empleadoModalRef"
    :is-saving="isSaving"
    @save="handleSaveEmpleado"
    @delete="handleDeleteEmpleado"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCrud } from '../composables/useCrud'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { deleteEmpleado, equipoKeys, listEquipo, saveEmpleado } from '../services/equipoService'
import { useBusinessStore } from '../store/business'
import { getInitials } from '../lib/formatters'
import { EmpleadoFormModal } from '../components/modals'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

const router = useRouter()
const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { info } = useNotification()
const empleadoModalRef = ref<InstanceType<typeof EmpleadoFormModal> | null>(null)

const businessId = computed(() => authStore.businessId)

const {
  items: team,
  handleSave: handleSaveEmpleado,
  handleDelete: handleDeleteEmpleado,
  isSaving,
} = useCrud<Empleado, EmpleadoFormData>({
  businessId,
  queryKey: (id) => equipoKeys.all(id),
  queryFn: (id) => listEquipo(id),
  saveFn: (id, data) => saveEmpleado(data, id),
  deleteFn: (id) => deleteEmpleado(id),
  entityName: 'Empleado',
  modalRef: empleadoModalRef,
  extraInvalidations: [
    () => ['appointments'],
    () => ['dashboard-services'],
    () => ['dashboard-payments'],
    () => ['dashboard-history'],
  ],
})

const DEFAULT_VISIBLE_EMPLOYEES = 4
const showAll = ref(false)

const hasMoreThanDefault = computed(() => team.value.length > DEFAULT_VISIBLE_EMPLOYEES)

const visibleTeam = computed(() => {
  if (showAll.value) return team.value
  return team.value.slice(0, DEFAULT_VISIBLE_EMPLOYEES)
})

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

const handleViewAgenda = (empleado: Empleado) => {
  router.push('/admin?employee=' + empleado.id)
  info(`Mostrando agenda de ${empleado.name}`)
}
</script>
