import { supabase } from '../lib/supabase'
import type { Business } from '../types/database'

const writableSupabase = supabase as any

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
}

export const listBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data as Business[]) || []
}

export const createBusinessWithOwner = async (input: CreateBusinessInput): Promise<CreateBusinessResult> => {
  const { data, error } = await writableSupabase.functions.invoke('superadmin-invite', {
    body: {
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
