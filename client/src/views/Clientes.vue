<template>
  <div class="min-h-screen bg-bg">
    <!-- Mobile Header -->
    <header class="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between bg-surface border-b border-border px-4 lg:hidden">
      <div class="flex items-center gap-3">
        <button @click="isSidebarOpen = !isSidebarOpen" class="rounded-lg p-2 text-text-secondary transition-theme hover:bg-bg-secondary">
          <svg v-if="!isSidebarOpen" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-hover shadow-sm shadow-primary/20">
          <svg class="h-5 w-5 text-text-inverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-text leading-tight">Andrus</span>
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

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 z-20 bg-black/50 lg:hidden"></div>

    <main class="ml-0 min-h-screen pt-16 lg:ml-64 lg:pt-0">
      <div class="p-4 lg:p-6">
        <!-- Header -->
        <header class="mb-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {{ authStore.terminology.client || 'Cliente' }}s
              </div>
              <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">
                {{ totalClientes }} {{ totalClientes === 1 ? (authStore.terminology.client || 'cliente').toLowerCase() : (authStore.terminology.client || 'cliente').toLowerCase() + 's' }}
              </h1>
              <p class="text-sm text-text-muted">
                {{ clientesConHistorial }} con historial · {{ clientesSinVisitar }} sin visitar en {{ daysSinceVisitFilter }} días
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                @click="handleNewCliente"
                class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Nuevo {{ (authStore.terminology.client || 'cliente').toLowerCase() }}</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <section class="mb-4 grid grid-cols-2 gap-2 lg:mb-4 lg:grid-cols-4 lg:gap-3">
          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ totalClientes }}</p>
                <p class="text-xs text-text-muted">Total</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ clientesRecientes }}</p>
                <p class="text-xs text-text-muted">Recientes</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ clientesConHistorial }}</p>
                <p class="text-xs text-text-muted">Con historial</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-border bg-surface p-3 transition-theme hover:border-border-strong sm:rounded-xl sm:p-4">
            <div class="flex items-center gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-danger/10 text-danger sm:h-9 sm:w-9">
                <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xl font-bold tabular-nums text-text sm:text-2xl">{{ clientesSinVisitar }}</p>
                <p class="text-xs text-text-muted">Sin visitar +{{ daysSinceVisitFilter }}d</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Search and Filter Bar -->
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1 max-w-md">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Buscar por nombre, teléfono o email..."
              class="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15" 
            />
            <div class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              @click="handleOpenFilters"
              class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:border-border-strong"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
            <button 
              @click="handleExport"
              class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:border-border-strong"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </button>
          </div>
        </div>

        <!-- Clients Table -->
        <div class="overflow-hidden rounded-lg border border-border bg-surface sm:rounded-xl">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{{ authStore.terminology.client || 'Cliente' }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Contacto</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Última visita</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{{ authStore.terminology.appointment || 'Cita' }}s</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Gasto</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="client in paginatedData" :key="client.id" class="cursor-pointer border-b border-border-subtle last:border-b-0 transition-theme hover:bg-bg-secondary" @click="handleViewAgenda(client)">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                        {{ getInitials(client.name) }}
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-text truncate">{{ client.name }}</p>
                        <p class="text-xs text-text-muted">Desde {{ client.joinDate }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-text-secondary">{{ client.phone }}</div>
                    <div v-if="client.email" class="text-xs text-text-muted truncate max-w-40">{{ client.email }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm text-text-secondary">{{ client.lastVisit }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-medium tabular-nums text-text">{{ client.totalAppointments }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-medium tabular-nums text-text">${{ client.totalSpent }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-0.5">
                      <button 
                        @click.stop="handleEditCliente(client)"
                        class="rounded-md p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary"
                        title="Editar {{ (authStore.terminology.client || 'cliente').toLowerCase() }}"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        @click.stop="handleWhatsApp(client)"
                        class="rounded-md p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-success"
                        title="Escribir por WhatsApp"
                      >
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M7 10l2 2 7-7M12 21a9 9 0 10-9-9c0 1.6.42 3.1 1.16 4.4L3 21l4.7-1.16A8.94 8.94 0 0012 21z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="flex items-center justify-between border-t border-border px-4 py-2.5">
            <div class="text-sm text-text-muted">
              {{ paginationStart }}-{{ paginationEnd }} de {{ filteredClients.length }}
            </div>
            <div class="flex gap-1">
              <button 
                @click="previousPage"
                :disabled="!hasPreviousPage"
                class="rounded-md px-2.5 py-1.5 text-sm font-medium transition-theme"
                :class="hasPreviousPage ? 'text-text-secondary hover:bg-bg-secondary' : 'text-text-muted cursor-not-allowed opacity-40'"
              >
                Anterior
              </button>
              <button 
                v-for="page in pageNumbers" 
                :key="page"
                @click="page === '...' ? null : goToPage(page as number)"
                :disabled="page === '...'"
                class="rounded-md px-2.5 py-1.5 text-sm font-medium transition-theme"
                :class="page === currentPage ? 'bg-primary text-text-inverse' : 'text-text-secondary hover:bg-bg-secondary disabled:cursor-default'"
              >
                {{ page }}
              </button>
              <button 
                @click="nextPage"
                :disabled="!hasNextPage"
                class="rounded-md px-2.5 py-1.5 text-sm font-medium transition-theme"
                :class="hasNextPage ? 'text-text-secondary hover:bg-bg-secondary' : 'text-text-muted cursor-not-allowed opacity-40'"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modals -->
  <ClienteFormModal 
    ref="clienteModalRef" 
    @save="handleSaveCliente" 
  />
  
  <FilterDrawer 
    ref="filterDrawerRef"
    :show-date-filter="false"
    :show-days-since-filter="true"
    @apply="handleApplyFilters"
    @clear="handleClearFilters"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { usePagination } from '../composables/usePagination'
import { clientesKeys, listClientes, saveCliente } from '../services/clientesService'
import Sidebar from '../components/layout/Sidebar.vue'
import { ClienteFormModal } from '../components/modals'
import { FilterDrawer } from '../components/filters'
import type { Cliente, ClienteFormData } from '../types/cliente'
import type { FilterState } from '../components/filters'

const router = useRouter()
const { logout, authStore } = useAuth()
const { success, info } = useNotification()
const queryClient = useQueryClient()

const isSidebarOpen = ref(false)
const searchQuery = ref('')
const clienteModalRef = ref<InstanceType<typeof ClienteFormModal> | null>(null)
const filterDrawerRef = ref<InstanceType<typeof FilterDrawer> | null>(null)

const businessId = computed(() => authStore.businessId)

const { data: clientsData } = useQuery({
  queryKey: computed(() => clientesKeys.all(businessId.value)),
  queryFn: () => listClientes(businessId.value!),
  enabled: computed(() => !!businessId.value),
})

const clients = computed<Cliente[]>(() => clientsData.value ?? [])

const saveClienteMutation = useMutation({
  mutationFn: (data: ClienteFormData & { id?: string }) => saveCliente(businessId.value!, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: clientesKeys.all(businessId.value) })
  },
})

const activeFilters = ref<Partial<FilterState>>({})
const daysSinceVisitFilter = ref(30)

const filteredClients = computed(() => {
  let result = clients.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    )
  }

  if (activeFilters.value.daysSinceVisit && activeFilters.value.daysSinceVisit !== '') {
    daysSinceVisitFilter.value = Number(activeFilters.value.daysSinceVisit) || 30
  }

  if (daysSinceVisitFilter.value > 0) {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - daysSinceVisitFilter.value)
    result = result.filter(c => {
      if (!c.lastVisit || c.lastVisit === 'Sin visitas') return true
      const visit = new Date(c.lastVisit)
      return visit < threshold
    })
  }

  if (activeFilters.value.sortBy === 'name') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name))
  } else if (activeFilters.value.sortBy === 'oldest') {
    result = [...result].sort((a, b) => new Date(a.joinDate!).getTime() - new Date(b.joinDate!).getTime())
  } else {
    result = [...result].sort((a, b) => new Date(b.joinDate!).getTime() - new Date(a.joinDate!).getTime())
  }

  return result
})

