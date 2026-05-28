<template>
  <div class="min-h-screen bg-bg">
    <!-- Top Header -->
    <header class="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-surface border-b border-border px-4">
      <div class="flex items-center gap-2">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary lg:hidden">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="flex flex-col">
          <img :src="lumaLogo" alt="Luma" class="-ml-1 h-6 w-auto object-contain" />
          <span class="text-[10px] text-text-muted uppercase tracking-wide">Admin</span>
        </div>
      </div>
      <button @click="logout" class="rounded-lg p-2 text-text-muted transition-theme hover:bg-bg-secondary hover:text-text-secondary">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </header>

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 top-16 z-30 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64">
      <div class="p-4 lg:p-6">
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-sm text-primary mb-0.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10M7 16h6" />
                </svg>
                <span class="font-medium uppercase tracking-wider">{{ authStore.terminology.client || 'Cliente' }}s</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Historial de {{ cliente?.name || authStore.terminology.client || 'Cliente' }}</h1>
              <p class="hidden text-sm text-text-muted sm:block">Servicios y visitas anteriores</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="goBack"
                class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              <button
                v-if="cliente?.phone"
                @click="handleWhatsApp"
                class="flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-success/25 transition-theme hover:bg-success/90"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10l2 2 7-7M12 21a9 9 0 10-9-9c0 1.6.42 3.1 1.16 4.4L3 21l4.7-1.16A8.94 8.94 0 0012 21z" />
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        </header>

        <section class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div class="rounded-xl border border-border bg-surface p-4 shadow-sm lg:col-span-2">
            <h3 class="mb-4 text-base font-semibold text-text">Servicios realizados</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-border-subtle">
                    <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
                    <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.service || 'Servicio' }}</th>
                    <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.employee || 'Empleado' }}</th>
                    <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
                    <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border-subtle">
                  <tr v-for="item in historial" :key="item.id" class="text-sm">
                    <td class="py-3 text-text-secondary">{{ item.date }}</td>
                    <td class="py-3 font-medium text-text">{{ item.service }}</td>
                    <td class="py-3 text-text-secondary">{{ item.employee }}</td>
                    <td class="py-3 text-right text-text">${{ item.amount }}</td>
                    <td class="py-3 text-right">
                      <span class="inline-flex items-center gap-2 rounded-full bg-bg-secondary px-2.5 py-1 text-xs font-medium text-text">
                        <span class="h-2 w-2 rounded-full" :style="{ background: item.statusColor }"></span>
                        {{ item.statusLabel }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 class="mb-4 text-base font-semibold text-text">Resumen</h3>
            <div class="space-y-3">
              <div class="rounded-lg bg-bg-secondary p-3">
                <p class="text-xs text-text-muted">Total {{ (authStore.terminology.appointment || 'cita').toLowerCase() }}s</p>
                <p class="text-lg font-bold text-text">{{ historial.length }}</p>
              </div>
              <div class="rounded-lg bg-bg-secondary p-3">
                <p class="text-xs text-text-muted">Gasto total</p>
                <p class="text-lg font-bold text-text">${{ totalGasto }}</p>
              </div>
              <div class="rounded-lg bg-bg-secondary p-3">
                <p class="text-xs text-text-muted">Última visita</p>
                <p class="text-lg font-bold text-text">{{ ultimaVisita || 'Sin visitas' }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useAuth } from '../composables/useAuth'
import { listCitas } from '../services/agendaService'
import { getClienteById } from '../services/clientesService'
import Sidebar from '../components/layout/Sidebar.vue'
import type { Cliente } from '../types/cliente'

const { logout, authStore } = useAuth()
const isSidebarOpen = ref(false)
const route = useRoute()
const router = useRouter()

const clienteId = route.params.id as string
const businessId = computed(() => authStore.businessId)

const { data: clienteData } = useQuery({
  queryKey: ['cliente', clienteId],
  queryFn: () => getClienteById(clienteId),
  enabled: computed(() => !!clienteId),
})

const { data: citasData } = useQuery({
  queryKey: computed(() => ['cliente-historial', businessId.value, clienteId]),
  queryFn: () => listCitas(businessId.value!, undefined, 'all'),
  enabled: computed(() => !!businessId.value),
})

const cliente = computed<Cliente | null>(() => clienteData.value ?? null)

const historial = computed(() => (citasData.value || [])
  .filter(c => c.clientId === clienteId)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map(c => ({
    id: c.id,
    date: c.date,
    service: c.service,
    employee: c.employee,
    amount: c.price.toLocaleString(),
    statusLabel: c.statusLabel || c.status,
    statusColor: c.statusColor || 'var(--color-primary)',
  }))
)

const totalGasto = computed(() => historial.value.reduce((sum, item) => sum + Number(item.amount.toString().replace(/,/g, '')), 0).toLocaleString())
const ultimaVisita = computed(() => historial.value[0]?.date || '')

const goBack = () => {
  router.push('/clientes')
}

const handleWhatsApp = () => {
  const phone = (cliente.value?.phone || '').replace(/[^\d]/g, '')
  if (!phone) return
  window.open(`https://wa.me/${phone}`, '_blank')
}
</script>
