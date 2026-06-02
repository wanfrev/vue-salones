<template>
  <div v-if="isEditable" class="mb-4 rounded-xl border border-border bg-surface p-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
          <svg class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-text">Tasa del Día (VES)</p>
          <p class="text-xs text-text-muted">
            1 USD = <strong>{{ displayRate }}</strong> Bs
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input
          :value="editRateValue"
          @input="$emit('update:editRateValue', Number(($event.target as HTMLInputElement).value))"
          type="number"
          step="0.01"
          min="0"
          placeholder="Tasa Bs/USD"
          class="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary"
        />
        <button
          @click="$emit('update-rate')"
          :disabled="updatingRate"
          class="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover disabled:opacity-50"
        >
          <svg v-if="updatingRate" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
