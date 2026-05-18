<template>
  <div class="flex h-full flex-col gap-2 sm:gap-3">
    <!-- Panel de Filtros Compacto - Responsive -->
    <div class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm sm:rounded-xl sm:p-3 sm:gap-3 lg:flex-row lg:items-center lg:justify-between">
      <!-- Filtro de Empleado y Búsqueda -->
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div v-if="isAdmin" class="flex items-center gap-2">
          <label class="text-xs font-semibold text-primary hidden sm:inline">Filtrar:</label>
          <div class="relative">
            <select
              id="employee-filter"
              v-model="selectedEmployeeId"
              class="w-full appearance-none rounded-md border border-border bg-surface pl-2 pr-8 py-1.5 text-sm font-medium text-text outline-none transition-theme focus:border-primary focus:ring-1 focus:ring-primary/20 sm:w-auto sm:rounded-lg sm:pl-3 sm:pr-10 sm:py-2"
              :disabled="loadingEmployees"
            >
              <option value="all">Todos</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.full_name }}
              </option>
            </select>
            <div class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-primary">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light">
            <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-text">{{ authStore.profile?.full_name }}</span>
        </div>

        <!-- Separador -->
        <div v-if="isAdmin" class="hidden h-6 w-px bg-border sm:block"></div>

        <!-- Búsqueda rápida -->
        <div class="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar cita..."
            class="w-full rounded-md border border-border bg-surface pl-8 pr-2 py-1.5 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 sm:w-44 sm:rounded-lg sm:pl-9 sm:pr-3 sm:py-2 lg:w-56"
          />
          <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Leyenda de Estados Compacta -->
      <div class="flex flex-wrap items-center gap-1">
        <div class="flex items-center gap-1 rounded bg-primary-light px-1.5 py-1 transition-theme hover:bg-primary/10 sm:px-2">
          <span class="h-2 w-2 rounded-full bg-primary"></span>
          <span class="text-[10px] font-medium text-text hidden sm:inline sm:text-xs">Confirmada</span>
        </div>
        <div class="flex items-center gap-1 rounded bg-bg-secondary px-1.5 py-1 transition-theme hover:bg-border sm:px-2">
          <span class="h-2 w-2 rounded-full bg-text-secondary"></span>
          <span class="text-[10px] font-medium text-text hidden sm:inline sm:text-xs">Completada</span>
        </div>
        <div class="flex items-center gap-1 rounded bg-warning-light px-1.5 py-1 transition-theme hover:bg-warning/10 sm:px-2">
          <span class="h-2 w-2 rounded-full bg-warning"></span>
          <span class="text-[10px] font-medium text-text hidden sm:inline sm:text-xs">Pendiente</span>
        </div>
        <div class="flex items-center gap-1 rounded bg-surface px-1.5 py-1 transition-theme hover:bg-bg-secondary sm:px-2">
          <span class="h-2 w-2 rounded-full bg-border-strong border border-border-strong"></span>
          <span class="text-[10px] font-medium text-text hidden sm:inline sm:text-xs">Libre</span>
        </div>
      </div>
    </div>

    <!-- Calendario - Altura máxima -->
    <div class="flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-sm sm:rounded-xl">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import { useAgenda } from '../../composables/useAgenda'
import { useAuthStore } from '../../store/auth'
import { isAdminPanelRole } from '../../constants/roles'

const authStore = useAuthStore()
const isAdmin = computed(() => isAdminPanelRole(authStore.role ?? undefined))
const emit = defineEmits<{
  eventClick: [event: { id: string; title: string; start: Date; end: Date; status?: string }]
  statusChange: [payload: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }]
}>()

const {
  selectedEmployeeId,
  setDateRange,
  employees,
  loadingEmployees,
  services,
  schedules,
  appointments,
} = useAgenda()

onMounted(() => {
  if (!isAdmin.value && authStore.profile?.id) {
    selectedEmployeeId.value = authStore.profile.id
  }
})

