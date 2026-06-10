<template>
  <div class="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-surface shadow-lg z-50">
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 class="text-sm font-semibold text-text">Recordatorios pendientes</h3>
      <span v-if="unreadCount > 0" class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {{ unreadCount }}
      </span>
    </div>

    <div class="max-h-80 overflow-y-auto">
      <div v-if="pendingReminders.length === 0" class="px-4 py-8 text-center text-sm text-text-muted">
        No hay recordatorios pendientes
      </div>

      <div
        v-for="reminder in pendingReminders"
        :key="reminder.id"
        class="border-b border-border/50 px-4 py-3 last:border-b-0"
      >
        <p class="text-sm font-medium text-text">{{ reminder.client_name }}</p>
        <p class="text-xs text-text-secondary">{{ reminder.service_name }}</p>
        <p class="mt-1 text-xs text-text-muted">
          {{ formatDateTime(reminder.appointment_time) }}
        </p>
        <div class="mt-2 flex gap-2">
          <button
            @click="handleSendWhatsApp(reminder)"
            class="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <MessageCircle :size="14" />
            Recordar
          </button>
          <button
            @click="handleDismiss(reminder.id)"
            class="rounded-lg px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-secondary"
          >
            Ignorar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'
import { useReminders } from '../../composables/useReminders'
import { formatDateTime } from '../../lib/formatters'

defineEmits<{ close: [] }>()

const { pendingReminders, unreadCount, handleSendWhatsApp, handleDismiss } = useReminders()
</script>
