<template>
  <div class="flex-1 overflow-hidden rounded-lg border border-border bg-surface sm:rounded-xl">
    <div class="h-full flex flex-col">
      <div class="grid grid-cols-7 border-b border-border bg-bg-secondary/40">
        <div
          v-for="dayName in dayNames"
          :key="dayName"
          class="py-2 text-center text-[11px] font-semibold text-text-muted uppercase tracking-wide sm:text-xs sm:py-2.5"
        >
          {{ dayName }}
        </div>
      </div>
      <div class="grid grid-cols-7 flex-1" style="grid-template-rows: repeat(6, 1fr);">
        <div
          v-for="(cell, idx) in cells"
          :key="idx"
          class="border-r border-b border-border-subtle/60 p-1 sm:p-1.5 cursor-pointer transition-colors hover:bg-bg-secondary/40 min-h-[64px] sm:min-h-[80px]"
          :class="[
            cell.iso === todayIso ? 'bg-primary-light/40' : '',
            cell.isCurrentMonth ? '' : 'opacity-30',
            cell.iso ? 'hover:bg-bg-secondary/60' : '',
            (idx % 7) === 6 ? 'border-r-0' : '',
          ]"
          @click="cell.iso && $emit('goToDate', cell.iso)"
        >
          <span
            class="inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold sm:h-6 sm:w-6 sm:text-sm"
            :class="cell.iso === todayIso ? 'bg-primary text-white' : cell.iso === selectedDate ? 'bg-primary/15 text-primary' : 'text-text'"
          >
            {{ cell.number }}
          </span>
          <div class="mt-0.5 space-y-0.5 overflow-hidden">
            <div
              v-for="appt in cell.appointments.slice(0, 2)"
              :key="appt.id"
              class="flex items-center gap-1 rounded px-1 py-px cursor-pointer transition-colors hover:brightness-95"
              :class="monthCardBg(appt.status)"
              @click.stop="$emit('eventClick', appt.raw)"
            >
              <span class="h-1.5 w-1.5 rounded-full flex-shrink-0" :class="statusDotClass(appt.status)" />
              <span class="text-[9px] font-medium leading-tight truncate sm:text-[10px]">{{ appt.clientName }}</span>
              <span class="text-[8px] text-text-muted ml-auto flex-shrink-0 hidden sm:inline">{{ appt.time }}</span>
            </div>
            <div
              v-if="cell.appointments.length > 2"
              class="text-[9px] font-medium text-text-muted pl-1"
            >
              +{{ cell.appointments.length - 2 }} más
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toISODate, dateToHHmm, normalizeAppointmentStatus } from '../../lib/formatters'

const props = defineProps<{
  appointments: any[]
  services: any[]
  employeeId: string | 'all'
  selectedDate: string
  todayIso: string
}>()

defineEmits<{
  eventClick: [raw: any]
  goToDate: [iso: string]
}>()

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const statusDotClass = (s: string) => {
  const map: Record<string, string> = {
    confirmed: 'bg-primary', pending: 'bg-warning', paid: 'bg-success',
    cancelled: 'bg-danger', no_show: 'bg-danger',
  }
  return map[s] || 'bg-primary'
}

const monthCardBg = (s: string) => {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-50 dark:bg-emerald-950/30',
    pending: 'bg-amber-50 dark:bg-amber-950/30',
    paid: 'bg-green-50 dark:bg-green-950/20',
    cancelled: 'bg-red-50/60 dark:bg-red-950/15',
    no_show: 'bg-red-50/60 dark:bg-red-950/15',
  }
  return map[s] || 'bg-zinc-50 dark:bg-zinc-900/30'
}

function getApptsForDate(iso: string) {
  return props.appointments
    .filter(a => {
      if (toISODate(new Date(a.start_time)) !== iso) return false
      if (props.employeeId !== 'all' && a.employee_id !== props.employeeId) return false
      return true
    })
    .map(a => {
      const svc = props.services.find((s: any) => s.id === a.service_id)
      return {
        id: a.id,
        clientName: a.clients?.full_name || 'Cliente',
        service: svc?.name || 'Servicio',
        time: dateToHHmm(new Date(a.start_time)),
        status: normalizeAppointmentStatus(a),
        raw: a,
      }
    })
    .sort((a, b) => a.time.localeCompare(b.time))
}

const cells = computed(() => {
  const d = new Date(props.selectedDate + 'T12:00:00')
  const year = d.getFullYear()
  const month = d.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay()
  const prevMonthLast = new Date(year, month, 0).getDate()
  const totalDays = lastDay.getDate()

  const result: {
    number: number
    iso: string | null
    isCurrentMonth: boolean
    appointments: ReturnType<typeof getApptsForDate>
  }[] = []

  // Previous month filler
  for (let i = startDow - 1; i >= 0; i--) {
    const pm = month === 0 ? 11 : month - 1
    const py = month === 0 ? year - 1 : year
    result.push({
      number: prevMonthLast - i,
      iso: toISODate(new Date(py, pm, prevMonthLast - i)),
      isCurrentMonth: false,
      appointments: getApptsForDate(toISODate(new Date(py, pm, prevMonthLast - i))),
    })
  }

  // Current month
  for (let day = 1; day <= totalDays; day++) {
    const iso = toISODate(new Date(year, month, day))
    result.push({
      number: day, iso, isCurrentMonth: true,
      appointments: getApptsForDate(iso),
    })
  }

  // Fill to 42 cells
  while (result.length < 42) {
    const nm = month === 11 ? 0 : month + 1
    const ny = month === 11 ? year + 1 : year
    const dayNum = result.length - totalDays - startDow + 1
    const iso = toISODate(new Date(ny, nm, dayNum))
    result.push({
      number: dayNum, iso, isCurrentMonth: false,
      appointments: getApptsForDate(iso),
    })
  }

  return result
})
</script>
