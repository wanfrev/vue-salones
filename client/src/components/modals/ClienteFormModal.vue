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

      <FormSalon
        v-if="isSalonNiche"
        :fields="salonFields"
        @update:fields="onUpdateSalon"
      />

      <FormBarber
        v-if="isBarberNiche"
        :fields="barberFields"
        @update:fields="onUpdateBarber"
      />

      <FormSpaHumano
        v-if="isSpaNiche"
        :fields="spaFields"
        @update:fields="onUpdateSpa"
      />

      <FormMascota
        v-if="isPetNiche"
        :fields="petFields"
        :is-vet="isVetNiche"
        @update:fields="onUpdatePet"
      />
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { useAuthStore } from '../../store/auth'
import type { Cliente, ClienteFormData } from '../../types/cliente'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormTextarea } from '../forms'
import { FormSalon, FormBarber, FormSpaHumano, FormMascota } from '../clients'
import type { SalonFields, BarberFields, SpaHumanoFields, MascotaFields } from '../clients'

const MODAL_ID = 'cliente-form-modal'

const props = defineProps<{
  cliente?: Cliente | null
}>()

const emit = defineEmits<{
  save: [cliente: ClienteFormData & { id?: string }]
}>()

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()
const authStore = useAuthStore()

const terminology = computed(() => authStore.terminology)
const nicheType = computed(() => authStore.nicheType)

const PET_NICHES = ['spa_perros', 'dog_spa', 'vet']
const isSalonNiche = computed(() => nicheType.value === 'salon')
const isBarberNiche = computed(() => nicheType.value === 'barberia')
const isSpaNiche = computed(() => nicheType.value === 'spa')
const isPetNiche = computed(() => PET_NICHES.includes(nicheType.value))
const isVetNiche = computed(() => nicheType.value === 'vet')

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
const petFields = reactive<MascotaFields>({
  pet_name: '',
  pet_breed: '',
  pet_weight: '',
  pet_owner: '',
  last_vaccine: '',
  last_checkup: '',
  medical_notes: '',
})
const salonFields = reactive<SalonFields>({
  hair_type: '',
  hair_length: '',
  chemical_history: '',
})
const barberFields = reactive<BarberFields>({
  beard_style: '',
  hair_type: '',
  fade_preference: '',
  products_used: '',
  notes: '',
})
const spaFields = reactive<SpaHumanoFields>({
  skin_type: '',
  massage_preference: '',
  allergies: '',
})

const onUpdateSalon = (fields: SalonFields) => { Object.assign(salonFields, fields) }
const onUpdateBarber = (fields: BarberFields) => { Object.assign(barberFields, fields) }
const onUpdateSpa = (fields: SpaHumanoFields) => { Object.assign(spaFields, fields) }
const onUpdatePet = (fields: MascotaFields) => { Object.assign(petFields, fields) }

const errors = ref<Partial<Record<keyof ClienteFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 && formData.value.phone.trim().length >= 8
})

watch(
  () => modalData.value?.cliente,
  (cliente) => {
    if (cliente) {
      const meta = cliente.metadata ?? {}
      formData.value = {
        name: cliente.name || '',
        phone: cliente.phone || '',
        email: cliente.email || '',
        notes: cliente.notes || '',
        birthday: cliente.birthday || '',
        preferredServices: cliente.preferredServices || [],
        metadata: { ...meta },
      }
      const m = meta as Record<string, string>
      petFields.pet_name = m.pet_name ?? ''
      petFields.pet_breed = m.pet_breed ?? ''
      petFields.pet_weight = m.pet_weight ?? ''
      petFields.pet_owner = m.pet_owner ?? ''
      petFields.last_vaccine = m.last_vaccine ?? ''
      petFields.last_checkup = m.last_checkup ?? ''
      petFields.medical_notes = m.medical_notes ?? ''
      salonFields.hair_type = m.hair_type ?? ''
      salonFields.hair_length = m.hair_length ?? ''
      salonFields.chemical_history = m.chemical_history ?? ''
      barberFields.beard_style = m.beard_style ?? ''
      barberFields.hair_type = m.hair_type ?? ''
      barberFields.fade_preference = m.fade_preference ?? ''
      barberFields.products_used = m.products_used ?? ''
      barberFields.notes = m.notes ?? ''
      spaFields.skin_type = m.skin_type ?? ''
      spaFields.massage_preference = m.massage_preference ?? ''
      spaFields.allergies = m.allergies ?? ''
    } else {
      formData.value = { ...defaultFormData, metadata: {} }
      petFields.pet_name = ''
      petFields.pet_breed = ''
      petFields.pet_weight = ''
      petFields.pet_owner = ''
      petFields.last_vaccine = ''
      petFields.last_checkup = ''
      petFields.medical_notes = ''
      salonFields.hair_type = ''
      salonFields.hair_length = ''
      salonFields.chemical_history = ''
      barberFields.beard_style = ''
      barberFields.hair_type = ''
      barberFields.fade_preference = ''
      barberFields.products_used = ''
      barberFields.notes = ''
      spaFields.skin_type = ''
      spaFields.massage_preference = ''
      spaFields.allergies = ''
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

    let nicheMeta: Record<string, unknown> = {}
    if (isPetNiche.value) {
      nicheMeta = { ...petFields }
      for (const key of Object.keys(nicheMeta)) {
        if (!nicheMeta[key]) delete nicheMeta[key]
      }
    } else if (isSalonNiche.value) {
      nicheMeta = { ...salonFields }
    } else if (isBarberNiche.value) {
      nicheMeta = { ...barberFields }
    } else if (isSpaNiche.value) {
      nicheMeta = { ...spaFields }
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
    success(isEditing.value ? `${terminology.value.client} actualizado correctamente` : `${terminology.value.client} creado correctamente`)
    confirm(clienteData)
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
