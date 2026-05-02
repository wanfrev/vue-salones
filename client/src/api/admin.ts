import http from './http'

export interface CreateEmployeeByAdminPayload {
  username: string
  password: string
  role: 'superadmin' | 'admin' | 'empleado'
  first_name?: string
  last_name?: string
  position?: string
}

interface CreateEmployeeByAdminResponse {
  message: string
  data: {
    username: string
    role: 'superadmin' | 'admin' | 'empleado'
    employee?: string
    employee_id: number | null
  }
}

export interface PrivilegedUser {
  id: number
  username: string
  role: 'superadmin' | 'admin'
  createdAt: string
  updatedAt: string
  canDelete: boolean
}

export interface AdminEmployeeDirectoryItem {
  employeeId: number
  nombre: string
  username: string
  position?: string
}

interface PrivilegedUsersResponse {
  data: PrivilegedUser[]
}

interface EmployeesDirectoryResponse {
  data: AdminEmployeeDirectoryItem[]
}

interface DeletePrivilegedUserResponse {
  msg: string
  user: {
    id: number
    username: string
    role: 'superadmin' | 'admin'
  }
}

interface UpdateEmployeePasswordAdminResponse {
  msg: string
  employeeId: number
}

interface DeleteEmployeeAdminResponse {
  msg: string
  employee: {
    id: number
    nombre: string
  }
}

export const getEmployeesAdmin = async (search = '') => {
  const { data } = await http.get<EmployeesDirectoryResponse>('/admin/empleados', {
    params: {
      search: search.trim() || undefined,
    },
  })

  return data.data
}

export const createEmployeeAdmin = async (payload: CreateEmployeeByAdminPayload) => {
  const { data } = await http.post<CreateEmployeeByAdminResponse>('/admin/empleados', payload)
  return data
}

export const updateEmployeePasswordAdmin = async (employeeId: number, password: string) => {
  const { data } = await http.patch<UpdateEmployeePasswordAdminResponse>(`/admin/empleados/${employeeId}/password`, {
    password,
  })

  return data
}

export const deleteEmployeeAdmin = async (employeeId: number) => {
  const { data } = await http.delete<DeleteEmployeeAdminResponse>(`/admin/empleados/${employeeId}`)
  return data
}

export const getPrivilegedUsersAdmin = async () => {
  const { data } = await http.get<PrivilegedUsersResponse>('/admin/privileged-users')
  return data.data
}

export const deletePrivilegedUserAdmin = async (userId: number) => {
  const { data } = await http.delete<DeletePrivilegedUserResponse>(`/admin/privileged-users/${userId}`)
  return data
}
