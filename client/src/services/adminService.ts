import { mutate } from '../lib/typedSupabase'

export type CreateUserInput = {
  email: string
  password: string
  user_metadata: {
    full_name: string
    business_id: string
    role: 'admin' | 'empleado'
    phone?: string
    job_title?: string
    pay_type?: string
    pay_percentage?: number
    base_salary?: number
  }
}

export type CreateUserResult = {
  user: {
    id: string
    email: string
  }
}

export const createAuthUser = async (input: CreateUserInput): Promise<CreateUserResult> => {
  const { data, error } = await mutate.functions.invoke('manage-user', {
    body: {
      action: 'create',
      email: input.email.trim().toLowerCase(),
      password: input.password,
      user_metadata: input.user_metadata,
    },
  })

  if (error) throw error
  if (!data?.user?.id) {
    throw new Error('No fue posible crear el usuario.')
  }

  return data as CreateUserResult
}

export const updateAuthUser = async (userId: string, input: {
  password?: string
  user_metadata?: Record<string, unknown>
}): Promise<void> => {
  const { data, error } = await mutate.functions.invoke('manage-user', {
    body: {
      action: 'update',
      user_id: userId,
      password: input.password,
      user_metadata: input.user_metadata,
    },
  })

  if (error) throw error
  if (!data?.success) {
    throw new Error('No fue posible actualizar el usuario.')
  }
}

export const deleteAuthUser = async (userId: string): Promise<void> => {
  const { data, error } = await mutate.functions.invoke('manage-user', {
    body: {
      action: 'delete',
      user_id: userId,
    },
  })

  if (error) throw error
  if (!data?.success) {
    throw new Error('No fue posible eliminar el usuario.')
  }
}
