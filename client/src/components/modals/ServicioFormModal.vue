<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar ${t.service}` : `Nuevo ${t.service}`"
    :subtitle="isEditing ? `Editando ${formData.name}` : `Agrega un nuevo ${t.service.toLowerCase()} al catálogo`"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'"
    size="md"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    :confirm-text="`Guardar ${t.service}`"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nombre -->
      <FormInput
        v-model="formData.name"
        label="Nombre del servicio"
        placeholder="Ej: Corte Mujer"
        required
        prefix-icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        :error="errors.name"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Categoría -->
        <FormSelect
          v-model="formData.category"
          label="Categoría"
          :options="categoryOptions"
          required
          :error="errors.category"
        />

        <!-- Estado -->
        <FormSelect
          v-model="formData.status"
          label="Estado"
          :options="statusOptions"
          required
          :error="errors.status"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Precio -->
        <FormInput
          v-model.number="formData.price"
          label="Precio ($)"
          type="number"
          placeholder="0.00"
          required
          prefix-icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          :error="errors.price"
        />

        <!-- Duración -->
        <FormInput
          v-model.number="formData.duration"
          label="Duración (minutos)"
          type="number"
          placeholder="30"
          required
          prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          :error="errors.duration"
        />
      </div>

      <!-- Descripción -->
      <FormTextarea
        v-model="formData.description"
        label="Descripción"
        placeholder="Describe el servicio, incluye detalles importantes..."
        :rows="3"
        :error="errors.description"
      />
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import type { Servicio, ServicioFormData } from '../../types/servicio'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect, FormTextarea } from '../forms'

const MODAL_ID = 'servicio-form-modal'

const emit = defineEmits<{
  save: [servicio: ServicioFormData & { id?: string }]
}>()

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()
const authStore = useAuthStore()

const t = computed(() => authStore.terminology)

const isLoading = ref(false)
const isEditing = computed(() => !!modalData.value?.servicio)

const categoryOptions = [
  { value: 'corte', label: 'Corte de Cabello' },
  { value: 'color', label: 'Coloración' },
  { value: 'manos', label: 'Manos & Pies' },
  { value: 'tratamientos', label: 'Tratamientos' },
  { value: 'barberia', label: 'Barbería' },
  { value: 'maquillaje', label: 'Maquillaje' },
  { value: 'otros', label: 'Otros' },
]

const statusOptions = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' },
]

const defaultFormData: ServicioFormData = {
  name: '',
  description: '',
  price: 0,
  duration: 30,
  status: 'Activo',
  category: 'corte',
}

const formData = ref<ServicioFormData>({ ...defaultFormData })
const errors = ref<Partial<Record<keyof ServicioFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && 
         formData.value.price > 0 && 
         formData.value.duration > 0
})

watch(
  () => modalData.value?.servicio,
  (servicio) => {
    if (servicio) {
      formData.value = {
        name: servicio.name || '',
        description: servicio.description || '',
        price: servicio.price || 0,
        duration: servicio.duration || 30,
        status: servicio.status || 'Activo',
        category: servicio.category || 'corte',
      }
    } else {
      formData.value = { ...defaultFormData }
    }
    errors.value = {}
  },
  { immediate: true }
)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim() || formData.value.name.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (formData.value.price <= 0) {
    errors.value.price = 'El precio debe ser mayor a 0'
  }

  if (formData.value.duration <= 0) {
    errors.value.duration = 'La duración debe ser mayor a 0 minutos'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  isLoading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const servicioData: ServicioFormData & { id?: string } = {
      ...formData.value,
    }

    if (modalData.value?.servicio?.id) {
      servicioData.id = modalData.value.servicio.id
    }

    emit('save', servicioData)
    success(isEditing.value ? `${t.value.service} actualizado correctamente` : `${t.value.service} creado correctamente`)
    confirm(servicioData)
  } catch (err) {
    showError(`Error al guardar el ${t.value.service.toLowerCase()}`)
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const open = (servicio?: Servicio) => {
  useModal(MODAL_ID).open({ servicio })
}

defineExpose({
  open,
  close,
  isOpen,
})
</script>
