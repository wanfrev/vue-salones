import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import DashboardView from '../views/Dashboard.vue'
import AdminView from '../views/Admin.vue'
import ClientesView from '../views/Clientes.vue'
import FinanzasView from '../views/Finanzas.vue'
import EquipoView from '../views/Equipo.vue'
import ServiciosView from '../views/Servicios.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
    },
    {
      path: '/finanzas',
      name: 'finanzas',
      component: FinanzasView,
    },
    {
      path: '/equipo',
      name: 'equipo',
      component: EquipoView,
    },
    {
      path: '/servicios',
      name: 'servicios',
      component: ServiciosView,
    },
  ],
})

// Guards desactivados en modo mock/offline.
// Para reactivarlos cuando esté Supabase configurado, restaurar la lógica
// con authStore.initialize() y las comprobaciones de rol.

export default router
