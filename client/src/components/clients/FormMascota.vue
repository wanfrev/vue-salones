<template>
  <div class="border-t border-border pt-4">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
      Datos de la {{ terminologyLabel('pet', 'mascota') }}
    </p>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormInput
        :model-value="fields.pet_name"
        @update:model-value="$emit('update:fields', { ...fields, pet_name: $event })"
        :label="terminologyLabel('pet', 'Mascota')"
        placeholder="Ej: Firulais"
        prefix-icon="M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
      />
      <FormInput
        :model-value="fields.pet_breed"
        @update:model-value="$emit('update:fields', { ...fields, pet_breed: $event })"
        :label="terminologyLabel('breed', 'Raza')"
        placeholder="Ej: Golden Retriever"
        prefix-icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </div>
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormInput
        :model-value="fields.pet_weight"
        @update:model-value="$emit('update:fields', { ...fields, pet_weight: $event })"
        :label="terminologyLabel('weight', 'Peso')"
        type="text"
        placeholder="Ej: 12 kg"
        prefix-icon="M3 6l3 1m0 0-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2 3-1m-3 1-1 4m1-4 4 9m-5-2 3 1"
      />
      <FormInput
        :model-value="fields.pet_owner"
        @update:model-value="$emit('update:fields', { ...fields, pet_owner: $event })"
        :label="terminologyLabel('owner', 'Dueño')"
        placeholder="Ej: Juan Pérez"
        prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </div>
    <div v-if="isVet" class="mt-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          :model-value="fields.last_vaccine"
          @update:model-value="$emit('update:fields', { ...fields, last_vaccine: $event })"
          label="Última vacuna"
          type="date"
        />
        <FormInput
          :model-value="fields.last_checkup"
          @update:model-value="$emit('update:fields', { ...fields, last_checkup: $event })"
          label="Última revisión"
          type="date"
        />
      </div>
      <div class="mt-4">
        <FormTextarea
          :model-value="fields.medical_notes"
          @update:model-value="$emit('update:fields', { ...fields, medical_notes: $event })"
          label="Notas veterinarias"
          placeholder="Condiciones médicas, alergias, medicamentos..."
          :rows="2"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../store/auth'
import { FormInput, FormTextarea } from '../forms'

export interface MascotaFields {
  pet_name: string
  pet_breed: string
  pet_weight: string
  pet_owner: string
  last_vaccine: string
  last_checkup: string
  medical_notes: string
}

const props = defineProps<{
  fields: MascotaFields
  isVet?: boolean
}>()

defineEmits<{
  'update:fields': [fields: MascotaFields]
}>()

const authStore = useAuthStore()
const terminology = computed(() => authStore.terminology)

const terminologyLabel = (key: string, fallback: string) => {
  return (terminology.value as Record<string, string>)[key] || fallback
}
</script>
