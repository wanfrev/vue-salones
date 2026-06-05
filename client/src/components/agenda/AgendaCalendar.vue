<template>
  <div class="flex h-full flex-col gap-3">
    <!-- Panel de Filtros -->
    <div class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2.5 sm:rounded-xl sm:p-3 sm:gap-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div v-if="isAdmin" class="flex items-center gap-2">
          <div class="relative">
            <select
              id="employee-filter"
              v-model="selectedEmployeeId"
              class="w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 py-1.5 text-sm font-medium text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-auto sm:pl-3.5 sm:pr-9"
              :disabled="loadingEmployees"
            >
              <option value="all">Todas</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.full_name }}
              </option>
            </select>
            <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <svg class="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm font-medium text-text">{{ authStore.profile?.full_name }}</span>
        </div>

        <div class="hidden h-5 w-px bg-border sm:block"></div>

        <div class="relative w-full sm:w-48 lg:w-56">
          <input
            type="text"
            placeholder="Buscar..."
            class="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-1.5 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Leyenda de Estados -->
      <div class="flex flex-wrap items-center gap-1.5">
        <div class="flex items-center gap-1.5 rounded-md bg-primary/5 px-2 py-1">
          <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
          <span class="text-[11px] font-medium text-text-secondary">Confirmada</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-md bg-success/5 px-2 py-1">
          <span class="h-1.5 w-1.5 rounded-full bg-success"></span>
          <span class="text-[11px] font-medium text-text-secondary">Pagada</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-md bg-warning/5 px-2 py-1">
          <span class="h-1.5 w-1.5 rounded-full bg-warning"></span>
          <span class="text-[11px] font-medium text-text-secondary">Pendiente</span>
        </div>
        <div class="flex items-center gap-1.5 rounded-md bg-danger/5 px-2 py-1">
          <span class="h-1.5 w-1.5 rounded-full bg-danger"></span>
          <span class="text-[11px] font-medium text-text-secondary">Cancelada</span>
        </div>
      </div>
    </div>

    <!-- Calendario -->
    <div class="flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-sm sm:rounded-xl">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import { getStatusLabel, getStatusColor, normalizeAppointmentStatus, dateToHHmm, toISODate } from '../../lib/formatters'
import { useAgenda } from '../../composables/useAgenda'
import { useAuthStore } from '../../store/auth'
import { isAdminPanelRole } from '../../constants/roles'
import type { Cita } from '../../types/cita'

const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => isAdminPanelRole(authStore.role ?? undefined))
const emit = defineEmits<{
  eventClick: [event: {
    id: string
    title: string
    start: Date
    end: Date
    status?: string
    citaData?: Omit<Cita, 'paymentStatus' | 'statusLabel' | 'statusColor' | 'groupId'>
  }]
  statusChange: [payload: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'paid' }]
  eventChange: [payload: { id: string; start: string; end: string }]
  slotSelect: [payload: { start: Date; end: Date }]
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
  const employeeParam = route.query.employee as string | undefined
  if (employeeParam) {
    selectedEmployeeId.value = employeeParam
  }
})

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'confirmed': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'paid': return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1a3.5 3.5 0 01-2.5-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'pending': return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'cancelled':
    case 'no_show': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    default: return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

const getStatusDotColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'var(--color-success)'
    case 'pending':
      return 'var(--color-warning)'
    case 'cancelled':
    case 'no_show':
      return 'var(--color-danger)'
    case 'confirmed':
    default:
      return 'var(--color-primary)'
  }
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'paid', label: 'Pagada' },
  { value: 'cancelled', label: 'Cancelada' },
]