// Mapear el estado a un color usando variables CSS
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'var(--color-primary)'
    case 'completed': return 'var(--color-text-secondary)'
    case 'pending': return 'var(--color-warning)'
    case 'cancelled':
    case 'no_show': return 'var(--color-danger)'
    default: return 'var(--color-primary)'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Confirmada'
    case 'completed': return 'Completada'
    case 'pending': return 'Pendiente'
    case 'cancelled':
    case 'no_show': return 'Cancelada'
    default: return 'Confirmada'
  }
}

// Generar los eventos para FullCalendar
const calendarEvents = computed<EventInput[]>(() => {
  const events: EventInput[] = []

  // 1. Agregar horarios libres como background events
  if (schedules.value) {
    schedules.value.forEach(sched => {
      events.push({
        groupId: `sched-${sched.id}`,
        daysOfWeek: [sched.weekday],
        startTime: sched.start_time,
        endTime: sched.end_time,
        display: 'background',
        color: 'var(--color-border-strong)',
      })
    })
  }

  // 2. Agregar citas
  if (appointments.value) {
    appointments.value.forEach(appt => {
      const service = services.value?.find(s => s.id === appt.service_id)
      const employee = employees.value?.find(e => e.id === appt.employee_id)
      
      const title = service ? service.name : 'Cita'
      const empName = employee ? ` - ${employee.full_name}` : ''

      events.push({
        id: appt.id,
        title: `${title}${empName}`,
        start: appt.start_time,
        end: appt.end_time,
        color: getStatusColor(appt.status),
        classNames: ['agenda-event', `agenda-status-${appt.status}`],
        extendedProps: {
          ...appt,
          serviceName: service?.name,
          employeeName: employee?.full_name,
          statusLabel: getStatusLabel(appt.status),
          statusColor: getStatusColor(appt.status),
        }
      })
    })
  }

  return events
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  allDaySlot: false,
  selectable: true,
  selectMirror: true,
  events: calendarEvents.value,
  eventContent: (arg) => {
    const statusLabel = (arg.event.extendedProps as any)?.statusLabel || ''
    const statusColor = (arg.event.extendedProps as any)?.statusColor || 'var(--color-primary)'
    const timeText = arg.timeText
    const titleText = arg.event.title

    const container = document.createElement('div')
    container.className = 'agenda-event-inner'

    const topRow = document.createElement('div')
    topRow.className = 'agenda-event-top'

    const dot = document.createElement('span')
    dot.className = 'agenda-event-dot'
    dot.style.background = statusColor

    const status = document.createElement('span')
    status.className = 'agenda-event-status'
    status.textContent = statusLabel

    topRow.appendChild(dot)
    topRow.appendChild(status)

    const title = document.createElement('div')
    title.className = 'agenda-event-title'
    title.textContent = titleText

    const time = document.createElement('div')
    time.className = 'agenda-event-time'
    time.textContent = timeText

    container.appendChild(topRow)
    container.appendChild(title)
    container.appendChild(time)

    return { domNodes: [container] }
  },
  datesSet: (arg) => {
    setDateRange(arg.start, arg.end)
  },
  eventClick: (arg) => {
    emit('eventClick', {
      id: arg.event.id,
      title: arg.event.title,
      start: arg.event.start!,
      end: arg.event.end!,
      status: (arg.event.extendedProps as any)?.status,
    })
  },
  eventDidMount: (info) => {
    const el = info.el as HTMLElement
    const status = (info.event.extendedProps as any)?.status as string | undefined
    if (status) {
      el.setAttribute('data-status', status)
    }

    const actions = document.createElement('div')
    actions.className = 'agenda-event-actions'

    const pending = document.createElement('button')
    pending.className = 'agenda-event-action agenda-event-pending'
    pending.title = 'Marcar pendiente'
    pending.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('statusChange', { id: info.event.id, status: 'pending' })
    })

    const confirmed = document.createElement('button')
    confirmed.className = 'agenda-event-action agenda-event-confirmed'
    confirmed.title = 'Marcar confirmada'
    confirmed.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('statusChange', { id: info.event.id, status: 'confirmed' })
    })

    const cancelled = document.createElement('button')
    cancelled.className = 'agenda-event-action agenda-event-cancelled'
    cancelled.title = 'Cancelar'
    cancelled.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('statusChange', { id: info.event.id, status: 'cancelled' })
    })

    const completed = document.createElement('button')
    completed.className = 'agenda-event-action agenda-event-completed'
    completed.title = 'Marcar completada'
    completed.addEventListener('click', (e) => {
      e.stopPropagation()
      emit('statusChange', { id: info.event.id, status: 'completed' })
    })

    actions.appendChild(confirmed)
    actions.appendChild(pending)
    actions.appendChild(completed)
    actions.appendChild(cancelled)

    el.appendChild(actions)
  },
  select: (arg) => {
    console.log('Rango seleccionado:', arg.start, arg.end)
  },
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día'
  }
}))
</script>

