<template>
  <header class="mb-5 lg:mb-8">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-1.5">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{{ businessStore.terminology.employee || 'Empleado' }}s</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-text lg:text-3xl">Gestión de {{ (businessStore.terminology.employee || 'Empleado').toLowerCase() }}s</h1>
      </div>
      <button
        @click="handleNewEmpleado"
        class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-text-inverse shadow-lg shadow-primary/20 transition-theme hover:bg-primary-hover"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span>Nuevo {{ businessStore.terminology.employee || 'Empleado' }}</span>
      </button>
    </div>
  </header>

  <!-- Stats -->
  <div class="mb-5 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-8 lg:grid-cols-4">
    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-primary/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-primary/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ totalEmpleados }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Total</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-info/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-info/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosPorcentaje }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Con %</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-warning/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-warning/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosSueldoBase }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Sueldo base</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-success/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-success/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-lg font-bold text-text tabular-nums sm:text-xl">{{ empleadosMixto }}</p>
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-muted sm:text-xs">Sueldo + %</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Team Grid -->
  <div class="mb-4 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div
      v-for="member in visibleTeam"
      :key="member.id"
      class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme hover:shadow-md hover:border-border-strong sm:p-5"
    >
      <div class="flex items-start gap-3">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-sm font-bold text-primary transition-theme group-hover:scale-105 group-hover:shadow-sm">
          {{ getInitials(member.name) }}
        </div>
        <div class="min-w-0 flex-1 pt-0.5">
          <h3 class="font-semibold text-text">{{ member.name }}</h3>
          <p class="text-xs text-text-muted">{{ member.role }}</p>
          <p v-if="member.email" class="text-xs text-text-muted truncate mt-0.5">{{ member.email }}</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <div class="rounded-lg bg-gradient-to-br from-bg-secondary/80 to-bg-secondary/40 p-2.5 text-center">
          <p class="text-sm font-semibold text-text">{{ member.payTypeLabel }}</p>
          <p class="text-xs text-text-muted">Tipo de pago</p>
        </div>
        <div class="rounded-lg bg-gradient-to-br from-bg-secondary/80 to-bg-secondary/40 p-2.5 text-center">
          <p class="text-sm font-semibold text-text">{{ member.payValueLabel }}</p>
          <p class="text-xs text-text-muted">Condición</p>
        </div>
      </div>

      <div class="mt-4 flex gap-2">
        <button
          @click="handleViewAgenda(member)"
          class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        >
          Ver Agenda
        </button>
        <button
          @click="handleEditEmpleado(member)"
          class="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary transition-theme hover:bg-bg-secondary hover:text-text hover:border-border-strong"
        >
          Editar
        </button>
      </div>
    </div>
  </div>

  <div v-if="hasMoreThanDefault" class="mb-5 flex justify-center">
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-theme hover:bg-primary/5 hover:border-primary/30"
      @click="showAll = !showAll"
    >
      <svg class="h-4 w-4" :class="showAll ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
      {{ showAll ? 'Ver menos' : 'Ver todos (' + team.length + ')' }}
    </button>
  </div>

  <!-- Pagos, Nómina, Deuda y Horarios — Tabs -->
  <div class="mb-5 lg:mb-6 rounded-xl border border-border bg-surface shadow-sm">
    <!-- Header -->
    <div class="flex flex-col gap-3 border-b border-border-subtle px-3 sm:px-5 py-3 sm:py-4">
      <div>
        <h3 class="text-sm sm:text-base font-semibold text-text flex items-center gap-2">
          <svg class="h-4 w-4 sm:h-4.5 sm:w-4.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Gestión de Pagos y Horarios
        </h3>
        <p class="text-xs text-text-muted mt-0.5">Comisiones, nómina, deuda y horarios del equipo</p>
      </div>

      <!-- Segmented Control -->
      <div class="bg-bg-secondary p-1 rounded-xl border border-border-subtle inline-flex items-center gap-0.5 self-start sm:self-auto">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-2',
            activeTab === tab.key
              ? 'bg-surface text-text shadow-sm shadow-black/5 border border-border font-semibold'
              : 'text-text-secondary hover:text-text hover:bg-surface/40'
          ]"
        >
          <svg v-if="tab.key === 'pagos'" class="h-3.5 w-3.5" :class="activeTab === 'pagos' ? 'text-success' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="tab.key === 'nomina'" class="h-3.5 w-3.5" :class="activeTab === 'nomina' ? 'text-danger' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <svg v-else-if="tab.key === 'deuda'" class="h-3.5 w-3.5" :class="activeTab === 'deuda' ? 'text-warning' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <svg v-else class="h-3.5 w-3.5" :class="activeTab === 'horarios' ? 'text-primary' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span class="sm:hidden">{{ tab.shortLabel }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Banner for Pagos tab -->
    <div v-if="activeTab === 'pagos'" class="mx-3 sm:mx-5 mt-3 sm:mt-4 mb-0 rounded-xl border border-border-subtle p-3 sm:p-4 bg-gradient-to-r from-success/[0.04] to-transparent">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg border bg-success/10 border-success/10 text-success shrink-0">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span class="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider font-semibold">Total Comisiones</span>
          <div class="flex items-baseline gap-2 mt-0.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-bold text-text tracking-tight tabular-nums">{{ formatUSD(totalComisiones) }}</span>
            <span class="text-xs text-text-muted font-mono">{{ summaryCtx.employeePayments.value.length }} servicio(s)</span>
          </div>
        </div>
        <button @click="openPaymentModal" class="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-text-inverse transition-theme hover:bg-primary-hover shrink-0">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Registrar pago</span>
          <span class="sm:hidden">+ Pago</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Banner for Nomina tab -->
    <div v-if="activeTab === 'nomina'" class="mx-3 sm:mx-5 mt-3 sm:mt-4 mb-0 rounded-xl border border-border-subtle p-3 sm:p-4 bg-gradient-to-r from-danger/[0.04] to-transparent">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg border bg-danger/10 border-danger/10 text-danger shrink-0">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <span class="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider font-semibold">Total Pagado en Nómina</span>
          <div class="flex items-baseline gap-2 mt-0.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-bold text-text tracking-tight tabular-nums">{{ formatUSD(totalNominaPagada) }}</span>
            <span class="text-xs text-text-muted font-mono">{{ paymentsCtx.paymentsMade.value.length }} pago(s)</span>
          </div>
        </div>
        <button @click="openPaymentModal" class="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-text-inverse transition-theme hover:bg-primary-hover shrink-0">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="hidden sm:inline">Registrar pago</span>
          <span class="sm:hidden">+ Pago</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Banner for Deuda tab -->
    <div v-if="activeTab === 'deuda'" class="mx-3 sm:mx-5 mt-3 sm:mt-4 mb-0 rounded-xl border border-border-subtle p-3 sm:p-4 bg-gradient-to-r from-warning/[0.04] to-transparent">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg border bg-warning/10 border-warning/10 text-warning shrink-0">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <span class="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider font-semibold">Deuda Pendiente Total</span>
          <div class="flex items-baseline gap-2 mt-0.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-bold text-text tracking-tight tabular-nums">{{ formatUSD(totalDeudaPendiente) }}</span>
            <span class="text-xs text-text-muted font-mono">{{ deudaConSaldo.length }} empleado(s) con saldo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Summary Banner for Horarios tab -->
    <div v-if="activeTab === 'horarios'" class="mx-3 sm:mx-5 mt-3 sm:mt-4 mb-0 rounded-xl border border-border-subtle p-3 sm:p-4 bg-gradient-to-r from-primary/[0.04] to-transparent">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-lg border bg-primary/10 border-primary/10 text-primary shrink-0">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <span class="text-[10px] sm:text-[11px] text-text-muted uppercase tracking-wider font-semibold">Horarios del Equipo</span>
          <div class="flex items-baseline gap-2 mt-0.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-bold text-text tracking-tight tabular-nums">{{ teamSchedule.length }}</span>
            <span class="text-xs text-text-muted font-mono">empleado(s) con horario registrado</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="p-3 sm:p-5">
      <!-- Tab: Pagos a Empleados -->
      <div v-if="activeTab === 'pagos'">
        <div v-if="summaryCtx.employeePayments.value.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{{ businessStore.terminology.employee || 'Empleado' }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{{ businessStore.terminology.service || 'Servicio' }}</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Costo</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">% {{ businessStore.terminology.employee || 'Empleado' }}</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Comisión</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="payment in summaryCtx.employeePayments.value" :key="payment.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-3 py-3 font-medium text-text">{{ payment.employee }}</td>
                <td class="px-3 py-3 text-text-secondary">{{ payment.service }}</td>
                <td class="px-3 py-3 text-right hidden sm:table-cell">
                  <div class="text-text">{{ formatUSD(payment.amount) }}</div>
                  <div class="text-[10px] text-text-muted">{{ formatVESInline(payment.amount) }} Bs</div>
                </td>
                <td class="px-3 py-3 text-right text-text-secondary">{{ payment.percentage }}%</td>
                <td class="px-3 py-3 text-right">
                  <div class="font-semibold text-success">{{ formatUSD(payment.earnings) }}</div>
                  <div class="text-[10px] text-text-muted">{{ formatVESInline(payment.earnings) }} Bs</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay comisiones registradas en este período</p>
        </div>
      </div>

      <!-- Tab: Pago de Nómina -->
      <div v-if="activeTab === 'nomina'">
        <div v-if="paymentsCtx.paymentsMade.value.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Fecha</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{{ businessStore.terminology.employee || 'Empleado' }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Método</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Monto</th>
                <th class="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="ep in paymentsCtx.paymentsMade.value" :key="ep.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-3 py-3 whitespace-nowrap text-text-secondary">{{ ep.paymentDate }}</td>
                <td class="px-3 py-3 font-medium text-text">{{ ep.employeeName }}</td>
                <td class="px-3 py-3 text-text-secondary hidden sm:table-cell">{{ formatMethod(ep.paymentMethod) }}</td>
                <td class="px-3 py-3 text-right">
                  <div class="font-medium text-danger">{{ ep.currency === 'VES' ? formatVESEs(ep.originalAmount) : formatUSD(ep.amount) }}</div>
                  <div class="text-[10px] text-text-muted">{{ ep.currency === 'VES' ? formatUSD(ep.amount) : formatVESInline(ep.amount) + ' Bs' }}</div>
                </td>
                <td class="px-3 py-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="openEditPaymentModal(ep)" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-primary/10 hover:text-primary" title="Editar pago">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="handleDeletePayment(ep.id)" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-danger/10 hover:text-danger" title="Eliminar pago">
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay pagos de nómina registrados</p>
        </div>
      </div>

      <!-- Tab: Deuda por Empleado -->
      <div v-if="activeTab === 'deuda'">
        <div v-if="deudaConSaldo.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{{ businessStore.terminology.employee || 'Empleado' }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Tipo</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Comisión</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Sueldo base</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Total Ganado</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Pagado</th>
                <th class="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Pendiente</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="row in deudaConSaldo" :key="row.employeeId" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-3 py-3 font-medium text-text">{{ row.employeeName }}</td>
                <td class="px-3 py-3 text-text-secondary text-xs hidden sm:table-cell">
                  <span v-if="row.payType === 'salary'">Sueldo base</span>
                  <span v-else-if="row.payType === 'mixed'">Sueldo + {{ row.payPercentage }}%</span>
                  <span v-else-if="row.payType === 'percentage'">{{ row.payPercentage }}%</span>
                  <span v-else>—</span>
                </td>
                <td class="px-3 py-3 text-right text-text hidden sm:table-cell">{{ formatUSD(row.commissionTotal) }}</td>
                <td class="px-3 py-3 text-right text-text hidden sm:table-cell">{{ formatUSD(row.baseSalary) }}</td>
                <td class="px-3 py-3 text-right font-semibold text-text">{{ formatUSD(row.totalEarned) }}</td>
                <td class="px-3 py-3 text-right hidden sm:table-cell">
                  <div class="font-medium text-danger">{{ formatUSD(row.totalPaid) }}</div>
                  <div class="text-[10px] text-text-muted">{{ formatVESInline(row.totalPaid) }} Bs</div>
                </td>
                <td class="px-3 py-3 text-right">
                  <span class="font-bold" :class="row.pendingBalance > 0 ? 'text-primary' : 'text-text-muted'">
                    {{ formatUSD(row.pendingBalance) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay deuda pendiente</p>
        </div>
      </div>

      <!-- Tab: Horarios del Equipo -->
      <div v-if="activeTab === 'horarios'">
        <div v-if="teamSchedule.length" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border-subtle">
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">{{ businessStore.terminology.employee || 'Empleado' }}</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Entrada</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Salida</th>
                <th class="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary hidden sm:table-cell">Descanso</th>
                <th class="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr v-for="schedule in teamSchedule" :key="schedule.id" class="text-xs transition-theme hover:bg-bg-secondary/40">
                <td class="px-3 py-3 font-medium text-text">{{ schedule.name }}</td>
                <td class="px-3 py-3 tabular-nums text-text-secondary">{{ schedule.start }}</td>
                <td class="px-3 py-3 tabular-nums text-text-secondary">{{ schedule.end }}</td>
                <td class="px-3 py-3 text-text-secondary hidden sm:table-cell">{{ schedule.break }}</td>
                <td class="px-3 py-3 text-center">
                  <span :class="[
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    schedule.available
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger'
                  ]">
                    <span :class="['h-1.5 w-1.5 rounded-full', schedule.available ? 'bg-success' : 'bg-danger']"></span>
                    {{ schedule.available ? 'Disponible' : 'No disponible' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary mb-2">
            <svg class="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="text-sm text-text-muted">No hay horarios registrados</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Modal -->
  <Teleport to="body">
    <div v-if="paymentsCtx.showPaymentModal.value"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="closePaymentModal"
    >
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-text">{{ paymentsCtx.editingPaymentId.value ? 'Editar pago' : 'Registrar pago' }}</h2>
          <p class="text-sm text-text-muted">{{ paymentsCtx.editingPaymentId.value ? 'Modifica los datos del pago' : 'Registra un adelanto, sueldo o comisión pagada' }}</p>
        </div>
        <form class="space-y-4" @submit.prevent="handleSubmitPayment">
          <div v-if="!paymentsCtx.editingPaymentId.value">
            <label class="mb-1 block text-sm font-medium text-text">{{ businessStore.terminology.employee || 'Empleado' }}</label>
            <select v-model="paymentsCtx.paymentForm.value.employeeId" required @change="onEmployeeChange"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
              <option value="" disabled>Seleccionar {{ (businessStore.terminology.employee || 'empleado').toLowerCase() }}</option>
              <option v-for="emp in paymentsCtx.employeeList.value" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>

          <div v-if="selectedBalance" class="rounded-lg bg-bg-secondary p-3 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Tipo de pago</span>
              <span class="font-medium text-text">{{ payTypeLabel() }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Generado en servicios</span>
              <span class="font-medium text-success">{{ formatUSD(selectedBalance.totalEarned) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-text-muted">Pagado hasta ahora</span>
              <span class="font-medium text-danger">{{ formatUSD(selectedBalance.totalPaid) }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-border pt-2">
              <span class="text-sm font-semibold text-text">Saldo pendiente</span>
              <span class="text-base font-bold" :class="selectedBalance.pendingBalance > 0 ? 'text-primary' : 'text-text-muted'">
                {{ formatUSD(selectedBalance.pendingBalance) }}
              </span>
            </div>
            <button
              v-if="selectedBalance.pendingBalance > 0"
              type="button"
              @click="paymentsCtx.paymentForm.value.amount = selectedBalance.pendingBalance"
              class="w-full mt-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-theme hover:bg-primary/10"
            >
              Pagar saldo pendiente
            </button>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="mb-1 block text-sm font-medium text-text">Monto</label>
              <input v-model.number="paymentsCtx.paymentForm.value.amount" type="number" min="0.01" step="0.01"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="0.00" required />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-text">Moneda</label>
              <select v-model="paymentsCtx.paymentForm.value.currency"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
                <option value="USD">USD $</option>
                <option value="VES">Bs</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-text">Método</label>
              <select v-model="paymentsCtx.paymentForm.value.method"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30">
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="zelle">Zelle</option>
                <option value="pago_movil">Pago Móvil</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text">Fecha</label>
            <input v-model="paymentsCtx.paymentForm.value.date" type="date"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30" required />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-text">Notas</label>
            <input v-model="paymentsCtx.paymentForm.value.notes" type="text"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-theme focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Ej: Comisión servicios, adelanto..." />
          </div>
          <div class="flex items-center justify-end gap-3">
            <button type="button"
              class="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition-theme hover:bg-bg-secondary"
              @click="closePaymentModal">Cancelar</button>
            <button type="submit" :disabled="paymentsCtx.createMutation.isPending.value || paymentsCtx.updateMutation.isPending.value"
              class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-text-inverse shadow-sm transition-theme hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
              {{ paymentsCtx.createMutation.isPending.value || paymentsCtx.updateMutation.isPending.value ? 'Guardando...' : (paymentsCtx.editingPaymentId.value ? 'Actualizar pago' : 'Guardar pago') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <!-- Modals -->
  <EmpleadoFormModal
    ref="empleadoModalRef"
    :is-saving="isSaving"
    @save="handleSaveEmpleado"
    @delete="handleDeleteEmpleado"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCrud } from '../composables/useCrud'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useNotification } from '../composables/useNotification'
import { useCurrency } from '../composables/useCurrency'
import { deleteEmpleado, equipoKeys, listEquipo, saveEmpleado } from '../services/equipoService'
import { useBusinessStore } from '../store/business'
import { getInitials, formatMethod } from '../lib/formatters'
import { EmpleadoFormModal } from '../components/modals'
import { useFinancialSummary } from '../composables/useFinancialSummary'
import { useEmployeePayments } from '../composables/useEmployeePayments'
import { useQueryClient } from '@tanstack/vue-query'
import { employeePaymentKeys, getEmployeeBalance, type EmployeeBalance, type EmployeePaymentRecord } from '../services/employeePaymentsService'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

const router = useRouter()
const { authStore } = useAuth()
const businessStore = useBusinessStore()
const { info } = useNotification()
const queryClient = useQueryClient()
const empleadoModalRef = ref<InstanceType<typeof EmpleadoFormModal> | null>(null)

const businessId = computed(() => authStore.businessId)

// Period for employee payments summary (current month)
const selectedPeriod = ref<'month' | 'quarter' | 'year'>('month')
const selectedMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

const periodDates = computed(() => {
  const monthMatch = selectedMonth.value.match(/^(\d{4})-(\d{2})$/)
  const today = new Date()
  const toYmd = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
  if (monthMatch) {
    const year = Number(monthMatch[1])
    const monthIndex = Number(monthMatch[2]) - 1
    const start = new Date(year, monthIndex, 1)
    const endOfMonth = new Date(year, monthIndex + 1, 0)
    const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth()
    return { start: toYmd(start), end: toYmd(isCurrentMonth ? today : endOfMonth) }
  }
  return { start: toYmd(new Date(today.getFullYear(), 0, 1)), end: toYmd(today) }
})

const emptyExpenses = ref<{ date: string; amount: number }[]>([])
const summaryCtx = useFinancialSummary(businessId, selectedPeriod, emptyExpenses, selectedMonth)
const paymentsCtx = useEmployeePayments(businessId, periodDates)

const onPaymentSaved = async () => {
  await queryClient.invalidateQueries({ queryKey: employeePaymentKeys.all(businessId.value) })
  await queryClient.invalidateQueries({ queryKey: ['financial-summary', businessId.value] })
}

const {
  items: team,
  handleSave: handleSaveEmpleado,
  handleDelete: handleDeleteEmpleado,
  isSaving,
} = useCrud<Empleado, EmpleadoFormData>({
  businessId,
  queryKey: (id) => equipoKeys.all(id),
  queryFn: (id) => listEquipo(id),
  saveFn: (id, data) => saveEmpleado(data, id),
  deleteFn: (id) => deleteEmpleado(id),
  entityName: 'Empleado',
  modalRef: empleadoModalRef,
  extraInvalidations: [
    () => ['appointments'],
    () => ['dashboard-services'],
    () => ['dashboard-payments'],
    () => ['dashboard-history'],
  ],
})

const DEFAULT_VISIBLE_EMPLOYEES = 4
const showAll = ref(false)

const hasMoreThanDefault = computed(() => team.value.length > DEFAULT_VISIBLE_EMPLOYEES)

const visibleTeam = computed(() => {
  if (showAll.value) return team.value
  return team.value.slice(0, DEFAULT_VISIBLE_EMPLOYEES)
})

const teamSchedule = computed(() => team.value
  .filter(member => member.schedule)
  .map(member => ({
    id: member.id,
    name: member.name,
    start: member.schedule?.start ?? '',
    end: member.schedule?.end ?? '',
    break: member.schedule?.break || 'Sin descanso registrado',
    appointments: 0,
    available: true,
  }))
)

// Stats
const totalEmpleados = computed(() => team.value.length)
const empleadosPorcentaje = computed(() => team.value.filter(e => e.payType === 'percentage' || e.payType === 'mixed').length)
const empleadosSueldoBase = computed(() => team.value.filter(e => e.payType === 'salary' || e.payType === 'mixed').length)
const empleadosMixto = computed(() => team.value.filter(e => e.payType === 'mixed').length)

// Actions
const handleNewEmpleado = () => {
  empleadoModalRef.value?.open()
}

const handleEditEmpleado = (empleado: Empleado) => {
  empleadoModalRef.value?.open(empleado)
}

const handleViewAgenda = (empleado: Empleado) => {
  router.push('/admin?employee=' + empleado.id)
  info(`Mostrando agenda de ${empleado.name}`)
}

// ---- Tabs ----
const tabs = [
  { key: 'pagos' as const, label: 'Pagos a Empleados', shortLabel: 'Pagos' },
  { key: 'nomina' as const, label: 'Pago de Nómina', shortLabel: 'Nómina' },
  { key: 'deuda' as const, label: 'Deuda por Empleado', shortLabel: 'Deuda' },
  { key: 'horarios' as const, label: 'Horarios del Equipo', shortLabel: 'Horarios' },
]
const activeTab = ref<'pagos' | 'nomina' | 'deuda' | 'horarios'>('pagos')

// ---- Currency ----
const { formatUSD, formatVESInline, formatVESEs } = useCurrency()

// ---- Payment Modal ----
const selectedBalance = ref<EmployeeBalance | null>(null)

const employeeDebtSummary = computed(() => {
  const summaries = summaryCtx.employeeEarningsByEmployee.value ?? []
  return summaries.map(s => {
    const totalPaid = paymentsCtx.paymentsMade.value
      .filter(p => p.employeeId === s.employeeId)
      .reduce((sum, p) => sum + p.amount, 0)
    return {
      ...s,
      totalPaid,
      pendingBalance: Math.max(0, s.totalEarned - totalPaid),
    }
  }).filter(s => s.totalEarned > 0 || s.totalPaid > 0)
})

const deudaConSaldo = computed(() => employeeDebtSummary.value.filter(r => r.pendingBalance > 0))

const totalComisiones = computed(() =>
  summaryCtx.employeePayments.value.reduce((acc, p) => acc + p.earnings, 0)
)

const totalNominaPagada = computed(() =>
  paymentsCtx.paymentsMade.value.reduce((acc, p) => acc + p.amount, 0)
)

const totalDeudaPendiente = computed(() =>
  deudaConSaldo.value.reduce((acc, r) => acc + r.pendingBalance, 0)
)

const buildBalanceFromSummary = (employeeId: string): EmployeeBalance | null => {
  const summary = employeeDebtSummary.value.find(row => row.employeeId === employeeId)
  if (!summary) return null
  return {
    employeeId: summary.employeeId,
    employeeName: summary.employeeName,
    payType: summary.payType === 'unknown' ? null : summary.payType,
    payPercentage: Number(summary.payPercentage ?? 0),
    baseSalary: Number(summary.baseSalary ?? 0),
    totalEarned: Number(summary.totalEarned ?? 0),
    totalPaid: Number(summary.totalPaid ?? 0),
    pendingBalance: Number(summary.pendingBalance ?? 0),
  }
}

const onEmployeeChange = async () => {
  const employeeId = paymentsCtx.paymentForm.value.employeeId
  if (!employeeId) { selectedBalance.value = null; return }
  const balanceFromSummary = buildBalanceFromSummary(employeeId)
  if (balanceFromSummary) { selectedBalance.value = balanceFromSummary; return }
  if (!authStore.businessId) { selectedBalance.value = null; return }
  try { selectedBalance.value = await getEmployeeBalance(authStore.businessId, employeeId) } catch { selectedBalance.value = null }
}

const openPaymentModal = () => { paymentsCtx.openModal(); selectedBalance.value = null }
const closePaymentModal = () => { paymentsCtx.closeModal(); selectedBalance.value = null }

const openEditPaymentModal = (payment: EmployeePaymentRecord) => { paymentsCtx.openEditModal(payment); selectedBalance.value = null }

const handleSavePayment = async () => {
  try { await paymentsCtx.handleSave(); closePaymentModal(); onPaymentSaved() } catch {}
}

const handleSubmitPayment = async () => {
  if (paymentsCtx.editingPaymentId.value) {
    try { await paymentsCtx.handleUpdate(); closePaymentModal(); onPaymentSaved() } catch {}
  } else { await handleSavePayment() }
}

const handleDeletePayment = (id: string) => { paymentsCtx.handleDelete(id) }

function payTypeLabel(): string {
  if (!selectedBalance.value) return '—'
  const b = selectedBalance.value
  if (b.payType === 'salary') return `Sueldo base ($${b.baseSalary})`
  if (b.payType === 'mixed') return `Sueldo + % ($${b.baseSalary} + ${b.payPercentage}%)`
  if (b.payType === 'percentage') return `${b.payPercentage}% por servicio`
  return 'Por servicio'
}
</script>
