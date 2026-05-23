<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar ${t.employee}` : `Nuevo ${t.employee}`"
    :subtitle="isEditing ? `Editando a ${formData.name}` : `Agrega un nuevo ${t.employee.toLowerCase()} al equipo`"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'"
    size="lg"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    :confirm-text="`Guardar ${t.employee}`"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Información Básica -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-text-muted">Información Básica</h4>
        
        <FormInput
          v-model="formData.name"
          label="Nombre completo"
          placeholder="Ej: Carlos Méndez"
          required
          prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          :error="errors.name"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            v-model="formData.role"
            label="Rol / Puesto"
            :options="roleOptions"
            required
            :error="errors.role"
          />
        </div>
      </div>

      <!-- Nómina -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-text-muted">Nómina</h4>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            v-model="formData.payType"
            label="Tipo de pago"
            :options="payTypeOptions"
            required
            :error="errors.payType"
          />

          <FormInput
            v-model.number="formData.payPercentage"
            :label="`% ${t.employee}`"
            type="number"
            min="0"
            max="100"
            placeholder="50"
            :disabled="formData.payType === 'salary'"
            :error="errors.payPercentage"
          />
        </div>

        <FormInput
          v-model.number="formData.baseSalary"
          label="Sueldo base"
          type="number"
          min="0"
          placeholder="0"
          :disabled="formData.payType === 'percentage'"
          :error="errors.baseSalary"
        />
      </div>

      <!-- Contacto -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-text-muted">Información de Contacto</h4>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            v-model="formData.phone"
            label="Teléfono"
            type="tel"
            placeholder="+52 55 1234 5678"
            prefix-icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            :error="errors.phone"
          />

          <FormInput
            v-model="formData.email"
            label="Email"
            type="email"
            placeholder="carlos@email.com"
            prefix-icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            :error="errors.email"
          />
        </div>
      </div>

      <!-- Horario -->
      <div class="space-y-4">
        <h4 class="text-sm font-semibold uppercase tracking-wider text-text-muted">Horario Laboral</h4>
        
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormInput
            v-model="formData.scheduleStart"
            label="Hora de entrada"
            type="time"
            required
            prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            :error="errors.scheduleStart"
          />

          <FormInput
            v-model="formData.scheduleEnd"
            label="Hora de salida"
            type="time"
            required
            prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            :error="errors.scheduleEnd"
          />

          <FormInput
            v-model="formData.scheduleBreak"
            label="Descanso"
            type="text"
            placeholder="13:00 - 14:00"
            prefix-icon="M20 12H4"
            :error="errors.scheduleBreak"
          />
        </div>
      </div>
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import type { Empleado, EmpleadoFormData } from '../../types/empleado'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect } from '../forms'

const MODAL_ID = 'empleado-form-modal'

const emit = defineEmits<{
  save: [empleado: EmpleadoFormData & { id?: string }]
}>()

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()
const authStore = useAuthStore()

const t = computed(() => authStore.terminology)

const isLoading = ref(false)
const isEditing = computed(() => !!modalData.value?.empleado)

const roleOptions = [
  { value: 'Estilista', label: 'Estilista' },
  { value: 'Estilista Senior', label: 'Estilista Senior' },
  { value: 'Colorista', label: 'Colorista' },
  { value: 'Manicurista', label: 'Manicurista' },
  { value: 'Pedicurista', label: 'Pedicurista' },
  { value: 'Barbero', label: 'Barbero' },
  { value: 'Asistente', label: 'Asistente' },
  { value: 'Recepcionista', label: 'Recepcionista' },
  { value: 'Gerente', label: 'Gerente' },
]

const payTypeOptions = [
  { value: 'salary', label: 'Sueldo base' },
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'mixed', label: 'Sueldo + %' },
]

const defaultFormData: EmpleadoFormData = {
  name: '',
  role: 'Estilista',
  phone: '',
  email: '',
  specialties: [],
  scheduleStart: '09:00',
  scheduleEnd: '18:00',
  scheduleBreak: '13:00 - 14:00',
  payType: 'percentage',
  payPercentage: 50,
  baseSalary: 0,
}

const formData = ref<EmpleadoFormData>({ ...defaultFormData })
const errors = ref<Partial<Record<keyof EmpleadoFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && formData.value.role !== ''
})

watch(
  () => modalData.value?.empleado,
  (empleado) => {
    if (empleado) {
      formData.value = {
        name: empleado.name || '',
        role: empleado.role || 'Estilista',
        phone: empleado.phone || '',
        email: empleado.email || '',
        specialties: empleado.specialties || [],
        scheduleStart: empleado.schedule?.start || '09:00',
        scheduleEnd: empleado.schedule?.end || '18:00',
        scheduleBreak: empleado.schedule?.break || '13:00 - 14:00',
        payType: empleado.payType || 'percentage',
        payPercentage: empleado.payPercentage || 0,
        baseSalary: empleado.baseSalary || 0,
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

  if (formData.value.payType !== 'salary' && (formData.value.payPercentage < 0 || formData.value.payPercentage > 100)) {
    errors.value.payPercentage = 'El porcentaje debe estar entre 0 y 100'
  }

  if (formData.value.payType !== 'percentage' && formData.value.baseSalary < 0) {
    errors.value.baseSalary = 'El sueldo base no puede ser negativo'
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
    const empleadoData: EmpleadoFormData & { id?: string } = {
      ...formData.value,
    }

    if (modalData.value?.empleado?.id) {
      empleadoData.id = modalData.value.empleado.id
    }

    emit('save', empleadoData)
  } catch (err) {
    showError(`Error al guardar el ${t.value.employee.toLowerCase()}`)
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const open = (empleado?: Empleado) => {
  useModal(MODAL_ID).open({ empleado })
}

defineExpose({
  open,
  close,
  isOpen,
})
</script>