<style>
/* FullCalendar con soporte para Dark Mode usando variables CSS */
.fc {
  font-family: var(--font-sans);
  color: var(--color-text);
}

/* Toolbar modernizado */
.fc .fc-toolbar.fc-header-toolbar {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.25rem 0;
}

@media (min-width: 640px) {
  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1rem;
    padding: 0.75rem 0.5rem 0;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1.25rem;
    padding: 1rem 1rem 0;
  }
}

/* Toolbar responsive */
.fc .fc-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.fc .fc-toolbar-chunk {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* Distribución en desktop */
@media (min-width: 640px) {
  .fc .fc-toolbar {
    flex-wrap: nowrap;
  }
  
  .fc .fc-toolbar-chunk:first-child {
    flex: 0 0 auto;
    justify-content: flex-start;
  }
  
  .fc .fc-toolbar-chunk:nth-child(2) {
    flex: 1 1 auto;
    justify-content: center;
  }
  
  .fc .fc-toolbar-chunk:last-child {
    flex: 0 0 auto;
    justify-content: flex-end;
  }
}

/* Distribución en móvil */
@media (max-width: 639px) {
  .fc .fc-toolbar {
    justify-content: center;
    gap: 0.5rem;
  }
  
  .fc .fc-toolbar-chunk {
    gap: 0.25rem;
  }
  
  .fc .fc-toolbar-chunk:first-child {
    order: 2;
    justify-content: center;
  }
  
  .fc .fc-toolbar-chunk:nth-child(2) {
    order: 1;
    width: 100%;
    justify-content: center;
    margin-bottom: 0.25rem;
  }
  
  .fc .fc-toolbar-chunk:last-child {
    order: 3;
    justify-content: center;
    flex-wrap: wrap;
  }
}

/* Botones del calendario usando variables */
.fc .fc-button-primary {
  background: var(--color-primary) !important;
  border: 1px solid var(--color-primary) !important;
  border-radius: 0.5rem !important;
  padding: 0.375rem 0.5rem !important;
  font-weight: 500 !important;
  font-size: 0.75rem !important;
  box-shadow: var(--shadow-sm) !important;
  transition: all 0.2s ease !important;
}

@media (min-width: 640px) {
  .fc .fc-button-primary {
    border-radius: 0.75rem !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
  }
}

.fc .fc-button-primary:hover {
  background: var(--color-primary-hover) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md) !important;
}

