<template>
  <div class="min-h-screen bg-bg">
    <header class="border-b border-border bg-surface">
      <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-text-muted">Superadmin</p>
          <h1 class="text-2xl font-bold tracking-tight text-text">SaaS control</h1>
          <p class="text-sm text-text-muted">Alta y control de negocios en un solo lugar.</p>
        </div>
        <button
          type="button"
          class="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
          @click="logout"
        >
          Cerrar sesion
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <section class="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-text">Registrar negocio</h2>
              <p class="text-sm text-text-muted">Crea el negocio y envia la invitacion al dueno.</p>
            </div>
            <div class="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              Total: {{ businessesCount }}
            </div>
          </div>

          <form class="grid gap-3" @submit.prevent="handleSubmit">
            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="businessName">Nombre del negocio</label>
              <input
                id="businessName"
                v-model="form.businessName"
                type="text"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Salon Luma"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="ownerEmail">Email del dueno</label>
              <input
                id="ownerEmail"
                v-model="form.ownerEmail"
                type="email"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="dueno@salon.com"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="ownerPassword">Contraseña del dueno</label>
              <input
                id="ownerPassword"
                v-model="form.ownerPassword"
                type="password"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="nicheType">Nicho</label>
              <select
                v-if="!showingCustomNiche"
                id="nicheType"
                :value="form.nicheType"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                @change="onNicheSelect"
              >
                <option value="" disabled selected>Selecciona un nicho</option>
                <option value="__new__">+ Agregar nuevo</option>
                <option value="salon">Salón de belleza</option>
                <option value="barberia">Barbería</option>
                <option value="spa">Spa (humano)</option>
                <option value="dog_spa">Spa canino / Veterinaria</option>
                <option value="nail_bar">Barra de uñas</option>
                <option value="centro_estetico">Centro estético</option>
              </select>
              <div v-else class="flex gap-2">
                <input
                  id="nicheType"
                  v-model="form.nicheType"
                  type="text"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Escribe el nicho..."
                />
                <button
                  type="button"
                  class="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition-theme hover:bg-bg-secondary"
                  @click="cancelCustomNiche"
                >
                  Volver
                </button>
              </div>
            </div>

            <p v-if="formError" class="text-sm text-danger">{{ formError }}</p>

            <button
              type="submit"
              :disabled="isCreating"
              class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ isCreating ? 'Creando...' : 'Crear negocio e invitar' }}
            </button>
          </form>
        </div>

        <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-text">Negocios registrados</h2>
              <p class="text-sm text-text-muted">Vista general de todos los locales.</p>
            </div>
            <input
              v-model="search"
              type="search"
              placeholder="Buscar"
              class="w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div class="space-y-3">
            <div v-for="biz in filteredBusinesses" :key="biz.id" class="rounded-xl border border-border bg-bg-secondary p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-text">{{ biz.name }}</h3>
                    <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      :class="biz.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'"
                    >
                      {{ biz.active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <p class="text-xs text-text-muted">Slug: {{ biz.slug }} · Nicho: {{ biz.niche_type }}</p>
                  <p class="text-xs text-text-muted">Creado: {{ formatDate(biz.created_at) }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
                    @click="openEdit(biz)"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    class="shrink-0 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition-theme hover:bg-danger/10"
                    :disabled="deletingId === biz.id"
                    @click="confirmDelete(biz)"
                  >
                    {{ deletingId === biz.id ? 'Eliminando...' : 'Eliminar' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!filteredBusinesses.length" class="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-sm text-text-muted">
              No hay negocios para mostrar.
            </div>
          </div>
        </div>
      </section>
      <!-- Edit modal -->
      <div
        v-if="editingBiz"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="closeEdit"
      >
        <div class="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-text">Editar negocio</h2>
            <p class="text-sm text-text-muted">{{ editingBiz.name }}</p>
          </div>

          <form class="grid gap-3" @submit.prevent="handleEditSubmit">
            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="edit-name">Nombre</label>
              <input
                id="edit-name"
                v-model="editForm.name"
                type="text"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="edit-phone">Teléfono</label>
                <input
                  id="edit-phone"
                  v-model="editForm.phone"
                  type="text"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="edit-timezone">Zona horaria</label>
                <input
                  id="edit-timezone"
                  v-model="editForm.timezone"
                  type="text"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="edit-address">Dirección</label>
              <input
                id="edit-address"
                v-model="editForm.address"
                type="text"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="edit-currency">Moneda</label>
                <select
                  id="edit-currency"
                  v-model="editForm.currency"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="USD">USD</option>
                  <option value="DOP">DOP</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="edit-niche">Nicho</label>
                <select
                  id="edit-niche"
                  v-model="editForm.niche_type"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="salon">Salón de belleza</option>
                  <option value="barberia">Barbería</option>
                  <option value="spa">Spa (humano)</option>
                  <option value="dog_spa">Spa canino / Veterinaria</option>
                  <option value="nail_bar">Barra de uñas</option>
                  <option value="centro_estetico">Centro estético</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input
                id="edit-active"
                v-model="editForm.active"
                type="checkbox"
                class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label class="text-sm font-medium text-text" for="edit-active">Activo</label>
            </div>

            <p v-if="editFormError" class="text-sm text-danger">{{ editFormError }}</p>

            <div class="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
                @click="closeEdit"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isUpdating ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from '../composables/useNotification'
import { useAuth } from '../composables/useAuth'
import { createBusinessWithOwner, deleteBusiness, listBusinesses, updateBusiness, superadminKeys } from '../services/superadminService'
import type { Business } from '../types/database'

const { logout } = useAuth()
const { success, error } = useNotification()
const queryClient = useQueryClient()

const form = ref({
  businessName: '',
  ownerEmail: '',
  ownerPassword: '',
  nicheType: '',
})

const showingCustomNiche = ref(false)

const onNicheSelect = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  if (value === '__new__') {
    showingCustomNiche.value = true
    form.value.nicheType = ''
    return
  }
  form.value.nicheType = value
}

const cancelCustomNiche = () => {
  showingCustomNiche.value = false
  form.value.nicheType = ''
}

const search = ref('')
const formError = ref('')

const { data: businessesData } = useQuery({
  queryKey: superadminKeys.businesses(),
  queryFn: listBusinesses,
})

const businesses = computed<Business[]>(() => businessesData.value ?? [])
const businessesCount = computed(() => businesses.value.length)

const { mutateAsync: createBusiness, isPending: isCreating } = useMutation({
  mutationFn: createBusinessWithOwner,
  onSuccess: async () => {
    success('Negocio creado. El admin ya puede iniciar sesión.')
    form.value.businessName = ''
    form.value.ownerEmail = ''
    form.value.ownerPassword = ''
    form.value.nicheType = ''
    formError.value = ''
    await queryClient.invalidateQueries({ queryKey: superadminKeys.businesses() })
  },
  onError: (err: unknown) => {
    const message = err instanceof Error ? err.message : 'No fue posible crear el negocio.'
    error(message)
  },
})

const deletingId = ref<string | null>(null)

const { mutateAsync: deleteBiz } = useMutation({
  mutationFn: deleteBusiness,
  onSuccess: async () => {
    success('Negocio eliminado completamente.')
    await queryClient.invalidateQueries({ queryKey: superadminKeys.businesses() })
  },
  onError: (err: unknown) => {
    const message = err instanceof Error ? err.message : 'No fue posible eliminar el negocio.'
    error(message)
  },
  onSettled: () => {
    deletingId.value = null
  },
})

const confirmDelete = (biz: Business) => {
  const msg = `¿Eliminar "${biz.name}"?\n\nSe borrará TODO: usuarios, empleados, clientes, citas, servicios, productos, inventario, transacciones, gastos...\n\nEsta acción NO se puede deshacer.`
  if (window.confirm(msg)) {
    deletingId.value = biz.id
    deleteBiz(biz.id)
  }
}

const filteredBusinesses = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return businesses.value
  return businesses.value.filter(biz =>
    biz.name.toLowerCase().includes(term)
      || biz.slug.toLowerCase().includes(term)
      || biz.niche_type.toLowerCase().includes(term)
  )
})

const handleSubmit = async () => {
  formError.value = ''

  if (!form.value.businessName.trim() || !form.value.ownerEmail.trim() || !form.value.ownerPassword.trim()) {
    formError.value = 'Nombre, email y contraseña son requeridos.'
    return
  }

  await createBusiness({
    businessName: form.value.businessName,
    ownerEmail: form.value.ownerEmail,
    ownerPassword: form.value.ownerPassword,
    nicheType: form.value.nicheType.trim() || undefined,
  })
}

// ─── Edit business ──────────────────────────────────────────
const editingBiz = ref<Business | null>(null)
const editFormError = ref('')
const editForm = ref({
  name: '',
  phone: '',
  address: '',
  timezone: '',
  currency: 'USD',
  niche_type: 'salon',
  active: true,
})

const openEdit = (biz: Business) => {
  editFormError.value = ''
  editingBiz.value = biz
  editForm.value = {
    name: biz.name,
    phone: biz.phone ?? '',
    address: biz.address ?? '',
    timezone: biz.timezone,
    currency: biz.currency,
    niche_type: biz.niche_type,
    active: biz.active,
  }
}

const closeEdit = () => {
  editFormError.value = ''
  editingBiz.value = null
}

const { mutateAsync: updateBiz, isPending: isUpdating } = useMutation({
  mutationFn: (input: { business_id: string; name: string; phone: string | null; address: string | null; timezone: string; currency: string; niche_type: string; active: boolean }) =>
    updateBusiness(input),
  onSuccess: async () => {
    success('Negocio actualizado correctamente.')
    closeEdit()
    await queryClient.invalidateQueries({ queryKey: superadminKeys.businesses() })
  },
  onError: (err: unknown) => {
    const message = err instanceof Error ? err.message : 'No fue posible actualizar el negocio.'
    error(message)
  },
})

const handleEditSubmit = () => {
  if (!editingBiz.value) return
  const f = editForm.value
  if (!f.name.trim()) {
    editFormError.value = 'El nombre es requerido.'
    return
  }
  updateBiz({
    business_id: editingBiz.value.id,
    name: f.name.trim(),
    phone: f.phone.trim() || null,
    address: f.address.trim() || null,
    timezone: f.timezone.trim(),
    currency: f.currency,
    niche_type: f.niche_type,
    active: f.active,
  })
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
}
</script>
