import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../store/auth'
import { useNotification } from './useNotification'
import {
  listPendingReminders,
  markReminderAsSent,
  dismissReminder,
  reminderKeys,
} from '../services/reminderService'
import type { ReminderNotification } from '../services/reminderService'
import { sanitizePhone } from '../lib/formatters'

export function useReminders() {
  const authStore = useAuthStore()
  const queryClient = useQueryClient()
  const { error: showError } = useNotification()

  const profileId = computed(() => authStore.profile?.id ?? null)

  const { data: pendingReminders, isLoading } = useQuery({
    queryKey: computed(() => reminderKeys.pending(profileId.value)),
    queryFn: () => listPendingReminders(profileId.value!),
    enabled: computed(() => !!profileId.value),
    refetchInterval: 30_000,
  })

  const reminders = computed(() => pendingReminders.value ?? [])
  const unreadCount = computed(() => reminders.value.length)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  }

  const sendMutation = useMutation({
    mutationFn: (id: string) => markReminderAsSent(id),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al marcar recordatorio')
    },
  })

  const dismissMutationFn = useMutation({
    mutationFn: (id: string) => dismissReminder(id),
    onSuccess: () => {
      invalidate()
    },
    onError: (err) => {
      showError(err instanceof Error ? err.message : 'Error al ignorar recordatorio')
    },
  })

  const handleSendWhatsApp = (notification: ReminderNotification) => {
    sendMutation.mutate(notification.id, {
      onSuccess: () => {
        const phone = sanitizePhone(notification.client_phone)
        if (phone) window.open(`https://wa.me/${phone}`, '_blank')
      },
    })
  }

  const handleDismiss = (id: string) => {
    dismissMutationFn.mutate(id)
  }

  return {
    pendingReminders: reminders,
    unreadCount,
    isLoading,
    handleSendWhatsApp,
    handleDismiss,
  }
}
