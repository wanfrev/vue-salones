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
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary-hover">
          <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span class="font-bold text-text">SalónApp</span>
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
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-sm text-primary mb-0.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Gestión</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Clientes</h1>
              <p class="hidden text-sm text-text-muted sm:block">Administra tu base de clientes</p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-primary/25 transition-theme hover:bg-primary-hover sm:px-5 sm:py-2.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Nuevo Cliente</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <section class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">248</p>
                <p class="text-xs text-text-muted">Total Clientes</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">186</p>
                <p class="text-xs text-text-muted">Clientes Activos</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light text-warning">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">12</p>
                <p class="text-xs text-text-muted">Citas Hoy</p>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-light text-danger">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">23</p>
                <p class="text-xs text-text-muted">Sin visitar +30d</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Search and Filter Bar -->
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="relative flex-1 max-w-md">
            <input type="text" placeholder="Buscar cliente por nombre, teléfono o email..."
              class="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20" />
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
            <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </button>
          </div>
        </div>

        <!-- Clients Table -->
        <div class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border bg-bg-secondary">
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Cliente</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Contacto</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Última Visita</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Total Citas</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Gasto Total</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Estado</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="client in clients" :key="client.id" class="transition-theme hover:bg-bg-secondary">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-hover text-sm font-bold text-text-inverse">
                        {{ getInitials(client.name) }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-text">{{ client.name }}</p>
                        <p class="text-xs text-text-muted">Cliente desde {{ client.joinDate }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <div class="text-sm text-text-secondary">{{ client.phone }}</div>
                    <div class="text-xs text-text-muted">{{ client.email }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm text-text-secondary">{{ client.lastVisit }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-medium text-text">{{ client.totalAppointments }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-medium text-text">${{ client.totalSpent }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span :class="[
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                      client.status === 'active' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                    ]">
                      {{ client.status === 'active' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary">
                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="flex items-center justify-between border-t border-border px-4 py-3">
            <div class="text-sm text-text-muted">
              Mostrando 1-10 de 248 clientes
            </div>
            <div class="flex gap-1">
              <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">Anterior</button>
              <button class="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-text-inverse">1</button>
              <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">2</button>
              <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">3</button>
              <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import Sidebar from '../components/layout/Sidebar.vue'

const { logout } = useAuth()
const isSidebarOpen = ref(false)

const clients = ref([
  { id: 1, name: 'María González', phone: '+52 55 1234 5678', email: 'maria@email.com', lastVisit: 'Hoy', totalAppointments: 24, totalSpent: '2,450', joinDate: '2023-01-15', status: 'active' },
  { id: 2, name: 'Ana López', phone: '+52 55 2345 6789', email: 'ana@email.com', lastVisit: 'Ayer', totalAppointments: 18, totalSpent: '1,890', joinDate: '2023-03-20', status: 'active' },
  { id: 3, name: 'Carmen Ruiz', phone: '+52 55 3456 7890', email: 'carmen@email.com', lastVisit: '12 may 2026', totalAppointments: 32, totalSpent: '3,200', joinDate: '2022-08-10', status: 'active' },
  { id: 4, name: 'Patricia Mendoza', phone: '+52 55 4567 8901', email: 'patricia@email.com', lastVisit: '10 may 2026', totalAppointments: 15, totalSpent: '1,350', joinDate: '2023-06-05', status: 'active' },
  { id: 5, name: 'Laura Herrera', phone: '+52 55 5678 9012', email: 'laura@email.com', lastVisit: '5 may 2026', totalAppointments: 8, totalSpent: '780', joinDate: '2024-01-10', status: 'inactive' },
  { id: 6, name: 'Diana Castro', phone: '+52 55 6789 0123', email: 'diana@email.com', lastVisit: '2 may 2026', totalAppointments: 45, totalSpent: '4,500', joinDate: '2022-03-15', status: 'active' },
  { id: 7, name: 'Sofia Vargas', phone: '+52 55 7890 1234', email: 'sofia@email.com', lastVisit: '28 abr 2026', totalAppointments: 12, totalSpent: '1,200', joinDate: '2023-09-20', status: 'active' },
  { id: 8, name: 'Elena Morales', phone: '+52 55 8901 2345', email: 'elena@email.com', lastVisit: '25 abr 2026', totalAppointments: 28, totalSpent: '2,800', joinDate: '2022-11-30', status: 'active' },
])

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>
