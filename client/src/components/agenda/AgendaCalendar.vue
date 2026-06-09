<template>
  <div class="flex h-full flex-col gap-2 sm:gap-3">
    <!-- Panel de Filtros -->
    <div class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 sm:rounded-xl sm:p-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div v-if="isAdmin" class="flex items-center gap-2">
          <div class="relative">
            <select
              id="employee-filter"
              v-model="selectedEmployeeId"
              class="w-full appearance-none rounded-lg border border-border bg-surface pl-3 pr-8 py-1.5 text-sm font-medium text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/15 sm:w-auto sm:pl-3.5 sm:pr-9"
              :disabled="loadingEmployees"
            >
              <option value="all">Todos los empleados</option>
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
        <div v-else class="flex items-center gap-2 px-1">
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
            placeholder="Buscar cliente..."
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
      <div class="flex flex-wrap items-center gap-1 sm:gap-1.5">
        <div class="flex items-center gap-1 rounded-md px-1.5 py-0.5">
          <span class="h-2 w-2 rounded-full" style="background: var(--color-primary)"></span>
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">Confirmada</span>
        </div>
        <div class="flex items-center gap-1 rounded-md px-1.5 py-0.5">
          <span class="h-2 w-2 rounded-full" style="background: var(--color-success)"></span>
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">Pagada</span>
        </div>
        <div class="flex items-center gap-1 rounded-md px-1.5 py-0.5">
          <span class="h-2 w-2 rounded-full" style="background: var(--color-warning)"></span>
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">Pendiente</span>
        </div>
        <div class="flex items-center gap-1 rounded-md px-1.5 py-0.5">
          <span class="h-2 w-2 rounded-full" style="background: var(--color-danger)"></span>
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">Cancelada</span>
        </div>
      </div>
    </div>

    <!-- Mobile: View Switcher -->
    <div v-if="isMobile" class="flex justify-center">
      <div class="inline-flex rounded-lg border border-border bg-surface p-0.5">
        <button
          v-for="view in mobileViewOptions"
          :key="view.value"
          @click="changeMobileView(view.value)"
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-theme"
          :class="mobileView === view.value
            ? 'bg-primary text-text-inverse shadow-sm'
            : 'text-text-secondary hover:text-text'"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <!-- Mobile: Date Selector Carousel -->
    <div v-if="isMobile && mobileView === 'timeGridDay'" class="-mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div class="flex gap-1.5 min-w-max pb-2">
        <button
          v-for="day in weekDays"
          :key="day.date"
          @click="selectedDate = day.date"
          class="flex flex-col items-center rounded-lg px-3 py-1.5 min-w-[48px] transition-theme"
          :class="day.date === selectedDate
            ? 'bg-primary text-text-inverse shadow-sm shadow-primary/25'
            : day.isToday
              ? 'bg-primary-light text-primary border border-primary/20'
              : 'bg-surface border border-border text-text-secondary'"
        >
          <span class="text-[9px] font-semibold uppercase tracking-wide opacity-70">{{ day.label }}</span>
          <span class="text-sm font-bold mt-0.5 leading-tight">{{ day.number }}</span>
        </button>
      </div>
    </div>

    <!-- Calendario -->
    <div class="flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-sm sm:rounded-xl">
      <FullCalendar ref="calendarRef" :options="calendarOptions" class="h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'
import { getStatusLabel, normalizeAppointmentStatus, dateToHHmm, toISODate } from '../../lib/formatters'
import { useAgenda } from '../../composables/useAgenda'
import { useAuthStore } from '../../store/auth'
import { isAdminPanelRole } from '../../constants/roles'
import type { Cita } from '../../types/cita'

