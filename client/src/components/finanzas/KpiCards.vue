<template>
  <div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-success/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-success/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">Ingresos</p>
          <p class="text-xl font-bold text-text tabular-nums sm:text-2xl lg:text-[1.75rem]">{{ formatUSD(incomeTotal) }}</p>
          <p class="text-[11px] text-text-muted tabular-nums font-medium">{{ formatVESEs(vesIncomeTotal) }}</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-warning/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10 text-warning shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-warning/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">Gastos</p>
          <p class="text-xl font-bold text-text tabular-nums sm:text-2xl lg:text-[1.75rem]">{{ formatUSD(expenseTotal) }}</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-info/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10 text-info shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-info/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">Ganancia Neta</p>
          <p class="text-xl font-bold text-text tabular-nums sm:text-2xl lg:text-[1.75rem]">{{ formatUSD(netTotal) }}</p>
        </div>
      </div>
    </div>

    <div class="group rounded-xl border border-border bg-surface p-3 shadow-sm transition-theme hover:shadow-md hover:border-primary/30 sm:p-4">
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 sm:h-10 sm:w-10 transition-theme group-hover:bg-primary/15 group-hover:scale-105">
          <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium uppercase tracking-wider text-text-secondary sm:text-xs">Margen</p>
          <p class="text-xl font-bold text-text tabular-nums sm:text-2xl lg:text-[1.75rem]">{{ formatPercentage(margin) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '../../composables/useCurrency'

defineProps<{
  incomeTotal: number
  vesIncomeTotal: number
  expenseTotal: number
  netTotal: number
  margin: number
}>()

const { formatUSD, formatVESEs } = useCurrency()

const formatPercentage = (value: number) => `${value.toFixed(1)}%`
</script>
