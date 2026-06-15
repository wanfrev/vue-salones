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
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">En Silla</span>
        </div>
        <div class="flex items-center gap-1 rounded-md px-1.5 py-0.5">
          <span class="h-2 w-2 rounded-full" style="background: var(--color-success)"></span>
          <span class="text-[10px] font-medium text-text-muted sm:text-[11px]">Cobrada</span>
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
          @click="currentView = view.value"
          class="px-3 py-1.5 text-xs font-medium rounded-md transition-theme"
          :class="currentView === view.value
            ? 'bg-primary text-text-inverse shadow-sm'
            : 'text-text-secondary hover:text-text'"
        >
          {{ view.label }}
        </button>
      </div>
    </div>

    <!-- Mobile: Date Selector Carousel -->
    <div v-if="isMobile && currentView === 'day'" class="-mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div class="flex gap-1.5 min-w-max pb-2">
        <button
          v-for="day in weekDays"
          :key="day.date"
          @click="viewDate = day.jsDate"
          class="flex flex-col items-center rounded-lg px-3 py-1.5 min-w-[48px] transition-theme"
          :class="day.date === selectedDateIso
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

    <!-- Calendario Vue-Cal -->
    <div class="flex-1 overflow-hidden rounded-lg border border-border bg-surface shadow-sm sm:rounded-xl vue-cal-wrapper" :class="{ 'vuecal-mobile-scroll': isMobile && hasSchedules }">
      <VueCal
        v-model:events="displayEvents"
        v-model:view="currentView"
        v-model:view-date="viewDate"
        :schedules="employeeSchedules"
        :editable-events="editableConfig"
        :views="['day', 'week', 'month']"
        :time-from="420"
        :time-to="1260"
        :snap-to-interval="15"
        :dark="isDark"
        :locale="'es'"
        :sticky-schedule-headers="true"
        :hide-weekend="false"
        @ready="onReady"
        @event-drag-end="onEventDragEnd"
        @event-resize-end="onEventResizeEnd"
        @event-drop="onEventDrop"
        @cell-click="onCellClick"
        @event-click="onEventClick"
      >
        <template #event="{ event, view }">
          <div
            class="agenda-event-card"
            :class="[`agenda-status-${event._customStatus}`, view.isMonth ? 'agenda-event-month' : '']"
            @click.stop
          >
            <!-- Header row: time + status dot + group badge -->
            <div class="agenda-event-header">
              <button
                class="agenda-event-dot"
                :class="`dot-status-${event._customStatus}`"
                :title="event._statusLabel"
                @click.stop="toggleStatusDropdown(event)"
              />
              <span v-if="!view.isMonth" class="agenda-event-time">{{ event._.startTimeFormatted24 }}</span>
              <span v-if="event._hasGroup" class="agenda-event-group" title="Multiples servicios">+</span>
              <div class="agenda-event-actions">
                <!-- Checkout Express -->
                <button
                  v-if="event._customStatus !== 'paid' && event._customStatus !== 'cancelled' && !view.isMonth"
                  class="agenda-event-checkout"
                  title="Cobrar cita"
                  @click.stop="emitCheckout(event)"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Body: client name + service badge + employee avatar -->
            <div class="agenda-event-body">
              <div class="agenda-event-client">{{ event.title }}</div>
              <div v-if="!view.isMonth" class="agenda-event-meta">
                <span class="agenda-event-service">{{ event._serviceName }}</span>
                <span v-if="event._employeeInitials" class="agenda-event-employee">{{ event._employeeInitials }}</span>
              </div>
            </div>

            <!-- Status icon (bottom right) -->
            <div v-if="!view.isMonth" class="agenda-event-status-icon">
              <!-- Pending: clock -->
              <svg v-if="event._customStatus === 'pending'" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Confirmed: salon/chair -->
              <svg v-else-if="event._customStatus === 'confirmed'" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <!-- Paid: check -->
              <svg v-else-if="event._customStatus === 'paid'" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <!-- Cancelled: X -->
              <svg v-else class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <!-- Status Dropdown (teleported to body) -->
            <Teleport to="body">
              <div
                v-if="activeDropdown?.id === event._.id"
                class="agenda-status-dropdown"
                :style="dropdownStyle"
              >
                <button
                  v-for="opt in STATUS_OPTIONS"
                  :key="opt.value"
                  class="agenda-status-option"
                  :class="{ 'agenda-status-option-active': event._customStatus === opt.value }"
                  @click.stop="changeStatus(event, opt.value)"
                >
                  <span class="agenda-status-dot" :class="`dot-status-${opt.value}`" />
                  <span class="agenda-status-label">{{ opt.label }}</span>
                  <span v-if="event._customStatus === opt.value" class="agenda-status-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                  </span>
                </button>
              </div>
            </Teleport>
          </div>
        </template>
      </VueCal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { getStatusLabel, normalizeAppointmentStatus, dateToHHmm, toISODate, getInitials } from '../../lib/formatters'
