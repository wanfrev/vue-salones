import type {
  Business, Profile, EmployeeSchedule, Service,
  Client, Appointment, Transaction
} from '../../types/database'

const BIZ = '00000000-0000-0000-0000-000000000001'
const ADMIN = '00000000-0000-0000-0000-000000000100'
const EMP1 = '00000000-0000-0000-0000-000000000201'
const EMP2 = '00000000-0000-0000-0000-000000000202'
const EMP3 = '00000000-0000-0000-0000-000000000203'

export interface MockDataStore {
  businesses: Business[]
  profiles: Profile[]
  employee_schedules: EmployeeSchedule[]
  services: Service[]
  employee_services: { employee_id: string; service_id: string }[]
  clients: Client[]
  client_preferred_services: { client_id: string; service_id: string; created_at: string }[]
  appointments: Appointment[]
  transactions: Transaction[]
  employee_absences: any[]
  [key: string]: any[]
}

function dateOffset(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export const MOCK_USER_ID = ADMIN
export const MOCK_BUSINESS_ID = BIZ
export const MOCK_EMAIL = 'admin@demo.com'
export const MOCK_PASSWORD = 'demo123'

export function createMockDataStore(): MockDataStore {
  const now = new Date().toISOString()

  const businesses: Business[] = [{
    id: BIZ, name: 'Salón Demo', slug: 'demo',
    phone: '+525551234567', address: 'Av. Principal #123',
    timezone: 'America/Mexico_City', currency: 'MXN',
    niche_type: 'salon',
    theme_config: { primary: '#8B5CF6', secondary: '#60A5FA' },
    terminology: {
      client: 'Cliente',
      employee: 'Empleado',
      service: 'Servicio',
      appointment: 'Cita',
      staff: 'Personal',
      pet: 'Mascota',
      owner: 'Dueno',
      breed: 'Raza',
      weight: 'Peso',
      vaccines: 'Vacunas',
    },
    active: true,
    created_at: now, updated_at: now,
  }]

  const profiles: Profile[] = [
    { id: ADMIN, business_id: BIZ, full_name: 'Admin Demo', role: 'admin', job_title: 'Administrador', phone: '+525551234500', avatar_url: null, active: true, created_at: now, updated_at: now },
    { id: EMP1, business_id: BIZ, full_name: 'María García', role: 'empleado', job_title: 'Estilista Senior', phone: '+525551234501', avatar_url: null, active: true, created_at: now, updated_at: now },
    { id: EMP2, business_id: BIZ, full_name: 'Ana López', role: 'empleado', job_title: 'Manicurista', phone: '+525551234502', avatar_url: null, active: true, created_at: now, updated_at: now },
    { id: EMP3, business_id: BIZ, full_name: 'Sofía Martínez', role: 'empleado', job_title: 'Barbera', phone: '+525551234503', avatar_url: null, active: true, created_at: now, updated_at: now },
  ]

  const employee_schedules: EmployeeSchedule[] = [
    { id: 'sch-1', employee_id: EMP1, weekday: 1, start_time: '09:00', end_time: '18:00', created_at: now },
    { id: 'sch-2', employee_id: EMP1, weekday: 2, start_time: '09:00', end_time: '18:00', created_at: now },
    { id: 'sch-3', employee_id: EMP1, weekday: 3, start_time: '09:00', end_time: '18:00', created_at: now },
    { id: 'sch-4', employee_id: EMP1, weekday: 4, start_time: '09:00', end_time: '18:00', created_at: now },
    { id: 'sch-5', employee_id: EMP1, weekday: 5, start_time: '09:00', end_time: '18:00', created_at: now },
    { id: 'sch-6', employee_id: EMP1, weekday: 6, start_time: '09:00', end_time: '15:00', created_at: now },
    { id: 'sch-7', employee_id: EMP2, weekday: 1, start_time: '10:00', end_time: '19:00', created_at: now },
    { id: 'sch-8', employee_id: EMP2, weekday: 2, start_time: '10:00', end_time: '19:00', created_at: now },
    { id: 'sch-9', employee_id: EMP2, weekday: 3, start_time: '10:00', end_time: '19:00', created_at: now },
    { id: 'sch-10', employee_id: EMP2, weekday: 4, start_time: '10:00', end_time: '19:00', created_at: now },
    { id: 'sch-11', employee_id: EMP2, weekday: 5, start_time: '10:00', end_time: '19:00', created_at: now },
    { id: 'sch-12', employee_id: EMP2, weekday: 6, start_time: '09:00', end_time: '14:00', created_at: now },
    { id: 'sch-13', employee_id: EMP3, weekday: 1, start_time: '09:00', end_time: '17:00', created_at: now },
    { id: 'sch-14', employee_id: EMP3, weekday: 2, start_time: '09:00', end_time: '17:00', created_at: now },
    { id: 'sch-15', employee_id: EMP3, weekday: 3, start_time: '09:00', end_time: '17:00', created_at: now },
    { id: 'sch-16', employee_id: EMP3, weekday: 4, start_time: '09:00', end_time: '17:00', created_at: now },
    { id: 'sch-17', employee_id: EMP3, weekday: 5, start_time: '09:00', end_time: '17:00', created_at: now },
    { id: 'sch-18', employee_id: EMP3, weekday: 6, start_time: '10:00', end_time: '16:00', created_at: now },
  ]

  const services: Service[] = [
    { id: '00000000-0000-0000-0000-000000000301', business_id: BIZ, name: 'Corte de cabello', description: 'Corte para dama o caballero', duration_minutes: 45, price: 250, local_percentage: 50, color: '#3B82F6', category: 'cabello', icon: 'scissors', active: true, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000302', business_id: BIZ, name: 'Manicure', description: 'Manicure completo con esmaltado', duration_minutes: 30, price: 180, local_percentage: 40, color: '#EC4899', category: 'uñas', icon: 'hand', active: true, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000303', business_id: BIZ, name: 'Pedicure', description: 'Pedicure completo', duration_minutes: 40, price: 220, local_percentage: 40, color: '#F59E0B', category: 'uñas', icon: 'foot', active: true, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000304', business_id: BIZ, name: 'Tinte completo', description: 'Coloración completa del cabello', duration_minutes: 120, price: 600, local_percentage: 60, color: '#8B5CF6', category: 'color', icon: 'palette', active: true, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000305', business_id: BIZ, name: 'Corte de barba', description: 'Arreglo de barba y bigote', duration_minutes: 30, price: 150, local_percentage: 50, color: '#10B981', category: 'barbería', icon: 'razor', active: true, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000306', business_id: BIZ, name: 'Peinado', description: 'Peinado para ocasión especial', duration_minutes: 60, price: 350, local_percentage: 50, color: '#F472B6', category: 'cabello', icon: 'hair', active: true, created_at: now, updated_at: now },
  ]

  const employee_services = [
    { employee_id: EMP1, service_id: '00000000-0000-0000-0000-000000000301' },
    { employee_id: EMP1, service_id: '00000000-0000-0000-0000-000000000304' },
    { employee_id: EMP1, service_id: '00000000-0000-0000-0000-000000000306' },
    { employee_id: EMP2, service_id: '00000000-0000-0000-0000-000000000302' },
    { employee_id: EMP2, service_id: '00000000-0000-0000-0000-000000000303' },
    { employee_id: EMP3, service_id: '00000000-0000-0000-0000-000000000301' },
    { employee_id: EMP3, service_id: '00000000-0000-0000-0000-000000000305' },
  ]

  const clients: Client[] = [
    { id: '00000000-0000-0000-0000-000000000401', business_id: BIZ, full_name: 'Laura Pérez', phone: '+525551234601', email: 'laura@ejemplo.com', notes: 'Cliente regular', birthday: '1990-05-15', metadata: { tipo_pelo: 'rizado', alergias: 'decolorante' }, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000402', business_id: BIZ, full_name: 'Carlos Ruiz', phone: '+525551234602', email: 'carlos@ejemplo.com', notes: null, birthday: '1985-11-20', metadata: { tipo_pelo: 'liso' }, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000403', business_id: BIZ, full_name: 'Diana Torres', phone: '+525551234603', email: null, notes: 'Prefiere sábados', birthday: null, metadata: {}, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000404', business_id: BIZ, full_name: 'Eduardo Vega', phone: '+525551234604', email: 'eduardo@ejemplo.com', notes: null, birthday: '1992-08-10', metadata: {}, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000405', business_id: BIZ, full_name: 'Gabriela Núñez', phone: '+525551234605', email: 'gabriela@ejemplo.com', notes: 'Alérgica a cierto tinte', birthday: '1988-03-25', metadata: { alergias: 'tinte' }, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000406', business_id: BIZ, full_name: 'Héctor Mendoza', phone: '+525551234606', email: null, notes: null, birthday: null, metadata: {}, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000407', business_id: BIZ, full_name: 'Isabel Rivas', phone: '+525551234607', email: 'isabel@ejemplo.com', notes: 'Cliente nueva', birthday: '1995-12-05', metadata: {}, created_at: now, updated_at: now },
    { id: '00000000-0000-0000-0000-000000000408', business_id: BIZ, full_name: 'Jorge Salinas', phone: '+525551234608', email: 'jorge@ejemplo.com', notes: 'Paga con tarjeta', birthday: '1982-07-14', metadata: {}, created_at: now, updated_at: now },
  ]

  const today = new Date()
  const monday = new Date(today)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  function buildAppointment(id: string, employeeId: string, serviceIdx: number, clientIdx: number, dayOffset: number, hour: number, status: string): Appointment {
    const svc = services[serviceIdx]
    const cl = clients[clientIdx]
    const start = new Date(monday)
    start.setDate(start.getDate() + dayOffset)
    start.setHours(hour, 0, 0, 0)
    const end = new Date(start.getTime() + svc.duration_minutes * 60000)
    return {
      id, business_id: BIZ,
      client_id: cl.id, employee_id: employeeId, service_id: svc.id,
      start_time: start.toISOString(), end_time: end.toISOString(),
      status: status as Appointment['status'],
      payment_status: 'unpaid',
      service_notes: null, internal_notes: null,
      reminder_sent_at: null,
      source: 'internal',
      created_by: ADMIN,
      created_at: now, updated_at: now,
    }
  }

  const appointments: Appointment[] = [
    buildAppointment('apt-01', EMP1, 0, 0, 0, 10, 'confirmed'),
    buildAppointment('apt-02', EMP1, 3, 4, 0, 14, 'confirmed'),
    buildAppointment('apt-03', EMP2, 1, 2, 0, 11, 'confirmed'),
    buildAppointment('apt-04', EMP3, 0, 3, 0, 10, 'completed'),
    buildAppointment('apt-05', EMP3, 4, 7, 0, 15, 'confirmed'),
    buildAppointment('apt-06', EMP1, 0, 5, 1, 9, 'pending'),
    buildAppointment('apt-07', EMP2, 2, 1, 1, 14, 'confirmed'),
    buildAppointment('apt-08', EMP3, 4, 3, 1, 11, 'confirmed'),
    buildAppointment('apt-09', EMP1, 5, 0, 2, 10, 'confirmed'),
    buildAppointment('apt-10', EMP2, 1, 6, 2, 12, 'pending'),
    buildAppointment('apt-11', EMP1, 3, 4, 3, 15, 'confirmed'),
    buildAppointment('apt-12', EMP3, 0, 5, 3, 9, 'completed'),
    buildAppointment('apt-13', EMP2, 2, 2, 4, 11, 'confirmed'),
    buildAppointment('apt-14', EMP1, 0, 7, 4, 13, 'cancelled'),
    buildAppointment('apt-15', EMP3, 5, 6, 5, 10, 'confirmed'),
  ]

  const transactions: Transaction[] = [
    {
      id: 'txn-01', business_id: BIZ, appointment_id: 'apt-04',
      total_amount: 250, local_amount: 125, employee_amount: 125,
      local_percentage: 50, employee_percentage: 50,
      method: 'cash', paid_at: dateOffset(-1).toISOString(),
      created_by: ADMIN, notes: null, created_at: now,
    },
    {
      id: 'txn-02', business_id: BIZ, appointment_id: 'apt-12',
      total_amount: 250, local_amount: 125, employee_amount: 125,
      local_percentage: 50, employee_percentage: 50,
      method: 'card', paid_at: dateOffset(-2).toISOString(),
      created_by: ADMIN, notes: null, created_at: now,
    },
  ]

  return {
    businesses, profiles, employee_schedules,
    services, employee_services, clients,
    client_preferred_services: [],
    appointments, transactions, employee_absences: [],
  }
}