.fc .fc-button-primary:not(:disabled):active,
.fc .fc-button-primary:not(:disabled).fc-button-active {
  background: var(--color-primary-hover) !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

.fc .fc-button-primary:disabled {
  opacity: 0.5 !important;
}

/* Iconos de navegación */
.fc .fc-prev-button,
.fc .fc-next-button {
  padding: 0.375rem !important;
}

.fc .fc-prev-button .fc-icon,
.fc .fc-next-button .fc-icon {
  font-size: 1rem !important;
}

@media (min-width: 640px) {
  .fc .fc-prev-button,
  .fc .fc-next-button {
    padding: 0.5rem 0.75rem !important;
  }
  
  .fc .fc-prev-button .fc-icon,
  .fc .fc-next-button .fc-icon {
    font-size: 1.25rem !important;
  }
}

/* Botón Hoy */
.fc .fc-today-button {
  font-weight: 600 !important;
}

/* Grupo de botones de vista */
.fc .fc-button-group {
  display: flex;
  gap: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

@media (min-width: 640px) {
  .fc .fc-button-group {
    border-radius: 0.75rem;
  }
}

.fc .fc-button-group .fc-button-primary {
  border-radius: 0 !important;
  margin: 0 !important;
}

.fc .fc-button-group .fc-button-primary:first-child {
  border-top-left-radius: 0.5rem !important;
  border-bottom-left-radius: 0.5rem !important;
}

@media (min-width: 640px) {
  .fc .fc-button-group .fc-button-primary:first-child {
    border-top-left-radius: 0.75rem !important;
    border-bottom-left-radius: 0.75rem !important;
  }
}

.fc .fc-button-group .fc-button-primary:last-child {
  border-top-right-radius: 0.5rem !important;
  border-bottom-right-radius: 0.5rem !important;
}

@media (min-width: 640px) {
  .fc .fc-button-group .fc-button-primary:last-child {
    border-top-right-radius: 0.75rem !important;
    border-bottom-right-radius: 0.75rem !important;
  }
}

.fc .fc-button-group .fc-button-primary.fc-button-active {
  background: var(--color-primary-hover) !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15) !important;
}

/* Título */
.fc .fc-toolbar-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 0.5rem;
}

@media (min-width: 640px) {
  .fc .fc-toolbar-title {
    font-size: 1.125rem;
    padding: 0 1rem;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar-title {
    font-size: 1.25rem;
  }
}

/* Grid y bordes usando variables */
.fc-theme-standard .fc-scrollgrid {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
}

@media (min-width: 640px) {
  .fc-theme-standard .fc-scrollgrid {
    border-radius: 0.75rem;
  }
}

.fc-theme-standard .fc-scrollgrid-section > td {
  border: none;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: var(--color-border);
}

/* Header de días */
.fc .fc-col-header-cell {
  background: var(--color-bg-secondary);
  padding: 0.5rem 0.25rem !important;
  font-weight: 600;
  font-size: 0.75rem;
}

@media (min-width: 640px) {
  .fc .fc-col-header-cell {
    padding: 0.75rem 0.5rem !important;
    font-size: 0.875rem;
  }
}

.fc .fc-col-header-cell-cushion {
  color: var(--color-text-secondary);
}

/* Celdas de tiempo */
.fc .fc-timegrid-slot {
  height: 3rem !important;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot {
    height: 3.5rem !important;
  }
}

@media (min-width: 1024px) {
  .fc .fc-timegrid-slot {
    height: 4rem !important;
  }
}

.fc .fc-timegrid-slot-label {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: 500;
  vertical-align: middle;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot-label {
    font-size: 0.75rem;
  }
}

.fc .fc-timegrid-slot-label-cushion {
  padding: 0.25rem;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot-label-cushion {
    padding: 0.5rem;
  }
}

/* Eventos del calendario */
.fc-v-event {
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.35rem;
  box-shadow: var(--shadow-md);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;
}

@media (min-width: 640px) {
  .fc-v-event {
    border-radius: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;
    box-shadow: var(--shadow-sm);
  }
}

.fc-v-event:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.fc-v-event .fc-event-title {
  font-weight: 600;
}

.fc-v-event .fc-event-time {
  font-size: 0.625rem;
  opacity: 0.9;
}

.agenda-event-inner {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.agenda-event-top {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.agenda-event-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
}

.agenda-event-status {
  white-space: nowrap;
}

.agenda-event-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.agenda-event-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
}

.agenda-event-actions {
  position: absolute;
  right: 0.25rem;
  top: 0.25rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.fc-v-event::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0.25rem;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
}

.fc-v-event:hover .agenda-event-actions {
  opacity: 1;
}

.agenda-event-action {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.25);
}

