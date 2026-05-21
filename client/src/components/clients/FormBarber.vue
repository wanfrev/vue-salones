<template>
  <div class="border-t border-border pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Perfil de barbería</p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormSelect
        :model-value="fields.beard_style"
        @update:model-value="$emit('update:fields', { ...fields, beard_style: $event })"
        label="Estilo de barba"
        :options="beardStyleOptions"
      />
      <FormSelect
        :model-value="fields.hair_type"
        @update:model-value="$emit('update:fields', { ...fields, hair_type: $event })"
        label="Tipo de cabello"
        :options="hairTypeOptions"
      />
    </div>
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormSelect
        :model-value="fields.fade_preference"
        @update:model-value="$emit('update:fields', { ...fields, fade_preference: $event })"
        label="Preferencia de fade"
        :options="fadeOptions"
      />
      <FormInput
        :model-value="fields.products_used"
        @update:model-value="$emit('update:fields', { ...fields, products_used: $event })"
        label="Productos que usa"
        placeholder="Ej: Pomada, cera, aceite"
      />
    </div>
    <div class="mt-4">
      <FormTextarea
        :model-value="fields.notes"
        @update:model-value="$emit('update:fields', { ...fields, notes: $event })"
        label="Notas del barbero"
        placeholder="Indicaciones específicas del corte..."
        :rows="2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormInput, FormSelect, FormTextarea } from '../forms'

export interface BarberFields {
  beard_style: string
  hair_type: string
  fade_preference: string
  products_used: string
  notes: string
}

defineProps<{
  fields: BarberFields
}>()

defineEmits<{
  'update:fields': [fields: BarberFields]
}>()

const hairTypeOptions = [
  { value: 'liso', label: 'Liso' },
  { value: 'ondulado', label: 'Ondulado' },
  { value: 'rizado', label: 'Rizado' },
  { value: 'crespo', label: 'Crespo' },
]
const beardStyleOptions = [
  { value: 'corta', label: 'Corta' },
  { value: 'media', label: 'Media' },
  { value: 'larga', label: 'Larga' },
  { value: 'candado', label: 'Candado' },
  { value: 'perilla', label: 'Perilla' },
  { value: 'sin_barba', label: 'Sin barba' },
]
const fadeOptions = [
  { value: 'bajo', label: 'Fade bajo' },
  { value: 'medio', label: 'Fade medio' },
  { value: 'alto', label: 'Fade alto' },
  { value: 'skin', label: 'Skin fade' },
  { value: 'mid', label: 'Mid fade' },
  { value: 'taper', label: 'Taper' },
]
</script>
