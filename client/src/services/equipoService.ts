import { supabase } from '../lib/supabase'
import { createAuthUser } from './adminService'
import { mapEmpleadoFormToProfileUpdate, mapEmpleadoFormToScheduleBlocks, mapProfileToEmpleado } from '../mappers/equipoMapper'
import type { EmployeeProfile } from '../mappers/equipoMapper'
import type { Empleado, EmpleadoFormData } from '../types/empleado'
import type { Business } from '../types/database'

const writableSupabase = supabase as any

export const equipoKeys = {
  all: (businessId?: string | null) => ['equipo', businessId] as const,
}

export const listEquipo = async (businessId: string): Promise<Empleado[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, employee_schedules(*)')
    .eq('business_id', businessId)
    .eq('role', 'empleado')
    .order('full_name')

  if (error) throw error

  return (data as EmployeeProfile[]).map(profile => mapProfileToEmpleado(profile))
}

export const saveEmpleado = async (
  data: EmpleadoFormData & { id?: string },
  businessId?: string
): Promise<void> => {
  if (!data.id) {
    const profileUpdate = mapEmpleadoFormToProfileUpdate(data)

    const { user } = await createAuthUser({
      email: data.email,
      password: data.password,
      user_metadata: {
        full_name: profileUpdate.full_name,
        business_id: businessId!,
        role: 'empleado',
        phone: profileUpdate.phone || undefined,
        job_title: profileUpdate.job_title || undefined,
        pay_type: profileUpdate.pay_type,
        pay_percentage: profileUpdate.pay_percentage,
        base_salary: profileUpdate.base_salary,
      },
    })

    const scheduleBlocks = mapEmpleadoFormToScheduleBlocks(user.id, data)
    const { error: scheduleError } = await writableSupabase
      .from('employee_schedules')
      .insert(scheduleBlocks)

    if (scheduleError) throw scheduleError
    return
  }

  const { error: profileError } = await writableSupabase
    .from('profiles')
    .update(mapEmpleadoFormToProfileUpdate(data))
    .eq('id', data.id)

  if (profileError) throw profileError

  const { error: deleteScheduleError } = await supabase
    .from('employee_schedules')
    .delete()
    .eq('employee_id', data.id)

  if (deleteScheduleError) throw deleteScheduleError

  const scheduleBlocks = mapEmpleadoFormToScheduleBlocks(data.id, data)
  const { error: scheduleError } = await writableSupabase
    .from('employee_schedules')
    .insert(scheduleBlocks)

  if (scheduleError) throw scheduleError
}

export const addBusinessCategory = async (businessId: string, category: string): Promise<string[]> => {
  const { data: biz, error: fetchError } = await supabase
    .from('businesses')
    .select('service_categories')
    .eq('id', businessId)
    .single()

  if (fetchError) throw fetchError

  const current: string[] = (biz?.service_categories as string[]) || []
  if (current.includes(category)) return current

  const updated = [...current, category]

  const { error } = await supabase
    .from('businesses')
    .update({ service_categories: updated } as Partial<Business>)
    .eq('id', businessId)

  if (error) throw error
  return updated
}

export const addBusinessJobTitle = async (businessId: string, title: string): Promise<string[]> => {
  const { data: biz, error: fetchError } = await supabase
    .from('businesses')
    .select('job_titles')
    .eq('id', businessId)
    .single()

  if (fetchError) throw fetchError

  const current: string[] = (biz?.job_titles as string[]) || []
  if (current.includes(title)) return current

  const updated = [...current, title]

  const { error } = await supabase
    .from('businesses')
    .update({ job_titles: updated } as Partial<Business>)
    .eq('id', businessId)

  if (error) throw error
  return updated
}