import { useAgenda } from '../../composables/useAgenda'
import { useAuthStore } from '../../store/auth'
import { isAdminPanelRole } from '../../constants/roles'
import type { Cita } from '../../types/cita'

const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => isAdminPanelRole(authStore.role ?? undefined))
const isDark = computed(() => document.documentElement.classList.contains('dark'))

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
  eventChange: [payload: { id: string; start: string; end: string; employeeId?: string }]
  slotSelect: [payload: { start: Date; end: Date }]
  checkout: [appointmentId: string]
}>()

const {
  selectedEmployeeId,
  setDateRange,
  employees,
  loadingEmployees,
  services,
  appointments,
} = useAgenda()

// --- Responsive ---
const isMobile = ref(window.innerWidth < 1024)
const onResize = () => { isMobile.value = window.innerWidth < 1024 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// --- View State ---
type ViewType = 'day' | 'week' | 'month'
const currentView = ref<ViewType>(isMobile.value ? 'day' : 'week')
const viewDate = ref(new Date())
const selectedDateIso = ref(toISODate(new Date()))

const mobileViewOptions = [
  { value: 'day' as const, label: 'Dia' },
  { value: 'week' as const, label: 'Semana' },
  { value: 'month' as const, label: 'Mes' },
]

watch(isMobile, (mobile) => {
  currentView.value = mobile ? 'day' : 'week'
})

watch(() => viewDate.value, (date) => {
  selectedDateIso.value = toISODate(date)
})

// --- Week days carousel ---
const weekDays = computed(() => {
  const selected = new Date(selectedDateIso.value + 'T12:00:00')
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
      jsDate: new Date(date),
      label: dayNames[date.getDay()],
      number: date.getDate(),
      isToday: dateStr === todayStr,
    })
  }
  return days
})

// --- Employee schedules as columns ---
const hasSchedules = computed(() => {
  const emps = employees.value ?? []
  return isAdmin.value && (selectedEmployeeId.value === 'all' || emps.length > 1)
})

const employeeSchedules = computed(() => {
  const emps = employees.value ?? []
  if (!hasSchedules.value) return undefined
  if (selectedEmployeeId.value !== 'all') {
    const emp = emps.find(e => e.id === selectedEmployeeId.value)
    if (emp) return [{ id: emp.id, label: emp.full_name, class: 'vc-schedule-employee' }]
    return undefined
  }
  return emps.map(emp => ({
    id: emp.id,
    label: emp.full_name,
    class: 'vc-schedule-employee',
  }))
})

// --- Status helpers ---
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'paid', label: 'Pagada' },
  { value: 'cancelled', label: 'Cancelada' },
] as const

// --- Editable config ---
const editableConfig = computed(() => isAdmin.value
  ? { drag: true, resize: true, create: true, delete: false }
  : { drag: false, resize: false, create: false, delete: false }
)

// --- Event mapping ---
interface AgendaEvent {
  _eid?: undefined
  start: string | Date
  end: string | Date
  id?: string
  title?: string
  content?: string
  class?: string
  schedule?: string | number
  _customStatus?: string
  _statusLabel?: string
  _hasGroup?: boolean
  _serviceName?: string
  _employeeName?: string
  _employeeInitials?: string
  _rawAppt?: any
}