const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => isAdminPanelRole(authStore.role ?? undefined))
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const emit = defineEmits<{
  eventClick: [event: {
    id: string
    title: string
    start: Date
    end: Date
    status?: string
    citaData?: Omit<Cita, 'paymentStatus' | 'statusLabel' | 'statusColor'>
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

const isMobile = ref(window.innerWidth < 1024)
const onResize = () => { isMobile.value = window.innerWidth < 1024 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const selectedDate = ref(toISODate(new Date()))

type MobileView = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'
const mobileView = ref<MobileView>('timeGridDay')
const mobileViewOptions = [
  { value: 'timeGridDay' as const, label: 'Dia' },
  { value: 'timeGridWeek' as const, label: 'Semana' },
  { value: 'dayGridMonth' as const, label: 'Mes' },
]

const changeMobileView = (view: MobileView) => {
  mobileView.value = view
  const api = calendarRef.value?.getApi()
  if (api) api.changeView(view)
}

const weekDays = computed(() => {
  const selected = new Date(selectedDate.value + 'T12:00:00')
  const startOfWeek = new Date(selected)
  startOfWeek.setDate(selected.getDate() - selected.getDay())
  const days = []
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  const todayStr = toISODate(new Date())
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    const dateStr = toISODate(date)
    days.push({
      date: dateStr,
      label: dayNames[date.getDay()],
      number: date.getDate(),
      isToday: dateStr === todayStr,
    })
  }
  return days
})

watch(isMobile, (mobile) => {
  const api = calendarRef.value?.getApi()
  if (api) api.changeView(mobile ? mobileView.value : 'timeGridWeek')
})

watch(selectedDate, (date) => {
  const api = calendarRef.value?.getApi()
  if (api) api.gotoDate(date)
})

onMounted(() => {
  if (!isAdmin.value && authStore.profile?.id) {
    selectedEmployeeId.value = authStore.profile.id
  }
  const employeeParam = route.query.employee as string | undefined
  if (employeeParam) selectedEmployeeId.value = employeeParam
  if (isMobile.value) {
    const api = calendarRef.value?.getApi()
    if (api) {
      const now = new Date()
      api.scrollToTime({ hours: now.getHours(), minutes: now.getMinutes() })
    }
  }
})

const getStatusBorderColor = (status: string) => {
  switch (status) {
    case 'paid': return 'var(--color-success)'
    case 'pending': return 'var(--color-warning)'
    case 'cancelled':
    case 'no_show': return 'var(--color-danger)'
    case 'confirmed':
    default: return 'var(--color-primary)'
  }
}

const getStatusDotColor = (status: string) => getStatusBorderColor(status)

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
    const renderedGroups = new Set<string>()

    appointments.value.forEach(appt => {
      const groupId = appt.group_id
      if (groupId && renderedGroups.has(groupId)) return
      if (groupId) renderedGroups.add(groupId)

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
        color: 'transparent',
        borderColor: 'transparent',
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
          borderColor: getStatusBorderColor(visualStatus),
        }
      })
    })
  }

  return events
})

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
  initialView: isMobile.value ? mobileView.value : 'timeGridWeek',
  headerToolbar: isMobile.value ? {
    left: 'prev,next',
    center: 'title',
    right: 'today'
  } : {
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
    const serviceName = extProps?.serviceName || 'Servicio'
    const employeeName = extProps?.employeeName || ''
    const timeText = arg.timeText
    const titleText = arg.event.title
    const isMonthView = arg.view.type === 'dayGridMonth'
    const borderColor = extProps?.borderColor || 'var(--color-primary)'

    const container = document.createElement('div')
    container.className = isMonthView ? 'agenda-card agenda-card-month' : 'agenda-card'
    container.style.borderLeftColor = borderColor

    const header = document.createElement('div')
    header.className = 'agenda-card-header'

    const statusDot = document.createElement('button')
    statusDot.className = 'agenda-card-status-dot'
    statusDot.setAttribute('data-action', 'toggle-status-dropdown')
    statusDot.style.background = borderColor
    statusDot.title = extProps?.statusLabel || ''

    const time = document.createElement('span')
    time.className = 'agenda-card-time'
    time.textContent = timeText || ''

    const groupBadge = extProps?.group_id
      ? (() => {
          const badge = document.createElement('span')
          badge.className = 'agenda-card-group'
          badge.textContent = '+'
          badge.title = 'Multiples servicios'
          return badge
        })()
      : null

    header.appendChild(statusDot)
    if (timeText) header.appendChild(time)
    if (groupBadge) header.appendChild(groupBadge)

    const body = document.createElement('div')
    body.className = 'agenda-card-body'

    const client = document.createElement('div')
    client.className = 'agenda-card-client'
    client.textContent = titleText

    const details = document.createElement('div')
    details.className = 'agenda-card-details'
    details.textContent = employeeName ? `${serviceName} · ${employeeName}` : serviceName

    body.appendChild(client)
    body.appendChild(details)

    container.appendChild(header)
    container.appendChild(body)

    return { domNodes: [container] }
  },
  datesSet: (arg) => {
    setDateRange(arg.start, arg.end)
  },
  slotDuration: '00:15:00',
  slotLabelInterval: '01:00:00',
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
        groupId: ext.group_id || undefined,
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
    if (status) el.setAttribute('data-status', status)

    const statusDot = el.querySelector('[data-action="toggle-status-dropdown"]') as HTMLElement
    if (!statusDot) return

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
        if (status === opt.value) item.classList.add('agenda-status-option-active')

        const dot = document.createElement('span')
        dot.className = 'agenda-status-dot'
        dot.style.background = getStatusDotColor(opt.value)

        const label = document.createElement('span')
        label.className = 'agenda-status-label'
        label.textContent = opt.label

        const check = document.createElement('span')
        check.className = 'agenda-status-check'
        check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'

        item.appendChild(dot)
        item.appendChild(label)
        if (status === opt.value) item.appendChild(check)

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

    statusDot.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault()
      openDropdown()
    })

    const closeOnOutsideClick = (e: MouseEvent) => {
      if (dropdown && !el.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('click', closeOnOutsideClick)

    const cleanup = () => {
      document.removeEventListener('click', closeOnOutsideClick)
    }
    el.addEventListener('mouseleave', () => closeDropdown())

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
    day: 'Dia'
  }
}))
</script>

