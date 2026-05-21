<template>
  <ModalBase
    :is-open="isOpen"
    :title="isEditing ? `Editar producto` : `Nuevo producto`"
    :subtitle="isEditing ? `Editando ${formData.name}` : 'Agrega un nuevo producto al catálogo'"
    :icon="isEditing ? 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'"
    size="lg"
    :is-loading="isLoading"
    :is-confirm-disabled="!isFormValid"
    confirm-text="Guardar producto"
    @close="close"
    @confirm="handleSubmit"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          v-model="formData.name"
          label="Nombre del producto"
          placeholder="Ej: Champú Keratina"
          required
          :error="errors.name"
        />
        <FormSelect
          v-model="formData.categoryId"
          label="Categoría"
          :options="categoryOptions"
          required
          :error="errors.categoryId"
        />
      </div>

      <FormTextarea
        v-model="formData.description"
        label="Descripción"
        placeholder="Describe el producto..."
        :rows="2"
        :error="errors.description"
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          v-model="formData.sku"
          label="SKU"
          placeholder="Ej: CHAMP-KER-001"
          :error="errors.sku"
        />
        <FormInput
          v-model="formData.barcode"
          label="Código de barras"
          placeholder="Ej: 7501234567890"
          :error="errors.barcode"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          v-model="formData.unit"
          label="Unidad de medida"
          placeholder="Ej: botella, unidad, litro"
          required
          :error="errors.unit"
        />
        <FormSelect
          v-model="formData.active"
          label="Estado"
          :options="statusOptions"
          required
          :error="errors.active"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormInput
          v-model.number="formData.unitCost"
          label="Costo unitario ($)"
          type="number"
          placeholder="0.00"
          required
          :error="errors.unitCost"
        />
        <FormInput
          v-model.number="formData.unitPrice"
          label="Precio de venta ($)"
          type="number"
          placeholder="0.00"
          required
          :error="errors.unitPrice"
        />
        <FormInput
          v-model.number="formData.reorderPoint"
          label="Stock mínimo"
          type="number"
          placeholder="0"
          :error="errors.reorderPoint"
        />
      </div>
    </form>
  </ModalBase>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useModal } from '../../composables/useModal'
import { useNotification } from '../../composables/useNotification'
import { listProductCategories, productosKeys } from '../../services/productosService'
import { useAuthStore } from '../../store/auth'
import { mapCategoryToOption } from '../../mappers/productosMapper'
import type { Producto, ProductoFormData } from '../../types/producto'
import ModalBase from '../common/ModalBase.vue'
import { FormInput, FormSelect, FormTextarea } from '../forms'

const MODAL_ID = 'producto-form-modal'

const emit = defineEmits<{
  save: [producto: ProductoFormData & { id?: string }]
}>()

const { isOpen, modalData, close, confirm } = useModal(MODAL_ID)
const { success, error: showError } = useNotification()
const authStore = useAuthStore()

const isLoading = ref(false)
const isEditing = computed(() => !!modalData.value?.producto)
const businessId = computed(() => authStore.businessId)

const { data: categoriesData } = useQuery({
  queryKey: computed(() => productosKeys.categories(businessId.value)),
  queryFn: () => listProductCategories(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const categoryOptions = computed(() => {
  const cats = categoriesData.value ?? []
  return [
    { value: '', label: 'Sin categoría' },
    ...cats.map(mapCategoryToOption),
  ]
})

const statusOptions = [
  { value: true, label: 'Activo' },
  { value: false, label: 'Inactivo' },
]

const defaultFormData: ProductoFormData = {
  name: '',
  description: '',
  categoryId: '',
  sku: '',
  barcode: '',
  unit: 'unidad',
  unitCost: 0,
  unitPrice: 0,
  reorderPoint: 0,
  active: true,
}

const formData = ref<ProductoFormData>({ ...defaultFormData })
const errors = ref<Partial<Record<keyof ProductoFormData, string>>>({})

const isFormValid = computed(() => {
  return formData.value.name.trim().length >= 2 &&
         formData.value.unit.trim().length > 0 &&
         formData.value.unitPrice > 0
})

watch(
  () => modalData.value?.producto,
  (producto) => {
    if (producto) {
      formData.value = {
        name: producto.name || '',
        description: producto.description || '',
        categoryId: producto.categoryId || '',
        sku: producto.sku || '',
        barcode: producto.barcode || '',
        unit: producto.unit || 'unidad',
        unitCost: producto.unitCost || 0,
        unitPrice: producto.unitPrice || 0,
        reorderPoint: producto.reorderPoint || 0,
        active: producto.status === 'Activo',
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
  if (!formData.value.unit.trim()) {
    errors.value.unit = 'La unidad de medida es requerida'
  }
  if (formData.value.unitPrice <= 0) {
    errors.value.unitPrice = 'El precio debe ser mayor a 0'
  }
  if (formData.value.unitCost < 0) {
    errors.value.unitCost = 'El costo no puede ser negativo'
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

    const productoData: ProductoFormData & { id?: string } = {
      ...formData.value,
    }

    if (modalData.value?.producto?.id) {
      productoData.id = modalData.value.producto.id
    }

    emit('save', productoData)
    success(isEditing.value ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
    confirm(productoData)
  } catch (err) {
    showError('Error al guardar el producto')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const open = (producto?: Producto) => {
  useModal(MODAL_ID).open({ producto })
}

defineExpose({
  open,
  close,
  isOpen,
})
</script>
