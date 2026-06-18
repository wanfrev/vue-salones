import { computed, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from './useNotification'
import { supabase } from '../lib/supabase'
import { translateError } from '../lib/errors'

export interface UseCrudOptions<TData, TForm, TId = string> {
  businessId: import('vue').Ref<string | null>
  queryKey: (businessId: string) => readonly any[]
  queryFn: (businessId: string) => Promise<TData[]>
  saveFn: (businessId: string, data: TForm & { id?: TId }) => Promise<TData | void>
  entityName?: string
  deleteFn?: (id: TId) => Promise<void>
  extraInvalidations?: ((businessId: string) => readonly any[])[]
  modalRef?: import('vue').Ref<{ close: () => void } | null>
  deleteConfirmMessage?: (entity: TData) => string
}

export function useCrud<TData, TForm, TId = string>(options: UseCrudOptions<TData, TForm, TId>) {
  const {
    businessId,
    queryKey,
    queryFn,
    saveFn,
    entityName = 'registro',
    deleteFn,
    extraInvalidations = [],
    modalRef,
  } = options

  const queryClient = useQueryClient()
  const { success, error: showError } = useNotification()
  const saveError = ref('')

  const { data, isLoading } = useQuery({
    queryKey: computed(() => queryKey(businessId.value ?? '')),
    queryFn: () => queryFn(businessId.value!),
    enabled: computed(() => !!businessId.value),
  })

  const items = computed<TData[]>(() => data.value ?? [])

  const invalidateAll = () => {
    if (!businessId.value) return
    queryClient.invalidateQueries({ exact: false, queryKey: queryKey(businessId.value) })
    for (const extra of extraInvalidations) {
      queryClient.invalidateQueries({ exact: false, queryKey: extra(businessId.value) })
    }
  }

  const saveMutation = useMutation({
    mutationFn: (formData: TForm & { id?: TId }) => {
      if (!businessId.value) throw new Error('No hay negocio activo')
      return saveFn(businessId.value, formData)
    },
    onSuccess: () => {
      saveError.value = ''
      invalidateAll()
      modalRef?.value?.close()
      success(`${entityName} guardado correctamente`)
    },
    onError: (err) => {
      saveError.value = translateError(err)
      showError(saveError.value)
    },
  })

  const deleteMutation = deleteFn
    ? useMutation({
        mutationFn: (id: TId) => deleteFn(id),
        onSuccess: () => {
          invalidateAll()
          modalRef?.value?.close()
          success(`${entityName} eliminado correctamente`)
        },
        onError: (err) => {
          saveError.value = translateError(err)
          showError(saveError.value)
        },
      })
    : null

  const handleSave = async (formData: TForm & { id?: TId }) => {
    saveError.value = ''
    try {
      await supabase.auth.getSession()
    } catch {
      // Proceed anyway — the mutation will trigger its own token check
    }
    try {
      await saveMutation.mutateAsync(formData)
    } catch {
      // Error handled by onError callback + saveError ref
    }
  }

  const handleDelete = (id: TId) => {
    if (!deleteMutation) return
    deleteMutation.mutate(id)
  }

  return {
    items,
    isLoading,
    saveMutation,
    saveError,
    deleteMutation,
    handleSave,
    handleDelete,
    isSaving: computed(() => saveMutation.isPending.value),
    invalidateAll,
  }
}
