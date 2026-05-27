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
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        <!-- Header -->
        <header class="mb-4 lg:mb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-xs text-primary mb-1">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Finanzas</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Dashboard Financiero</h1>
              <p class="hidden text-sm text-text-muted sm:block">Ingresos, gastos y rentabilidad del salón</p>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex rounded-xl border border-border bg-surface p-1">
                <button
                  v-for="period in periods"
                  :key="period.value"
                  @click="selectedPeriod = period.value"
                  :class="[
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-theme',
                    selectedPeriod === period.value
                      ? 'bg-primary text-text-inverse'
                      : 'text-text-secondary hover:bg-bg-secondary'
                  ]"
                >
                  {{ period.label }}
                </button>
              </div>
              <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Exchange Rate Card -->
        <div v-if="isTasaAdmin" class="mb-4 rounded-xl border border-border bg-surface p-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <svg class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-text">Tasa del Día (VES)</p>
                <p class="text-xs text-text-muted">
                  1 USD = <strong>{{ exchangeRateDisplay }}</strong> Bs
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="editRateValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="Tasa Bs/USD"
                class="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme placeholder:text-text-muted focus:border-primary"
              />
              <button
                @click="handleUpdateRate"
                :disabled="updatingRate"
                class="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover disabled:opacity-50"
              >
                <svg v-if="updatingRate" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                <svg class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Ingresos</p>
                <p class="text-lg font-bold text-text">{{ formatUSD(incomeTotal) }}</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 12.5%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                <svg class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Gastos</p>
                <p class="text-lg font-bold text-text">{{ formatUSD(expenseTotal) }}</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-danger">↑ 3.1%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10">
                <svg class="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Ganancia Neta</p>
                <p class="text-lg font-bold text-text">{{ formatUSD(netTotal) }}</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 18.7%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>

          <div class="rounded-xl border border-border bg-surface p-3 transition-theme hover:border-border-strong">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-text-muted">Margen</p>
                <p class="text-lg font-bold text-text">{{ formatPercentage(marginTotal) }}</p>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-1 text-xs">
              <span class="text-success">↑ 4.2%</span>
              <span class="text-text-muted">vs mes pasado</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <!-- Revenue vs Expenses Chart -->
          <div class="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-text">Ingresos vs Gastos</h3>
                <p class="text-sm text-text-muted">Comparativa mensual</p>
              </div>
              <div class="flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-success"></div>
                  <span class="text-text-muted">Ingresos</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-danger/60"></div>
                  <span class="text-text-muted">Gastos</span>
                </div>
              </div>
            </div>
            <div class="flex h-56 items-end justify-around gap-3 rounded-lg bg-bg-secondary/50 p-4">
              <div v-for="(bar, i) in chartData" :key="i" class="flex flex-1 flex-col items-center gap-1">
                <div class="flex w-full flex-col items-center gap-1">
                  <div class="w-full rounded-t bg-success transition-all" :style="{ height: bar.income + 'px' }"></div>
                  <div class="w-full rounded-t bg-danger/60 transition-all" :style="{ height: bar.expense + 'px' }"></div>
                </div>
                <span class="text-xs text-text-muted">{{ bar.label }}</span>
              </div>
            </div>
          </div>

          <!-- Revenue by Service -->
          <div class="rounded-xl border border-border bg-surface p-4">
            <div class="mb-4">
              <h3 class="text-base font-semibold text-text">Ingresos por Servicio</h3>
              <p class="text-sm text-text-muted">Distribución del mes</p>
            </div>
            <div class="space-y-3">
              <div v-for="service in servicesRevenue" :key="service.name">
                <div class="mb-1 flex items-center justify-between">
                  <span class="text-sm text-text-secondary">{{ service.name }}</span>
                  <span class="text-sm font-medium text-text">{{ formatUSD(service.amount) }}</span>
                </div>
                <div class="h-2 w-full rounded-full bg-bg-secondary">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="service.percentage > 25 ? 'bg-primary' : 'bg-primary/60'"
                    :style="{ width: service.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="mt-4 border-t border-border-subtle pt-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">Total Servicios</span>
                <span class="font-semibold text-text">{{ formatUSD(incomeTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expenses Table -->
        <div class="mb-4 rounded-xl border border-border bg-surface p-4">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 class="text-base font-semibold text-text">Gastos del Mes</h3>
              <p class="text-sm text-text-muted">Egresos fijos y variables</p>
            </div>
            <button @click="showExpenseModal = true" class="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Registrar gasto</span>
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Concepto</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Categoría</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="expense in expenses" :key="expense.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                  <td class="py-3 text-text-secondary">{{ expense.date }}</td>
                  <td class="py-3 font-medium text-text">{{ expense.name }}</td>
                  <td class="py-3">
                    <span :class="[
                      'rounded-full px-2 py-0.5 text-xs',
                      expense.category === 'Fijos' ? 'bg-info/10 text-info' :
                      expense.category === 'Insumos' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    ]">{{ expense.category }}</span>
                  </td>
                  <td class="py-3 text-right font-medium text-text">{{ formatUSD(expense.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Employee Payments Table -->
        <div class="mb-4 rounded-xl border border-border bg-surface p-4">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-text">Pagos a Empleados</h3>
              <p class="text-sm text-text-muted">Servicios realizados y comisión aplicada</p>
            </div>
            <button class="text-sm text-primary hover:text-primary-hover transition-theme">Ver detalles</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.employee || 'Empleado' }}</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.service || 'Servicio' }}</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Costo</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">% {{ authStore.terminology.employee || 'Empleado' }}</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Ganancia</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="payment in employeePayments" :key="payment.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                  <td class="py-3 font-medium text-text">{{ payment.employee }}</td>
                  <td class="py-3 text-text-secondary">{{ payment.service }}</td>
                  <td class="py-3 text-right">
                    <div class="text-text">{{ formatUSD(payment.amount) }}</div>
                    <div class="text-xs text-text-muted">Bs {{ formatVESInline(payment.amount) }}</div>
                  </td>
                  <td class="py-3 text-right text-text-secondary">{{ payment.percentage }}%</td>
                  <td class="py-3 text-right">
                    <div class="font-semibold text-success">{{ formatUSD(payment.earnings) }}</div>
                    <div class="text-xs text-text-muted">Bs {{ formatVESInline(payment.earnings) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recent Transactions Table -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <h3 class="text-base font-semibold text-text">Transacciones Recientes</h3>
              <p class="text-sm text-text-muted">Últimos pagos registrados</p>
            </div>
            <button class="text-sm text-primary hover:text-primary-hover transition-theme">Ver todas</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-border-subtle">
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Fecha</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.client || 'Cliente' }}</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">{{ authStore.terminology.service || 'Servicio' }}</th>
                  <th class="pb-3 text-left text-xs font-semibold uppercase text-text-muted">Método</th>
                  <th class="pb-3 text-right text-xs font-semibold uppercase text-text-muted">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-subtle">
                <tr v-for="tx in transactions" :key="tx.id" class="text-sm transition-theme hover:bg-bg-secondary/50">
                  <td class="py-3 text-text-secondary">{{ tx.date }}</td>
                  <td class="py-3 font-medium text-text">{{ tx.client }}</td>
                  <td class="py-3 text-text-secondary">{{ tx.service }}</td>
                  <td class="py-3">
                    <span :class="[
                      'rounded-full px-2 py-0.5 text-xs',
                      tx.method === 'Efectivo' ? 'bg-success/10 text-success' :
                      tx.method === 'Tarjeta' ? 'bg-primary/10 text-primary' :
                      tx.method === 'Transferencia' ? 'bg-info/10 text-info' :
                      tx.method === 'Zelle' ? 'bg-warning/10 text-warning' :
                      tx.method === 'Pago Móvil' ? 'bg-info/10 text-info' :
                      tx.method === 'Mixto' ? 'bg-primary/10 text-primary' :
                      'bg-bg-secondary text-text-muted'
                    ]">{{ tx.method }}</span>
                  </td>
                  <td class="py-3 text-right">
                    <div class="font-medium text-text">{{ formatUSD(tx.amount) }}</div>
                    <div class="text-xs text-text-muted">Bs {{ formatVESInline(tx.amount) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Expense Modal -->
      <div
        v-if="showExpenseModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click.self="showExpenseModal = false"
      >
        <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-text">Registrar gasto</h2>
            <p class="text-sm text-text-muted">Agrega un egreso al negocio</p>
          </div>

          <form class="space-y-4" @submit.prevent="handleSaveExpense">
            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="exp-name">Concepto</label>
              <input
                id="exp-name"
                v-model="expenseForm.name"
                type="text"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Ej: Renta del local"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="exp-category">Categoría</label>
                <select
                  id="exp-category"
                  v-model="expenseForm.category"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  <option value="Fijos">Fijos</option>
                  <option value="Insumos">Insumos</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-text" for="exp-amount">Monto ($)</label>
                <input
                  id="exp-amount"
                  v-model.number="expenseForm.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="exp-date">Fecha</label>
              <input
                id="exp-date"
                v-model="expenseForm.date"
                type="date"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-text" for="exp-notes">Notas</label>
              <textarea
                id="exp-notes"
                v-model="expenseForm.notes"
                rows="2"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Opcional"
              />
            </div>

            <p v-if="expenseError" class="text-sm text-danger">{{ expenseError }}</p>

            <div class="flex items-center justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
                @click="showExpenseModal = false"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="savingExpense"
                class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ savingExpense ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'
import Sidebar from '../components/layout/Sidebar.vue'
import type { Expense, Transaction } from '../types/database'

type SummaryBucket = {
  bucket: string
  appointments: number
  total_amount: number
  local_amount: number
  employee_amount: number
}

type ExpenseRow = {
  id: string
  date: string
  name: string
  category: string
  amount: number
}

type PaymentRow = {
  id: string
  employee: string
  service: string
  amount: number
  percentage: number
  earnings: number
}

type TransactionRow = {
  id: string
  date: string
  client: string
  service: string
  method: string
  amount: number
}

const { logout, authStore } = useAuth()
const { exchangeRate, formatUSD, formatVESInline, setExchangeRate, isAdmin } = useCurrency()
const { success: notifySuccess, error: notifyError } = useNotification()
const isSidebarOpen = ref(false)
const editRateValue = ref(0)
const updatingRate = ref(false)

const showExpenseModal = ref(false)
const savingExpense = ref(false)
const expenseError = ref('')
const expenseForm = ref({
  name: '',
  category: 'General',
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  notes: '',
})

const isTasaAdmin = computed(() => isAdmin.value)
const exchangeRateDisplay = computed(() =>
  exchangeRate.value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
)

const handleUpdateRate = async () => {
  if (!editRateValue.value || editRateValue.value <= 0) {
    notifyError('Ingresa una tasa válida mayor a 0')
    return
  }
  updatingRate.value = true
  try {
    await setExchangeRate(editRateValue.value)
    notifySuccess(`Tasa actualizada a 1 USD = ${editRateValue.value} Bs`)
  } catch {
    notifyError('Error al actualizar la tasa')
  } finally {
    updatingRate.value = false
  }
}

watch(exchangeRate, (val) => {
  editRateValue.value = val
}, { immediate: true })

const periods: { label: string; value: 'month' | 'quarter' | 'year' }[] = [
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' },
]
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')

const summaryBuckets = ref<SummaryBucket[]>([])
const expenses = ref<ExpenseRow[]>([])
const payments = ref<PaymentRow[]>([])
const transactions = ref<TransactionRow[]>([])
const transactionsAll = ref<TransactionRow[]>([])

const incomeTotal = computed(() => summaryBuckets.value.reduce((acc, row) => acc + row.total_amount, 0))
const expenseTotal = computed(() => expenses.value.reduce((acc, row) => acc + row.amount, 0))
const netTotal = computed(() => incomeTotal.value - expenseTotal.value)
const marginTotal = computed(() => (incomeTotal.value > 0 ? (netTotal.value / incomeTotal.value) * 100 : 0))

const servicesRevenue = computed(() => {
  const totals = new Map<string, number>()
  for (const tx of transactionsAll.value) {
    const key = tx.service || 'Sin servicio'
    totals.set(key, (totals.get(key) ?? 0) + tx.amount)
  }
  const total = incomeTotal.value
  return [...totals.entries()]
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
  })

const chartData = computed(() => {
  const expenseBuckets = buildExpenseBuckets(expenses.value, resolvePeriod(selectedPeriod.value).bucket)
  const entries = summaryBuckets.value.map(row => {
    const bucketKey = normalizeBucketKey(new Date(row.bucket), resolvePeriod(selectedPeriod.value).bucket)
    const expenseValue = expenseBuckets.get(bucketKey) ?? 0
    return {
      label: formatBucketLabel(new Date(row.bucket), resolvePeriod(selectedPeriod.value).bucket),
      incomeValue: row.total_amount,
      expenseValue,
    }
  })

  const maxValue = Math.max(1, ...entries.map(item => Math.max(item.incomeValue, item.expenseValue)))
  return entries.map(item => ({
    label: item.label,
    income: Math.max(4, Math.round((item.incomeValue / maxValue) * 140)),
    expense: Math.max(4, Math.round((item.expenseValue / maxValue) * 140)),
  }))
})

const employeePayments = computed(() => payments.value)

const formatPercentage = (value: number) => `${value.toFixed(1)}%`

const formatDate = (value: string) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatMethod = (method: string) => {
  switch (method) {
    case 'cash':
      return 'Efectivo'
    case 'card':
      return 'Tarjeta'
    case 'transfer':
      return 'Transferencia'
    case 'zelle':
      return 'Zelle'
    case 'pago_movil':
      return 'Pago Móvil'
    case 'mixed':
      return 'Mixto'
    default:
      return method
  }
}

const resolvePeriod = (value: 'month' | 'quarter' | 'year') => {
  const today = new Date()
  if (value === 'month') {
    return {
      bucket: 'day' as const,
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    }
  }
  if (value === 'quarter') {
    const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3
    return {
      bucket: 'week' as const,
      start: new Date(today.getFullYear(), quarterStartMonth, 1),
      end: today,
    }
  }
  return {
    bucket: 'month' as const,
    start: new Date(today.getFullYear(), 0, 1),
    end: today,
  }
}

const normalizeBucketKey = (date: Date, bucket: 'day' | 'week' | 'month') => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  if (bucket === 'day') {
    return normalized.toISOString().slice(0, 10)
  }
  if (bucket === 'month') {
    return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, '0')}-01`
  }
  const day = (normalized.getDay() + 6) % 7
  normalized.setDate(normalized.getDate() - day)
  return normalized.toISOString().slice(0, 10)
}

const formatBucketLabel = (date: Date, bucket: 'day' | 'week' | 'month') => {
  if (bucket === 'month') {
    return date.toLocaleDateString('es-ES', { month: 'short' })
  }
  if (bucket === 'week') {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const buildExpenseBuckets = (rows: ExpenseRow[], bucket: 'day' | 'week' | 'month') => {
  const map = new Map<string, number>()
  for (const row of rows) {
    const key = normalizeBucketKey(new Date(row.date), bucket)
    map.set(key, (map.get(key) ?? 0) + row.amount)
  }
  return map
}

const handleSaveExpense = async () => {
  const businessId = authStore.businessId
  if (!businessId) return

  savingExpense.value = true
  expenseError.value = ''

  try {
    const { error } = await supabase.from('expenses').insert({
      business_id: businessId,
      name: expenseForm.value.name,
      category: expenseForm.value.category,
      amount: expenseForm.value.amount,
      expense_date: expenseForm.value.date,
      notes: expenseForm.value.notes || null,
    })

    if (error) throw error

    notifySuccess('Gasto registrado correctamente')
    showExpenseModal.value = false
    expenseForm.value = {
      name: '',
      category: 'General',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    }
    await loadFinancialData()
  } catch (err) {
    expenseError.value = err instanceof Error ? err.message : 'Error al registrar el gasto'
  } finally {
    savingExpense.value = false
  }
}

const loadFinancialData = async () => {
  const businessId = authStore.businessId
  if (!businessId) return

  const periodConfig = resolvePeriod(selectedPeriod.value)
  const startDate = periodConfig.start.toISOString().slice(0, 10)
  const endDate = periodConfig.end.toISOString().slice(0, 10)

  const summaryResponse = await supabase.rpc('financial_summary', {
    p_business_id: businessId,
    p_period_start: startDate,
    p_period_end: endDate,
    p_period: periodConfig.bucket,
  })

  summaryBuckets.value = (summaryResponse.data ?? []) as SummaryBucket[]

  const expensesResponse = await supabase
    .from('expenses')
    .select('id, name, category, amount, expense_date')
    .eq('business_id', businessId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false })

  const rawExpenses = (expensesResponse.data ?? []) as Expense[]
  expenses.value = rawExpenses.map(row => ({
    id: row.id,
    date: row.expense_date,
    name: row.name,
    category: row.category,
    amount: row.amount,
  }))

  const transactionsResponse = await supabase
    .from('transactions')
    .select(`
      id,
      paid_at,
      total_amount,
      method,
      employee_percentage,
      appointments (
        client_id,
        service_id,
        employee_id,
        clients ( full_name ),
        services ( name ),
        profiles ( full_name )
      )
    `)
    .eq('business_id', businessId)
    .gte('paid_at', periodConfig.start.toISOString())
    .lte('paid_at', periodConfig.end.toISOString())
    .order('paid_at', { ascending: false })

  const rawTransactions = (transactionsResponse.data ?? []) as Array<
    Transaction & {
      appointments?: {
        clients?: { full_name: string | null } | null
        services?: { name: string | null } | null
        profiles?: { full_name: string | null } | null
      } | null
    }
  >

  const mappedTransactions = rawTransactions.map(row => ({
    id: row.id,
    date: formatDate(row.paid_at),
    client: row.appointments?.clients?.full_name ?? '—',
    service: row.appointments?.services?.name ?? '—',
    method: formatMethod(row.method),
    amount: row.total_amount,
  }))

  transactionsAll.value = mappedTransactions
  transactions.value = mappedTransactions.slice(0, 10)

  payments.value = rawTransactions.map(row => ({
    id: row.id,
    employee: row.appointments?.profiles?.full_name ?? '—',
    service: row.appointments?.services?.name ?? '—',
    amount: row.total_amount,
    percentage: row.employee_percentage ?? 0,
    earnings: row.total_amount * ((row.employee_percentage ?? 0) / 100),
  }))
}

watch([() => authStore.businessId, selectedPeriod], () => {
  void loadFinancialData()
}, { immediate: true })
</script>
