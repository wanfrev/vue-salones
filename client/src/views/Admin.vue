<template>
  <div class="min-h-screen bg-slate-900">
    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header class="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Salon Admin</p>
          <h1 class="mt-2 text-2xl font-semibold">Panel de administracion</h1>
          <p class="mt-1 text-sm text-slate-300">Usuarios y permisos para tu salon.</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-slate-400">Sesion</p>
          <p class="text-sm font-semibold text-slate-100">{{ authStore.user?.nombre || authStore.user?.username }}</p>
          <p class="text-xs text-slate-400">{{ authStore.user?.rol || 'admin' }}</p>
          <button
            type="button"
            class="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
            @click="logout"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <main class="mt-6 space-y-6">
        <AdminAlerts :error-message="errorMessage" :success-message="successMessage" :auto-creation-notice="''" />

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Equipo del salon</h2>
              <p class="text-sm text-slate-500">Gestiona usuarios y accesos.</p>
            </div>
            <div class="flex gap-2">
              <input
                v-model="search"
                type="search"
                placeholder="Buscar por nombre o usuario"
                class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900"
              />
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400"
                :disabled="loadingEmployees"
                @click="loadEmployees"
              >
                Buscar
              </button>
            </div>
          </div>

          <div v-if="loadingEmployees" class="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
            Cargando empleados...
          </div>

          <div v-else class="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            <div v-if="!employees.length" class="p-4 text-sm text-slate-500">
              No hay empleados registrados.
            </div>
            <div
              v-for="employee in employees"
              :key="employee.employeeId"
              class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ employee.nombre }}</p>
                <p class="text-xs text-slate-500">{{ employee.username }}</p>
                <p v-if="employee.position" class="text-xs text-slate-500">{{ employee.position }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  @click="openChangePassword(employee)"
                >
                  Cambiar clave
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  @click="openDeleteEmployee(employee)"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </section>

        <AdminCreateUserSection
          :employee-form="employeeForm"
          :creating-employee="creatingEmployee"
          :can-create-superadmin="isSuperadmin"
          @update:employee-form="updateEmployeeForm"
          @create-user="crearEmpleadoYRecargar"
          @clear-form="limpiarFormularioEmpleado"
        />

        <AdminPrivilegedUsersSection
          v-if="isSuperadmin"
          :users="privilegedUsers"
          :loading="loadingPrivilegedUsers"
          :deleting-user-id="deletingPrivilegedUserId"
          @delete-user="solicitarEliminarPrivilegedUser"
        />
      </main>

      <AdminConfirmCard
        :visible="confirmDeleteEmployeeVisible"
        title="Eliminar empleado"
        :description="confirmDeleteEmployeeText"
        confirm-label="Eliminar"
        :danger="true"
        :loading="modalActionLoading"
        @cancel="cerrarModalesAccion"
        @confirm="confirmarEliminarEmpleado"
      />

      <AdminPasswordCard
        :visible="changePasswordVisible"
        :employee-name="selectedEmployeeAction?.nombre || 'Empleado'"
        :loading="modalActionLoading"
        @cancel="cerrarModalesAccion"
        @confirm="confirmarCambioPassword"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import AdminAlerts from '../components/admin/AdminAlerts.vue'
import AdminConfirmCard from '../components/admin/AdminConfirmCard.vue'
import AdminCreateUserSection from '../components/admin/AdminCreateUserSection.vue'
import AdminPasswordCard from '../components/admin/AdminPasswordCard.vue'
import AdminPrivilegedUsersSection from '../components/admin/AdminPrivilegedUsersSection.vue'
import { getEmployeesAdmin, type AdminEmployeeDirectoryItem } from '../api/admin'
import { useAdminUserManagement } from '../composables/useAdminUserManagement'
import { useAuth } from '../composables/useAuth'
import { ROLES } from '../constants/roles'

const { logout, authStore } = useAuth()
const isSuperadmin = computed(() => authStore.user?.rol === ROLES.SUPERADMIN)

const errorMessage = ref('')
const successMessage = ref('')

const limpiarMensajes = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const setErrorMessage = (message: string) => {
  errorMessage.value = message
}

const setSuccessMessage = (message: string) => {
  successMessage.value = message
}

const search = ref('')

const employeesQuery = useQuery({
  queryKey: computed(() => ['admin', 'employees', search.value.trim()]),
  queryFn: () => getEmployeesAdmin(search.value),
  onError: () => {
    setErrorMessage('No fue posible cargar los empleados.')
  },
})

const employees = computed<AdminEmployeeDirectoryItem[]>(() => employeesQuery.data.value ?? [])
const loadingEmployees = computed(
  () => employeesQuery.isLoading.value || employeesQuery.isFetching.value,
)

const loadEmployees = async () => {
  limpiarMensajes()
  await employeesQuery.refetch()
}

const {
  employeeForm,
  creatingEmployee,
  privilegedUsers,
  loadingPrivilegedUsers,
  deletingPrivilegedUserId,
  updateEmployeeForm,
  limpiarFormularioEmpleado,
  crearEmpleado,
  cambiarPasswordDesdeMenu,
  eliminarEmpleadoDesdeMenu,
  eliminarPrivilegedUserDesdeMenu,
} = useAdminUserManagement({
  isSuperadmin: isSuperadmin.value,
  limpiarMensajes,
  setSuccessMessage,
  setErrorMessage,
})

const selectedEmployeeAction = ref<AdminEmployeeDirectoryItem | null>(null)
const confirmDeleteEmployeeVisible = ref(false)
const changePasswordVisible = ref(false)
const modalActionLoading = ref(false)

const confirmDeleteEmployeeText = computed(() => {
  const name = selectedEmployeeAction.value?.nombre || 'este empleado'
  return `Esta accion eliminara al usuario ${name}.`
})

const openDeleteEmployee = (employee: AdminEmployeeDirectoryItem) => {
  selectedEmployeeAction.value = employee
  confirmDeleteEmployeeVisible.value = true
}

const openChangePassword = (employee: AdminEmployeeDirectoryItem) => {
  selectedEmployeeAction.value = employee
  changePasswordVisible.value = true
}

const cerrarModalesAccion = () => {
  confirmDeleteEmployeeVisible.value = false
  changePasswordVisible.value = false
  modalActionLoading.value = false
}

const confirmarEliminarEmpleado = async () => {
  if (!selectedEmployeeAction.value) {
    return
  }

  modalActionLoading.value = true

  try {
    await eliminarEmpleadoDesdeMenu({
      employeeId: selectedEmployeeAction.value.employeeId,
      nombre: selectedEmployeeAction.value.nombre,
    })
    await loadEmployees()
  } finally {
    modalActionLoading.value = false
    confirmDeleteEmployeeVisible.value = false
  }
}

const confirmarCambioPassword = async (password: string) => {
  if (!selectedEmployeeAction.value) {
    return
  }

  modalActionLoading.value = true

  try {
    await cambiarPasswordDesdeMenu(
      {
        employeeId: selectedEmployeeAction.value.employeeId,
        nombre: selectedEmployeeAction.value.nombre,
      },
      password,
    )
  } finally {
    modalActionLoading.value = false
    changePasswordVisible.value = false
  }
}

const crearEmpleadoYRecargar = async () => {
  await crearEmpleado()
  await loadEmployees()
}

const solicitarEliminarPrivilegedUser = async (user: { id: number; username: string; role: 'admin' | 'superadmin' }) => {
  await eliminarPrivilegedUserDesdeMenu(user)
}
</script>
