<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar ${terminology.client}` : `Nuevo ${terminology.client}`"
    :subtitle="isEditing ? `Editando a ${formData.name}` : `Agrega un nuevo ${terminology.client.toLowerCase()} a tu base de datos`"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'"
    size="md"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    :confirm-text="`Guardar ${terminology.client}`"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <FormInput
        v-model="formData.name"
        label="Nombre completo"
        placeholder="Ej: María González"
        required
        prefix-icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        :error="errors.name"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          v-model="formData.phone"
          label="Teléfono"
          type="tel"
          placeholder="+52 55 1234 5678"
          required
          prefix-icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          :error="errors.phone"
        />

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
        <FormInput
          v-model="formData.birthday"
          label="Cumpleaños"
          type="date"
          prefix-icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          :error="errors.birthday"
        />
      </div>

      <FormTextarea
        v-model="formData.notes"
        label="Notas adicionales"
        placeholder="Alergias, preferencias, historial relevante..."
        :rows="3"
        :error="errors.notes"
      />

      <NicheFields
        v-if="nicheConfig"
        :config="nicheConfig"
        :values="nicheValues"
        :terminology="terminology"
        @update="onNicheFieldUpdate"
      />

      <div v-if="isEditing" class="border-t border-border pt-4">
        <button
          type="button"
          class="rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition-theme hover:bg-danger/10"
          @click="confirmDelete"
        >
          Eliminar {{ terminology.client.toLowerCase() }}
        </button>
      </div>
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useBusinessStore } from '../../store/business'
import type { Cliente, ClienteFormData } from '../../types/cliente'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormTextarea } from '../forms'
import NicheFields from '../clients/NicheFields.vue'
import { getNicheConfig, isPetNiche } from '../../config/nicheFields'

const MODAL_ID = 'cliente-form-modal'

const props = defineProps<{
  cliente?: Cliente | null
}>()

const emit = defineEmits<{
  save: [cliente: ClienteFormData & { id?: string }]
  delete: [clienteId: string]
}>()

const { isOpen, modalData, close } = useModal(MODAL_ID)
const { error: showError } = useNotification()
const businessStore = useBusinessStore()

const terminology = computed(() => businessStore.terminology)
const nicheType = computed(() => businessStore.nicheType)

const isLoading = ref(false)

const isEditing = computed(() => !!modalData.value?.cliente)

const defaultFormData: ClienteFormData = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  birthday: '',
  preferredServices: [],
  metadata: {},
}

const formData = ref<ClienteFormData>({ ...defaultFormData })
const nicheValues = reactive<Record<string, string>>({})

const nicheConfig = computed(() => getNicheConfig(nicheType.value))

const isPet = computed(() => isPetNiche(nicheType.value))

// Auto-link pet_owner from name when it's a pet niche
watch(
  () => formData.value.name,
  (name) => {
    if (isPet.value && !nicheValues.pet_owner && !isEditing.value) {
      nicheValues.pet_owner = name
    }
  }
)

const onNicheFieldUpdate = (key: string, value: string) => {
  nicheValues[key] = value
}

const errors = ref<Partial<Record<keyof ClienteFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && formData.value.phone.trim().length >= 8
})

watch(
  () => modalData.value?.cliente,
  (cliente) => {
    if (cliente) {
      const meta = cliente.metadata ?? {} as Record<string, string>
      formData.value = {
        name: cliente.name || '',
        phone: cliente.phone || '',
        email: cliente.email || '',
        notes: cliente.notes || '',
        birthday: cliente.birthday || '',
        preferredServices: cliente.preferredServices || [],
        metadata: { ...meta },
      }
      Object.assign(nicheValues, meta)
    } else {
      formData.value = { ...defaultFormData, metadata: {} }
      for (const key of Object.keys(nicheValues)) {
        delete nicheValues[key]
      }
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

  if (isPet.value) {
    if (!nicheValues.pet_name?.trim()) {
      errors.value.name = `El nombre ${terminology.value.pet?.toLowerCase() || 'de la mascota'} es obligatorio`
    }
    if (!nicheValues.pet_owner?.trim()) {
      errors.value.name = 'El nombre del dueño es obligatorio'
    }
  }

  return Object.keys(errors.value).length === 0
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const confirmDelete = () => {
  const id = modalData.value?.cliente?.id
  if (!id) return
  const name = formData.value.name
  const msg = `¿Eliminar a "${name}"?\n\nSe eliminarán todos sus datos. Esta acción no se puede deshacer.`
  if (window.confirm(msg)) {
    emit('delete', id)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    showError('Por favor corrige los errores en el formulario')
    return
  }

  isLoading.value = true

  try {
    const nicheMeta: Record<string, unknown> = { ...nicheValues }
    if (isPet.value) {
      for (const key of Object.keys(nicheMeta)) {
        if (!nicheMeta[key]) delete nicheMeta[key]
      }
    }

    const clienteData: ClienteFormData & { id?: string } = {
      ...formData.value,
      metadata: {
        ...formData.value.metadata,
        ...nicheMeta,
      },
    }

    if (modalData.value?.cliente?.id) {
      clienteData.id = modalData.value.cliente.id
    }

    emit('save', clienteData)
  } catch (err) {
    showError(`Error al guardar el ${terminology.value.client.toLowerCase()}`)
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
