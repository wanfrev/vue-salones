import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { toISODate } from '../lib/formatters'
import { listCitas, agendaKeys } from '../services/agendaService'
import { listServicios, serviciosKeys } from '../services/serviciosService'
import { listEquipo, equipoKeys } from '../services/equipoService'
import { useBusinessStore } from '../store/business'
import type { Cita } from '../types/cita'

export function useAdminAgenda(businessId: () => string | null) {
  const selectedDate = ref<Date>(new Date())
  const businessStore = useBusinessStore()

  const currentBranchId = computed(() => businessStore.currentBranchId)

  const dateRange = computed(() => {
    const start = new Date(selectedDate.value)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  })

  const { data: citasData, isLoading } = useQuery({
    queryKey: computed(() => [...agendaKeys.appointments(businessId(), currentBranchId.value), toISODate(selectedDate.value)]),
    queryFn: () => listCitas(businessId()!, dateRange.value, undefined, currentBranchId.value),
    enabled: computed(() => !!businessId()),
  })

  const { data: serviciosData } = useQuery({
    queryKey: computed(() => serviciosKeys.all(businessId())),
    queryFn: () => listServicios(businessId()!),
    enabled: computed(() => !!businessId()),
  })

  const { data: empleadosData } = useQuery({
    queryKey: computed(() => equipoKeys.all(businessId())),
    queryFn: () => listEquipo(businessId()!),
    enabled: computed(() => !!businessId()),
  })

  const citas = computed<Cita[]>(() => citasData.value ?? [])

  const goToToday = () => {
    selectedDate.value = new Date()
  }

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
    payType: employee.payType,
    payPercentage: employee.payPercentage,
  })))

  return {
    selectedDate,
    citas,
    isLoading,
    stats,
    serviciosList,
    empleadosList,
    todayLabel,
    isToday,
    goToToday,
  }
}
