<template>
  <div class="min-h-screen bg-slate-950">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-100">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Salon Workspace</p>
        <h1 class="mt-2 text-3xl font-semibold">Bienvenido, {{ authStore.user?.nombre || authStore.user?.username }}</h1>
        <p class="mt-2 text-sm text-slate-300">
          Este panel esta listo para la agenda, clientes y caja del salon.
        </p>
        <button
          type="button"
          class="mt-5 inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
          @click="logout"
        >
          Cerrar sesion
        </button>
      </header>

      <section class="mt-8 grid gap-4 md:grid-cols-3">
        <article class="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-slate-100">
          <p class="text-xs uppercase tracking-wide text-slate-400">Agenda</p>
          <p class="mt-2 text-sm text-slate-300">Configura horarios, turnos y citas.</p>
        </article>
        <article class="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-slate-100">
          <p class="text-xs uppercase tracking-wide text-slate-400">Clientes</p>
          <p class="mt-2 text-sm text-slate-300">Historial, preferencias y servicios.</p>
        </article>
        <article class="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-slate-100">
          <p class="text-xs uppercase tracking-wide text-slate-400">Caja</p>
          <p class="mt-2 text-sm text-slate-300">Ventas del dia y comisiones.</p>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { logout, authStore } = useAuth()
</script>
