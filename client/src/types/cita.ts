export interface Cita {
  id: string
  clientName: string
  clientId?: string
  service: string
  serviceId?: string
  employee: string
  employeeId?: string
  date: string
  time: string
  duration: number
  price: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'paid'
  paymentStatus?: 'unpaid' | 'partial' | 'paid'
  statusLabel?: string
  statusColor?: string
  notes?: string
}

export interface CitaFormData {
  clientName: string
  clientPhone: string
  service: string
  employee: string
  date: string
  time: string
  duration: number
  price: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'paid'
  notes: string
}
