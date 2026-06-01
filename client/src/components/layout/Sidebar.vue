<template>
  <aside
    :class="[
      'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface border-r border-border shadow-xl transition-theme transition-transform duration-300 lg:translate-x-0 flex flex-col',
      // z-40 para que quede debajo del top header (z-50) pero arriba del overlay (z-30)
      isOpen ? 'z-40 translate-x-0' : 'z-40 -translate-x-full lg:z-40'
    ]"
  >

    <!-- Navigation - Flex grow para ocupar espacio disponible -->
    <nav class="flex-1 overflow-y-auto px-3 pt-4 pb-2">
      <router-link 
        v-if="isAdmin"
        to="/admin" 
        :class="[
          'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
          isActive('/admin') 
            ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
        ]"
      >
        <span :class="[
          'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
          isActive('/admin') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
        ]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <span>Agenda</span>
      </router-link>

      <router-link
        v-if="!isAdmin"
        to="/dashboard/agenda"
        :class="[
          'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
          isActive('/dashboard/agenda') 
            ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
        ]"
      >
        <span :class="[
          'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
          isActive('/dashboard/agenda') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
        ]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <span>Agenda</span>
      </router-link>

      <router-link
        v-if="!isAdmin"
        to="/dashboard/historial"
        :class="[
          'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
          isActive('/dashboard/historial') 
            ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
        ]"
      >
        <span :class="[
          'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
          isActive('/dashboard/historial') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
        ]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </span>
        <span>Historial</span>
      </router-link>

      <router-link
        v-if="!isAdmin"
        to="/dashboard/comisiones"
        :class="[
          'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
          isActive('/dashboard/comisiones') 
            ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
        ]"
      >
        <span :class="[
          'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
          isActive('/dashboard/comisiones') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
        ]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span>Comisiones</span>
      </router-link>

      <router-link
        v-if="!isAdmin"
        to="/dashboard/recibo"
        :class="[
          'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
          isActive('/dashboard/recibo') 
            ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
            : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
        ]"
      >
        <span :class="[
          'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
          isActive('/dashboard/recibo') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
        ]">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        <span>Recibo</span>
      </router-link>

        <router-link 
          v-if="isAdmin"
          to="/clientes" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/clientes') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/clientes') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <span>{{ authStore.terminology.client || 'Cliente' }}s</span>
        </router-link>

        <router-link 
          v-if="isAdmin"
          to="/finanzas" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/finanzas') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/finanzas') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="flex-1">Finanzas</span>
          <span class="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary" v-if="!isActive('/finanzas')">Nuevo</span>
        </router-link>

        <router-link 
          v-if="isAdmin"
          to="/equipo" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/equipo') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/equipo') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <span>{{ authStore.terminology.employee || 'Empleado' }}s</span>
        </router-link>

        <router-link 
          v-if="isAdmin"
          to="/servicios" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/servicios') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/servicios') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </span>
          <span>{{ authStore.terminology.service || 'Servicio' }}s</span>
        </router-link>

        <router-link 
          v-if="isAdmin"
          to="/productos" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/productos') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/productos') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <span>Productos</span>
        </router-link>

        <router-link 
          v-if="isAdmin"
          to="/inventario" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/inventario') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/inventario') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </span>
          <span>Inventario</span>
        </router-link>

      <!-- Ventas -->
      <div v-if="isAdmin" class="mb-1">
        <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted/70">Ventas</p>

        <router-link 
          to="/pos" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/pos') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/pos') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </span>
          <span class="flex-1">Punto de Venta</span>
          <span class="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold text-primary" v-if="!isActive('/pos')">Nuevo</span>
        </router-link>
      </div>

      <!-- Separador sutil -->
      <div class="my-4 mx-3 h-px bg-border"></div>

      <!-- Configuración -->
      <div v-if="isAdmin" class="mb-1">
        <p class="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted/70">Configuración</p>

        <router-link 
          to="/ajustes" 
          :class="[
            'group mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-theme',
            isActive('/ajustes') 
              ? 'relative -ml-3 border-l-[3px] border-primary bg-primary/10 pl-2 text-primary shadow-none' 
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text'
          ]"
        >
          <span :class="[
            'flex h-7 w-7 items-center justify-center rounded-md transition-theme',
            isActive('/ajustes') ? 'bg-primary/15 text-primary' : 'bg-bg-secondary group-hover:bg-border'
          ]">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <span>Ajustes</span>
        </router-link>
      </div>
    </nav>

    <!-- User Mini Profile & Theme Toggle - Siempre al final -->
    <div class="border-t border-border bg-bg-secondary p-3 shrink-0">
      <div class="flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary-hover text-xs font-bold text-text-inverse shadow-sm">
          {{ getInitials(authStore.profile?.full_name) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="truncate text-sm font-medium text-text leading-tight">{{ authStore.profile?.full_name || 'Usuario' }}</p>
          <p class="text-[10px] text-text-muted capitalize">{{ authStore.role }}</p>
        </div>
        <ThemeToggle />
        <button @click="logout" :disabled="loading" class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-border hover:text-text disabled:opacity-40 disabled:cursor-not-allowed" title="Cerrar sesión">
          <svg v-if="!loading" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <svg v-else class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { isAdminPanelRole } from '../../constants/roles'
import ThemeToggle from '../common/ThemeToggle.vue'

interface Props {
  isOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const { logout, loading, authStore } = useAuth()

const isAdmin = computed(() => isAdminPanelRole(authStore.role ?? undefined))

const isActive = (path: string): boolean => {
  return route.path === path
}

const getInitials = (name?: string): string => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
</script>


