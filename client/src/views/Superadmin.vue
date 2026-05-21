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
                placeholder="Salon Andrus"
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

            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="primaryColor">Color primario (hex)</label>
                <div class="flex items-center gap-2">
                  <span class="h-9 w-9 rounded-lg border border-border" :style="{ backgroundColor: form.primaryColor }"></span>
                  <input
                    id="primaryColor"
                    v-model="form.primaryColor"
                    type="text"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="#2F4156"
                  />
                </div>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="secondaryColor">Color secundario (hex)</label>
                <div class="flex items-center gap-2">
                  <span class="h-9 w-9 rounded-lg border border-border" :style="{ backgroundColor: form.secondaryColor }"></span>
                  <input
                    id="secondaryColor"
                    v-model="form.secondaryColor"
                    type="text"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                    placeholder="#567CB0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="nicheType">Nicho</label>
              <select
                id="nicheType"
                v-model="form.nicheType"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="salon">Salón de belleza</option>
                <option value="barberia">Barbería</option>
                <option value="spa">Spa (humano)</option>
                <option value="dog_spa">Spa canino / Veterinaria</option>
              </select>
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
                <div>
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
                  <span
                    class="h-8 w-8 rounded-lg border border-border"
                    :style="{ backgroundColor: biz.theme_config?.primary || '#2F4156' }"
                    title="Primary"
                  ></span>
                  <span
                    class="h-8 w-8 rounded-lg border border-border"
                    :style="{ backgroundColor: biz.theme_config?.secondary || '#567CB0' }"
                    title="Secondary"
                  ></span>
                </div>
              </div>
            </div>

            <div v-if="!filteredBusinesses.length" class="rounded-xl border border-dashed border-border bg-bg-secondary p-6 text-center text-sm text-text-muted">
              No hay negocios para mostrar.
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useNotification } from '../composables/useNotification'
import { useAuth } from '../composables/useAuth'
import { createBusinessWithOwner, listBusinesses, superadminKeys } from '../services/superadminService'
import type { Business } from '../types/database'

const { logout } = useAuth()
const { success, error } = useNotification()
const queryClient = useQueryClient()

const form = ref({
  businessName: '',
  ownerEmail: '',
  primaryColor: '#2F4156',
  secondaryColor: '#567CB0',
  nicheType: 'salon',
})

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
    success('Negocio creado e invitacion enviada.')
    form.value.businessName = ''
    form.value.ownerEmail = ''
    formError.value = ''
    await queryClient.invalidateQueries({ queryKey: superadminKeys.businesses() })
  },
  onError: (err: unknown) => {
    const message = err instanceof Error ? err.message : 'No fue posible crear el negocio.'
    error(message)
  },
})

const filteredBusinesses = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return businesses.value
  return businesses.value.filter(biz =>
    biz.name.toLowerCase().includes(term)
      || biz.slug.toLowerCase().includes(term)
      || biz.niche_type.toLowerCase().includes(term)
  )
})

const isHex = (value: string) => /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value.trim())

const handleSubmit = async () => {
  formError.value = ''

  if (!form.value.businessName.trim() || !form.value.ownerEmail.trim()) {
    formError.value = 'Nombre y email son requeridos.'
    return
  }

  if (!isHex(form.value.primaryColor) || !isHex(form.value.secondaryColor)) {
    formError.value = 'Los colores deben ser hex validos, ej: #2F4156.'
    return
  }

  await createBusiness({
    businessName: form.value.businessName,
    ownerEmail: form.value.ownerEmail,
    primaryColor: form.value.primaryColor,
    secondaryColor: form.value.secondaryColor,
    nicheType: form.value.nicheType,
  })
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })
}
</script>
