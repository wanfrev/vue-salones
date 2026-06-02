export function getInitials(name?: string): string {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  zelle: 'Zelle',
  pago_movil: 'Pago Móvil',
  mixed: 'Mixto',
  other: 'Otro',
}

export function formatMethod(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  paid: 'Pagada',
  completed: 'Completada',
  no_show: 'Cancelada',
}

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-primary/10 text-primary',
  pending: 'bg-warning/10 text-warning',
  cancelled: 'bg-danger/10 text-danger',
  paid: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success',
  no_show: 'bg-danger/10 text-danger',
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? 'bg-bg-secondary text-text-muted'
}

export function normalizeAppointmentStatus(appt: { status: string; payment_status: string }): string {
  if (appt.payment_status === 'paid') return 'paid'
  if (appt.status === 'no_show') return 'cancelled'
  if (appt.status === 'completed') return 'confirmed'
  return appt.status
}

const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: 'short', year: 'numeric' },
  long: { day: '2-digit', month: 'long', year: 'numeric' },
  shortTime: { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  month: { month: 'short' },
}

export function formatDate(date: string | Date, format: keyof typeof DATE_FORMATS = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return String(date)
  return d.toLocaleDateString('es-ES', DATE_FORMATS[format])
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return String(date)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return String(date)
  return `${formatDate(d, 'short')} ${formatTime(d)}`
}

export function toISODate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '')
}

export function minutesToHHmm(minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function dateToHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}
