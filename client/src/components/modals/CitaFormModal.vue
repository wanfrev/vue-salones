<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar ${t.appointment}` : `Nueva ${t.appointment}`"
    :subtitle="isEditing ? `Modifica los detalles de la ${t.appointment.toLowerCase()}` : `Agenda una nueva ${t.appointment.toLowerCase()} para un ${t.client.toLowerCase()}`"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'"
    size="lg"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid || saveInProgress"
    :confirm-text="isEditing ? `Actualizar ${t.appointment}` : `Agendar ${t.appointment}`"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Cliente -->
      <div class="relative">
        <FormInput
          v-model="formData.clientName"
          :label="t.client"
          :placeholder="`Nombre del ${t.client.toLowerCase()}`"
          required
          prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          :error="errors.clientName"
          @update:model-value="onClientNameInput"
          @blur="onClientNameBlur"
          @focus="onClientNameFocus"
        />
        <div
          v-if="showClientSuggestions && clientSuggestions.length > 0"
          class="absolute z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
        >
          <button
            v-for="client in clientSuggestions"
            :key="client.id"
            type="button"
            @mousedown.prevent="selectClient(client)"
            class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-bg-secondary border-b border-border last:border-b-0"
          >
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-text truncate">{{ client.full_name }}</div>
              <div class="text-xs text-text-muted">{{ client.phone }}</div>
            </div>
          </button>
        </div>
      </div>

      <FormInput
        v-model="formData.clientPhone"
        :label="`Teléfono del ${t.client.toLowerCase()}`"
        type="tel"
        placeholder="+52 55 1234 5678"
        required
        prefix-icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        :error="errors.clientPhone"
      />

      <!-- Servicios Simultáneos -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="text-sm font-semibold text-text">
            {{ t.service }}s
          </label>
          <button
            type="button"
            @click="addServiceRow"
            class="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar {{ t.service.toLowerCase() }} simultáneo
          </button>
        </div>

        <div
          v-for="(row, index) in serviceRows"
          :key="index"
          class="rounded-lg border border-border bg-bg-secondary/50 p-3 space-y-3"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {{ t.service }} {{ index + 1 }}
            </span>
            <button
              v-if="serviceRows.length > 1"
              type="button"
              @click="removeServiceRow(index)"
              class="rounded-md p-1 text-danger hover:bg-danger/10 transition-colors"
              title="Eliminar servicio"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormSelect
              :model-value="row.serviceId"
              :label="t.service"
              :options="serviceOptions"
              required
              :error="getRowError(index, 'serviceId')"
              @update:model-value="updateServiceRow(index, 'serviceId', $event)"
            />
            <FormSelect
              :model-value="row.employeeId"
              :label="t.employee"
              :options="employeeOptions"
              required
              :error="getRowError(index, 'employeeId')"
              @update:model-value="updateServiceRow(index, 'employeeId', $event)"
            />
          </div>
        </div>

        <!-- Totales -->
        <div v-if="serviceRows.length > 1" class="flex items-center gap-4 rounded-lg bg-primary/5 px-3 py-2 text-sm">
          <span class="font-semibold text-text">
            Total: <span class="text-primary">${{ totalPrice }}</span>
          </span>
          <span class="text-text-muted">·</span>
          <span class="font-medium text-text-muted">
            Duración: {{ maxDuration }} min
          </span>
        </div>
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
        <!-- Precio (total) -->
        <FormInput
          :model-value="displayPrice"
          @update:model-value="onPriceInput"
          label="Precio total ($)"
          type="number"
          placeholder="0.00"
          required
          prefix-icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />

        <!-- Duración -->
        <FormInput
          v-model="formData.duration"
          label="Duración total (min)"
          type="number"
          placeholder="30"
          required
          prefix-icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
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

      <div v-if="isEditing" class="border-t border-border pt-4">
        <button
          type="button"
          class="rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition-theme hover:bg-danger/10"
          @click="confirmDelete"
        >
          Eliminar {{ t.appointment.toLowerCase() }}
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
import { toISODate, minutesToHHmm } from '../../lib/formatters'
import { searchClients } from '../../services/clientesService'
import type { Cita, CitaFormData, CitaFormServiceItem } from '../../types/cita'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect, FormTextarea } from '../forms'

const MODAL_ID = 'cita-form-modal'

const props = defineProps<{
  servicios?: { id: string; name: string; price: number; duration: number }[]
  empleados?: { id: string; name: string }[]
}>()

const emit = defineEmits<{
  save: [cita: CitaFormData & { id?: string }]
  delete: [citaId: string]
}>()

const saveInProgress = ref(false)

const { isOpen, modalData, close } = useModal(MODAL_ID)
const { error: showError } = useNotification()
const authStore = useAuthStore()
const businessStore = useBusinessStore()

const t = computed(() => businessStore.terminology)
const businessId = computed(() => authStore.businessId)

const clientSuggestions = ref<{ id: string; full_name: string; phone: string }[]>([])
const showClientSuggestions = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const onClientNameInput = () => {
  formData.value.clientId = undefined
  if (searchTimeout) clearTimeout(searchTimeout)
  const query = formData.value.clientName.trim()
  if (query.length < 1) {
    clientSuggestions.value = []
    showClientSuggestions.value = false
    return
  }
  searchTimeout = setTimeout(async () => {
    if (!businessId.value) return
    try {
      clientSuggestions.value = await searchClients(businessId.value, query)
      showClientSuggestions.value = clientSuggestions.value.length > 0
    } catch {
      clientSuggestions.value = []
      showClientSuggestions.value = false
    }
  }, 300)
}

const selectClient = (client: { id: string; full_name: string; phone: string }) => {
  formData.value.clientId = client.id
  formData.value.clientName = client.full_name
  formData.value.clientPhone = client.phone
  showClientSuggestions.value = false
  if (searchTimeout) clearTimeout(searchTimeout)
}

const onClientNameBlur = () => {
  setTimeout(() => { showClientSuggestions.value = false }, 200)
}

const onClientNameFocus = () => {
  if (clientSuggestions.value.length > 0) {
    showClientSuggestions.value = true
  }
}

const isLoading = ref(false)
const isEditing = computed(() => !!modalData.value?.cita)

const serviceOptions = computed(() =>
  (props.servicios ?? []).map(s => ({ value: s.id, label: `${s.name} - $${s.price} (${s.duration} min)` }))
)

const employeeOptions = computed(() =>
  (props.empleados ?? []).map(e => ({ value: e.id, label: e.name }))
)

const statusOptions = [
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagada' },
  { value: 'cancelled', label: 'Cancelada' },
]

const emptyServiceRow = (): CitaFormServiceItem => ({
  serviceId: '',
  employeeId: '',
  duration: 30,
  price: 0,
})

const defaultFormData = (): CitaFormData & { extraServices: CitaFormServiceItem[] } => {
  const today = toISODate(new Date())
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const nextSlot = Math.ceil(minutes / 30) * 30
  return {
    clientId: undefined,
    clientName: '',
    clientPhone: '',
    service: '',
    employee: '',
    duration: 30,
    price: 0,
    extraServices: [],
    date: today,
    time: minutesToHHmm(nextSlot),
    status: 'confirmed',
    notes: '',
  }
}

const formData = ref<CitaFormData & { extraServices: CitaFormServiceItem[] }>(defaultFormData())
const errors = ref<Partial<Record<keyof CitaFormData, string>> & { rowErrors?: Record<number, Partial<Record<string, string>>> }>({})

const priceOverride = ref<number | null>(null)

const displayPrice = computed(() => priceOverride.value !== null ? String(priceOverride.value) : String(totalPrice.value))

const onPriceInput = (val: string | number) => {
  const num = val === '' ? 0 : Number(val)
  priceOverride.value = num
}

const servicesLoaded = computed(() => (props.servicios?.length ?? 0) > 0)
const employeesLoaded = computed(() => (props.empleados?.length ?? 0) > 0)

// Computed service rows: combine primary service + extraServices
const serviceRows = computed<CitaFormServiceItem[]>(() => {
  const rows: CitaFormServiceItem[] = [{
    serviceId: formData.value.service,
    employeeId: formData.value.employee,
    duration: formData.value.duration,
    price: formData.value.price,
  }]
  for (const extra of formData.value.extraServices) {
    rows.push({ ...extra })
  }
  return rows
})

const addServiceRow = () => {
  formData.value.extraServices.push(emptyServiceRow())
  priceOverride.value = null
}

const removeServiceRow = (index: number) => {
  const extraIndex = index - 1 // first row is primary
  if (extraIndex >= 0 && extraIndex < formData.value.extraServices.length) {
    formData.value.extraServices.splice(extraIndex, 1)
    priceOverride.value = null
  }
}

const updateServiceRow = (index: number, field: keyof CitaFormServiceItem, value: string) => {
  if (index === 0) {
    // Primary row: update formData directly
    if (field === 'serviceId') {
      formData.value.service = value
    } else if (field === 'employeeId') {
      formData.value.employee = value
    }
  } else {
    const extraIndex = index - 1
    const extra = formData.value.extraServices[extraIndex]
    if (extra) {
      if (field === 'serviceId') {
        extra.serviceId = value
        const svc = props.servicios?.find(s => s.id === value)
        if (svc) {
          extra.price = svc.price
          extra.duration = svc.duration
        }
      } else if (field === 'employeeId') {
        extra.employeeId = value
      }
    }
  }
}

const getRowError = (index: number, field: string): string | undefined => {
  return (errors.value as any)?.rowErrors?.[index]?.[field]
}

// When primary service changes, auto-fill price/duration and reset override
watch(() => formData.value.service, (serviceId) => {
  priceOverride.value = null
  if (!serviceId) return
  const svc = props.servicios?.find(s => s.id === serviceId)
  if (svc) {
    formData.value.price = svc.price
    formData.value.duration = svc.duration
  }
})

// Total price = sum of all service rows
const totalPrice = computed(() => {
  let total = formData.value.price
  for (const extra of formData.value.extraServices) {
    total += extra.price
  }
  return total
})

// Max duration = max of all service rows
const maxDuration = computed(() => {
  let max = formData.value.duration
  for (const extra of formData.value.extraServices) {
    if (extra.duration > max) max = extra.duration
  }
  return max
})

const isFormValid = computed(() => {
  const hasPrimaryService = formData.value.service !== '' && formData.value.employee !== ''
  const extrasValid = formData.value.extraServices.every(e => e.serviceId !== '' && e.employeeId !== '')
  return formData.value.clientName.trim().length >= 2 &&
    /^[\d\s\-\+\(\)]+$/.test(formData.value.clientPhone.trim()) &&
    formData.value.clientPhone.trim().length >= 7 &&
    hasPrimaryService &&
    extrasValid &&
    formData.value.date !== '' &&
    formData.value.time !== '' &&
    servicesLoaded.value &&
    employeesLoaded.value
})

watch(
  [isOpen, () => modalData.value?.cita],
  async ([open, cita]) => {
    if (!open) return
    priceOverride.value = null
    if (cita) {
      let phone = ''
      if (cita.clientId && businessId.value) {
        try {
          const results = await searchClients(businessId.value, cita.clientName)
          const match = results.find(c => c.id === cita.clientId)
          if (match) phone = match.phone
        } catch { /* ignore */ }
      }
      formData.value = {
        clientId: cita.clientId || undefined,
        clientName: cita.clientName || '',
        clientPhone: phone,
        service: cita.serviceId || '',
        employee: cita.employeeId || '',
        duration: cita.duration || 30,
        price: cita.price || 0,
        extraServices: [],
        date: cita.date || toISODate(new Date()),
        time: cita.time || '09:00',
        status: cita.status || 'confirmed',
        notes: cita.notes || '',
      }
    } else {
      formData.value = defaultFormData()
    }
    errors.value = {}
  },
  { immediate: true }
)

const normalizePhone = (phone: string): string => {
  let digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (!digits.startsWith('58')) digits = '58' + digits
  return '+' + digits
}

const isTimeInPast = (date: string, time: string): boolean => {
  const now = new Date()
  const y = now.getFullYear()
  const mo = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  if (date !== `${y}-${mo}-${d}`) return false
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m < currentMinutes
}

const validateForm = (): boolean => {
  errors.value = {}
  const rowErrors: Record<number, Partial<Record<string, string>>> = {}

  if (!formData.value.clientName.trim() || formData.value.clientName.length < 2) {
    errors.value.clientName = 'El nombre del cliente es requerido'
  }

  const phoneRaw = formData.value.clientPhone.trim()
  if (!phoneRaw) {
    errors.value.clientPhone = 'El teléfono del cliente es requerido'
  } else {
    formData.value.clientPhone = normalizePhone(phoneRaw)
    const normalized = formData.value.clientPhone
    if (normalized.length < 10) {
      errors.value.clientPhone = 'El teléfono debe tener al menos 10 dígitos'
    } else if (!/^\+58\d{9,}$/.test(normalized)) {
      errors.value.clientPhone = 'Formato inválido. Debe ser +584121234567'
    }
  }

  // Validate primary service row
  if (!formData.value.service) {
    rowErrors[0] = { ...rowErrors[0], serviceId: 'Selecciona un servicio' }
  }
  if (!formData.value.employee) {
    rowErrors[0] = { ...rowErrors[0], employeeId: 'Selecciona un empleado' }
  }

  // Validate extra service rows
  for (let i = 0; i < formData.value.extraServices.length; i++) {
    const extra = formData.value.extraServices[i]
    const idx = i + 1
    if (!extra.serviceId) {
      rowErrors[idx] = { ...rowErrors[idx], serviceId: 'Selecciona un servicio' }
    }
    if (!extra.employeeId) {
      rowErrors[idx] = { ...rowErrors[idx], employeeId: 'Selecciona un empleado' }
    }
  }

  if (!formData.value.date) {
    errors.value.date = 'Selecciona una fecha'
  }

  if (!formData.value.time) {
    errors.value.time = 'Selecciona una hora'
  } else if (isTimeInPast(formData.value.date, formData.value.time)) {
    errors.value.time = 'La hora no puede ser en el pasado'
  }

  if (Object.keys(rowErrors).length > 0) {
    ;(errors.value as any).rowErrors = rowErrors
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (saveInProgress.value) return

  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  saveInProgress.value = true

  const finalPrice = priceOverride.value !== null ? priceOverride.value : totalPrice.value
  const citaData: CitaFormData & { id?: string } = {
    ...formData.value,
    price: finalPrice,
  }

  if (modalData.value?.cita?.id) {
    citaData.id = modalData.value.cita.id
  }

  emit('save', citaData)
}

const onSaveComplete = () => {
  saveInProgress.value = false
}

const confirmDelete = () => {
  const id = modalData.value?.cita?.id
  if (!id) return
  emit('delete', id)
}

const open = (cita?: Cita) => {
  useModal(MODAL_ID).open({ cita })
}

defineExpose({
  open,
  close,
  isOpen,
  onSaveComplete,
})
</script>
