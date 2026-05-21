<template>
  <div class="border-t border-border pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Perfil de bienestar</p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormSelect
        :model-value="fields.skin_type"
        @update:model-value="$emit('update:fields', { ...fields, skin_type: $event })"
        label="Tipo de piel"
        :options="skinTypeOptions"
      />
      <FormSelect
        :model-value="fields.massage_preference"
        @update:model-value="$emit('update:fields', { ...fields, massage_preference: $event })"
        label="Preferencia de masaje"
        :options="massageOptions"
      />
    </div>
    <div class="mt-4">
      <FormTextarea
        :model-value="fields.allergies"
        @update:model-value="$emit('update:fields', { ...fields, allergies: $event })"
        label="Alergias o contraindicaciones"
        placeholder="Aceites esenciales, fragancias, condiciones médicas..."
        :rows="2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormSelect, FormTextarea } from '../forms'

export interface SpaHumanoFields {
  skin_type: string
  massage_preference: string
  allergies: string
}

defineProps<{
  fields: SpaHumanoFields
}>()

defineEmits<{
  'update:fields': [fields: SpaHumanoFields]
}>()

const skinTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'seca', label: 'Seca' },
  { value: 'grasa', label: 'Grasa' },
  { value: 'mixta', label: 'Mixta' },
  { value: 'sensible', label: 'Sensible' },
]
const massageOptions = [
  { value: 'relajante', label: 'Relajante' },
  { value: 'descontracturante', label: 'Descontracturante' },
  { value: 'piedras', label: 'Piedras calientes' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'linfatico', label: 'Drenaje linfático' },
  { value: 'aromatico', label: 'Aromaterapia' },
]
</script>
