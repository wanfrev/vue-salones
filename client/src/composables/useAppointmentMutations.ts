import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from './useNotification'
import { saveCita, updateCitaStatus, updateAppointmentTime, deleteCita } from '../services/agendaService'
import type { CitaFormData } from '../types/cita'

export function useAppointmentMutations(options: {
  businessId: import('vue').Ref<string | null>
  createdBy?: import('vue').Ref<string | null | undefined>
  modalRef?: import('vue').Ref<{ close: () => void; onSaveComplete?: () => void } | null>
  invalidateKeys?: ((businessId: string) => readonly any[])
}) {
  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()

  const invalidate = () => {
    const keys = [
      ['appointments'],
      ['pos-pending'],
      ['clientes'],
      ['cliente'],
      ['cliente-historial'],
      ['finanzas-transactions'],
      ['financial-summary'],
      ['finanzas-employee-payments'],
      ['dashboard-services'],
      ['dashboard-payments'],
      ['dashboard-history'],
      ['employee-appointments'],
      ['employee-earnings'],
      ['employee-history'],
    ]
    for (const key of keys) {
      queryClient.invalidateQueries({ queryKey: key })
    }
  }

  const saveCitaMutation = useMutation({
    mutationFn: (data: CitaFormData & { id?: string; clientPhone?: string }) =>
      saveCita(options.businessId.value!, data, options.createdBy?.value),
    onSuccess: () => {
      invalidate()
      options.modalRef?.value?.close()
      options.modalRef?.value?.onSaveComplete?.()
      success('Cita guardada correctamente')
    },
    onError: (err) => {
      options.modalRef?.value?.onSaveComplete?.()
      showError(err instanceof Error ? err.message : 'Error al guardar la cita')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'paid' }) =>
      updateCitaStatus(id, status),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al actualizar el estado de la cita')
    },
  })

  const updateTimeMutation = useMutation({
    mutationFn: ({ id, start, end }: { id: string; start: string; end: string }) =>
      updateAppointmentTime(id, start, end),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al reagendar la cita')
    },
  })

  const deleteCitaMutation = useMutation({
    mutationFn: (id: string) => deleteCita(id),
    onSuccess: () => {
      invalidate()
      options.modalRef?.value?.close()
      options.modalRef?.value?.onSaveComplete?.()
      success('Cita eliminada correctamente')
    },
    onError: (err) => {
      options.modalRef?.value?.onSaveComplete?.()
      showError(err instanceof Error ? err.message : 'Error al eliminar la cita')
    },
  })

  const handleDeleteCita = (id: string) => {
    const msg = '¿Eliminar esta cita?\n\nEsta acción no se puede deshacer.'
    if (window.confirm(msg)) {
      deleteCitaMutation.mutate(id)
    }
  }

  const handleSaveCita = async (data: CitaFormData & { id?: string; clientPhone?: string }) => {
    try {
      await saveCitaMutation.mutateAsync(data)
    } catch {
      // Error handled by onError callback
    }
  }

  const handleStatusChange = async ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'paid' }) => {
    await updateStatusMutation.mutateAsync({ id, status })
    success(`Estado actualizado a ${status}`)
  }

  const handleEventChange = async ({ id, start, end }: { id: string; start: string; end: string }) => {
    await updateTimeMutation.mutateAsync({ id, start, end })
    success('Cita reagendada correctamente')
  }

  return {
    saveCitaMutation,
    updateStatusMutation,
    updateTimeMutation,
    deleteCitaMutation,
    handleSaveCita,
    handleStatusChange,
    handleEventChange,
    handleDeleteCita,
  }
}
