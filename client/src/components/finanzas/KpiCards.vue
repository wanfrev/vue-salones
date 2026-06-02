<template>
  <div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
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
          <p class="text-lg font-bold text-text">{{ formatPercentage(margin) }}</p>
        </div>
      </div>
      <div class="mt-2 flex items-center gap-1 text-xs">
        <span class="text-success">↑ 4.2%</span>
        <span class="text-text-muted">vs mes pasado</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCurrency } from '../../composables/useCurrency'

defineProps<{
  incomeTotal: number
  expenseTotal: number
  netTotal: number
  margin: number
}>()

const { formatUSD } = useCurrency()

const formatPercentage = (value: number) => `${value.toFixed(1)}%`
</script>
