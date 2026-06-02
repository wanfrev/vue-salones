<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-text-secondary">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <div v-if="prefixIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="prefixIcon" />
        </svg>
      </div>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'w-full rounded-xl border bg-surface text-text outline-none transition-theme',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-secondary',
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border hover:border-border-strong',
          prefixIcon ? 'pl-10' : 'pl-4',
          suffixIcon ? 'pr-10' : 'pr-4',
          sizeClasses[size],
        ]"
      />
      <div v-if="suffixIcon" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="suffixIcon" />
        </svg>
      </div>
    </div>
    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-text-muted">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

let idCounter = 0

export type InputSize = 'sm' | 'md' | 'lg'
export type InputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'date' | 'time' | 'search' | 'url'

interface Props {
  modelValue: string | number | undefined
  label?: string
  type?: InputType
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  hint?: string
  prefixIcon?: string
  suffixIcon?: string
  size?: InputSize
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => props.id || `form-input-${++idCounter}`)

const sizeClasses: Record<InputSize, string> = {
  sm: 'py-1.5 text-sm',
  md: 'py-2.5 text-sm',
  lg: 'py-3 text-base',
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