const totalClientes = computed(() => clients.value.length)
const clientesRecientes = computed(() => {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - daysSinceVisitFilter.value)
  return clients.value.filter(c => c.lastVisit && c.lastVisit !== 'Sin visitas' && new Date(c.lastVisit) >= threshold).length
})
const clientesSinVisitar = computed(() => {
  const threshold = new Date()
  threshold.setDate(threshold.getDate() - daysSinceVisitFilter.value)
  return clients.value.filter(c => !c.lastVisit || c.lastVisit === 'Sin visitas' || new Date(c.lastVisit) < threshold).length
})
const clientesConHistorial = computed(() => clients.value.filter(c => c.lastVisit && c.lastVisit !== 'Sin visitas').length)

const {
  currentPage,
  paginatedData: paginatedClients,
  pageNumbers,
  hasNextPage,
  hasPreviousPage,
  goToPage,
  nextPage,
  previousPage,
  paginationStart,
  paginationEnd,
} = usePagination({
  data: filteredClients,
  pageSize: 5,
})

const paginatedData = paginatedClients

const handleNewCliente = () => {
  clienteModalRef.value?.open()
}

const handleEditCliente = (cliente: Cliente) => {
  clienteModalRef.value?.open(cliente)
}

const handleSaveCliente = async (data: ClienteFormData & { id?: string }) => {
  await saveClienteMutation.mutateAsync(data)
}

const handleViewAgenda = (cliente: Cliente) => {
  router.push(`/clientes/${cliente.id}`)
  info(`Mostrando historial de ${cliente.name}`)
}

const handleOpenFilters = () => {
  filterDrawerRef.value?.setFilters({ daysSinceVisit: String(daysSinceVisitFilter.value) })
  filterDrawerRef.value?.open()
}

const handleApplyFilters = (filters: FilterState) => {
  activeFilters.value = filters
  currentPage.value = 1
  success('Filtros aplicados')
}

const handleClearFilters = () => {
  activeFilters.value = {}
  daysSinceVisitFilter.value = 30
  currentPage.value = 1
  info('Filtros limpiados')
}

const handleExport = () => {
  const csvContent = [
    ['Nombre', 'Teléfono', 'Email', 'Última Visita'].join(','),
    ...filteredClients.value.map(c => [c.name, c.phone, c.email, c.lastVisit].join(',')),
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `clientes-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
  
  success('Clientes exportados correctamente')
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleWhatsApp = (cliente: Cliente) => {
  const phone = (cliente.phone || '').replace(/[^\d]/g, '')
  if (!phone) return
  window.open(`https://wa.me/${phone}`, '_blank')
}
</script>
