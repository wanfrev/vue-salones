import { mutate } from '../lib/typedSupabase'
import { supabase } from '../lib/supabase'
import { resolveFunctionErrorMessage } from '../lib/errors'

async function invokeWithSessionRefresh(action: string, body: Record<string, unknown>) {
  const invoke = () =>
    mutate.functions.invoke('manage-user', {
      body: { action, ...body },
    })

  let result = await invoke()

  if (result.error && /session|jwt|auth/i.test(String(result.error.message ?? ''))) {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      const { data: refreshed } = await supabase.auth.refreshSession({
        refresh_token: sessionData.session.refresh_token,
      })
      if (refreshed.session) {
        result = await invoke()
      }
    }
  }

  return result
}

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
  const { data, error } = await invokeWithSessionRefresh('create', {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    user_metadata: input.user_metadata,
  })

  if (error) {
    const message = await resolveFunctionErrorMessage(error, 'No fue posible crear el usuario.')
    throw new Error(message)
  }
  if (!data?.user?.id) {
    throw new Error('No fue posible crear el usuario.')
  }

  return data as CreateUserResult
}

export const updateAuthUser = async (userId: string, input: {
  email?: string
  password?: string
  user_metadata?: Record<string, unknown>
}): Promise<void> => {
  const { data, error } = await invokeWithSessionRefresh('update', {
    user_id: userId,
    email: input.email,
    password: input.password,
    user_metadata: input.user_metadata,
  })

  if (error) {
    const message = await resolveFunctionErrorMessage(error, 'No fue posible actualizar el usuario.')
    throw new Error(message)
  }
  if (!data?.success) {
    throw new Error('No fue posible actualizar el usuario.')
  }
}

export const deleteAuthUser = async (userId: string): Promise<void> => {
  const { data, error } = await invokeWithSessionRefresh('delete', {
    user_id: userId,
  })

  if (error) {
    const message = await resolveFunctionErrorMessage(error, 'No fue posible eliminar el usuario.')
    throw new Error(message)
  }
  if (!data?.success) {
    throw new Error('No fue posible eliminar el usuario.')
  }
}