const displayEvents = computed<AgendaEvent[]>(() => {
  const events: AgendaEvent[] = []

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
      const serviceName = service?.name || 'Servicio'
      const employeeName = employee?.full_name || 'Empleado'
      const employeeInitials = employeeName !== 'Empleado' ? getInitials(employeeName) : ''

      events.push({
        start: appt.start_time,
        end: appt.end_time,
        id: appt.id,
        title,
        schedule: hasSchedules.value ? appt.employee_id : undefined,
        class: `vc-event-agenda vc-status-${visualStatus}`,
        _customStatus: visualStatus,
        _statusLabel: getStatusLabel(visualStatus),
        _hasGroup: !!groupId,
        _serviceName: serviceName,
        _employeeName: employeeName,
        _employeeInitials: employeeInitials,
        _rawAppt: appt,
      } as any)
    })
  }

  return events
})

// --- Calendar ready ---
const onReady = (ctx: { view: { start: Date; end: Date } }) => {
  setDateRange(ctx.view.start, ctx.view.end)
}

// --- Event drag/resize ---
const onEventDragEnd = ({ event }: { event: any }) => {
  emit('eventChange', {
    id: event.id,
    start: new Date(event.start).toISOString(),
    end: new Date(event.end).toISOString(),
  })
}

const onEventResizeEnd = ({ event }: { event: any }) => {
  emit('eventChange', {
    id: event.id,
    start: new Date(event.start).toISOString(),
    end: new Date(event.end).toISOString(),
  })
}

// --- Event dropped onto different schedule (employee change) ---
const onEventDrop = ({ event }: { event: any; cell: { start: Date; end: Date }; external: boolean }) => {
  emit('eventChange', {
    id: event.id,
    start: new Date(event.start).toISOString(),
    end: new Date(event.end).toISOString(),
    employeeId: event.schedule ? String(event.schedule) : undefined,
  })
}

// --- Cell click (slot select) ---
const onCellClick = ({ cell }: { cell: { start: Date; end: Date } }) => {
  // Ignore clicks on existing events
  emit('slotSelect', { start: cell.start, end: cell.end })
}

// --- Event click ---
const onEventClick = (event: any, nativeEvent: MouseEvent) => {
  const target = nativeEvent?.target as HTMLElement
  if (target?.closest('.agenda-event-dot') || target?.closest('.agenda-event-checkout') || target?.closest('.agenda-status-dropdown')) {
    return
  }

  const raw = event._rawAppt
  if (!raw) return

  const start = new Date(raw.start_time)
  const end = new Date(raw.end_time)
  const service = services.value?.find(s => s.id === raw.service_id)
  const duration = service?.duration_minutes || Math.round((end.getTime() - start.getTime()) / 60000)
  const citaStatus = (event._customStatus || 'confirmed') as Cita['status']

  emit('eventClick', {
    id: raw.id,
    title: event.title,
    start,
    end,
    status: event._customStatus,
    citaData: {
      id: raw.id,
      clientId: raw.client_id,
      clientName: event.title,
      serviceId: raw.service_id,
      service: service?.name || 'Servicio',
      employeeId: raw.employee_id,
      employee: event._employeeName || 'Empleado',
      groupId: raw.group_id || undefined,
      date: toISODate(start),
      time: dateToHHmm(start),
      duration,
      price: Number(service?.price ?? 0),
      status: citaStatus,
      notes: raw.internal_notes || '',
    },
  })
}

// --- Checkout Express ---
const emitCheckout = (event: any) => {
  const raw = event._rawAppt
  if (raw?.id) {
    emit('checkout', raw.id)
  }
}

// --- Status dropdown ---
const activeDropdown = ref<{ id: string | number; event: any } | null>(null)
const dropdownStyle = ref<Record<string, string>>({})

