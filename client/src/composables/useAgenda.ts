import { ref, computed } from 'vue'
import { useQuery, keepPreviousData } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import type { Profile, Service } from '../types/database'

function defaultWeekRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  end.setMilliseconds(-1)
  return { start, end }
}

export const useAgenda = () => {
  const authStore = useAuthStore()
  const businessId = computed(() => authStore.businessId)

  const selectedEmployeeId = ref<string | 'all'>('all')
  const dateRange = ref(defaultWeekRange())

  const setDateRange = (start: Date, end: Date) => {
    dateRange.value = { start, end }
  }

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: computed(() => ['employees', businessId.value]),
    queryFn: async (): Promise<Profile[]> => {
      if (!businessId.value) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('business_id', businessId.value)
        .eq('role', 'empleado')
        .eq('active', true)
      if (error) throw error
      return data as Profile[]
    },
    enabled: computed(() => !!businessId.value),
  })

  const { data: services } = useQuery({
    queryKey: computed(() => ['services', businessId.value]),
    queryFn: async (): Promise<Service[]> => {
      if (!businessId.value) return []
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId.value)
        .eq('active', true)
      if (error) throw error
      return data as Service[]
    },
    enabled: computed(() => !!businessId.value),
  })

  const { data: schedules } = useQuery({
    queryKey: computed(() => ['schedules', businessId.value, selectedEmployeeId.value]),
    queryFn: async (): Promise<any[]> => {
      if (!businessId.value) return []
      let query = supabase
        .from('employee_schedules')
        .select('*, profiles!inner(business_id)')
        .eq('profiles.business_id', businessId.value)
      if (selectedEmployeeId.value !== 'all') {
        query = query.eq('employee_id', selectedEmployeeId.value)
      }
      const { data, error } = await query
      if (error) throw error
      return data as any[]
    },
    enabled: computed(() => !!businessId.value),
  })

  const { data: appointments, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: computed(() => ['appointments', businessId.value, selectedEmployeeId.value, dateRange.value] as const),
    queryFn: async ({ queryKey }): Promise<any[]> => {
      const [, bizId, empId, range] = queryKey
      if (!bizId) return []
      const { start, end } = range as { start: Date; end: Date }
      let query = supabase
        .from('appointments')
        .select('*, clients(id, full_name), profiles(full_name)')
        .eq('business_id', bizId)
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
      if (empId !== 'all') {
        query = query.eq('employee_id', empId)
      }
      const { data, error } = await query
      if (error) throw error
      return data as any[]
    },
    enabled: computed(() => !!businessId.value),
    staleTime: 0,
    placeholderData: keepPreviousData,
  })

  return {
    selectedEmployeeId,
    dateRange,
    setDateRange,
    employees,
    loadingEmployees,
    services,
    schedules,
    appointments,
    loadingAppointments,
    refetchAppointments,
  }
}
