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
          <svg class="h-4 w-4 text-text-inverse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Finanzas</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Dashboard Financiero</h1>
              <p class="hidden text-sm text-text-muted sm:block">Resumen de ingresos y métricas</p>
            </div>
            <div class="flex gap-2">
              <select class="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary transition-theme">
                <option>Este Mes</option>
                <option>Mes Pasado</option>
                <option>Últimos 3 Meses</option>
                <option>Este Año</option>
              </select>
              <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </header>

        <!-- KPI Cards -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Ingresos del Mes</p>
                <p class="text-lg font-bold text-text">$24,580</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 12.5%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Ticket Promedio</p>
                <p class="text-lg font-bold text-text">$85.50</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 5.2%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-light text-warning">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Gastos del Mes</p>
                <p class="text-lg font-bold text-text">$8,240</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-danger">↑ 3.1%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info-light text-info">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Ganancia Neta</p>
                <p class="text-lg font-bold text-text">$16,340</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 18.7%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div class="rounded-xl border border-border bg-surface p-4 shadow-sm lg:col-span-2">
            <h3 class="mb-4 text-base font-semibold text-text">Ingresos vs Gastos</h3>
            <div class="h-64 rounded-lg bg-linear-to-b from-bg-secondary to-surface flex items-end justify-around p-4 gap-2">
              <div v-for="(bar, i) in chartData" :key="i" class="flex flex-col items-center gap-1 flex-1">
                <div class="w-full flex flex-col gap-1">
                  <div class="w-full rounded-t bg-success transition-all" :style="{ height: bar.income + 'px' }"></div>
                  <div class="w-full rounded-t bg-danger-light transition-all" :style="{ height: bar.expense + 'px' }"></div>
                </div>
                <span class="text-xs text-text-muted">{{ bar.label }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 class="mb-4 text-base font-semibold text-text">Ingresos por Servicio</h3>
            <div class="space-y-3">
              <div v-for="service in servicesRevenue" :key="service.name" class="flex items-center gap-3">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm text-text-secondary">{{ service.name }}</span>
                    <span class="text-sm font-medium text-text">${{ service.amount }}</span>
                  </div>
                  <div class="h-2 w-full rounded-full bg-bg-secondary">
                    <div class="h-2 rounded-full bg-primary" :style="{ width: service.percentage + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-4 border-t border-border-subtle pt-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">Total Servicios</span>
                <span class="font-semibold text-text">$24,580</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-text">Transacciones Recientes</h3>
            <button class="text-sm text-primary hover:text-primary-hover transition-theme">Ver todas</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Cliente</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Servicio</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="tx in transactions" :key="tx.id" class="text-sm">
                  <td class="py-3 text-text-secondary">{{ tx.date }}</td>
                  <td class="py-3 font-medium text-text">{{ tx.client }}</td>
                  <td class="py-3 text-text-secondary">{{ tx.service }}</td>
                  <td class="py-3">
                    <span :class="[
                      'rounded-full px-2 py-0.5 text-xs',
                      tx.method === 'Efectivo' ? 'bg-success-light text-success' :
                      tx.method === 'Tarjeta' ? 'bg-primary-light text-primary' :
                      'bg-info-light text-info'
                    ]">{{ tx.method }}</span>
                  </td>
                  <td class="py-3 text-right font-medium text-text">${{ tx.amount }}</td>
                </tr>
              </tbody>
            </table>
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

const chartData = ref([
  { label: 'Ene', income: 80, expense: 40 },
  { label: 'Feb', income: 95, expense: 45 },
  { label: 'Mar', income: 85, expense: 35 },
  { label: 'Abr', income: 110, expense: 50 },
  { label: 'May', income: 125, expense: 55 },
  { label: 'Jun', income: 140, expense: 60 },
])

const servicesRevenue = ref([
  { name: 'Corte de Cabello', amount: '8,450', percentage: 34 },
  { name: 'Coloración', amount: '6,230', percentage: 25 },
  { name: 'Manicure', amount: '4,120', percentage: 17 },
  { name: 'Pedicure', amount: '3,580', percentage: 15 },
  { name: 'Tratamientos', amount: '2,200', percentage: 9 },
])

const transactions = ref([
  { id: 1, date: '11 May 2026', client: 'María González', service: 'Corte + Color', method: 'Tarjeta', amount: '95.00' },
  { id: 2, date: '11 May 2026', client: 'Ana López', service: 'Manicure Gel', method: 'Efectivo', amount: '35.00' },
  { id: 3, date: '10 May 2026', client: 'Carmen Ruiz', service: 'Tratamiento', method: 'Transferencia', amount: '120.00' },
  { id: 4, date: '10 May 2026', client: 'Patricia Mendoza', service: 'Corte', method: 'Tarjeta', amount: '45.00' },
  { id: 5, date: '10 May 2026', client: 'Laura Herrera', service: 'Pedicure', method: 'Efectivo', amount: '40.00' },
])
</script>
