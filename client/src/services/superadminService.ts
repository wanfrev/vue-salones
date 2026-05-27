import { supabase } from '../lib/supabase'
import type { Business } from '../types/database'
import type { AuthProfile } from '../types/auth'

const serviceSupabase = supabase as any

export type CreateBusinessInput = {
  businessName: string
  ownerEmail: string
  ownerPassword: string
  nicheType?: string
}

export type CreateBusinessResult = {
  business: Business
  invitedUserId: string
}

export const superadminKeys = {
  businesses: () => ['superadmin', 'businesses'] as const,
  businessAdmins: (businessId: string) => ['superadmin', 'business-admins', businessId] as const,
}

export const listBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as Business[]) || []
}

export const createBusinessWithOwner = async (input: CreateBusinessInput): Promise<CreateBusinessResult> => {
  const { data, error } = await serviceSupabase.functions.invoke('superadmin-invite', {
    body: {
      action: 'create',
      businessName: input.businessName.trim(),
      ownerEmail: input.ownerEmail.trim(),
      ownerPassword: input.ownerPassword,
      nicheType: input.nicheType?.trim() || null,
    },
  })

  if (error) throw error
  if (!data?.business || !data?.invitedUserId) {
    throw new Error('No fue posible crear el negocio.')
  }

  return data as CreateBusinessResult
}

export type UpdateBusinessInput = {
  business_id: string
  name?: string
  phone?: string | null
  address?: string | null
  timezone?: string
  currency?: string
  niche_type?: string
  active?: boolean
  ves_exchange_rate?: number
}

export const updateBusiness = async (input: UpdateBusinessInput): Promise<Business> => {
  const { data, error } = await serviceSupabase.functions.invoke('superadmin-invite', {
    body: {
      action: 'update_business',
      ...input,
    },
  })

  if (error) throw error
  if (!data?.business) {
    throw new Error('No fue posible actualizar el negocio.')
  }

  return data.business as Business
}

export const deleteBusiness = async (businessId: string): Promise<void> => {
  const { data, error } = await serviceSupabase.functions.invoke('superadmin-invite', {
    body: {
      action: 'delete_business',
      business_id: businessId,
    },
  })

  if (error) throw error
  if (!data?.success) {
    throw new Error('No fue posible eliminar el negocio.')
  }
}

export const suspendBusiness = async (businessId: string): Promise<void> => {
  const { data, error } = await serviceSupabase.functions.invoke('superadmin-invite', {
    body: {
      action: 'suspend_business',
      business_id: businessId,
    },
  })

  if (error) throw error
  if (!data?.success) {
    throw new Error('No fue posible suspender el servicio.')
  }
}

export const resumeBusiness = async (businessId: string): Promise<void> => {
  const { data, error } = await serviceSupabase.functions.invoke('superadmin-invite', {
    body: {
      action: 'resume_business',
      business_id: businessId,
    },
  })

  if (error) throw error
  if (!data?.success) {
    throw new Error('No fue posible reactivar el servicio.')
  }
}

export const listBusinessAdmins = async (businessId: string): Promise<AuthProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, business_id, full_name, role, phone, avatar_url')
    .eq('business_id', businessId)
    .eq('role', 'admin')
    .order('full_name')

  if (error) throw error
  return (data as AuthProfile[]) || []
}
