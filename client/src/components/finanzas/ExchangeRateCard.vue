<template>
  <div v-if="isEditable" class="rounded-xl border border-border bg-surface shadow-sm">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-warning/10 to-warning/5 text-warning shrink-0">
          <svg class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex items-center gap-2">
          <p class="text-xs font-medium text-text-muted">Tasa del Día</p>
          <span class="text-sm font-semibold text-text">1 USD = <span class="text-warning">{{ displayRate }}</span> Bs</span>
        </div>
      </div>
      <div class="flex items-center gap-2 pl-0 sm:pl-0">
        <input
          :value="editRateValue"
          @input="$emit('update:editRateValue', Number(($event.target as HTMLInputElement).value))"
          type="number"
          step="0.01"
          min="0"
          placeholder="Tasa"
          class="w-24 rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:bg-surface"
        />
        <button
          @click="$emit('update-rate')"
          :disabled="updatingRate"
          class="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-text-inverse shadow-sm shadow-primary/20 transition-theme hover:bg-primary-hover disabled:opacity-50"
        >
          <svg v-if="updatingRate" class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Actualizar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isEditable: boolean
  editRateValue: number
  updatingRate: boolean
  displayRate: string
}>()

defineEmits<{
  'update:editRateValue': [value: number]
  'update-rate': []
}>()
</script>