.agenda-event-confirmed {
  background: var(--color-primary);
  border-color: rgba(255, 255, 255, 0.8);
}

.agenda-event-pending {
  background: var(--color-warning);
  border-color: rgba(255, 255, 255, 0.8);
}

.agenda-event-cancelled {
  background: var(--color-danger);
  border-color: rgba(255, 255, 255, 0.8);
}

.agenda-event-completed {
  background: var(--color-text-secondary);
  border-color: rgba(255, 255, 255, 0.8);
}

@media (min-width: 640px) {
  .fc-v-event .fc-event-time {
    font-size: 0.75rem;
  }
}

/* Eventos de fondo (horarios libres) */
.fc .fc-bg-event {
  opacity: 0.4;
}

/* Efectos de selección y hover */
.fc .fc-highlight {
  background: var(--color-primary-light) !important;
}

.fc .fc-cell-shaded,
.fc .fc-day-disabled {
  background: var(--color-bg);
}

/* Día actual */
.fc .fc-day-today {
  background: var(--color-primary-light) !important;
}

.fc .fc-day-today .fc-col-header-cell-cushion {
  color: var(--color-primary);
  font-weight: 700;
}

/* More link */
.fc .fc-more-link {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.625rem;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

@media (min-width: 640px) {
  .fc .fc-more-link {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
  }
}

.fc .fc-more-link:hover {
  background: var(--color-primary-light);
}

/* Popover */
.fc .fc-popover {
  border-radius: 0.75rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  background: var(--color-surface);
}

.fc .fc-popover-header {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0.75rem 1rem;
  border-radius: 0.75rem 0.75rem 0 0;
}

.fc .fc-popover-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.fc .fc-popover-body {
  background: var(--color-surface);
}

/* Vista de mes */
.fc-daygrid-day {
  min-height: 4rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day {
    min-height: 6rem;
  }
}

.fc-daygrid-day-number {
  font-weight: 500;
  padding: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text);
}

@media (min-width: 640px) {
  .fc-daygrid-day-number {
    padding: 0.5rem;
    font-size: 0.875rem;
  }
}

.fc-daygrid-day.fc-day-today {
  background: var(--color-primary-light);
}

.fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.875rem;
  }
}

/* Eventos en vista de mes */
.fc-daygrid-event {
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 500;
  padding: 0.0625rem 0.25rem;
}

@media (min-width: 640px) {
  .fc-daygrid-event {
    border-radius: 0.375rem;
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
  }
}

/* Ajustes para pantallas muy pequeñas */
@media (max-width: 480px) {
  .fc .fc-toolbar-title {
    font-size: 0.75rem;
  }
  
  .fc .fc-col-header-cell {
    font-size: 0.625rem;
    padding: 0.375rem 0.125rem !important;
  }
  
  .fc .fc-timegrid-slot-label {
    font-size: 0.5625rem;
  }
  
  .fc-daygrid-day {
    min-height: 3rem;
  }
}

/* Dark Mode adjustments for FullCalendar */
.dark .fc-theme-standard .fc-scrollgrid {
  border-color: var(--color-border);
}

.dark .fc-theme-standard td,
.dark .fc-theme-standard th {
  border-color: var(--color-border);
}

.dark .fc .fc-col-header-cell {
  background: var(--color-bg-secondary);
}

.dark .fc .fc-cell-shaded,
.dark .fc .fc-day-disabled {
  background: var(--color-bg);
}

.dark .fc .fc-timegrid-slot-label {
  color: var(--color-text-muted);
}

.dark .fc-v-event {
  box-shadow: var(--shadow-sm);
}

.dark .fc-daygrid-day-number {
  color: var(--color-text);
}
</style>
