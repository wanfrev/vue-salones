import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth'
import type { Appointment, Profile, Service } from '../types/database'

const IS_MOCK = import.meta.env.VITE_USE_LOCAL_MOCK === 'true'

export const useAgenda = () => {
  const authStore = useAuthStore()
  const businessId = computed(() => authStore.businessId)

  const selectedEmployeeId = ref<string | 'all'>('all')
  const dateRange = ref({ start: new Date(), end: new Date() })

  const setDateRange = (start: Date, end: Date) => {
    dateRange.value = { start, end }
  }

  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees', businessId],
    queryFn: async (): Promise<Profile[]> => {
      if (IS_MOCK || !businessId.value) return []
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('business_id', businessId.value)
        .eq('role', 'empleado')
        .eq('active', true)
      if (error) throw error
      return data as Profile[]
    },
    enabled: computed(() => !IS_MOCK && !!businessId.value),
  })

  const { data: services } = useQuery({
    queryKey: ['services', businessId],
    queryFn: async (): Promise<Service[]> => {
      if (IS_MOCK || !businessId.value) return []
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId.value)
        .eq('active', true)
      if (error) throw error
      return data as Service[]
    },
    enabled: computed(() => !IS_MOCK && !!businessId.value),
  })

  const { data: schedules } = useQuery({
    queryKey: ['schedules', businessId, selectedEmployeeId],
    queryFn: async (): Promise<any[]> => {
      if (IS_MOCK || !businessId.value) return []
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
    enabled: computed(() => !IS_MOCK && !!businessId.value),
  })

  const { data: appointments, isLoading: loadingAppointments, refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments', businessId, selectedEmployeeId, dateRange],
    queryFn: async (): Promise<Appointment[]> => {
      if (IS_MOCK || !businessId.value) return []
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId.value)
        .gte('start_time', dateRange.value.start.toISOString())
        .lte('start_time', dateRange.value.end.toISOString())
      if (selectedEmployeeId.value !== 'all') {
        query = query.eq('employee_id', selectedEmployeeId.value)
      }
      const { data, error } = await query
      if (error) throw error
      return data as Appointment[]
    },
    enabled: computed(() => !IS_MOCK && !!businessId.value),
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