const calendarEvents = computed<EventInput[]>(() => {
  const events: EventInput[] = []

  if (schedules.value) {
    schedules.value.forEach(sched => {
      events.push({
        groupId: `sched-${sched.id}`,
        daysOfWeek: [sched.weekday],
        startTime: sched.start_time,
        endTime: sched.end_time,
        display: 'background',
        color: 'var(--color-bg-secondary)',
      })
    })
  }

  if (appointments.value) {
    appointments.value.forEach(appt => {
      const visualStatus = normalizeAppointmentStatus(appt)
      const service = services.value?.find(s => s.id === appt.service_id)
      const employee = employees.value?.find(e => e.id === appt.employee_id)
      const clientName = appt.clients?.full_name || ''
      const title = clientName || 'Cliente'

      events.push({
        id: appt.id,
        title,
        start: appt.start_time,
        end: appt.end_time,
        color: getStatusColor(visualStatus),
        classNames: ['agenda-event', `agenda-status-${visualStatus}`],
        extendedProps: {
          ...appt,
          status: visualStatus,
          serviceName: service?.name,
          servicePrice: service?.price,
          serviceDuration: service?.duration_minutes,
          employeeName: employee?.full_name,
          clientName,
          statusLabel: getStatusLabel(visualStatus),
          statusColor: getStatusColor(visualStatus),
          statusIcon: getStatusIcon(visualStatus),
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
  editable: true,
  eventDurationEditable: true,
  eventStartEditable: true,
  events: calendarEvents.value,
  eventContent: (arg) => {
    const extProps = arg.event.extendedProps as any
    const statusLabel = extProps?.statusLabel || ''
    const statusIcon = extProps?.statusIcon || ''
    const serviceName = extProps?.serviceName || 'Servicio'
    const employeeName = extProps?.employeeName || ''
    const timeText = arg.timeText
    const titleText = arg.event.title
    const isMonthView = arg.view.type === 'dayGridMonth'

    const container = document.createElement('div')
    container.className = isMonthView ? 'agenda-event-inner agenda-month-view' : 'agenda-event-inner'

    const topRow = document.createElement('div')
    topRow.className = 'agenda-event-top'
    topRow.setAttribute('data-action', 'toggle-status-dropdown')

    const dot = document.createElement('span')
    dot.className = 'agenda-event-dot'
    dot.style.background = getStatusDotColor(extProps?.status || 'confirmed')

    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    iconSvg.setAttribute('viewBox', '0 0 24 24')
    iconSvg.setAttribute('fill', 'none')
    iconSvg.setAttribute('stroke', 'currentColor')
    iconSvg.setAttribute('stroke-width', '2')
    iconSvg.setAttribute('stroke-linecap', 'round')
    iconSvg.setAttribute('stroke-linejoin', 'round')
    iconSvg.classList.add('agenda-event-status-icon')
    const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    iconPath.setAttribute('d', statusIcon)
    iconSvg.appendChild(iconPath)

    const status = document.createElement('span')
    status.className = 'agenda-event-status'
    status.textContent = statusLabel

    topRow.appendChild(dot)
    topRow.appendChild(iconSvg)
    topRow.appendChild(status)

    const title = document.createElement('div')
    title.className = 'agenda-event-title'
    title.textContent = titleText

    const service = document.createElement('div')
    service.className = 'agenda-event-service'
    service.textContent = employeeName ? `${serviceName} · ${employeeName}` : serviceName
    if (extProps?.group_id) {
      const groupBadge = document.createElement('span')
      groupBadge.className = 'agenda-event-group-badge'
      groupBadge.textContent = '⤒'
      service.appendChild(document.createTextNode(' '))
      service.appendChild(groupBadge)
    }

    const time = document.createElement('div')
    time.className = 'agenda-event-time'
    time.textContent = timeText

    container.appendChild(topRow)
    container.appendChild(title)
    container.appendChild(service)
    if (!isMonthView) {
      container.appendChild(time)
    }

    return { domNodes: [container] }
  },
  datesSet: (arg) => {
    setDateRange(arg.start, arg.end)
  },
  slotDuration: '00:15:00',
  slotLabelInterval: '01:00',
  expandRows: true,
  handleWindowResize: true,
  windowResizeDelay: 100,
  eventClick: (arg) => {
    const target = (arg.jsEvent?.target as HTMLElement)
    if (target?.closest('[data-action="toggle-status-dropdown"]') || target?.closest('.agenda-status-dropdown')) {
      return
    }
    const ext = arg.event.extendedProps as any
    const start = arg.event.start!
    const end = arg.event.end!
    const duration = ext.serviceDuration || Math.round((end.getTime() - start.getTime()) / 60000)
    const date = toISODate(start)
    const time = dateToHHmm(start)
    const citaStatus = (ext?.status || 'confirmed') as Cita['status']
    emit('eventClick', {
      id: arg.event.id,
      title: arg.event.title,
      start,
      end,
      status: ext?.status,
      citaData: {
        id: arg.event.id,
        clientId: ext.client_id,
        clientName: arg.event.title,
        serviceId: ext.service_id,
        service: ext.serviceName || 'Servicio',
        employeeId: ext.employee_id,
        employee: ext.employeeName || 'Empleado',
        date,
        time,
        duration,
        price: Number(ext.servicePrice ?? 0),
        status: citaStatus,
        notes: ext.internal_notes || '',
      },
    })
  },
  eventDidMount: (info) => {
    const el = info.el as HTMLElement
    const status = (info.event.extendedProps as any)?.status as string | undefined
    if (status) {
      el.setAttribute('data-status', status)
    }

    const statusBadge = el.querySelector('[data-action="toggle-status-dropdown"]') as HTMLElement
    if (!statusBadge) return

    let dropdown: HTMLElement | null = null

    const openDropdown = () => {
      if (dropdown) {
        closeDropdown()
        return
      }

      dropdown = document.createElement('div')
      dropdown.className = 'agenda-status-dropdown'

      STATUS_OPTIONS.forEach(opt => {
        const item = document.createElement('button')
        item.className = 'agenda-status-option'
        item.setAttribute('data-status-value', opt.value)

        const itemDot = document.createElement('span')
        itemDot.className = 'agenda-status-option-dot'
        itemDot.style.background = getStatusDotColor(opt.value)

        const itemIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        itemIcon.setAttribute('viewBox', '0 0 24 24')
        itemIcon.setAttribute('fill', 'none')
        itemIcon.setAttribute('stroke', 'currentColor')
        itemIcon.setAttribute('stroke-width', '2')
        itemIcon.setAttribute('stroke-linecap', 'round')
        itemIcon.setAttribute('stroke-linejoin', 'round')
        itemIcon.classList.add('agenda-status-option-icon')
        const itemPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        itemPath.setAttribute('d', getStatusIcon(opt.value))
        itemIcon.appendChild(itemPath)

        const itemLabel = document.createElement('span')
        itemLabel.className = 'agenda-status-option-label'
        itemLabel.textContent = opt.label

        if (status === opt.value) {
          item.classList.add('agenda-status-option-active')
          const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          checkIcon.setAttribute('viewBox', '0 0 24 24')
          checkIcon.setAttribute('fill', 'none')
          checkIcon.setAttribute('stroke', 'currentColor')
          checkIcon.setAttribute('stroke-width', '2.5')
          checkIcon.setAttribute('stroke-linecap', 'round')
          checkIcon.setAttribute('stroke-linejoin', 'round')
          checkIcon.classList.add('agenda-status-option-check')
          const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
          checkPath.setAttribute('d', 'M5 13l4 4L19 7')
          checkIcon.appendChild(checkPath)
          item.appendChild(itemDot)
          item.appendChild(itemIcon)
          item.appendChild(itemLabel)
          item.appendChild(checkIcon)
        } else {
          item.appendChild(itemDot)
          item.appendChild(itemIcon)
          item.appendChild(itemLabel)
        }

        item.addEventListener('click', (e) => {
          e.stopPropagation()
          emit('statusChange', { id: info.event.id, status: opt.value as any })
          closeDropdown()
        })

        dropdown!.appendChild(item)
      })

      el.style.position = 'relative'
      el.appendChild(dropdown)
    }

    const closeDropdown = () => {
      if (dropdown) {
        dropdown.remove()
        dropdown = null
      }
    }

    statusBadge.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault()
      openDropdown()
    })

    const closeOnOutsideClick = (e: MouseEvent) => {
      if (dropdown && !el.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('click', closeOnOutsideClick)

    const cleanup = () => {
      document.removeEventListener('click', closeOnOutsideClick)
    }
    el.addEventListener('mouseleave', () => {
      closeDropdown()
    })

    const observer = new MutationObserver(() => {
      if (!document.contains(el)) {
        closeDropdown()
        observer.disconnect()
        cleanup()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  },
  eventDrop: (arg) => {
    emit('eventChange', {
      id: arg.event.id,
      start: arg.event.start!.toISOString(),
      end: arg.event.end!.toISOString(),
    })
  },
  eventResize: (arg) => {
    emit('eventChange', {
      id: arg.event.id,
      start: arg.event.start!.toISOString(),
      end: arg.event.end!.toISOString(),
    })
  },
  select: (arg) => {
    emit('slotSelect', { start: arg.start, end: arg.end })
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
.fc {
  font-family: var(--font-sans);
  color: var(--color-text);
}

.fc .fc-toolbar.fc-header-toolbar {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.5rem 0;
}

@media (min-width: 640px) {
  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 0.75rem;
    padding: 0.75rem 0.75rem 0;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar.fc-header-toolbar {
    margin-bottom: 1rem;
    padding: 0.75rem 1rem 0;
  }
}

.fc .fc-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.fc .fc-toolbar-chunk {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

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

@media (max-width: 639px) {
  .fc .fc-toolbar {
    justify-content: center;
    gap: 0.375rem;
  }
  
  .fc .fc-toolbar-chunk {
    gap: 0.2rem;
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

.fc .fc-button-primary {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.5rem !important;
  padding: 0.3rem 0.5rem !important;
  font-weight: 500 !important;
  font-size: 0.7rem !important;
  color: var(--color-text-secondary) !important;
  box-shadow: none !important;
  transition: all 0.15s ease !important;
}

@media (min-width: 640px) {
  .fc .fc-button-primary {
    border-radius: 0.5rem !important;
    padding: 0.35rem 0.75rem !important;
    font-size: 0.75rem !important;
  }
}

.fc .fc-button-primary:hover {
  background: var(--color-bg-secondary) !important;
  border-color: var(--color-border-strong) !important;
  color: var(--color-text) !important;
}

.fc .fc-button-primary:not(:disabled):active,
.fc .fc-button-primary:not(:disabled).fc-button-active {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-text-inverse) !important;
  box-shadow: none !important;
}

.fc .fc-button-primary:disabled {
  opacity: 0.4 !important;
}

.fc .fc-prev-button,
.fc .fc-next-button {
  padding: 0.3rem !important;
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
}

.fc .fc-prev-button:hover,
.fc .fc-next-button:hover {
  background: var(--color-bg-secondary) !important;
  border-color: var(--color-border-strong) !important;
  color: var(--color-text) !important;
}

.fc .fc-prev-button .fc-icon,
.fc .fc-next-button .fc-icon {
  font-size: 1rem !important;
}

@media (min-width: 640px) {
  .fc .fc-prev-button,
  .fc .fc-next-button {
    padding: 0.35rem 0.5rem !important;
  }
  
  .fc .fc-prev-button .fc-icon,
  .fc .fc-next-button .fc-icon {
    font-size: 1.125rem !important;
  }
}

.fc .fc-today-button {
  font-weight: 600 !important;
}

.fc .fc-button-group {
  display: flex;
  gap: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

@media (min-width: 640px) {
  .fc .fc-button-group {
    border-radius: 0.5rem;
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

.fc .fc-button-group .fc-button-primary:last-child {
  border-top-right-radius: 0.5rem !important;
  border-bottom-right-radius: 0.5rem !important;
}

.fc .fc-button-group .fc-button-primary.fc-button-active {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-text-inverse) !important;
}

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
  letter-spacing: -0.01em;
}

@media (min-width: 640px) {
  .fc .fc-toolbar-title {
    font-size: 1rem;
    padding: 0 1rem;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar-title {
    font-size: 1.125rem;
  }
}

.fc-theme-standard .fc-scrollgrid {
  border: none;
  border-radius: 0;
  overflow: hidden;
}

.fc-theme-standard .fc-scrollgrid-section > td {
  border: none;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: var(--color-border-subtle);
}

.fc .fc-col-header-cell {
  background: transparent;
  padding: 0.5rem 0.25rem !important;
  font-weight: 600;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border) !important;
}

@media (min-width: 640px) {
  .fc .fc-col-header-cell {
    padding: 0.625rem 0.5rem !important;
    font-size: 0.75rem;
  }
}

.fc .fc-col-header-cell-cushion {
  color: var(--color-text-muted);
  text-decoration: none !important;
}

.fc .fc-timegrid-slot {
  height: 2.5rem !important;
  border-color: var(--color-border-subtle) !important;
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
  border-color: var(--color-border-subtle) !important;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot-label {
    font-size: 0.6875rem;
  }
}

.fc .fc-timegrid-slot-label-cushion {
  padding: 0.25rem 0.5rem;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot-label-cushion {
    padding: 0.375rem 0.75rem;
  }
}

.fc .fc-timegrid-col {
  border-color: var(--color-border-subtle) !important;
}

.fc-v-event {
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.45rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.15s ease;
  overflow: hidden;
  position: relative;
}

@media (min-width: 640px) {
  .fc-v-event {
    border-radius: 0.5rem;
    padding: 0.3rem 0.5rem;
    font-size: 0.8125rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }
}

.fc-v-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.agenda-event-inner.agenda-month-view {
  gap: 0.125rem;
}

.agenda-event-top {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.55rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 0.08rem 0.15rem;
  margin: -0.08rem -0.15rem;
  border-radius: 0.2rem;
  transition: background 0.12s ease;
  min-width: 0;
  overflow: hidden;
}

.agenda-event-top:hover {
  background: rgba(255, 255, 255, 0.12);
}

.agenda-event-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.agenda-event-status-icon {
  width: 0.6rem;
  height: 0.6rem;
  flex-shrink: 0;
  opacity: 0.8;
}

.agenda-event-status {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agenda-event-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (min-width: 640px) {
  .agenda-event-title {
    font-size: 0.8125rem;
  }
}

.agenda-event-service {
  font-size: 0.66rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-event-group-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 0.2rem;
  padding: 0 0.2rem;
  line-height: 1.1;
  vertical-align: middle;
}

.agenda-event-time {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-status-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  box-shadow: var(--shadow-xl);
  padding: 0.3rem;
  min-width: 140px;
  animation: agenda-dropdown-in 0.12s ease-out;
}

@keyframes agenda-dropdown-in {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: translateY(0); }
}

.agenda-status-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.35rem 0.45rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.1s ease;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
}

.agenda-status-option:hover {
  background: var(--color-bg-secondary);
}

.agenda-status-option-active {
  background: var(--color-bg-secondary);
}

.agenda-status-option-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.agenda-status-option-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.agenda-status-option-label {
  flex: 1;
}

.agenda-status-option-check {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  color: var(--color-primary);
}

.fc-v-event::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0.2rem;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem 0 0 0.5rem;
}

@media (min-width: 640px) {
  .fc-v-event .fc-event-time {
    font-size: 0.6875rem;
  }
}

.fc .fc-bg-event {
  opacity: 0.5;
  border-radius: 0;
}

.fc .fc-highlight {
  background: var(--color-primary-light) !important;
}

.fc .fc-cell-shaded,
.fc .fc-day-disabled {
  background: var(--color-bg);
}

.fc .fc-day-today {
  background: var(--color-primary-light) !important;
}

.fc .fc-day-today .fc-col-header-cell-cushion {
  color: var(--color-primary);
  font-weight: 700;
}

.fc .fc-more-link {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.625rem;
  padding: 0.1rem 0.2rem;
  border-radius: 0.25rem;
  transition: all 0.15s;
}

@media (min-width: 640px) {
  .fc .fc-more-link {
    font-size: 0.6875rem;
    padding: 0.15rem 0.35rem;
    border-radius: 0.3rem;
  }
}

.fc .fc-more-link:hover {
  background: var(--color-primary-light);
}

.fc .fc-popover {
  border-radius: 0.625rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  background: var(--color-surface);
}

.fc .fc-popover-header {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0.5rem 0.75rem;
  border-radius: 0.625rem 0.625rem 0 0;
}

.fc .fc-popover-title {
  font-weight: 600;
  font-size: 0.8125rem;
}

.fc .fc-popover-body {
  background: var(--color-surface);
}

.fc-daygrid-day {
  min-height: 3.5rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day {
    min-height: 5.5rem;
  }
}

.fc-daygrid-day-number {
  font-weight: 500;
  padding: 0.3rem;
  font-size: 0.7rem;
  color: var(--color-text);
}

@media (min-width: 640px) {
  .fc-daygrid-day-number {
    padding: 0.4rem;
    font-size: 0.8125rem;
  }
}

.fc-daygrid-day.fc-day-today {
  background: var(--color-primary-light);
}

.fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50%;
  width: 1.375rem;
  height: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.6875rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }
}

.fc-daygrid-event {
  border-radius: 0.2rem;
  font-size: 0.6rem;
  font-weight: 500;
  padding: 0.05rem 0.2rem;
}

@media (min-width: 640px) {
  .fc-daygrid-event {
    border-radius: 0.3rem;
    font-size: 0.6875rem;
    padding: 0.08rem 0.3rem;
  }
}

@media (max-width: 480px) {
  .fc .fc-toolbar-title {
    font-size: 0.7rem;
  }
  
  .fc .fc-col-header-cell {
    font-size: 0.5625rem;
    padding: 0.3rem 0.1rem !important;
  }
  
  .fc .fc-timegrid-slot-label {
    font-size: 0.5rem;
  }
  
  .fc-daygrid-day {
    min-height: 2.5rem;
  }
}

.dark .fc-theme-standard .fc-scrollgrid {
  border-color: var(--color-border);
}

.dark .fc-theme-standard td,
.dark .fc-theme-standard th {
  border-color: var(--color-border);
}

.dark .fc .fc-col-header-cell {
  background: transparent;
}

.dark .fc .fc-cell-shaded,
.dark .fc .fc-day-disabled {
  background: var(--color-bg);
}

.dark .fc .fc-timegrid-slot-label {
  color: var(--color-text-muted);
}

.dark .fc-v-event {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dark .fc-daygrid-day-number {
  color: var(--color-text);
}
</style>
