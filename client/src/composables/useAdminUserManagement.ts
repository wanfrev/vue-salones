import { computed, ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  createEmployeeAdmin,
  deletePrivilegedUserAdmin,
  deleteEmployeeAdmin,
  getPrivilegedUsersAdmin,
  type PrivilegedUser,
  updateEmployeePasswordAdmin,
} from '../api/admin'

interface EmployeeFormState {
  username: string
  password: string
  role: 'superadmin' | 'admin' | 'empleado'
  first_name: string
  last_name: string
  position: string
}

interface DeleteEmployeeCandidate {
  employeeId: number
  nombre: string
}

interface DeletePrivilegedUserCandidate {
  id: number
  username: string
  role: 'superadmin' | 'admin'
}

interface UseAdminUserManagementOptions {
  isSuperadmin: boolean
  limpiarMensajes: () => void
  setSuccessMessage: (message: string) => void
  setErrorMessage: (message: string) => void
}

export const useAdminUserManagement = ({
  isSuperadmin,
  limpiarMensajes,
  setSuccessMessage,
  setErrorMessage,
}: UseAdminUserManagementOptions) => {
  const queryClient = useQueryClient()
  const deletingEmployeeId = ref<number | null>(null)
  const deletingPrivilegedUserId = ref<number | null>(null)
  const employeeForm = ref<EmployeeFormState>({
    username: '',
    password: '',
    role: 'empleado',
    first_name: '',
    last_name: '',
    position: '',
  })

  const privilegedUsersQuery = useQuery({
    queryKey: ['admin', 'privileged-users'],
    queryFn: getPrivilegedUsersAdmin,
    enabled: isSuperadmin,
    onError: () => {
      setErrorMessage('Could not load admins and superadmins.')
    },
  })

  const privilegedUsers = computed<PrivilegedUser[]>(() => privilegedUsersQuery.data.value ?? [])
  const loadingPrivilegedUsers = computed(
    () => privilegedUsersQuery.isLoading.value || privilegedUsersQuery.isFetching.value,
  )

  const updateEmployeeForm = (nextForm: EmployeeFormState) => {
    employeeForm.value = nextForm
  }

  const limpiarFormularioEmpleado = () => {
    employeeForm.value = {
      username: '',
      password: '',
      role: 'empleado',
      first_name: '',
      last_name: '',
      position: '',
    }
  }

  const createEmployeeMutation = useMutation({
    mutationFn: createEmployeeAdmin,
    onSuccess: (_, payload) => {
      setSuccessMessage(
        payload.role === 'superadmin'
          ? 'Superadmin user created successfully.'
          : payload.role === 'admin'
            ? 'Admin user created successfully.'
            : 'Employee user created successfully.',
      )
      limpiarFormularioEmpleado()

      if (payload.role !== 'empleado' && isSuperadmin) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'privileged-users'] })
      }
    },
    onError: () => {
      setErrorMessage('Could not create the user.')
    },
  })

  const updatePasswordMutation = useMutation({
    mutationFn: (payload: { employeeId: number; password: string; employeeName: string }) =>
      updateEmployeePasswordAdmin(payload.employeeId, payload.password),
    onSuccess: (_, payload) => {
      setSuccessMessage(`Password updated successfully for ${payload.employeeName}.`)
    },
    onError: () => {
      setErrorMessage('Could not update employee password.')
    },
  })

  const deleteEmployeeMutation = useMutation({
    mutationFn: (payload: { employeeId: number }) => deleteEmployeeAdmin(payload.employeeId),
    onSuccess: (response) => {
      setSuccessMessage(`Employee deleted successfully: ${response.employee.nombre}.`)
    },
    onError: () => {
      setErrorMessage('Could not delete employee.')
    },
  })

  const deletePrivilegedUserMutation = useMutation({
    mutationFn: (payload: { id: number }) => deletePrivilegedUserAdmin(payload.id),
    onSuccess: (_, payload) => {
      const user = privilegedUsers.value.find((entry) => entry.id === payload.id)
      if (user) {
        setSuccessMessage(`${user.role} user ${user.username} deleted successfully.`)
      } else {
        setSuccessMessage('Admin or superadmin user deleted successfully.')
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'privileged-users'] })
    },
    onError: () => {
      setErrorMessage('Could not delete the admin/superadmin user.')
    },
  })

  const creatingEmployee = computed(() => createEmployeeMutation.isPending.value)

  const crearEmpleado = async () => {
    limpiarMensajes()

    const payload = {
      username: employeeForm.value.username.trim(),
      password: employeeForm.value.password,
      role: employeeForm.value.role,
      first_name:
        employeeForm.value.role === 'empleado'
          ? employeeForm.value.first_name.trim()
          : undefined,
      last_name:
        employeeForm.value.role === 'empleado'
          ? employeeForm.value.last_name.trim()
          : undefined,
      position:
        employeeForm.value.role === 'empleado'
          ? employeeForm.value.position.trim() || undefined
          : undefined,
    }

    if (!payload.username || !payload.password) {
      setErrorMessage('Complete username and password.')
      return
    }

    if (payload.role === 'superadmin' && !isSuperadmin) {
      setErrorMessage('Only a superadmin can create another superadmin.')
      return
    }

    if (payload.role === 'empleado' && (!payload.first_name || !payload.last_name)) {
      setErrorMessage('For employee users, first_name and last_name are required.')
      return
    }

    try {
      await createEmployeeMutation.mutateAsync(payload)
    } catch (error) {
      void error
    }
  }

  const cambiarPasswordDesdeMenu = async (empleado: DeleteEmployeeCandidate, nextPassword: string) => {
    limpiarMensajes()
    const normalized = nextPassword.trim()

    if (normalized.length < 8) {
      setErrorMessage('The new password must have at least 8 characters.')
      return
    }

    deletingEmployeeId.value = empleado.employeeId

    try {
      await updatePasswordMutation.mutateAsync({
        employeeId: empleado.employeeId,
        password: normalized,
        employeeName: empleado.nombre,
      })
    } finally {
      deletingEmployeeId.value = null
    }
  }

  const eliminarEmpleadoDesdeMenu = async (empleado: DeleteEmployeeCandidate) => {
    limpiarMensajes()

    deletingEmployeeId.value = empleado.employeeId

    try {
      await deleteEmployeeMutation.mutateAsync({ employeeId: empleado.employeeId })
    } finally {
      deletingEmployeeId.value = null
    }
  }

  const cargarUsuariosPrivilegiados = async () => {
    if (!isSuperadmin) {
      return
    }

    try {
      await privilegedUsersQuery.refetch()
    } catch (error) {
      void error
    }
  }

  const eliminarPrivilegedUserDesdeMenu = async (user: DeletePrivilegedUserCandidate) => {
    limpiarMensajes()

    if (!isSuperadmin) {
      setErrorMessage('Only a superadmin can delete admins or superadmins.')
      return
    }

    deletingPrivilegedUserId.value = user.id

    try {
      await deletePrivilegedUserMutation.mutateAsync({ id: user.id })
    } finally {
      deletingPrivilegedUserId.value = null
    }
  }

  return {
    employeeForm,
    creatingEmployee,
    deletingEmployeeId,
    privilegedUsers,
    loadingPrivilegedUsers,
    deletingPrivilegedUserId,
    updateEmployeeForm,
    limpiarFormularioEmpleado,
    crearEmpleado,
    cambiarPasswordDesdeMenu,
    eliminarEmpleadoDesdeMenu,
    cargarUsuariosPrivilegiados,
    eliminarPrivilegedUserDesdeMenu,
  }
}
