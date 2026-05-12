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

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-20 bg-black/50 lg:hidden"
    ></div>

    <!-- Main Content -->
    <main class="ml-0 min-h-screen pt-16 lg:ml-64 lg:pt-0">
      <div class="p-4 lg:p-6">
        <!-- Header -->
        <header class="mb-2 lg:mb-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center gap-2 text-sm text-primary mb-0.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Agenda</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">
                Calendario de Citas
              </h1>
              <p class="hidden text-sm text-text-muted sm:block">
                Gestiona las reservas de tu salón de belleza
              </p>
            </div>
            
            <div class="flex items-center gap-2 sm:gap-3">
              <button class="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-text-secondary shadow-sm transition-theme hover:shadow-md hover:border-border-strong sm:px-4 sm:py-2.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span class="hidden sm:inline">Exportar</span>
              </button>
              <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-primary/25 transition-theme hover:bg-primary-hover sm:px-5 sm:py-2.5">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nueva</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats Cards -->
        <section class="mb-2 grid grid-cols-4 gap-2 sm:gap-3 lg:mb-3 lg:grid-cols-4">
          <div class="group relative overflow-hidden rounded-lg bg-surface p-2 shadow-sm transition-theme hover:shadow-md sm:rounded-xl sm:p-3">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-primary-light text-primary sm:h-9 sm:w-9 sm:rounded-lg">
                <svg class="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="text-base font-bold text-text sm:text-lg">12</p>
                <p class="text-[10px] text-text-muted sm:text-xs">Citas Hoy</p>
              </div>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[10px] sm:text-xs">
              <span class="flex items-center text-success">
                <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +3
              </span>
              <span class="text-text-muted">vs ayer</span>
            </div>
          </div>

          <div class="group relative overflow-hidden rounded-lg bg-surface p-2 shadow-sm transition-theme hover:shadow-md sm:rounded-xl sm:p-3">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-warning-light text-warning sm:h-9 sm:w-9 sm:rounded-lg">
                <svg class="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-base font-bold text-text sm:text-lg">4</p>
                <p class="text-[10px] text-text-muted sm:text-xs">Pendientes</p>
              </div>
            </div>
            <div class="mt-1 text-[10px] text-text-muted sm:text-xs">
              Por confirmar
            </div>
          </div>

          <div class="group relative overflow-hidden rounded-lg bg-surface p-2 shadow-sm transition-theme hover:shadow-md sm:rounded-xl sm:p-3">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-success-light text-success sm:h-9 sm:w-9 sm:rounded-lg">
                <svg class="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-base font-bold text-text sm:text-lg">8</p>
                <p class="text-[10px] text-text-muted sm:text-xs">Confirmadas</p>
              </div>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[10px] sm:text-xs">
              <span class="flex items-center text-success">
                <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                67%
              </span>
              <span class="text-text-muted">del total</span>
            </div>
          </div>

          <div class="group relative overflow-hidden rounded-lg bg-surface p-2 shadow-sm transition-theme hover:shadow-md sm:rounded-xl sm:p-3">
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-md bg-info-light text-info sm:h-9 sm:w-9 sm:rounded-lg">
                <svg class="h-3.5 w-3.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-base font-bold text-text sm:text-lg">$850</p>
                <p class="text-[10px] text-text-muted sm:text-xs">Estimado Hoy</p>
              </div>
            </div>
            <div class="mt-1 flex items-center gap-1 text-[10px] sm:text-xs">
              <span class="flex items-center text-success">
                <svg class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +12%
              </span>
              <span class="text-text-muted">vs ayer</span>
            </div>
          </div>
        </section>

        <!-- Agenda Calendar Component - Altura ajustada para no solaparse -->
        <section class="h-[calc(100vh-280px)] min-h-[400px] sm:h-[calc(100vh-300px)] lg:h-[calc(100vh-260px)]">
          <AgendaCalendar />
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'
import Sidebar from '../components/layout/Sidebar.vue'

const { logout } = useAuth()
const isSidebarOpen = ref(false)
</script>
