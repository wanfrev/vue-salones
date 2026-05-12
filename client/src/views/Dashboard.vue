<template>
  <div class="min-h-screen bg-bg">
    <aside class="fixed left-0 top-0 h-full w-64 border-r bg-surface-elevated border-border">
      <div class="flex h-16 items-center justify-center border-b border-border">
        <h1 class="text-xl font-bold text-text">Salón</h1>
      </div>
      <nav class="p-4">
        <p class="mb-2 text-xs uppercase tracking-wider text-text-muted">Mi espacio</p>
        <a href="#" class="mb-1 block rounded-lg bg-primary-light px-4 py-2 text-sm text-primary transition-theme">Mi Agenda</a>
        <a href="#" class="mb-1 block rounded-lg px-4 py-2 text-sm text-text-secondary transition-theme hover:bg-bg-secondary">Mi Historial</a>
        <a href="#" class="mb-1 block rounded-lg px-4 py-2 text-sm text-text-secondary transition-theme hover:bg-bg-secondary">Mis Comisiones</a>
      </nav>
    </aside>

    <main class="ml-64 p-8">
      <header class="mb-8 rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between transition-theme">
        <div>
          <p class="text-xs uppercase tracking-wider text-primary">Empleada</p>
          <h1 class="mt-2 text-3xl font-semibold text-text">
            Hola, {{ authStore.profile?.full_name || 'Empleada' }}
          </h1>
          <p class="mt-2 text-sm text-text-muted">
            Aquí verás tus próximas citas, historial y comisiones.
          </p>
        </div>
        <button
          type="button"
          class="mt-5 sm:mt-0 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-inverse transition-theme hover:bg-primary-hover"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </header>

      <!-- Agenda Calendar Component -->
      <section class="h-[800px]">
        <AgendaCalendar />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import AgendaCalendar from '../components/agenda/AgendaCalendar.vue'

const { logout, authStore } = useAuth()
</script>