const toggleStatusDropdown = (event: any) => {
  if (activeDropdown.value?.id === event._.id) {
    activeDropdown.value = null
    return
  }

  const dot = document.activeElement as HTMLElement
  const rect = dot?.getBoundingClientRect()
  if (rect) {
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left - 8}px`,
      zIndex: '100',
    }
  }

  activeDropdown.value = { id: event._.id, event }
}

const changeStatus = (event: any, status: string) => {
  emit('statusChange', {
    id: event.id,
    status: status as 'pending' | 'confirmed' | 'cancelled' | 'paid',
  })
  activeDropdown.value = null
}

const onDocumentClick = (e: MouseEvent) => {
  if (activeDropdown.value && !(e.target as HTMLElement)?.closest('.agenda-event-dot') && !(e.target as HTMLElement)?.closest('.agenda-status-dropdown')) {
    activeDropdown.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)

  if (!isAdmin.value && authStore.profile?.id) {
    selectedEmployeeId.value = authStore.profile.id
  }
  const employeeParam = route.query.employee as string | undefined
  if (employeeParam) selectedEmployeeId.value = employeeParam
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<style>
/* ============================================================
   VUE-CAL BASE THEME — mapped to app design tokens
   ============================================================ */

:root {
  --vc-bg: var(--color-surface);
  --vc-text: var(--color-text);
  --vc-text-light: var(--color-text-secondary);
  --vc-text-lighter: var(--color-text-muted);
  --vc-border: var(--color-border);
  --vc-border-light: var(--color-border-subtle);
  --vc-header-bg: var(--color-bg-secondary);
  --vc-header-text: var(--color-text-muted);
  --vc-weekend-bg: var(--color-bg);
  --vc-today-bg: var(--color-primary-light);
  --vc-highlight: var(--color-primary-light);
  --vc-event-bg: var(--color-surface);
  --vc-event-text: var(--color-text);
  --vc-resize-handle: var(--color-primary);
}

.vue-cal-wrapper {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.vue-cal-wrapper .vuecal {
  height: 100%;
  min-height: 0;
}

/* ============================================================
   TOOLBAR & HEADERS
   ============================================================ */

.vuecal__header {
  background: var(--vc-header-bg, var(--color-bg-secondary));
  border-bottom: 1px solid var(--color-border);
}

.vuecal__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

@media (min-width: 640px) { .vuecal__title { font-size: 0.9375rem; } }

.vuecal__title-bar button {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.vuecal__title-bar button:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.vuecal__title-bar button.vuecal--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.vuecal__arrow { color: var(--color-text-secondary); }
.vuecal__arrow:hover { color: var(--color-text); }

.vuecal__cell-header {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  padding: 0.5rem 0.25rem;
}

@media (min-width: 640px) {
  .vuecal__cell-header { font-size: 0.75rem; padding: 0.625rem 0.5rem; }
}

/* ============================================================
   TIME GRID
   ============================================================ */

.vuecal__time-column .vuecal__time-header-label {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  padding: 0.25rem 0.5rem;
}

@media (min-width: 640px) {
  .vuecal__time-column .vuecal__time-header-label { font-size: 0.6875rem; }
}

.vuecal__cells.day-view .vuecal__cell { min-height: 2.5rem; }
@media (min-width: 640px) {
  .vuecal__cells.day-view .vuecal__cell { min-height: 3.5rem; }
}

.vuecal__cell.today { background: var(--color-primary-light); }

/* ============================================================
   SCHEDULE HEADERS
   ============================================================ */

.vuecal__schedule-header {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: 0.375rem 0.5rem;
}

/* ============================================================
   AGENDA EVENT CARDS — Premium Design
   ============================================================ */

.vuecal__event {
  border: none !important;
  background: transparent !important;
  border-radius: 0 !important;
  padding: 0 !important;
  overflow: visible !important;
}

.agenda-event-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-radius: 0.375rem;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  cursor: pointer;
}

.agenda-event-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

/* Status backgrounds */
.agenda-status-pending {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(251, 191, 36, 0.04));
  border-left-color: var(--color-warning) !important;
}

.agenda-status-confirmed {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04));
  border-left-color: var(--color-primary) !important;
}

.agenda-status-paid {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04));
  border-left-color: var(--color-success) !important;
}

.agenda-status-cancelled,
.agenda-status-no_show {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02));
  border-left-color: var(--color-danger) !important;
  opacity: 0.65;
}

/* Status dots */
.dot-status-pending { background: var(--color-warning) !important; }
.dot-status-confirmed { background: var(--color-primary) !important; }
.dot-status-paid { background: var(--color-success) !important; }
.dot-status-cancelled { background: var(--color-danger) !important; }
.dot-status-no_show { background: var(--color-danger) !important; }

/* Event card internals */
.agenda-event-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.375rem 0;
  min-width: 0;
}

.agenda-event-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  background: var(--color-primary);
}

.agenda-event-dot:hover {
  transform: scale(1.3);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.agenda-event-time {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 640px) { .agenda-event-time { font-size: 0.625rem; } }

.agenda-event-group {
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

.agenda-event-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Checkout button */
.agenda-event-checkout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border: none;
  border-radius: 0.25rem;
  background: rgba(34, 197, 94, 0.15);
  color: var(--color-success);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.agenda-event-card:hover .agenda-event-checkout {
  opacity: 1;
}

.agenda-event-checkout:hover {
  background: var(--color-success);
  color: white;
  transform: scale(1.1);
}

.agenda-event-body {
  flex: 1;
  min-width: 0;
  padding: 0.125rem 0.375rem 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.125rem;
}

.agenda-event-client {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 640px) { .agenda-event-client { font-size: 0.75rem; } }

.agenda-event-meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.agenda-event-service {
  font-size: 0.5625rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.agenda-event-employee {
  font-size: 0.5rem;
  font-weight: 700;
  color: var(--color-text-inverse);
  background: var(--color-primary);
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}

@media (min-width: 640px) {
  .agenda-event-service { font-size: 0.625rem; }
  .agenda-event-employee { width: 1.125rem; height: 1.125rem; font-size: 0.5625rem; }
}

/* Status icon (bottom-right corner) */
.agenda-event-status-icon {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  opacity: 0.25;
}

.agenda-status-pending .agenda-event-status-icon { color: var(--color-warning); }
.agenda-status-confirmed .agenda-event-status-icon { color: var(--color-primary); }
.agenda-status-paid .agenda-event-status-icon { color: var(--color-success); }
.agenda-status-cancelled .agenda-event-status-icon,
.agenda-status-no_show .agenda-event-status-icon { color: var(--color-danger); }

/* Month view compact */
.agenda-event-month .agenda-event-header {
  padding: 0.125rem 0.25rem 0;
}

.agenda-event-month .agenda-event-body {
  padding: 0 0.25rem 0.125rem;
}

.agenda-event-month .agenda-event-client {
  font-size: 0.625rem;
}

.agenda-event-month .agenda-event-meta,
.agenda-event-month .agenda-event-time,
.agenda-event-month .agenda-event-status-icon,
.agenda-event-month .agenda-event-actions {
  display: none;
}

/* ============================================================
   STATUS DROPDOWN (teleported to body)
   ============================================================ */

.agenda-status-dropdown {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 0.25rem;
  min-width: 130px;
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

.agenda-status-option:hover { background: var(--color-bg-secondary); }
.agenda-status-option-active { background: var(--color-bg-secondary); }

.agenda-status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
  background: var(--color-primary);
}

.agenda-status-label { flex: 1; }

.agenda-status-check {
  width: 0.75rem;
  height: 0.75rem;
  flex-shrink: 0;
  color: var(--color-primary);
}

.agenda-status-check svg { width: 100%; height: 100%; }

/* ============================================================
   DARK MODE
   ============================================================ */

.vuecal--dark-theme {
  --vc-bg: var(--color-surface);
  --vc-header-bg: var(--color-bg-secondary);
  --vc-weekend-bg: var(--color-bg);
  --vc-border: var(--color-border);
  --vc-border-light: var(--color-border-subtle);
}

.vuecal--dark-theme .agenda-event-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.18);
}
.vuecal--dark-theme .agenda-event-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.25);
}

.vuecal--dark-theme .agenda-status-pending {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.03));
}
.vuecal--dark-theme .agenda-status-confirmed {
  background: linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(129, 140, 248, 0.03));
}
.vuecal--dark-theme .agenda-status-paid {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.03));
}
.vuecal--dark-theme .agenda-status-cancelled {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02));
}

/* ============================================================
   MOBILE HORIZONTAL SCROLL (schedules on small screens)
   ============================================================ */

@media (max-width: 1023px) {
  .vuecal-mobile-scroll .vuecal__cells.day-view {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .vuecal-mobile-scroll .vuecal__cell-split {
    min-width: 220px;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
}
</style>
