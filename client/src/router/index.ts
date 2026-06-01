import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue'
import EmployeeAgenda from '../views/employee/EmployeeAgenda.vue'
import EmployeeHistorial from '../views/employee/EmployeeHistorial.vue'
import EmployeeComisiones from '../views/employee/EmployeeComisiones.vue'
import EmployeeRecibo from '../views/employee/EmployeeRecibo.vue'
import AdminView from '../views/Admin.vue'
import SuperadminView from '../views/Superadmin.vue'
import SuperadminBusinessAdminsView from '../views/SuperadminBusinessAdmins.vue'
import SuperadminBusinessDetailView from '../views/SuperadminBusinessDetail.vue'
import ClientesView from '../views/Clientes.vue'
import ClienteHistorialView from '../views/ClienteHistorial.vue'
import FinanzasView from '../views/Finanzas.vue'
import EquipoView from '../views/Equipo.vue'
import ServiciosView from '../views/Servicios.vue'
import ProductosView from '../views/Productos.vue'
import InventarioView from '../views/Inventario.vue'
import POSView from '../views/POS.vue'
import { useAuthStore } from '../store/auth'
import { isAdminPanelRole, resolveHomeByRole } from '../constants/roles'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/dashboard',
      redirect: '/dashboard/agenda',
    },
    {
      path: '/dashboard/agenda',
      name: 'employee-agenda',
      component: EmployeeAgenda,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/historial',
      name: 'employee-historial',
      component: EmployeeHistorial,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/comisiones',
      name: 'employee-comisiones',
      component: EmployeeComisiones,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/recibo',
      name: 'employee-recibo',
      component: EmployeeRecibo,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/superadmin',
      name: 'superadmin',
      component: SuperadminView,
      meta: { requiresAuth: true, superadminOnly: true },
    },
    {
      path: '/superadmin/business/:id',
      name: 'superadmin-business-detail',
      component: SuperadminBusinessDetailView,
      meta: { requiresAuth: true, superadminOnly: true },
    },
    {
      path: '/superadmin/business/:id/admins',
      name: 'superadmin-business-admins',
      component: SuperadminBusinessAdminsView,
      meta: { requiresAuth: true, superadminOnly: true },
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: ClientesView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/clientes/:id',
      name: 'cliente-historial',
      component: ClienteHistorialView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/finanzas',
      name: 'finanzas',
      component: FinanzasView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/equipo',
      name: 'equipo',
      component: EquipoView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/servicios',
      name: 'servicios',
      component: ServiciosView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/productos',
      name: 'productos',
      component: ProductosView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: InventarioView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/pos',
      name: 'pos',
      component: POSView,
      meta: { requiresAuth: true, adminOnly: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.initialize()

  if (to.meta.public && authStore.isAuthenticated) {
    return resolveHomeByRole(authStore.role ?? undefined)
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/'
  }

  if (to.meta.superadminOnly && authStore.role !== 'superadmin') {
    return resolveHomeByRole(authStore.role ?? undefined)
  }

  if (to.meta.adminOnly && !isAdminPanelRole(authStore.role ?? undefined)) {
    return resolveHomeByRole(authStore.role ?? undefined)
  }
})

export default router
