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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span class="font-medium uppercase tracking-wider">Catálogo</span>
              </div>
              <h1 class="text-xl font-bold text-text lg:text-2xl">Servicios</h1>
              <p class="hidden text-sm text-text-muted sm:block">Gestiona tu menú de servicios</p>
            </div>
            <div class="flex gap-2">
              <button class="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-text-inverse shadow-lg shadow-primary/25 transition-theme hover:bg-primary-hover">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Nuevo Servicio</span>
              </button>
            </div>
          </div>
        </header>

        <!-- Stats -->
        <div class="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:mb-6 lg:grid-cols-4">
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">24</p>
                <p class="text-xs text-text-muted">Servicios Activos</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">6</p>
                <p class="text-xs text-text-muted">Categorías</p>
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
                <p class="text-lg font-bold text-text">156</p>
                <p class="text-xs text-text-muted">Citas Este Mes</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl bg-surface p-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-info-light text-info">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-bold text-text">$85</p>
                <p class="text-xs text-text-muted">Precio Promedio</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="mb-4 flex flex-wrap gap-2">
          <button 
            v-for="cat in categories" 
            :key="cat.id"
            @click="activeCategory = cat.id"
            :class="[
              'rounded-full px-4 py-2 text-sm font-medium transition-theme',
              activeCategory === cat.id 
                ? 'bg-primary text-text-inverse shadow-md' 
                : 'bg-surface text-text-secondary hover:bg-bg-secondary border border-border'
            ]"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div 
            v-for="service in filteredServices" 
            :key="service.id" 
            class="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-theme hover:shadow-md"
          >
            <div class="flex items-start justify-between">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', service.iconBg]">
                <svg class="h-5 w-5" :class="service.iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="service.icon" />
                </svg>
              </div>
              <div class="flex gap-1">
                <button class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-primary">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button class="rounded-lg p-1.5 text-text-muted transition-theme hover:bg-bg-secondary hover:text-danger">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="mt-3">
              <h3 class="font-semibold text-text">{{ service.name }}</h3>
              <p class="text-xs text-text-muted">{{ service.description }}</p>
            </div>
            
            <div class="mt-3 flex items-center justify-between">
              <div>
                <span class="text-lg font-bold text-text">${{ service.price }}</span>
                <span class="text-xs text-text-muted"> / {{ service.duration }} min</span>
              </div>
              <span :class="[
                'rounded-full px-2 py-1 text-xs font-medium',
                service.status === 'Activo' ? 'bg-success-light text-success' : 'bg-bg-secondary text-text-muted'
              ]">
                {{ service.status }}
              </span>
            </div>
            
            <div class="mt-3 border-t border-border-subtle pt-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-text-muted">{{ service.citasMes }} citas este mes</span>
                <span class="font-medium text-success">${{ service.ingresos }} ingresos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import Sidebar from '../components/layout/Sidebar.vue'

const { logout } = useAuth()
const isSidebarOpen = ref(false)
const activeCategory = ref('all')

const categories = ref([
  { id: 'all', name: 'Todos' },
  { id: 'corte', name: 'Corte de Cabello' },
  { id: 'color', name: 'Coloración' },
  { id: 'manos', name: 'Manos & Pies' },
  { id: 'tratamientos', name: 'Tratamientos' },
  { id: 'barberia', name: 'Barbería' },
  { id: 'maquillaje', name: 'Maquillaje' },
])

const services = ref([
  { id: 1, category: 'corte', name: 'Corte Mujer', description: 'Corte, lavado y peinado', price: 45, duration: 45, status: 'Activo', citasMes: 68, ingresos: '3,060', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 2, category: 'corte', name: 'Corte Hombre', description: 'Corte clásico o moderno', price: 35, duration: 30, status: 'Activo', citasMes: 52, ingresos: '1,820', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { id: 3, category: 'color', name: 'Tinte Completo', description: 'Coloración total del cabello', price: 75, duration: 90, status: 'Activo', citasMes: 34, ingresos: '2,550', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 4, category: 'color', name: 'Mechas/Balayage', description: 'Técnica de iluminación', price: 95, duration: 120, status: 'Activo', citasMes: 28, ingresos: '2,660', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { id: 5, category: 'manos', name: 'Manicure Clásico', description: 'Lima, cutícula y esmalte', price: 25, duration: 30, status: 'Activo', citasMes: 89, ingresos: '2,225', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 6, category: 'manos', name: 'Manicure Gel', description: 'Esmalte semipermanente', price: 35, duration: 45, status: 'Activo', citasMes: 76, ingresos: '2,660', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { id: 7, category: 'manos', name: 'Pedicure Spa', description: 'Tratamiento completo pies', price: 40, duration: 60, status: 'Activo', citasMes: 43, ingresos: '1,720', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 8, category: 'tratamientos', name: 'Hidratación', description: 'Tratamiento hidratante', price: 55, duration: 45, status: 'Activo', citasMes: 31, ingresos: '1,705', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 9, category: 'tratamientos', name: 'Keratina', description: 'Alisado con keratina', price: 120, duration: 150, status: 'Activo', citasMes: 18, ingresos: '2,160', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 10, category: 'barberia', name: 'Afeitado Clásico', description: 'Toalla caliente y navaja', price: 30, duration: 30, status: 'Activo', citasMes: 24, ingresos: '720', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  { id: 11, category: 'barberia', name: 'Arreglo de Barba', description: 'Diseño y mantenimiento', price: 25, duration: 20, status: 'Activo', citasMes: 38, ingresos: '950', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm8.486-.486a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z', iconBg: 'bg-slate-100', iconColor: 'text-slate-600' },
  { id: 12, category: 'maquillaje', name: 'Maquillaje Social', description: 'Look para eventos', price: 60, duration: 45, status: 'Activo', citasMes: 15, ingresos: '900', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', iconBg: 'bg-pink-100', iconColor: 'text-pink-600' },
])

const filteredServices = computed(() => {
  if (activeCategory.value === 'all') return services.value
  return services.value.filter(s => s.category === activeCategory.value)
})
</script>
