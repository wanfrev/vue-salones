import { supabase } from '../lib/supabase'
import { mapEmpleadoFormToProfileUpdate, mapEmpleadoFormToScheduleBlocks, mapProfileToEmpleado } from '../mappers/equipoMapper'
import type { EmployeeProfile } from '../mappers/equipoMapper'
import type { Empleado, EmpleadoFormData } from '../types/empleado'

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
  data: EmpleadoFormData & { id?: string }
): Promise<void> => {
  if (!data.id) {
    throw new Error('Para crear empleados reales necesitas crear primero el usuario en Supabase Auth y luego asociar su perfil.')
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