<style>
/* ============================================================
   FULLCALENDAR BASE
   ============================================================ */

.fc {
  font-family: var(--font-sans);
  color: var(--color-text);
}

.fc .fc-toolbar.fc-header-toolbar {
  margin-bottom: 0;
  padding: 0.5rem 0.5rem 0.25rem;
}

@media (min-width: 640px) {
  .fc .fc-toolbar.fc-header-toolbar {
    padding: 0.75rem 0.75rem 0.5rem;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar.fc-header-toolbar {
    padding: 0.75rem 1rem 0.5rem;
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
    gap: 0.25rem;
  }
  .fc .fc-toolbar-chunk {
    gap: 0.15rem;
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

/* ============================================================
   TOOLBAR BUTTONS
   ============================================================ */

.fc .fc-button-primary {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 0.5rem !important;
  padding: 0.25rem 0.5rem !important;
  font-weight: 500 !important;
  font-size: 0.6875rem !important;
  color: var(--color-text-secondary) !important;
  box-shadow: none !important;
  transition: all 0.15s ease !important;
  text-transform: none !important;
  letter-spacing: 0 !important;
}

@media (min-width: 640px) {
  .fc .fc-button-primary {
    padding: 0.3rem 0.625rem !important;
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
  padding: 0.25rem !important;
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
  font-size: 0.875rem !important;
}

@media (min-width: 640px) {
  .fc .fc-prev-button,
  .fc .fc-next-button {
    padding: 0.3rem 0.5rem !important;
  }
  .fc .fc-prev-button .fc-icon,
  .fc .fc-next-button .fc-icon {
    font-size: 1rem !important;
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
  font-size: 0.8125rem;
  font-weight: 600;
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
    font-size: 0.9375rem;
    padding: 0 0.75rem;
  }
}

@media (min-width: 1024px) {
  .fc .fc-toolbar-title {
    font-size: 1rem;
  }
}

/* ============================================================
   GRID & SLOTS
   ============================================================ */

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
  background: var(--color-bg-secondary);
  padding: 0.5rem 0.25rem !important;
  font-weight: 600;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  font-weight: 600;
}

.fc .fc-timegrid-slot {
  height: 2rem !important;
  border-color: var(--color-border-subtle) !important;
}

@media (min-width: 640px) {
  .fc .fc-timegrid-slot {
    height: 3rem !important;
  }
}

@media (min-width: 1024px) {
  .fc .fc-timegrid-slot {
    height: 3.5rem !important;
  }
}

.fc .fc-timegrid-slot-label {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: 500;
  vertical-align: middle;
  border-color: var(--color-border-subtle) !important;
  font-variant-numeric: tabular-nums;
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

.fc .fc-timegrid-col.fc-day-today {
  background: var(--color-primary-light);
  background: color-mix(in srgb, var(--color-primary-light) 40%, transparent);
}

/* ============================================================
   EVENT CARDS - REDESIGNED
   ============================================================ */

.fc-v-event {
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
  overflow: visible !important;
}

.fc-v-event:hover {
  transform: none !important;
}

.fc-v-event::after {
  display: none !important;
}

.fc-v-event .fc-event-main {
  padding: 0 !important;
}

.fc-v-event .fc-event-title-container {
  display: none !important;
}

/* Event Card Component */
.agenda-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--color-surface);
  border-left: 3px solid var(--color-primary);
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  cursor: pointer;
}

.agenda-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.agenda-card-month {
  border-left-width: 2px;
  border-radius: 0.25rem;
}

.agenda-card-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem 0;
  min-width: 0;
}

.agenda-card-status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.agenda-card-status-dot:hover {
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.agenda-card-time {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) {
  .agenda-card-time {
    font-size: 0.625rem;
  }
}

.agenda-card-group {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  height: 0.875rem;
  font-size: 0.5rem;
  font-weight: 700;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.agenda-card-body {
  flex: 1;
  min-width: 0;
  padding: 0.125rem 0.375rem 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.0625rem;
}

.agenda-card-client {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .agenda-card-client {
    font-size: 0.75rem;
  }
}

.agenda-card-details {
  font-size: 0.5625rem;
  font-weight: 500;
  color: var(--color-text-muted);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .agenda-card-details {
    font-size: 0.625rem;
  }
}

/* Month view compact */
.agenda-card-month .agenda-card-header {
  padding: 0.125rem 0.25rem 0;
}

.agenda-card-month .agenda-card-body {
  padding: 0 0.25rem 0.125rem;
}

.agenda-card-month .agenda-card-client {
  font-size: 0.625rem;
}

.agenda-card-month .agenda-card-details {
  display: none;
}

.agenda-card-month .agenda-card-time {
  font-size: 0.5rem;
}

/* ============================================================
   STATUS DROPDOWN
   ============================================================ */

.agenda-status-dropdown {
  position: absolute;
  top: 0;
  left: 0.75rem;
  z-index: 100;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  min-width: 120px;
  animation: agenda-dropdown-in 0.12s ease-out;
}

@keyframes agenda-dropdown-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.agenda-status-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.1s ease;
  font-size: 0.6875rem;
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

.agenda-status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.agenda-status-label {
  flex: 1;
}

.agenda-status-check {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  color: var(--color-primary);
}

.agenda-status-check svg {
  width: 100%;
  height: 100%;
}

/* ============================================================
   BACKGROUND EVENTS (SCHEDULES)
   ============================================================ */

.fc .fc-bg-event {
  opacity: 0.35;
  border-radius: 0;
}

/* ============================================================
   SELECTION & TODAY
   ============================================================ */

.fc .fc-highlight {
  background: var(--color-primary-light) !important;
  opacity: 0.5;
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

/* ============================================================
   MONTH VIEW
   ============================================================ */

.fc-daygrid-day {
  min-height: 3rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day {
    min-height: 5rem;
  }
}

.fc-daygrid-day-number {
  font-weight: 500;
  padding: 0.25rem;
  font-size: 0.6875rem;
  color: var(--color-text);
}

@media (min-width: 640px) {
  .fc-daygrid-day-number {
    padding: 0.375rem;
    font-size: 0.75rem;
  }
}

.fc-daygrid-day.fc-day-today {
  background: var(--color-primary-light) !important;
}

.fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.625rem;
}

@media (min-width: 640px) {
  .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
    width: 1.375rem;
    height: 1.375rem;
    font-size: 0.6875rem;
  }
}

.fc-daygrid-event {
  border-radius: 0.2rem;
  font-size: 0.6rem;
  font-weight: 500;
  padding: 0.05rem 0.2rem;
  margin-top: 1px;
}

@media (min-width: 640px) {
  .fc-daygrid-event {
    border-radius: 0.25rem;
    font-size: 0.625rem;
    padding: 0.0625rem 0.25rem;
  }
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
    padding: 0.125rem 0.3rem;
    border-radius: 0.25rem;
  }
}

.fc .fc-more-link:hover {
  background: var(--color-primary-light);
}

.fc .fc-popover {
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  background: var(--color-surface);
}

.fc .fc-popover-header {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.fc .fc-popover-title {
  font-weight: 600;
  font-size: 0.8125rem;
}

.fc .fc-popover-body {
  background: var(--color-surface);
}

/* ============================================================
   MOBILE ADJUSTMENTS
   ============================================================ */

@media (max-width: 480px) {
  .fc .fc-toolbar-title {
    font-size: 0.7rem;
  }
  .fc .fc-col-header-cell {
    font-size: 0.5625rem;
    padding: 0.25rem 0.1rem !important;
  }
  .fc .fc-timegrid-slot-label {
    font-size: 0.5rem;
  }
  .fc-daygrid-day {
    min-height: 2.5rem;
  }
  .agenda-card {
    border-left-width: 2px;
    border-radius: 0.25rem;
  }
  .agenda-card-client {
    font-size: 0.625rem;
  }
  .agenda-card-details {
    font-size: 0.5rem;
  }
}

/* ============================================================
   DARK MODE
   ============================================================ */

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

.dark .agenda-card {
  background: var(--color-surface-elevated);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15);
}

.dark .agenda-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .fc-daygrid-day-number {
  color: var(--color-text);
}

/* ============================================================
   SCROLLBAR HIDE UTILITY
   ============================================================ */

@media (max-width: 1023px) {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
</style>
