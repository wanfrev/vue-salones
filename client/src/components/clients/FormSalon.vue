<template>
  <div class="border-t border-border pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Perfil capilar</p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormSelect
        :model-value="fields.hair_type"
        @update:model-value="$emit('update:fields', { ...fields, hair_type: $event })"
        label="Tipo de cabello"
        :options="hairTypeOptions"
      />
      <FormSelect
        :model-value="fields.hair_length"
        @update:model-value="$emit('update:fields', { ...fields, hair_length: $event })"
        label="Largo del cabello"
        :options="hairLengthOptions"
      />
    </div>
    <div class="mt-4">
      <FormTextarea
        :model-value="fields.chemical_history"
        @update:model-value="$emit('update:fields', { ...fields, chemical_history: $event })"
        label="Historial de químicos"
        placeholder="Tintes, alisados, decoloraciones recientes..."
        :rows="2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormSelect, FormTextarea } from '../forms'

export interface SalonFields {
  hair_type: string
  hair_length: string
  chemical_history: string
}

defineProps<{
  fields: SalonFields
}>()

defineEmits<{
  'update:fields': [fields: SalonFields]
}>()

const hairTypeOptions = [
  { value: 'liso', label: 'Liso' },
  { value: 'ondulado', label: 'Ondulado' },
  { value: 'rizado', label: 'Rizado' },
  { value: 'crespo', label: 'Crespo' },
]
const hairLengthOptions = [
  { value: 'corto', label: 'Corto' },
  { value: 'medio', label: 'Medio' },
  { value: 'largo', label: 'Largo' },
  { value: 'extra_largo', label: 'Extra largo' },
]
</script>
