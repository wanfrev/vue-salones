<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar ${t.appointment}` : `Nueva ${t.appointment}`"
    :subtitle="isEditing ? `Modifica los detalles de la ${t.appointment.toLowerCase()}` : `Agenda una nueva ${t.appointment.toLowerCase()} para un ${t.client.toLowerCase()}`"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'"
    size="lg"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    :confirm-text="isEditing ? `Actualizar ${t.appointment}` : `Agendar ${t.appointment}`"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Cliente -->
      <FormInput
        v-model="formData.clientName"
        :label="t.client"
        :placeholder="`Nombre del ${t.client.toLowerCase()}`"
        required
        prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        :error="errors.clientName"
      />

      <FormInput
        v-model="formData.clientPhone"
        :label="`Teléfono del ${t.client.toLowerCase()}`"
        type="tel"
        placeholder="+52 55 1234 5678"
        required
        prefix-icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        :error="errors.clientPhone"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelect
          v-model="formData.service"
          :label="t.service"
          :options="serviceOptions"
          required
          :error="errors.service"
        />

        <FormSelect
          v-model="formData.employee"
          :label="t.employee"
          :options="employeeOptions"
          required
          :error="errors.employee"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- Fecha -->
        <FormInput
          v-model="formData.date"
          label="Fecha"
          type="date"
          required
          prefix-icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          :error="errors.date"
        />

        <!-- Hora -->
        <FormInput
          v-model="formData.time"
          label="Hora"
          type="time"
          required
          prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          :error="errors.time"
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
          label="Duración (min)"
          type="number"
          placeholder="30"
          required
          prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          :error="errors.duration"
        />
      </div>

      <!-- Notas -->
      <FormTextarea
        v-model="formData.notes"
        label="Notas"
        placeholder="Notas adicionales sobre la cita..."
        :rows="2"
        :error="errors.notes"
      />
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import type { Cita, CitaFormData } from '../../types/cita'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect, FormTextarea } from '../forms'

const MODAL_ID = 'cita-form-modal'

const props = defineProps<{
  servicios?: { id: string; name: string }[]
  empleados?: { id: string; name: string }[]
}>()

const emit = defineEmits<{
  save: [cita: CitaFormData & { id?: string }]
}>()

const saveInProgress = ref(false)
const isSaving = computed(() => saveInProgress.value)

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()
const authStore = useAuthStore()

const t = computed(() => authStore.terminology)

const isLoading = ref(false)
const isEditing = computed(() => !!modalData.value?.cita)

const serviceOptions = computed(() => 
  (props.servicios ?? []).map(s => ({ value: s.id, label: s.name }))
)

const employeeOptions = computed(() => 
  (props.empleados ?? []).map(e => ({ value: e.id, label: e.name }))
)

const statusOptions = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'cancelled', label: 'Cancelada' },
]

const defaultFormData: CitaFormData = {
  clientName: '',
  clientPhone: '',
  service: '',
  employee: '',
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  duration: 30,
  price: 0,
  status: 'confirmed',
  notes: '',
}

const formData = ref<CitaFormData>({ ...defaultFormData })
const errors = ref<Partial<Record<keyof CitaFormData, string>>>({})

const servicesLoaded = computed(() => (props.servicios?.length ?? 0) > 0)
const employeesLoaded = computed(() => (props.empleados?.length ?? 0) > 0)

const isFormValid = computed(() => {
  return formData.value.clientName.trim().length >= 2 && 
         /^[\d\s\-\+\(\)]+$/.test(formData.value.clientPhone.trim()) &&
         formData.value.clientPhone.trim().length >= 7 &&
         formData.value.service !== '' && 
         formData.value.employee !== '' &&
         formData.value.date !== '' &&
         formData.value.time !== '' &&
         servicesLoaded.value &&
         employeesLoaded.value
})

watch(
  () => modalData.value?.cita,
  (cita) => {
    if (cita) {
      formData.value = {
        clientName: cita.clientName || '',
        clientPhone: '',
        service: cita.serviceId || '',
        employee: cita.employeeId || '',
        date: cita.date || new Date().toISOString().split('T')[0],
        time: cita.time || '09:00',
        duration: cita.duration || 30,
        price: cita.price || 0,
        status: cita.status || 'confirmed',
        notes: cita.notes || '',
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

  if (!formData.value.clientName.trim() || formData.value.clientName.length < 2) {
    errors.value.clientName = 'El nombre del cliente es requerido'
  }

  const phoneRaw = formData.value.clientPhone.trim()
  if (!phoneRaw || phoneRaw.length < 7) {
    errors.value.clientPhone = 'El teléfono del cliente es requerido'
  } else if (!/^[\d\s\-\+\(\)]+$/.test(phoneRaw)) {
    errors.value.clientPhone = 'El teléfono solo puede contener números, espacios, +, -, (, )'
  }

  if (!formData.value.service) {
    errors.value.service = 'Selecciona un servicio'
  }

  if (!formData.value.employee) {
    errors.value.employee = 'Selecciona un empleado'
  }

  if (!formData.value.date) {
    errors.value.date = 'Selecciona una fecha'
  }

  if (!formData.value.time) {
    errors.value.time = 'Selecciona una hora'
  }

  if (formData.value.price < 0) {
    errors.value.price = 'El precio no puede ser negativo'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  isLoading.value = true
  saveInProgress.value = true

  try {
    const citaData: CitaFormData & { id?: string } = {
      ...formData.value,
    }

    if (modalData.value?.cita?.id) {
      citaData.id = modalData.value.cita.id
    }

    emit('save', citaData)
  } catch (err) {
    showError(`Error al guardar la ${t.value.appointment.toLowerCase()}`)
    console.error(err)
  } finally {
    isLoading.value = false
    saveInProgress.value = false
  }
}

const open = (cita?: Cita) => {
  useModal(MODAL_ID).open({ cita })
}

defineExpose({
  open,
  close,
  isOpen,
})
</script>
