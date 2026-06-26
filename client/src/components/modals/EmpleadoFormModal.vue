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
          hint="Mínimo 2 caracteres"
          prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          :error="errors.name"
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect
            v-if="!showingCustomRole"
            v-model="formData.role"
            label="Rol / Puesto"
            :options="roleOptions"
            required
            :error="errors.role"
          />
          <div v-else class="flex gap-2">
            <FormInput
              v-model="formData.role"
              label="Rol / Puesto"
              placeholder="Escribe el rol..."
              required
              :error="errors.role"
              class="flex-1"
            />
            <button
              type="button"
              class="mt-6 shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition-theme hover:bg-bg-secondary"
              @click="cancelCustomRole"
            >
              Volver
            </button>
          </div>
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
            hint="0 a 100"
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
            required
            prefix-icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            :error="errors.email"
          />
        </div>

        <FormInput
          v-model="formData.password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          :required="!isEditing"
          :hint="isEditing ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'"
          prefix-icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          :error="errors.password"
          show-password-toggle
          autocomplete="new-password"
        />
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

      <div v-if="isEditing" class="border-t border-border pt-4">
        <button
          type="button"
          class="rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition-theme hover:bg-danger/10"
          @click="confirmDelete"
        >
          Eliminar {{ t.employee.toLowerCase() }}
        </button>
      </div>
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import { useBusinessStore } from '../../store/business'
import { addBusinessJobTitle } from '../../services/equipoService'
import type { Empleado, EmpleadoFormData } from '../../types/empleado'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect } from '../forms'

const MODAL_ID = 'empleado-form-modal'

const props = withDefaults(defineProps<{ isSaving?: boolean }>(), {
  isSaving: false,
})

const emit = defineEmits<{
  save: [empleado: EmpleadoFormData & { id?: string }]
  delete: [empleadoId: string]
}>()

const { isOpen, modalData, close } = useModal(MODAL_ID)
const { error: showError } = useNotification()
const authStore = useAuthStore()
const businessStore = useBusinessStore()

const t = computed(() => businessStore.terminology)

const isSubmitting = ref(false)
const isLoading = computed(() => isSubmitting.value || props.isSaving)
const isEditing = computed(() => !!modalData.value?.empleado)

const showingCustomRole = ref(false)

const roleOptions = computed(() => {
  const titles = businessStore.jobTitles || []
  const options = titles.map((t: string) => ({ value: t, label: t }))
  options.push({ value: '__new__', label: '+ Agregar nuevo' })
  return options
})

const cancelCustomRole = () => {
  showingCustomRole.value = false
  formData.value.role = ''
}

const payTypeOptions = [
  { value: 'salary', label: 'Sueldo base' },
  { value: 'percentage', label: 'Porcentaje' },
  { value: 'mixed', label: 'Sueldo + %' },
]

const defaultFormData: EmpleadoFormData = {
  name: '',
  role: '',
  phone: '',
  email: '',
  password: '',
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
  const nameValid = formData.value.name.trim().length >= 2
  const roleValid = formData.value.role !== ''
  const emailValid = formData.value.email.trim().length >= 5
  const pwd = formData.value.password
  const passwordValid = pwd.length === 0 ? isEditing.value : pwd.length >= 6
  return nameValid && roleValid && emailValid && passwordValid
})

watch(
  [isOpen, () => modalData.value?.empleado],
  ([open, empleado]) => {
    if (!open) return

    showingCustomRole.value = false

    if (empleado) {
      formData.value = {
        name: empleado.name || '',
        role: empleado.role || '',
        phone: empleado.phone || '',
        email: empleado.email || '',
        password: '',
        specialties: empleado.specialties || [],
        scheduleStart: empleado.schedule?.start || '09:00',
        scheduleEnd: empleado.schedule?.end || '18:00',
        scheduleBreak: empleado.schedule?.break || '13:00 - 14:00',
        payType: empleado.payType || 'percentage',
        payPercentage: empleado.payPercentage || 0,
        baseSalary: empleado.baseSalary || 0,
      }
    } else {
      // Always reset when opening "Nuevo" to avoid stale values from previous attempts.
      formData.value = { ...defaultFormData }
    }
    errors.value = {}
  },
  { immediate: true }
)

watch(
  () => formData.value.role,
  (role) => {
    if (role === '__new__') {
      showingCustomRole.value = true
      formData.value.role = ''
    }
  }
)

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim() || formData.value.name.length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!formData.value.role.trim()) {
    errors.value.role = 'El rol / puesto es obligatorio'
  }

  if (formData.value.payType !== 'salary' && (formData.value.payPercentage < 0 || formData.value.payPercentage > 100)) {
    errors.value.payPercentage = 'El porcentaje debe estar entre 0 y 100'
  }

  if (formData.value.payType !== 'percentage' && formData.value.baseSalary < 0) {
    errors.value.baseSalary = 'El sueldo base no puede ser negativo'
  }

  if (!formData.value.email.trim()) {
    errors.value.email = 'El email es obligatorio'
  } else if (!isValidEmail(formData.value.email)) {
    errors.value.email = 'El email no es válido'
  }

  const pwdLength = formData.value.password.length

  if (pwdLength === 0) {
    if (!isEditing.value) {
      errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
    }
  } else if (pwdLength < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const confirmDelete = () => {
  const id = modalData.value?.empleado?.id
  if (!id) return
  const name = formData.value.name
  const msg = `¿Eliminar a "${name}"?\n\nEl empleado perderá el acceso al sistema. Esta acción no se puede deshacer.`
  if (window.confirm(msg)) {
    emit('delete', id)
  }
}

const handleSubmit = async () => {
  if (isLoading.value) return

  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  isSubmitting.value = true

  try {
    const role = formData.value.role.trim()

    // Persist new role to business config
    const businessId = authStore.businessId
    if (businessId && role && !businessStore.jobTitles.includes(role)) {
      const updated = await addBusinessJobTitle(businessId, role)
      businessStore.updateBusiness({ job_titles: updated })
    }

    const empleadoData: EmpleadoFormData & { id?: string } = {
      ...formData.value,
      role,
    }

    if (modalData.value?.empleado?.id) {
      empleadoData.id = modalData.value.empleado.id
    }

    emit('save', empleadoData)
  } catch (err) {
    showError(`Error al guardar el ${t.value.employee.toLowerCase()}`)
    console.error(err)
  } finally {
    isSubmitting.value = false
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
