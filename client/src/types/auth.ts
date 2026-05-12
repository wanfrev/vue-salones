import type { Role } from '../constants/roles'

export interface AuthProfile {
  id: string
  business_id: string | null
  full_name: string
  role: Role
  phone: string | null
  avatar_url: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}
