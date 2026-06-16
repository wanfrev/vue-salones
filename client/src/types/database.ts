// Tipos mínimos de las tablas/funciones del esquema.
// Para una generación automática completa puedes correr:
//   supabase gen types typescript --project-id <ref> > src/types/database.ts
// (o `--local` si trabajas con la CLI de Supabase localmente).

export type AppRole = 'superadmin' | 'admin' | 'empleado'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type PaymentMethod = 'cash' | 'cash_ves' | 'card' | 'transfer' | 'other' | 'zelle' | 'pago_movil' | 'mixed'
export type AppointmentSource = 'internal' | 'public'
export type EmployeeAbsenceType = 'break' | 'vacation' | 'sick_leave' | 'personal' | 'blocked'
export type InventoryMovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'transfer_in'
  | 'transfer_out'
  | 'return'
  | 'consumption'

export type ThemeConfig = {
  primary: string
  secondary: string
  [key: string]: string
}

export type Terminology = Record<string, string>

export interface Business {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  timezone: string
  currency: string
  ves_exchange_rate: number
  niche_type: string
  theme_config: ThemeConfig
  terminology: Terminology
  job_titles: string[]
  service_categories: string[]
  active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  business_id: string | null
  full_name: string
  role: AppRole
  job_title: string | null
  phone: string | null
  avatar_url: string | null
  active: boolean
  pay_type?: 'salary' | 'percentage' | 'mixed'
  pay_percentage?: number | null
  base_salary?: number | null
  created_at: string
  updated_at: string
}

export interface EmployeeSchedule {
  id: string
  employee_id: string
  weekday: number
  start_time: string
  end_time: string
  created_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  local_percentage: number
  color: string | null
  service_category_id?: string | null
  category: string
  icon: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeService {
  employee_id: string
  service_id: string
}

export interface ClientPreferredService {
  client_id: string
  service_id: string
  created_at: string
}

export interface Client {
  id: string
  business_id: string
  full_name: string
  phone: string
  email: string | null
  notes: string | null
  birthday: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  client_id: string
  employee_id: string
  service_id: string
  group_id: string | null
  start_time: string
  end_time: string
  status: AppointmentStatus
  payment_status: PaymentStatus
  price_override: number | null
  service_notes: string | null
  internal_notes: string | null
  reminder_sent_at: string | null
  source: AppointmentSource
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentWithRelations extends Appointment {
  clients?: Pick<Client, 'id' | 'full_name' | 'phone' | 'email'> | null
  services?: Pick<Service, 'id' | 'name' | 'duration_minutes' | 'price' | 'color'> | null
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface Transaction {
  id: string
  business_id: string
  appointment_id: string
  total_amount: number
  local_amount: number
  employee_amount: number
  local_percentage: number
  employee_percentage: number
  method: PaymentMethod
  exchange_rate_used: number
  payments_breakdown: any
  paid_at: string
  created_by: string | null
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  business_id: string
  name: string
  category: string
  amount: number
  expense_date: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EmployeeAbsence {
  id: string
  business_id: string
  employee_id: string
  type: EmployeeAbsenceType
  starts_at: string
  ends_at: string
  reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  business_id: string
  parent_id: string | null
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ServiceVariant {
  id: string
  business_id: string
  service_id: string
  name: string
  description: string | null
  duration_minutes: number | null
  price: number | null
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  business_id: string
  parent_id: string | null
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  business_id: string
  category_id: string | null
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  unit: string
  unit_cost: number
  unit_price: number
  reorder_point: number
  active: boolean
  is_sellable: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  unit_cost: number
  unit_price: number
  metadata: Record<string, unknown>
  active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryLocation {
  id: string
  business_id: string
  name: string
  is_default: boolean
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface InventoryStock {
  id: string
  business_id: string
  location_id: string
  product_id: string
  variant_id: string | null
  quantity: number
  reserved_qty: number
  updated_at: string
}

export interface InventoryMovement {
  id: string
  business_id: string
  location_id: string
  product_id: string
  variant_id: string | null
  movement_type: InventoryMovementType
  quantity: number
  unit_cost: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface EmployeePayment {
  id: string
  business_id: string
  employee_id: string
  amount: number
  payment_method: string
  notes: string | null
  payment_date: string
  created_by: string | null
  created_at: string
  updated_at: string
}

type TableShape<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      businesses: TableShape<Business>
      profiles: TableShape<Profile>
      employee_schedules: TableShape<EmployeeSchedule>
      services: TableShape<Service>
      service_categories: TableShape<ServiceCategory>
      service_variants: TableShape<ServiceVariant>
      employee_services: TableShape<EmployeeService>
      client_preferred_services: TableShape<ClientPreferredService>
      clients: TableShape<Client>
      appointments: TableShape<Appointment>
      transactions: TableShape<Transaction>
      expenses: TableShape<Expense>
      employee_absences: TableShape<EmployeeAbsence>
      product_categories: TableShape<ProductCategory>
      products: TableShape<Product>
      product_variants: TableShape<ProductVariant>
      inventory_locations: TableShape<InventoryLocation>
      inventory_stock: TableShape<InventoryStock>
      inventory_movements: TableShape<InventoryMovement>
      employee_payments: TableShape<EmployeePayment>
    }
    Views: Record<string, never>
    Functions: {
      public_business_info: {
        Args: { p_slug: string }
        Returns: Array<Pick<Business, 'id' | 'name' | 'timezone' | 'currency' | 'niche_type' | 'theme_config' | 'terminology' | 'phone' | 'address'>>
      }
      public_list_services: {
        Args: { p_slug: string }
        Returns: Array<Pick<Service, 'id' | 'name' | 'description' | 'duration_minutes' | 'price' | 'color'>>
      }
      public_list_employees_for_service: {
        Args: { p_slug: string; p_service_id: string }
        Returns: Array<{ id: string; full_name: string; avatar_url: string | null }>
      }
      public_get_available_slots: {
        Args: {
          p_slug: string
          p_employee_id: string
          p_service_id: string
          p_date_from: string
          p_date_to: string
          p_slot_minutes?: number
        }
        Returns: Array<{ slot_start: string; slot_end: string }>
      }
      public_book_appointment: {
        Args: {
          p_slug: string
          p_employee_id: string
          p_service_id: string
          p_start_time: string
          p_client_name: string
          p_client_phone: string
          p_client_email?: string | null
          p_client_notes?: string | null
        }
        Returns: Array<{
          appointment_id: string
          start_time: string
          end_time: string
          status: AppointmentStatus
        }>
      }
      financial_summary: {
        Args: {
          p_business_id: string
          p_period_start: string
          p_period_end: string
          p_period?: 'day' | 'week' | 'month'
          p_employee_id?: string | null
        }
        Returns: Array<{
          bucket: string
          appointments: number
          total_amount: number
          local_amount: number
          employee_amount: number
        }>
      }
      record_payment: {
        Args: {
          p_appointment_id: string
          p_amount: number
          p_method?: PaymentMethod
          p_notes?: string | null
          p_exchange_rate?: number | null
          p_payments_breakdown?: string
        }
        Returns: string
      }
      record_sale: {
        Args: {
          p_appointment_id: string
          p_amount: number
          p_method?: PaymentMethod
          p_products?: string
          p_notes?: string | null
          p_exchange_rate?: number | null
          p_payments_breakdown?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: AppRole
      appointment_status: AppointmentStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      appointment_source: AppointmentSource
      employee_absence_type: EmployeeAbsenceType
      inventory_movement_type: InventoryMovementType
    }
    CompositeTypes: Record<string, never>
  }
}
