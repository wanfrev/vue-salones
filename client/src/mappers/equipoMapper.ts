import type { EmployeeSchedule, Profile } from '../types/database'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

export type EmployeeProfile = Profile & {
  employee_schedules?: EmployeeSchedule[]
}

export const mapProfileToEmpleado = (
  profile: EmployeeProfile,
  stats?: { citasHoy?: number; producido?: number; isOnBreak?: boolean; isOnVacation?: boolean }
): Empleado => {
  const firstSchedule = profile.employee_schedules?.[0]
  const payType = profile.pay_type || 'percentage'
  const payPercentage = Number(profile.pay_percentage ?? 0)
  const baseSalary = Number(profile.base_salary ?? 0)
  const payTypeLabel = payType === 'salary'
    ? 'Sueldo base'
    : payType === 'mixed'
      ? 'Sueldo + %'
      : 'Porcentaje'
  const payValueLabel = payType === 'salary'
    ? `$${baseSalary.toLocaleString()}`
    : payType === 'mixed'
      ? `$${baseSalary.toLocaleString()} + ${payPercentage}%`
      : `${payPercentage}%`

  return {
    id: profile.id,
    name: profile.full_name,
    role: profile.job_title || (profile.role === 'admin' ? 'Administrador' : 'Empleado'),
    citasHoy: stats?.citasHoy ?? 0,
    producido: (stats?.producido ?? 0).toLocaleString(),
    schedule: firstSchedule
      ? {
          start: firstSchedule.start_time.slice(0, 5),
          end: firstSchedule.end_time.slice(0, 5),
          break: '',
        }
      : undefined,
    phone: profile.phone ?? '',
    email: '',
    specialties: [],
    joinDate: profile.created_at.split('T')[0],
    payType,
    payPercentage,
    baseSalary,
    payTypeLabel,
    payValueLabel,
  }
}

export const mapEmpleadoFormToProfileUpdate = (data: EmpleadoFormData) => ({
  full_name: data.name.trim(),
  job_title: data.role.trim() || null,
  phone: data.phone.trim() || null,
  pay_type: data.payType,
  pay_percentage: data.payType === 'salary' ? 0 : Number(data.payPercentage),
  base_salary: data.payType === 'percentage' ? 0 : Number(data.baseSalary),
})

export const mapEmpleadoFormToScheduleBlocks = (employeeId: string, data: EmpleadoFormData) => {
  return [1, 2, 3, 4, 5, 6].map(weekday => ({
    employee_id: employeeId,
    weekday,
    start_time: data.scheduleStart,
    end_time: data.scheduleEnd,
  }))
}
