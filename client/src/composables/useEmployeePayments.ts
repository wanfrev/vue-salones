import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { supabase } from '../lib/supabase'
import { useNotification } from './useNotification'
import {
  listEmployeePayments,
  createEmployeePayment,
  employeePaymentKeys,
} from '../services/employeePaymentsService'

interface EmployeeOption {
  id: string
  name: string
}

export function useEmployeePayments(
  businessId: import('vue').Ref<string | null>,
  periodDates?: import('vue').Ref<{ start: string; end: string }>,
) {
  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: computed(() => [
      ...employeePaymentKeys.all(businessId.value),
      periodDates?.value.start ?? null,
      periodDates?.value.end ?? null,
    ] as const),
    queryFn: () => listEmployeePayments(
      businessId.value!,
      periodDates?.value.start,
      periodDates?.value.end,
    ),
    enabled: computed(() => !!businessId.value),
  })

  const paymentsMade = computed(() => paymentsData.value ?? [])

  const createMutation = useMutation({
    mutationFn: (params: {
      employeeId: string
      amount: number
      method: string
      notes: string
      date: string
    }) => createEmployeePayment(businessId.value!, params.employeeId, params.amount, params.method, params.notes, params.date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
      success('Pago registrado correctamente')
      closeModal()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al registrar el pago')
    },
  })

  const showPaymentModal = ref(false)
  const paymentForm = ref({
    employeeId: '',
    amount: 0,
    method: 'cash',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  })
  const employeeList = ref<EmployeeOption[]>([])

  const loadEmployees = async () => {
    if (!businessId.value || employeeList.value.length > 0) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('business_id', businessId.value)
      .eq('role', 'empleado')
      .eq('active', true)
      .order('full_name')
    if (!error) {
      employeeList.value = (data ?? []).map((p: any) => ({
        id: p.id, name: p.full_name,
      }))
    }
  }

  const openModal = async () => {
    paymentForm.value = {
      employeeId: '',
      amount: 0,
      method: 'cash',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    showPaymentModal.value = true
    await loadEmployees()
  }

  const closeModal = () => {
    showPaymentModal.value = false
  }

  const handleSave = () => {
    if (!paymentForm.value.employeeId) {
      showError('Selecciona un empleado')
      return
    }
    if (paymentForm.value.amount <= 0) {
      showError('El monto debe ser mayor a 0')
      return
    }
    createMutation.mutate(paymentForm.value)
  }

  return {
    paymentsMade,
    isLoading,
    createMutation,
    showPaymentModal,
    paymentForm,
    employeeList,
    openModal,
    closeModal,
    handleSave,
  }
}
