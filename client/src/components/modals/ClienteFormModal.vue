<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? 'Editar Cliente' : 'Nuevo Cliente'"
    :subtitle="isEditing ? `Editando a ${formData.name}` : 'Agrega un nuevo cliente a tu base de datos'"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'"
    size="md"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    confirm-text="Guardar Cliente"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Nombre -->
      <FormInput
        v-model="formData.name"
        label="Nombre completo"
        placeholder="Ej: María González"
        required
        prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        :error="errors.name"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Teléfono -->
        <FormInput
          v-model="formData.phone"
          label="Teléfono"
          type="tel"
          placeholder="+52 55 1234 5678"
          required
          prefix-icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          :error="errors.phone"
        />

        <!-- Email -->
        <FormInput
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="maria@email.com"
          prefix-icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          :error="errors.email"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Cumpleaños -->
        <FormInput
          v-model="formData.birthday"
          label="Cumpleaños"
          type="date"
          prefix-icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          :error="errors.birthday"
        />
      </div>

      <!-- Notas -->
      <FormTextarea
        v-model="formData.notes"
        label="Notas adicionales"
        placeholder="Alergias, preferencias, historial relevante..."
        :rows="3"
        :error="errors.notes"
      />
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import type { Cliente, ClienteFormData } from '../../types/cliente'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormTextarea } from '../forms'

const MODAL_ID = 'cliente-form-modal'

const props = defineProps<{
  cliente?: Cliente | null
}>()

const emit = defineEmits<{
  save: [cliente: ClienteFormData & { id?: string }]
}>()

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()

const isLoading = ref(false)

const isEditing = computed(() => !!modalData.value?.cliente)

const defaultFormData: ClienteFormData = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  birthday: '',
  preferredServices: [],
}

const formData = ref<ClienteFormData>({ ...defaultFormData })
const errors = ref<Partial<Record<keyof ClienteFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && formData.value.phone.trim().length >= 8
})

watch(
  () => modalData.value?.cliente,
  (cliente) => {
    if (cliente) {
      formData.value = {
        name: cliente.name || '',
        phone: cliente.phone || '',
        email: cliente.email || '',
        notes: cliente.notes || '',
        birthday: cliente.birthday || '',
        preferredServices: cliente.preferredServices || [],
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

  if (!formData.value.phone.trim()) {
    errors.value.phone = 'El teléfono es requerido'
  } else if (formData.value.phone.length < 8) {
    errors.value.phone = 'El teléfono debe tener al menos 8 dígitos'
  }

  if (formData.value.email && !isValidEmail(formData.value.email)) {
    errors.value.email = 'El email no es válido'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  isLoading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const clienteData: ClienteFormData & { id?: string } = {
      ...formData.value,
    }

    if (modalData.value?.cliente?.id) {
      clienteData.id = modalData.value.cliente.id
    }

    emit('save', clienteData)
    success(isEditing.value ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente')
    confirm(clienteData)
  } catch (err) {
    showError('Error al guardar el cliente')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const open = (cliente?: Cliente) => {
  useModal(MODAL_ID).open({ cliente })
}

defineExpose({
  open,
  close,
  isOpen,
})
</script>
